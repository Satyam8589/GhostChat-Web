import { io } from "socket.io-client";
import { BASE_URL } from "../../config";

// Socket.IO client instance
let socket = null;

// Socket configuration
const SOCKET_CONFIG = {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
  autoConnect: false, // We'll connect manually after authentication
  transports: ["websocket", "polling"],
};

/**
 * Initialize Socket.IO connection
 * @param {string} token - Authentication token
 * @returns {Socket} Socket instance
 */
export const initializeSocket = (token) => {
  // If socket exists and is connected, return it
  if (socket && socket.connected) {
    console.log("✅ Socket already connected, reusing existing connection");
    return socket;
  }

  // If socket exists but is disconnected, try to reconnect
  if (socket && !socket.connected) {
    console.log("🔄 Socket exists but disconnected, attempting reconnection...");
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  // Use the same BASE_URL that works for API calls
  // This ensures consistency between HTTP and WebSocket connections
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || BASE_URL;
  
  console.log("🔌 Initializing new socket connection...");
  console.log("📍 Socket URL:", SOCKET_URL);
  console.log("🌍 Environment:", process.env.NODE_ENV);

  socket = io(SOCKET_URL, {
    ...SOCKET_CONFIG,
    auth: {
      token: token,
    },
    // Force polling first in production for better compatibility
    transports: process.env.NODE_ENV === "production" 
      ? ["polling", "websocket"] 
      : ["websocket", "polling"],
  });

  console.log("📡 Socket instance created");
  console.log("🔧 Config:", {
    reconnection: SOCKET_CONFIG.reconnection,
    timeout: SOCKET_CONFIG.timeout,
    transports: socket.io.opts.transports,
  });

  // Connection event handlers
  socket.on("connect", () => {
    errorLogged = false; // Reset error flag on successful connection
    console.log("✅ Socket connected successfully!");
    console.log("🆔 Socket ID:", socket.id);
    console.log("🔗 Connected to:", SOCKET_URL);
    console.log("🚀 Transport:", socket.io.engine.transport.name);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚠️ Socket disconnected");
    console.log("📍 Reason:", reason);
    if (reason === "io server disconnect") {
      console.log("🔄 Server disconnected, attempting manual reconnection...");
      socket.connect();
    }
  });

  let errorLogged = false;
  socket.on("connect_error", (error) => {
    // Only log error once to avoid console spam
    if (!errorLogged) {
      errorLogged = true;
      console.error("❌ Socket connection error:");
      console.error("📍 Error message:", error.message);
      console.error("📍 Error type:", error.type);
      console.error("📍 Attempted URL:", SOCKET_URL);
      console.error("💡 Troubleshooting:");
      console.error("   1. Check if NEXT_PUBLIC_API_URL is set correctly");
      console.error("   2. Verify backend is running and accessible");
      console.error("   3. Check CORS configuration on backend");
      console.error("   4. Ensure token is valid");
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    errorLogged = false;
    console.log("✅ Socket reconnected successfully!");
    console.log("📊 Attempt number:", attemptNumber);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
  });

  socket.on("reconnect_error", (error) => {
    console.log("⚠️ Reconnection failed, will retry...");
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ All reconnection attempts failed");
    console.error("💡 Please check your internet connection and backend status");
  });

  // Connect the socket
  console.log("🚀 Connecting socket...");
  socket.connect();

  return socket;
};

/**
 * Get the current socket instance
 * @returns {Socket|null} Socket instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Emit an event to the server
 * @param {string} event - Event name
 * @param {any} data - Data to send
 * @param {Function} callback - Optional callback
 */
export const emitEvent = (event, data, callback) => {
  if (socket && socket.connected) {
    socket.emit(event, data, callback);
  }
};

/**
 * Listen to an event from the server
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

/**
 * Remove event listener
 * @param {string} event - Event name
 * @param {Function} callback - Optional specific callback to remove
 */
export const offEvent = (event, callback) => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};

/**
 * Check if socket is connected
 * @returns {boolean} Connection status
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  emitEvent,
  onEvent,
  offEvent,
  isSocketConnected,
};
