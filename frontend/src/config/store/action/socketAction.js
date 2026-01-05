/**
 * Socket Redux Actions
 * Actions for managing socket connection and real-time events
 */

import {
  initializeSocket,
  disconnectSocket,
  getSocket,
  emitEvent,
} from "../../../lib/socket/socket";
import {
  setupSocketListeners,
  removeSocketListeners,
  SOCKET_EVENTS,
  socketEmitters,
} from "../../../lib/socket/events";

// Action Types
export const SOCKET_ACTION_TYPES = {
  // Connection
  SOCKET_CONNECT_REQUEST: "SOCKET_CONNECT_REQUEST",
  SOCKET_CONNECTED: "SOCKET_CONNECTED",
  SOCKET_DISCONNECTED: "SOCKET_DISCONNECTED",
  SOCKET_ERROR: "SOCKET_ERROR",
  SOCKET_RECONNECTING: "SOCKET_RECONNECTING",

  // User Status
  USER_ONLINE: "USER_ONLINE",
  USER_OFFLINE: "USER_OFFLINE",
  USER_TYPING: "USER_TYPING",
  USER_STOP_TYPING: "USER_STOP_TYPING",

  // Messages
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  MESSAGE_DELIVERED: "MESSAGE_DELIVERED",
  MESSAGE_READ: "MESSAGE_READ",
  MESSAGE_DELETED: "MESSAGE_DELETED",
  MESSAGE_EDITED: "MESSAGE_EDITED",

  // Chats
  CHAT_CREATED: "CHAT_CREATED",
  CHAT_RECEIVED: "CHAT_RECEIVED",
  CHAT_UPDATED: "CHAT_UPDATED",
  CHAT_DELETED: "CHAT_DELETED",

  // Groups
  GROUP_CREATED: "GROUP_CREATED",
  GROUP_UPDATED: "GROUP_UPDATED",
  GROUP_MEMBER_ADDED: "GROUP_MEMBER_ADDED",
  GROUP_MEMBER_REMOVED: "GROUP_MEMBER_REMOVED",

  // Notifications
  NOTIFICATION_RECEIVED: "NOTIFICATION_RECEIVED",

  // Calls
  CALL_INCOMING: "CALL_INCOMING",
  CALL_ACCEPTED: "CALL_ACCEPTED",
  CALL_REJECTED: "CALL_REJECTED",
  CALL_ENDED: "CALL_ENDED",
};

// ==================== CONNECTION ACTIONS ====================

/**
 * Connect to Socket.IO server
 * @param {string} token - Authentication token
 */
export const connectSocket = (token) => {
  return (dispatch) => {
    try {
      console.log("🔌 connectSocket action called with token");
      dispatch({ type: SOCKET_ACTION_TYPES.SOCKET_CONNECT_REQUEST });

      console.log("📡 Initializing socket...");
      const socket = initializeSocket(token);
      console.log("✅ Socket initialized:", socket ? "SUCCESS" : "FAILED");
      console.log("🔌 Socket ID:", socket?.id);
      console.log("🔗 Socket connected:", socket?.connected);

      // Setup all event listeners
      console.log("🎧 Setting up socket event listeners...");
      setupSocketListeners(socket, dispatch);
      console.log("✅ Socket event listeners setup complete");
    } catch (error) {
      dispatch({
        type: SOCKET_ACTION_TYPES.SOCKET_ERROR,
        payload: { error: error.message },
      });
    }
  };
};

/**
 * Disconnect from Socket.IO server
 */
export const disconnectSocketAction = () => {
  return (dispatch) => {
    try {
      const socket = getSocket();

      if (socket) {
        removeSocketListeners(socket);
        disconnectSocket();
      }

      dispatch({ type: SOCKET_ACTION_TYPES.SOCKET_DISCONNECTED });
    } catch (error) {
      dispatch({
        type: SOCKET_ACTION_TYPES.SOCKET_ERROR,
        payload: { error: error.message },
      });
    }
  };
};

// ==================== MESSAGE ACTIONS ====================

/**
 * Send a message via socket
 * @param {Object} messageData - Message data
 */
export const sendSocketMessage = (messageData) => {
  return (dispatch) => {
    try {
      const socket = getSocket();

      if (!socket || !socket.connected) {
        throw new Error("Socket is not connected");
      }

      socketEmitters.sendMessage(socket, messageData);
    } catch (error) {
      dispatch({
        type: SOCKET_ACTION_TYPES.SOCKET_ERROR,
        payload: { error: error.message },
      });
    }
  };
};

/**
 * Mark message as delivered
 * @param {string} messageId - Message ID
 */
export const markMessageDelivered = (messageId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.markMessageDelivered(socket, messageId);
      }
    } catch (error) {}
  };
};

/**
 * Mark message as read
 * @param {string} messageId - Message ID
 */
export const markMessageRead = (messageId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.markMessageRead(socket, messageId);
      }
    } catch (error) {}
  };
};

// ==================== TYPING ACTIONS ====================

/**
 * Emit user typing event
 * @param {string} chatId - Chat ID
 */
export const emitUserTyping = (chatId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.userTyping(socket, chatId);
      }
    } catch (error) {}
  };
};

/**
 * Emit user stopped typing event
 * @param {string} chatId - Chat ID
 */
export const emitUserStopTyping = (chatId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.userStopTyping(socket, chatId);
      }
    } catch (error) {}
  };
};

// ==================== CHAT ROOM ACTIONS ====================

/**
 * Join a chat room
 * @param {string} chatId - Chat ID
 */
export const joinChatRoom = (chatId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.joinChat(socket, chatId);
      }
    } catch (error) {}
  };
};

/**
 * Leave a chat room
 * @param {string} chatId - Chat ID
 */
export const leaveChatRoom = (chatId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.leaveChat(socket, chatId);
      }
    } catch (error) {}
  };
};

// ==================== GROUP ACTIONS ====================

/**
 * Create a group via socket
 * @param {Object} groupData - Group data
 */
export const createSocketGroup = (groupData) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.createGroup(socket, groupData);
      }
    } catch (error) {}
  };
};

// ==================== CALL ACTIONS ====================

/**
 * Initiate a call
 * @param {Object} callData - Call data (receiverId, callType, etc.)
 */
export const initiateCall = (callData) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.initiateCall(socket, callData);
      }
    } catch (error) {}
  };
};

/**
 * Accept a call
 * @param {string} callId - Call ID
 */
export const acceptCall = (callId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.acceptCall(socket, callId);
      }
    } catch (error) {}
  };
};

/**
 * Reject a call
 * @param {string} callId - Call ID
 */
export const rejectCall = (callId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.rejectCall(socket, callId);
      }
    } catch (error) {}
  };
};

/**
 * End a call
 * @param {string} callId - Call ID
 */
export const endCall = (callId) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socketEmitters.endCall(socket, callId);
      }
    } catch (error) {}
  };
};

// ==================== CUSTOM EVENT ACTION ====================

/**
 * Emit a custom socket event
 * @param {string} eventName - Event name
 * @param {any} data - Event data
 */
export const emitCustomEvent = (eventName, data) => {
  return () => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        emitEvent(eventName, data);
      }
    } catch (error) {}
  };
};

export default {
  connectSocket,
  disconnectSocketAction,
  sendSocketMessage,
  markMessageDelivered,
  markMessageRead,
  emitUserTyping,
  emitUserStopTyping,
  joinChatRoom,
  leaveChatRoom,
  createSocketGroup,
  initiateCall,
  acceptCall,
  rejectCall,
  endCall,
  emitCustomEvent,
};
