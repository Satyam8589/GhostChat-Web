/**
 * Socket.IO Event Constants and Handlers
 * Centralized event management for real-time communication
 */

import { SOCKET_ACTION_TYPES } from "../../config/store/action/socketAction";

// ==================== EVENT NAMES ====================

// Connection Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",

  // User Events
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_TYPING: "user:typing",
  USER_STOP_TYPING: "user:stop_typing",

  // Message Events
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVE: "message:receive",
  MESSAGE_DELIVERED: "message:delivered",
  MESSAGE_READ: "message:read",
  MESSAGE_DELETE: "message:delete",
  MESSAGE_EDIT: "message:edit",

  // Chat Events
  CHAT_CREATE: "chat:create",
  CHAT_NEW: "chat:new",
  CHAT_UPDATE: "chat:update",
  CHAT_DELETE: "chat:delete",
  CHAT_JOIN: "chat:join",
  CHAT_LEAVE: "chat:leave",

  // Group Events
  GROUP_CREATE: "group:create",
  GROUP_UPDATE: "group:update",
  GROUP_DELETE: "group:delete",
  GROUP_MEMBER_ADD: "group:member:add",
  GROUP_MEMBER_REMOVE: "group:member:remove",
  GROUP_ADMIN_ADD: "group:admin:add",
  GROUP_ADMIN_REMOVE: "group:admin:remove",

  // Notification Events
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_DELETE: "notification:delete",

  // Call Events
  CALL_INITIATE: "call:initiate",
  CALL_ACCEPT: "call:accept",
  CALL_REJECT: "call:reject",
  CALL_END: "call:end",
  CALL_OFFER: "call:offer",
  CALL_ANSWER: "call:answer",
  CALL_ICE_CANDIDATE: "call:ice_candidate",

  // Error Events
  ERROR: "error",
  UNAUTHORIZED: "unauthorized",
};

// ==================== EVENT HANDLERS ====================

/**
 * Setup all socket event listeners
 * @param {Socket} socket - Socket instance
 * @param {Function} dispatch - Redux dispatch function
 */
export const setupSocketListeners = (socket, dispatch) => {
  if (!socket) {
    console.warn("Socket is not initialized");
    return;
  }

  // Connection Events
  socket.on(SOCKET_EVENTS.CONNECT, () => {
    dispatch({
      type: SOCKET_ACTION_TYPES.SOCKET_CONNECTED,
      payload: { socketId: socket.id },
    });
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    dispatch({
      type: SOCKET_ACTION_TYPES.SOCKET_DISCONNECTED,
      payload: { reason },
    });
  });

  socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
    // Error already logged in socket.js, just dispatch to Redux
    dispatch({
      type: SOCKET_ACTION_TYPES.SOCKET_ERROR,
      payload: { error: error.message },
    });
  });

  // User Events
  socket.on(SOCKET_EVENTS.USER_ONLINE, (data) => {
    dispatch({ type: "USER_ONLINE", payload: data });
  });

  socket.on(SOCKET_EVENTS.USER_OFFLINE, (data) => {
    dispatch({ type: "USER_OFFLINE", payload: data });
  });

  socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
    dispatch({ type: "USER_TYPING", payload: data });
  });

  socket.on(SOCKET_EVENTS.USER_STOP_TYPING, (data) => {
    dispatch({ type: "USER_STOP_TYPING", payload: data });
  });

  // Message Events
  socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, (data) => {
    // Dispatch to socket reducer
    dispatch({ type: "MESSAGE_RECEIVED", payload: data });
    // Dispatch to message reducer to add the message
    dispatch({ type: "message/addMessageFromSocket", payload: data });
  });

  socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, (data) => {
    dispatch({ type: "MESSAGE_DELIVERED", payload: data });
    // Update message status in message reducer
    dispatch({
      type: "message/updateMessageFromSocket",
      payload: { ...data, status: "delivered" },
    });
  });

  socket.on(SOCKET_EVENTS.MESSAGE_READ, (data) => {
    dispatch({ type: "MESSAGE_READ", payload: data });
    // Update message status in message reducer
    dispatch({
      type: "message/updateMessageFromSocket",
      payload: data,
    });
  });

  socket.on(SOCKET_EVENTS.MESSAGE_DELETE, (data) => {
    dispatch({ type: "MESSAGE_DELETED", payload: data });
    // Remove message from message reducer
    dispatch({ type: "message/deleteMessageFromSocket", payload: data });
  });

  socket.on(SOCKET_EVENTS.MESSAGE_EDIT, (data) => {
    dispatch({ type: "MESSAGE_EDITED", payload: data });
    // Update message in message reducer
    dispatch({ type: "message/updateMessageFromSocket", payload: data });
  });

  // Chat Events
  socket.on(SOCKET_EVENTS.CHAT_CREATE, (data) => {
    dispatch({ type: "CHAT_CREATED", payload: data });
  });

  socket.on(SOCKET_EVENTS.CHAT_NEW, (data) => {
    // Dispatch to socket reducer for tracking
    dispatch({ type: "CHAT_RECEIVED", payload: data });
    // Dispatch to chat reducer to add to chat list
    dispatch({ type: "chat/handleChatReceived", payload: data });
  });

  socket.on(SOCKET_EVENTS.CHAT_UPDATE, (data) => {
    dispatch({ type: "CHAT_UPDATED", payload: data });
  });

  socket.on(SOCKET_EVENTS.CHAT_DELETE, (data) => {
    dispatch({ type: "CHAT_DELETED", payload: data });
  });

  // Group Events
  socket.on(SOCKET_EVENTS.GROUP_CREATE, (data) => {
    dispatch({ type: "GROUP_CREATED", payload: data });
  });

  socket.on(SOCKET_EVENTS.GROUP_UPDATE, (data) => {
    dispatch({ type: "GROUP_UPDATED", payload: data });
  });

  socket.on(SOCKET_EVENTS.GROUP_MEMBER_ADD, (data) => {
    dispatch({ type: "GROUP_MEMBER_ADDED", payload: data });
  });

  socket.on(SOCKET_EVENTS.GROUP_MEMBER_REMOVE, (data) => {
    dispatch({ type: "GROUP_MEMBER_REMOVED", payload: data });
  });

  // Notification Events
  socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, (data) => {
    dispatch({ type: "NOTIFICATION_RECEIVED", payload: data });
  });

  // Call Events
  socket.on(SOCKET_EVENTS.CALL_INITIATE, (data) => {
    dispatch({ type: "CALL_INCOMING", payload: data });
  });

  socket.on(SOCKET_EVENTS.CALL_ACCEPT, (data) => {
    dispatch({ type: "CALL_ACCEPTED", payload: data });
  });

  socket.on(SOCKET_EVENTS.CALL_REJECT, (data) => {
    dispatch({ type: "CALL_REJECTED", payload: data });
  });

  socket.on(SOCKET_EVENTS.CALL_END, (data) => {
    dispatch({ type: "CALL_ENDED", payload: data });
  });

  // Error Events
  socket.on(SOCKET_EVENTS.ERROR, (error) => {
    console.error("🔴 Socket error:", error);
    dispatch({ type: "SOCKET_ERROR", payload: { error } });
  });

  socket.on(SOCKET_EVENTS.UNAUTHORIZED, () => {
    console.error("🔴 Unauthorized socket connection");
    dispatch({ type: "SOCKET_UNAUTHORIZED" });
  });
};

