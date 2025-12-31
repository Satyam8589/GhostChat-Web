import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { logAuditEvent } from "../services/auditService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      uploadedBy: req.userId,
      uploadedAt: new Date(),
    };

    await logAuditEvent(req.userId, "file_upload", {
      severity: "low",
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: fileData,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during file upload",
    });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(__dirname, "../uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    await logAuditEvent(req.userId, "file_download", {
      severity: "low",
      metadata: {
        filename: filename,
      },
    });

    res.download(filePath);
  } catch (error) {
    console.error("File download error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during file download",
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(__dirname, "../uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    fs.unlinkSync(filePath);

    await logAuditEvent(req.userId, "file_delete", {
      severity: "medium",
      metadata: {
        filename: filename,
      },
    });

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("File delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during file deletion",
    });
  }
};

export const getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(__dirname, "../uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const stats = fs.statSync(filePath);

    const fileInfo = {
      filename: filename,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      url: `/uploads/${filename}`,
    };

    return res.status(200).json({
      success: true,
      message: "File info retrieved successfully",
      data: fileInfo,
    });
  } catch (error) {
    console.error("Get file info error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during file info retrieval",
    });
  }
};
