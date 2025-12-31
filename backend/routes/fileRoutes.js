import { Router } from "express";
import { uploadFile, downloadFile, deleteFile, getFileInfo } from "../controllers/fileController.js";
import { verifyToken } from "../middleware/auth.js";
import upload from "../config/upload.js";

const router = Router();

router.route("/upload").post(verifyToken, upload.single("file"), uploadFile);
router.route("/download/:filename").get(verifyToken, downloadFile);
router.route("/delete/:filename").delete(verifyToken, deleteFile);
router.route("/info/:filename").get(verifyToken, getFileInfo);

export default router;