/**
 * Remove all socket event listeners
 * @param {Socket} socket - Socket instance
 */
export const removeSocketListeners = (socket) => {
  if (!socket) return;

  Object.values(SOCKET_EVENTS).forEach((event) => {
    socket.off(event);
  });
};

// ==================== EMIT HELPERS ====================

/**
 * Emit helper functions for common events
 */
export const socketEmitters = {
  // Send a message
  sendMessage: (socket, messageData) => {
    socket.emit(SOCKET_EVENTS.MESSAGE_SEND, messageData);
  },

  // Mark message as delivered
  markMessageDelivered: (socket, messageId) => {
    socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, { messageId });
  },

  // Mark message as read
  markMessageRead: (socket, messageId) => {
    socket.emit(SOCKET_EVENTS.MESSAGE_READ, { messageId });
  },

  // User typing
  userTyping: (socket, chatId) => {
    socket.emit(SOCKET_EVENTS.USER_TYPING, { chatId });
  },

  // User stopped typing
  userStopTyping: (socket, chatId) => {
    socket.emit(SOCKET_EVENTS.USER_STOP_TYPING, { chatId });
  },

  // Join chat room
  joinChat: (socket, chatId) => {
    socket.emit(SOCKET_EVENTS.CHAT_JOIN, { chatId });
  },

  // Leave chat room
  leaveChat: (socket, chatId) => {
    socket.emit(SOCKET_EVENTS.CHAT_LEAVE, { chatId });
  },

  // Create group
  createGroup: (socket, groupData) => {
    socket.emit(SOCKET_EVENTS.GROUP_CREATE, groupData);
  },

  // Initiate call
  initiateCall: (socket, callData) => {
    socket.emit(SOCKET_EVENTS.CALL_INITIATE, callData);
  },

  // Accept call
  acceptCall: (socket, callId) => {
    socket.emit(SOCKET_EVENTS.CALL_ACCEPT, { callId });
  },

  // Reject call
  rejectCall: (socket, callId) => {
    socket.emit(SOCKET_EVENTS.CALL_REJECT, { callId });
  },

  // End call
  endCall: (socket, callId) => {
    socket.emit(SOCKET_EVENTS.CALL_END, { callId });
  },
};

export default {
  SOCKET_EVENTS,
  setupSocketListeners,
  removeSocketListeners,
  socketEmitters,
};
