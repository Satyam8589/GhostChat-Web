import Chat from "../models/chatModel.js";
import User from "../models/userModule.js";
import Message from "../models/messageModel.js";
import mongoose from "mongoose";
import { emitToChat, emitToUser } from "../socket/socket.js";
import { encrypt, decrypt } from "../utils/encryption.js";

// ==================== SEND MESSAGE ====================

export const sendMessage = async (req, res) => {
  try {
    const {
      chatId,
      encryptedContent,
      messageType,
      mediaUrl,
      metadata,
      replyTo,
    } = req.body;
    const userId = req.userId;

    if (!chatId || !encryptedContent) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and encrypted content are required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this chat",
      });
    }

    // Encrypt the message content using AES-256
    const encryptedMessage = encrypt(encryptedContent);
    
    // Debug: Verify encryption is working
    console.log('📝 Message Encryption:');
    console.log('  Original (plain text):', encryptedContent.substring(0, 50) + '...');
    console.log('  Encrypted (saved to DB):', encryptedMessage.substring(0, 80) + '...');
    console.log('  Encryption format:', encryptedMessage.includes(':') ? '✅ Correct (iv:data)' : '❌ Wrong');

    const message = new Message({
      chat: chatId,
      sender: userId,
      encryptedContent: encryptedMessage,
      messageType: messageType || "text",
      mediaUrl: mediaUrl || null,
      metadata: metadata || {},
      replyTo: replyTo || null,
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.lastMessageTime = message.createdAt;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name username email profilePicture status")
      .populate("replyTo", "encryptedContent sender createdAt");

    // Decrypt the message before sending via socket
    const decryptedMessage = {
      ...populatedMessage.toObject(),
      encryptedContent: decrypt(populatedMessage.encryptedContent),
    };

    // Decrypt replyTo message if exists
    if (decryptedMessage.replyTo && decryptedMessage.replyTo.encryptedContent) {
      decryptedMessage.replyTo.encryptedContent = decrypt(
        decryptedMessage.replyTo.encryptedContent
      );
    }

    // Emit message to all participants via socket
    emitToChat(chatId, "message:receive", {
      chatId: chatId,
      message: decryptedMessage,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: decryptedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during message sending",
    });
  }
};

// ==================== GET MESSAGES ====================

export const receiveMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this chat",
      });
    }

    const messages = await Message.find({ chat: chatId, isDeleted: false })
      .populate("sender", "name username email profilePicture status")
      .populate("replyTo", "encryptedContent sender createdAt")
      .sort({ createdAt: 1 }); // Oldest first for chat window

    // Decrypt all messages before sending
    const decryptedMessages = messages.map((message) => {
      const messageObj = message.toObject();
      messageObj.encryptedContent = decrypt(messageObj.encryptedContent);

      // Decrypt replyTo message if exists
      if (messageObj.replyTo && messageObj.replyTo.encryptedContent) {
        messageObj.replyTo.encryptedContent = decrypt(
          messageObj.replyTo.encryptedContent
        );
      }

      return messageObj;
    });

    return res.status(200).json({
      success: true,
      message: "Messages received successfully",
      data: decryptedMessages,
    });
  } catch (error) {
    console.error("Receive message error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during message receiving",
    });
  }
};

// ==================== MARK MESSAGES AS READ ====================

export const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this chat",
      });
    }

    // Find messages in this chat sent by others that haven't been read by this user
    const unreadMessages = await Message.find({
      chat: chatId,
      sender: { $ne: userId },
      "readBy.userId": { $ne: userId },
    });

    let markedCount = 0;
    const updatedMessageIds = [];

    for (const message of unreadMessages) {
      await message.markAsRead(userId);
      markedCount++;
      updatedMessageIds.push(message._id);
    }

    // Emit socket event to notify sender that messages were read
    if (markedCount > 0 && updatedMessageIds.length > 0) {
      // Get the sender IDs of the messages
      const senderIds = [
        ...new Set(unreadMessages.map((msg) => msg.sender.toString())),
      ];

      console.log(
        `Emitting message:read event for ${markedCount} messages in chat ${chatId}`
      );

      // Notify via chat room
      emitToChat(chatId, "message:read", {
        chatId: chatId,
        messageIds: updatedMessageIds,
        readBy: userId,
        readAt: new Date(),
      });

      // Also notify each sender directly via their user room
      senderIds.forEach((senderId) => {
        emitToUser(senderId, "message:read", {
          chatId: chatId,
          messageIds: updatedMessageIds,
          readBy: userId,
          readAt: new Date(),
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: `${markedCount} messages marked as read`,
      data: {
        chatId: chatId,
        markedCount: markedCount,
        userId: userId,
      },
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during marking messages as read",
    });
  }
};

export default { sendMessage, receiveMessage, markAsRead };
