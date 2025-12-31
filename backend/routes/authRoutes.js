import { Router } from "express";
import { checkServer, register, login, logout } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.route("/").get(checkServer);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(verifyToken, logout);

export default router;
