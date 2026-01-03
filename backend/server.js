import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import { initializeSocket } from "./socket/socket.js";
import { validateEncryptionKey } from "./utils/encryption.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/status", statusRoutes);

const start = async () => {
  try {
    // Validate encryption key
    console.log("🔐 Validating encryption configuration...");
    validateEncryptionKey();

    await connectDB();
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO is ready for connections`);
      console.log(`🔒 AES-256 encryption is active for messages`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

start();
