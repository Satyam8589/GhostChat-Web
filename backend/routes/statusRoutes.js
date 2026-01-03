import { Router } from "express";
import { updateUserStatus } from "../controllers/statusController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.route("/update").put(verifyToken, updateUserStatus);

export default router;
