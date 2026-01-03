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
    return socket;
  }

  // If socket exists but is disconnected, try to reconnect
  if (socket && !socket.connected) {
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
    errorLogged = false; // Reset error flag on successful connection
  });

  socket.on("disconnect", (reason) => {});

  let errorLogged = false;
  socket.on("connect_error", (error) => {
    // Only log error once to avoid console spam
    if (!errorLogged) {
      errorLogged = true;
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    errorLogged = false;
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    // Silent reconnection attempts
  });

  socket.on("reconnect_error", (error) => {
    // Don't log reconnect errors, already logged in connect_error
  });

  socket.on("reconnect_failed", () => {
    // Reconnection failed silently
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
