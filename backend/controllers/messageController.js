import Chat from "../models/chatModel.js";
import User from "../models/userModule.js";
import Message from "../models/messageModule.js";
import mongoose from "mongoose";

export const sendMessage = async (req, res) => {
    try {
        const { chatId, encryptedContent, messageType, mediaUrl, metadata, replyTo } = req.body;
        const userId = req.userId;

        if (!chatId || !encryptedContent) {
            return res.status(400).json({
                success: false,
                message: "Chat ID and encrypted content are required"
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        if (!chat.isParticipant(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this chat"
            });
        }

        const message = new Message({
            chatId,
            senderId: userId,
            encryptedContent,
            messageType: messageType || "text",
            mediaUrl: mediaUrl || null,
            metadata: metadata || {},
            replyTo: replyTo || null,
        });

        await message.save();

        chat.lastMessage = message._id;
        chat.lastMessageTime = message.createdAt;
        await chat.save();

        const populatedMessage = await Message.findById(message._id)
            .populate("senderId", "username email profilePicture status")
            .populate("replyTo", "encryptedContent senderId createdAt");

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage
        });
    } catch (error) {
        console.error("Send message error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during message sending"
        });
    }
};

export const receiveMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required"
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const messages = await Message.find({ chatId })
            .populate("chatId", "name participants")
            .populate("senderId", "username email profilePicture status");

        return res.status(200).json({
            success: true,
            message: "Messages received successfully",
            data: messages
        });
    } catch (error) {
        console.error("Receive message error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during message receiving"
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.userId;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required"
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        if (!chat.isParticipant(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not a participant in this chat"
            });
        }

        const messages = await Message.find({
            chatId: chatId,
            senderId: { $ne: userId },
            'readBy.userId': { $ne: userId }
        });

        let markedCount = 0;
        for (const message of messages) {
            await message.markAsRead(userId);
            markedCount++;
        }

        return res.status(200).json({
            success: true,
            message: `${markedCount} messages marked as read`,
            data: {
                chatId: chatId,
                markedCount: markedCount,
                userId: userId
            }
        });
    } catch (error) {
        console.error("Mark as read error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during marking messages as read"
        });
    }
};