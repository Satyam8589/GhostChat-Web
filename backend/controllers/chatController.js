import mongoose from "mongoose";
import Chat from "../models/chatModel.js";
import User from "../models/userModule.js";
import Message from "../models/messageModel.js";
import { emitToUser } from "../socket/socket.js";
import { decrypt } from "../utils/encryption.js";

// ==================== CREATE CHAT ====================

export const createChat = async (req, res) => {
  try {
    const {
      type,
      name,
      description,
      participants,
      participantId,
      groupKey,
      groupIcon,
    } = req.body;
    const userId = req.userId;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Chat type is required",
      });
    }

    let chatParticipants = participants || [];

    // For private chat, use participantId (could be userId or username)
    if (type === "private" && participantId) {
      // Check if participantId is a valid ObjectId
      const isObjectId = mongoose.Types.ObjectId.isValid(participantId);

      if (isObjectId) {
        chatParticipants = [userId, participantId];
      } else {
        // If not an ObjectId, assume it's a username and find the user
        const user = await User.findOne({
          username: participantId.toLowerCase(),
        });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: `User with username "${participantId}" not found`,
          });
        }
        chatParticipants = [userId, user._id.toString()];
      }
    }

    if (!chatParticipants || chatParticipants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participants are required",
      });
    }

    // Standardize all participants to strings for comparison
    chatParticipants = chatParticipants.map((p) => p.toString());

    if (!chatParticipants.includes(userId.toString())) {
      chatParticipants.push(userId.toString());
    }

    // If it's a group chat, we might also have usernames in the participants array
    // Let's resolve all participants to ObjectIds
    const resolvedParticipants = [];
    for (const pId of chatParticipants) {
      if (mongoose.Types.ObjectId.isValid(pId)) {
        resolvedParticipants.push(pId);
      } else {
        const user = await User.findOne({ username: pId.toLowerCase() });
        if (user) {
          resolvedParticipants.push(user._id.toString());
        }
      }
    }

    const users = await User.find({ _id: { $in: resolvedParticipants } });

    if (users.length !== resolvedParticipants.length) {
      return res.status(400).json({
        success: false,
        message: "One or more participants not found",
      });
    }

    // Use the resolved participants from now on
    chatParticipants = resolvedParticipants;

    if (type === "private") {
      if (chatParticipants.length !== 2) {
        return res.status(400).json({
          success: false,
          message: "Private chat must have exactly 2 participants",
        });
      }

      const existingChat = await Chat.findOne({
        type: "private",
        participants: { $all: chatParticipants, $size: 2 },
      });

      if (existingChat) {
        const populatedChat = await Chat.findById(existingChat._id).populate(
          "participants",
          "name username email profilePicture status"
        );

        return res.status(200).json({
          success: true,
          message: "Chat already exists",
          chat: populatedChat,
        });
      }

      const newChat = new Chat({
        type: "private",
        participants: chatParticipants,
        isActive: true,
      });

      await newChat.save();

      const populatedChat = await Chat.findById(newChat._id).populate(
        "participants",
        "name username email profilePicture status"
      );

      // Emit to both participants that a new chat was created
      chatParticipants.forEach((participantId) => {
        emitToUser(participantId.toString(), "chat:new", {
          chat: populatedChat,
        });
      });

      return res.status(201).json({
        success: true,
        message: "Private chat created successfully",
        chat: populatedChat,
      });
    }

    if (type === "group") {
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Group name is required",
        });
      }

      if (chatParticipants.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Group must have at least 2 participants",
        });
      }

      const newChat = new Chat({
        type: "group",
        name,
        description: description || "",
        participants: chatParticipants,
        admin: userId,
        groupKey: groupKey || "default_key",
        groupIcon: groupIcon || null,
        isActive: true,
      });

      await newChat.save();

      const populatedChat = await Chat.findById(newChat._id)
        .populate("participants", "name username email profilePicture status")
        .populate("admin", "name username email");

      // Emit to all participants that a new group was created
      chatParticipants.forEach((participantId) => {
        emitToUser(participantId.toString(), "chat:new", {
          chat: populatedChat,
        });
      });

      return res.status(201).json({
        success: true,
        message: "Group chat created successfully",
        chat: populatedChat,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid chat type",
    });
  } catch (error) {
    console.error("Create chat error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || "Validation failed",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during chat creation",
    });
  }
};

