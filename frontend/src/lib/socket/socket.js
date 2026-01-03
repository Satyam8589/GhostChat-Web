import { io } from "socket.io-client";

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
    console.log("Socket already connected");
    return socket;
  }

  // If socket exists but is disconnected, try to reconnect
  if (socket && !socket.connected) {
    console.log("Reconnecting existing socket...");
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  // Create new socket instance
  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

  socket = io(SOCKET_URL, {
    ...SOCKET_CONFIG,
    auth: {
      token: token,
    },
  });

  // Connection event handlers
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    errorLogged = false; // Reset error flag on successful connection
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  let errorLogged = false;
  socket.on("connect_error", (error) => {
    // Only log error once to avoid console spam
    if (!errorLogged) {
      console.error("🔴 Socket connection error:", error.message);
      console.log("💡 Make sure backend is running on port 5000");
      errorLogged = true;
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    errorLogged = false;
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    // Only log every 5th attempt to reduce spam
    if (attemptNumber % 5 === 0) {
      console.log("🔄 Reconnection attempt:", attemptNumber);
    }
  });

  socket.on("reconnect_error", (error) => {
    // Don't log reconnect errors, already logged in connect_error
  });

  socket.on("reconnect_failed", () => {
    console.error("🔴 Reconnection failed after maximum attempts");
  });

  // Connect the socket
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
    console.log("Socket disconnected and cleaned up");
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
  } else {
    console.warn("Socket is not connected. Cannot emit event:", event);
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
  } else {
    console.warn("Socket is not initialized. Cannot listen to event:", event);
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
