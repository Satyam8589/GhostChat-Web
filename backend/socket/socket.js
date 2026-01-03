import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModule.js";

let io;

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 */
export const initializeSocket = (server) => {
  // CORS Configuration - Support multiple origins
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or matches Vercel preview pattern
        if (allowedOrigins.includes(origin) || origin.includes(".vercel.app")) {
          callback(null, true);
        } else {
          console.warn(`Socket.IO CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.deviceId = decoded.deviceId;

      // Update user status to online
      await User.findByIdAndUpdate(decoded.userId, {
        status: "online",
        lastSeen: new Date(),
      });

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Broadcast user online status
    socket.broadcast.emit("user:online", {
      userId: socket.userId,
      timestamp: new Date(),
    });

    // ==================== CHAT EVENTS ====================

    // Join chat room
    socket.on("chat:join", ({ chatId }) => {
      socket.join(`chat:${chatId}`);
      console.log(
        `✅ User ${socket.userId} (Socket: ${socket.id}) joined chat room: ${chatId}`
      );

      // Get room members count
      const roomSize =
        io.sockets.adapter.rooms.get(`chat:${chatId}`)?.size || 0;
      console.log(`📊 Room ${chatId} now has ${roomSize} member(s)`);

      // Send confirmation to the user
      socket.emit("chat:joined", {
        chatId,
        socketId: socket.id,
        userId: socket.userId,
        roomSize: roomSize,
        message: "You are now connected to the room",
        timestamp: new Date(),
      });
    });

    // Leave chat room
    socket.on("chat:leave", ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // ==================== MESSAGE EVENTS ====================

    // Send message
    socket.on("message:send", (data) => {
      const { chatId, receiverId, content, type, timestamp } = data;

      const messageData = {
        _id: `msg_${Date.now()}`,
        chatId,
        senderId: socket.userId,
        receiverId,
        content,
        type,
        timestamp: timestamp || new Date(),
        status: "sent",
      };

      // Send to chat room
      io.to(`chat:${chatId}`).emit("message:receive", messageData);

      // Send to receiver's personal room
      if (receiverId) {
        io.to(`user:${receiverId}`).emit("message:receive", messageData);
      }

      console.log(`Message sent in chat ${chatId}`);
    });

    // Message delivered
    socket.on("message:delivered", ({ messageId }) => {
      socket.broadcast.emit("message:delivered", {
        messageId,
        deliveredAt: new Date(),
      });
    });

    // Message read
    socket.on("message:read", ({ messageId }) => {
      socket.broadcast.emit("message:read", {
        messageId,
        readAt: new Date(),
      });
    });

    // ==================== TYPING EVENTS ====================

    // User typing
    socket.on("user:typing", ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit("user:typing", {
        userId: socket.userId,
        chatId,
      });
    });

    // User stopped typing
    socket.on("user:stop_typing", ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit("user:stop_typing", {
        userId: socket.userId,
        chatId,
      });
    });

    // ==================== GROUP EVENTS ====================

    // Create group
    socket.on("group:create", (data) => {
      const { groupId, name, members } = data;

      // Notify all members
      members.forEach((memberId) => {
        io.to(`user:${memberId}`).emit("group:create", {
          groupId,
          name,
          members,
          createdBy: socket.userId,
          createdAt: new Date(),
        });
      });

      console.log(`Group ${groupId} created by ${socket.userId}`);
    });

    // Add member to group
    socket.on("group:member:add", ({ groupId, userId }) => {
      io.to(`user:${userId}`).emit("group:member:add", {
        groupId,
        userId,
        addedBy: socket.userId,
        addedAt: new Date(),
      });
    });

    // Remove member from group
    socket.on("group:member:remove", ({ groupId, userId }) => {
      io.to(`user:${userId}`).emit("group:member:remove", {
        groupId,
        userId,
        removedBy: socket.userId,
        removedAt: new Date(),
      });
    });

    // ==================== CALL EVENTS ====================

    // Initiate call
    socket.on("call:initiate", (data) => {
      const { receiverId, callType, callId } = data;

      io.to(`user:${receiverId}`).emit("call:initiate", {
        callId,
        callerId: socket.userId,
        callerName: data.callerName,
        callType,
        timestamp: new Date(),
      });

      console.log(`Call initiated from ${socket.userId} to ${receiverId}`);
    });

    // Accept call
    socket.on("call:accept", ({ callId, callerId }) => {
      io.to(`user:${callerId}`).emit("call:accept", {
        callId,
        acceptedBy: socket.userId,
        timestamp: new Date(),
      });
    });

    // Reject call
    socket.on("call:reject", ({ callId, callerId }) => {
      io.to(`user:${callerId}`).emit("call:reject", {
        callId,
        rejectedBy: socket.userId,
        timestamp: new Date(),
      });
    });

    // End call
    socket.on("call:end", ({ callId, receiverId }) => {
      io.to(`user:${receiverId}`).emit("call:end", {
        callId,
        endedBy: socket.userId,
        timestamp: new Date(),
      });
    });

    // WebRTC signaling
    socket.on("call:offer", ({ receiverId, offer }) => {
      io.to(`user:${receiverId}`).emit("call:offer", {
        senderId: socket.userId,
        offer,
      });
    });

    socket.on("call:answer", ({ callerId, answer }) => {
      io.to(`user:${callerId}`).emit("call:answer", {
        senderId: socket.userId,
        answer,
      });
    });

    socket.on("call:ice_candidate", ({ receiverId, candidate }) => {
      io.to(`user:${receiverId}`).emit("call:ice_candidate", {
        senderId: socket.userId,
        candidate,
      });
    });

    // ==================== NOTIFICATION EVENTS ====================

    socket.on("notification:send", ({ userId, notification }) => {
      io.to(`user:${userId}`).emit("notification:new", notification);
    });

    // ==================== DISCONNECT ====================

    socket.on("disconnect", async () => {
      console.log(
        `❌ User disconnected: ${socket.userId} (Socket: ${socket.id})`
      );

      try {
        // Update user status to offline
        await User.findByIdAndUpdate(socket.userId, {
          status: "offline",
          lastSeen: new Date(),
        });

        // Broadcast user offline status
        socket.broadcast.emit("user:offline", {
          userId: socket.userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error updating user status on disconnect:", error);
      }
    });

    // Error handling
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  console.log("✅ Socket.IO server initialized");
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to chat room
 * @param {string} chatId - Chat ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToChat = (chatId, event, data) => {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
};

export default { initializeSocket, getIO, emitToUser, emitToChat };