// ==================== GET USER CHATS ====================

export const getUserChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await Chat.find({
      participants: userId,
      isActive: true,
    })
      .populate(
        "participants",
        "name username email profilePicture status lastSeen"
      )
      .populate("admin", "name username email")
      .populate("lastMessage")
      .sort({ lastMessageTime: -1 });

    // Add user-specific preferences (pinned, archived) and unread count to each chat
    const chatsWithPreferences = await Promise.all(
      chats.map(async (chat) => {
        const chatObj = chat.toObject();
        const userPref = chat.userPreferences.find(
          (pref) => pref.userId.toString() === userId.toString()
        );

        chatObj.pinned = userPref?.pinned || false;
        chatObj.archived = userPref?.archived || false;

        // Decrypt lastMessage if it exists
        if (chatObj.lastMessage && chatObj.lastMessage.encryptedContent) {
          chatObj.lastMessage.encryptedContent = decrypt(
            chatObj.lastMessage.encryptedContent
          );
        }

        // Calculate unread message count for this user
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: userId }, // Messages not sent by this user
          "readBy.userId": { $ne: userId }, // Messages not read by this user
          isDeleted: false,
        });

        chatObj.unreadCount = unreadCount;

        return chatObj;
      })
    );

    return res.status(200).json({
      success: true,
      chats: chatsWithPreferences,
    });
  } catch (error) {
    console.error("Get user chats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching chats",
    });
  }
};

// ==================== GET CHAT BY ID ====================

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId)
      .populate(
        "participants",
        "name username email profilePicture status lastSeen"
      )
      .populate("admin", "name username email")
      .populate("lastMessage");

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (!chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this chat",
      });
    }

    // Add user-specific preferences
    const chatObj = chat.toObject();
    const userPref = chat.userPreferences.find(
      (pref) => pref.userId.toString() === userId.toString()
    );

    chatObj.pinned = userPref?.pinned || false;
    chatObj.archived = userPref?.archived || false;

    // Decrypt lastMessage if it exists
    if (chatObj.lastMessage && chatObj.lastMessage.encryptedContent) {
      chatObj.lastMessage.encryptedContent = decrypt(
        chatObj.lastMessage.encryptedContent
      );
    }

    return res.status(200).json({
      success: true,
      chat: chatObj,
    });
  } catch (error) {
    console.error("Get chat by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching chat",
    });
  }
};

// ==================== UPDATE CHAT ====================

export const updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.type === "group" && !chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can update group chat",
      });
    }

    // Update allowed fields
    const allowedUpdates = ["name", "description", "groupIcon"];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        chat[key] = updates[key];
      }
    });

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("participants", "name username email profilePicture status")
      .populate("admin", "name username email");

    return res.status(200).json({
      success: true,
      message: "Chat updated successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Update chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating chat",
    });
  }
};

// ==================== DELETE CHAT ====================

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.type === "group" && !chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete group chat",
      });
    }

    if (chat.type === "private" && !chat.isParticipant(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this chat",
      });
    }

    // Soft delete
    chat.isActive = false;
    await chat.save();

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting chat",
    });
  }
};

// ==================== ADD PARTICIPANT ====================

export const addParticipant = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId: newUserId } = req.body;
    const userId = req.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.type !== "group") {
      return res.status(400).json({
        success: false,
        message: "Can only add participants to group chats",
      });
    }

    if (!chat.isAdmin(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can add participants",
      });
    }

    if (chat.isParticipant(newUserId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a participant",
      });
    }

    const user = await User.findById(newUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await chat.addParticipant(newUserId);

    const updatedChat = await Chat.findById(chatId)
      .populate("participants", "name username email profilePicture status")
      .populate("admin", "name username email");

    return res.status(200).json({
      success: true,
      message: "Participant added successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Add participant error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding participant",
    });
  }
};

