/**
 * Message Redux Reducer
 * Manages message state including messages by chat, loading, and errors
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  sendMessage,
  fetchMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
} from "../action/messageAction";

const initialState = {
  messagesByChat: {}, // Object with chatId as key, array of messages as value
  loading: false,
  sending: false,
  error: null,
  activeChat: null, // Currently active chat ID
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    // Set active chat
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },

    // Clear messages for a specific chat
    clearChatMessages: (state, action) => {
      const chatId = action.payload;
      delete state.messagesByChat[chatId];
    },

    // Clear all messages
    clearAllMessages: (state) => {
      state.messagesByChat = {};
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Add message from socket (real-time)
    addMessageFromSocket: (state, action) => {
      const payload = action.payload;
      // Handle different payload structures
      const message = payload.message || payload;
      const chatId = payload.chatId || message.chat || message.chatId;

      if (!chatId) {
        console.error("Cannot add message: chatId is missing", payload);
        return;
      }

      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }

      // Check if message already exists
      const exists = state.messagesByChat[chatId].some(
        (msg) => msg._id === message._id
      );

      if (!exists) {
        state.messagesByChat[chatId].push(message);
      }
    },

    // Update message from socket (edit/read status)
    updateMessageFromSocket: (state, action) => {
      const payload = action.payload;

      // Handle different payload structures
      if (payload.messageIds) {
        // Batch update for multiple messages (read status)
        const { chatId, messageIds, readBy, readAt } = payload;
        if (state.messagesByChat[chatId]) {
          state.messagesByChat[chatId] = state.messagesByChat[chatId].map(
            (msg) => {
              if (messageIds.includes(msg._id)) {
                return {
                  ...msg,
                  status: "read",
                  readAt: readAt,
                  readBy: [...(msg.readBy || []), { userId: readBy, readAt }],
                };
              }
              return msg;
            }
          );
        }
      } else if (payload.messageId) {
        // Single message update
        const { chatId, messageId, status, updates } = payload;
        if (state.messagesByChat[chatId]) {
          const messageIndex = state.messagesByChat[chatId].findIndex(
            (msg) => msg._id === messageId
          );
          if (messageIndex !== -1) {
            state.messagesByChat[chatId][messageIndex] = {
              ...state.messagesByChat[chatId][messageIndex],
              status:
                status || state.messagesByChat[chatId][messageIndex].status,
              ...updates,
            };
          }
        }
      }
    },

    // Delete message from socket
    deleteMessageFromSocket: (state, action) => {
      const { chatId, messageId } = action.payload;
      if (state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = state.messagesByChat[chatId].filter(
          (msg) => msg._id !== messageId
        );
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ==================== SEND MESSAGE ====================
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.error = null;

        const message = action.payload.data || action.payload.message;
        const chatId = message.chat;

        if (!state.messagesByChat[chatId]) {
          state.messagesByChat[chatId] = [];
        }

        // Add message if it doesn't exist
        const exists = state.messagesByChat[chatId].some(
          (msg) => msg._id === message._id
        );
        if (!exists) {
          state.messagesByChat[chatId].push(message);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      // ==================== FETCH MESSAGES ====================
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { chatId, messages } = action.payload;
        state.messagesByChat[chatId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== MARK AS READ ====================
      .addCase(markMessagesAsRead.pending, (state) => {
        // Don't show loading for mark as read
        state.error = null;
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.error = null;
        const { chatId } = action.payload;

        // Update all messages in the chat to read status
        if (state.messagesByChat[chatId]) {
          state.messagesByChat[chatId] = state.messagesByChat[chatId].map(
            (msg) => ({
              ...msg,
              status: "read",
            })
          );
        }
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ==================== DELETE MESSAGE ====================
      .addCase(deleteMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.error = null;
        const { chatId, messageId } = action.payload;

        if (state.messagesByChat[chatId]) {
          // Remove message from array
          state.messagesByChat[chatId] = state.messagesByChat[chatId].filter(
            (msg) => msg._id !== messageId
          );
        }
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ==================== EDIT MESSAGE ====================
      .addCase(editMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        state.error = null;
        const { chatId, messageId, message } = action.payload;

        if (state.messagesByChat[chatId]) {
          const messageIndex = state.messagesByChat[chatId].findIndex(
            (msg) => msg._id === messageId
          );
          if (messageIndex !== -1) {
            state.messagesByChat[chatId][messageIndex] = {
              ...state.messagesByChat[chatId][messageIndex],
              ...message,
              isEdited: true,
            };
          }
        }
      })
      .addCase(editMessage.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setActiveChat,
  clearChatMessages,
  clearAllMessages,
  clearError,
  addMessageFromSocket,
  updateMessageFromSocket,
  deleteMessageFromSocket,
} = messageSlice.actions;

export default messageSlice.reducer;
