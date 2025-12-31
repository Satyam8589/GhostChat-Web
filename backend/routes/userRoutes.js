import { Router } from "express";
import { userProfile, search, updateProfile } from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.route("/profile").get(verifyToken, userProfile);
router.route("/search").get(verifyToken, search);
router.route("/update").put(verifyToken, updateProfile);

export default router;