// ==================== REMOVE PARTICIPANT ====================

export const removeParticipant = async (req, res) => {
  try {
    const { chatId, userId: removeUserId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.type !== "group") {
      return res.status(400).json({
        success: false,
        message: "Can only remove participants from group chats",
      });
    }

    if (!chat.isAdmin(userId) && userId !== removeUserId) {
      return res.status(403).json({
        success: false,
        message: "Only admin can remove other participants",
      });
    }

    if (!chat.isParticipant(removeUserId)) {
      return res.status(400).json({
        success: false,
        message: "User is not a participant",
      });
    }

    await chat.removeParticipant(removeUserId);

    const updatedChat = await Chat.findById(chatId)
      .populate("participants", "name username email profilePicture status")
      .populate("admin", "name username email");

    return res.status(200).json({
      success: true,
      message: "Participant removed successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Remove participant error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing participant",
    });
  }
};

// ==================== MARK CHAT AS READ ====================

export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

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
        message: "You are not a participant of this chat",
      });
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        status: { $ne: "read" },
      },
      {
        $set: { status: "read", readAt: new Date() },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Chat marked as read",
    });
  } catch (error) {
    console.error("Mark chat as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking chat as read",
    });
  }
};

// ==================== PIN/UNPIN CHAT ====================

export const togglePinChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { pinned } = req.body;
    const userId = req.userId;

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
        message: "You are not a participant of this chat",
      });
    }

    // If trying to pin, check the limit of 3 pinned chats
    if (pinned) {
      const allUserChats = await Chat.find({
        participants: userId,
        isActive: true,
      });

      const pinnedCount = allUserChats.filter((c) => {
        const userPref = c.userPreferences.find(
          (pref) => pref.userId.toString() === userId.toString()
        );
        return userPref?.pinned === true;
      }).length;

      if (pinnedCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "You can only pin up to 3 chats. Unpin a chat first.",
        });
      }
    }

    // Find existing preference or create new one
    const existingPrefIndex = chat.userPreferences.findIndex(
      (pref) => pref.userId.toString() === userId.toString()
    );

    if (existingPrefIndex !== -1) {
      // Update existing preference
      chat.userPreferences[existingPrefIndex].pinned = pinned;
    } else {
      // Create new preference
      chat.userPreferences.push({
        userId,
        pinned,
        archived: false,
      });
    }

    await chat.save();

    return res.status(200).json({
      success: true,
      message: pinned ? "Chat pinned" : "Chat unpinned",
      chat,
    });
  } catch (error) {
    console.error("Toggle pin chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while toggling pin",
    });
  }
};

// ==================== ARCHIVE/UNARCHIVE CHAT ====================

export const toggleArchiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { archived } = req.body;
    const userId = req.userId;

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
        message: "You are not a participant of this chat",
      });
    }

    // Find existing preference or create new one
    const existingPrefIndex = chat.userPreferences.findIndex(
      (pref) => pref.userId.toString() === userId.toString()
    );

    if (existingPrefIndex !== -1) {
      // Update existing preference
      chat.userPreferences[existingPrefIndex].archived = archived;
    } else {
      // Create new preference
      chat.userPreferences.push({
        userId,
        pinned: false,
        archived,
      });
    }

    await chat.save();

    return res.status(200).json({
      success: true,
      message: archived ? "Chat archived" : "Chat unarchived",
      chat,
    });
  } catch (error) {
    console.error("Toggle archive chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while toggling archive",
    });
  }
};

export default {
  createChat,
  getUserChats,
  getChatById,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant,
  markChatAsRead,
  togglePinChat,
  toggleArchiveChat,
};
