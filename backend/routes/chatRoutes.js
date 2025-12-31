import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { createChat } from "../controllers/chatController.js";

const router = Router();

router.route("/createChat").post(verifyToken, createChat);

export default router;
