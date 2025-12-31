import { Router } from "express";
import { sendMessage, receiveMessage, markAsRead } from "../controllers/messageController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.route("/send").post(verifyToken, sendMessage);
router.route("/receive/:chatId").get(verifyToken, receiveMessage);
router.route("/markAsRead/:chatId").get(verifyToken, markAsRead);

export default router;
