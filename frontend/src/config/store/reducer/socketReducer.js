/**
 * Socket Redux Reducer
 * Manages socket connection state and real-time events
 */

import { SOCKET_ACTION_TYPES } from "../action/socketAction";

const initialState = {
  // Connection state
  connected: false,
  connecting: false,
  socketId: null,
  error: null,

  // Online users
  onlineUsers: [],

  // Typing indicators
  typingUsers: {}, // { chatId: [userId1, userId2, ...] }

  // Real-time messages
  realtimeMessages: [],

  // Notifications
  realtimeNotifications: [],

  // Call state
  incomingCall: null,
  activeCall: null,

  // Last activity
  lastActivity: null,
};

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==================== CONNECTION ====================

    case SOCKET_ACTION_TYPES.SOCKET_CONNECT_REQUEST:
      return {
        ...state,
        connecting: true,
        error: null,
      };

    case SOCKET_ACTION_TYPES.SOCKET_CONNECTED:
      return {
        ...state,
        connected: true,
        connecting: false,
        socketId: action.payload.socketId,
        error: null,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.SOCKET_DISCONNECTED:
      return {
        ...state,
        connected: false,
        connecting: false,
        socketId: null,
        onlineUsers: [],
        typingUsers: {},
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.SOCKET_ERROR:
      return {
        ...state,
        connected: false,
        connecting: false,
        error: action.payload.error,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.SOCKET_RECONNECTING:
      return {
        ...state,
        connecting: true,
        lastActivity: new Date().toISOString(),
      };

    // ==================== USER STATUS ====================

    case SOCKET_ACTION_TYPES.USER_ONLINE:
      return {
        ...state,
        onlineUsers: [
          ...new Set([...state.onlineUsers, action.payload.userId]),
        ],
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.USER_OFFLINE:
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter(
          (id) => id !== action.payload.userId
        ),
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.USER_TYPING: {
      const { chatId, userId } = action.payload;
      const chatTypingUsers = state.typingUsers[chatId] || [];

      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [chatId]: [...new Set([...chatTypingUsers, userId])],
        },
        lastActivity: new Date().toISOString(),
      };
    }

    case SOCKET_ACTION_TYPES.USER_STOP_TYPING: {
      const { chatId, userId } = action.payload;
      const chatTypingUsers = state.typingUsers[chatId] || [];

      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [chatId]: chatTypingUsers.filter((id) => id !== userId),
        },
        lastActivity: new Date().toISOString(),
      };
    }

    // ==================== MESSAGES ====================

    case SOCKET_ACTION_TYPES.MESSAGE_RECEIVED:
      return {
        ...state,
        realtimeMessages: [action.payload, ...state.realtimeMessages].slice(
          0,
          100
        ), // Keep last 100
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.MESSAGE_DELIVERED:
      return {
        ...state,
        realtimeMessages: state.realtimeMessages.map((msg) =>
          msg._id === action.payload.messageId
            ? {
                ...msg,
                status: "delivered",
                deliveredAt: action.payload.deliveredAt,
              }
            : msg
        ),
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.MESSAGE_READ:
      return {
        ...state,
        realtimeMessages: state.realtimeMessages.map((msg) =>
          msg._id === action.payload.messageId
            ? { ...msg, status: "read", readAt: action.payload.readAt }
            : msg
        ),
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.MESSAGE_DELETED:
      return {
        ...state,
        realtimeMessages: state.realtimeMessages.filter(
          (msg) => msg._id !== action.payload.messageId
        ),
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.MESSAGE_EDITED:
      return {
        ...state,
        realtimeMessages: state.realtimeMessages.map((msg) =>
          msg._id === action.payload.messageId
            ? {
                ...msg,
                content: action.payload.content,
                edited: true,
                editedAt: action.payload.editedAt,
              }
            : msg
        ),
        lastActivity: new Date().toISOString(),
      };

    // ==================== CHATS ====================

    case SOCKET_ACTION_TYPES.CHAT_CREATED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.CHAT_RECEIVED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.CHAT_UPDATED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.CHAT_DELETED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    // ==================== GROUPS ====================

    case SOCKET_ACTION_TYPES.GROUP_CREATED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.GROUP_UPDATED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.GROUP_MEMBER_ADDED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.GROUP_MEMBER_REMOVED:
      return {
        ...state,
        lastActivity: new Date().toISOString(),
      };

    // ==================== NOTIFICATIONS ====================

    case SOCKET_ACTION_TYPES.NOTIFICATION_RECEIVED:
      return {
        ...state,
        realtimeNotifications: [
          action.payload,
          ...state.realtimeNotifications,
        ].slice(0, 50), // Keep last 50
        lastActivity: new Date().toISOString(),
      };

    // ==================== CALLS ====================

    case SOCKET_ACTION_TYPES.CALL_INCOMING:
      return {
        ...state,
        incomingCall: action.payload,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.CALL_ACCEPTED:
      return {
        ...state,
        activeCall: action.payload,
        incomingCall: null,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.CALL_REJECTED:
      return {
        ...state,
        incomingCall: null,
        lastActivity: new Date().toISOString(),
      };

    case SOCKET_ACTION_TYPES.CALL_ENDED:
      return {
        ...state,
        activeCall: null,
        incomingCall: null,
        lastActivity: new Date().toISOString(),
      };

    // ==================== DEFAULT ====================

    default:
      return state;
  }
};

export default socketReducer;
