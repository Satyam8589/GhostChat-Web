import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
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
} from "../controllers/chatController.js";

const router = Router();

// ==================== CHAT ROUTES ====================

// Create new chat (private or group)
router.post("/create", verifyToken, createChat);

// Get all chats for current user
router.get("/user-chats", verifyToken, getUserChats);

// Get single chat by ID
router.get("/:chatId", verifyToken, getChatById);

// Update chat details
router.put("/:chatId", verifyToken, updateChat);

// Delete chat
router.delete("/:chatId", verifyToken, deleteChat);

// Add participant to group chat
router.post("/:chatId/participants", verifyToken, addParticipant);

// Remove participant from group chat
router.delete("/:chatId/participants/:userId", verifyToken, removeParticipant);

// Mark all messages in chat as read
router.put("/:chatId/read", verifyToken, markChatAsRead);

// Pin/unpin chat
router.put("/:chatId/pin", verifyToken, togglePinChat);

// Archive/unarchive chat
router.put("/:chatId/archive", verifyToken, toggleArchiveChat);

export default router;
