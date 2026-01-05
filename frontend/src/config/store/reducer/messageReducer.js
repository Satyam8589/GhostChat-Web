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

      // ALWAYS log for debugging (even in production)
      console.log("📨 Socket message received:", payload);

      // Handle different payload structures
      // Backend sends: { chatId, message }
      const message = payload.message || payload;
      const chatId =
        payload.chatId || message.chat?._id || message.chat || message.chatId;

      if (!chatId) {
        console.error("❌ Cannot add message: chatId is missing", payload);
        return;
      }

      // Normalize chatId to string for consistent comparison
      const normalizedChatId = chatId.toString();

      if (!state.messagesByChat[normalizedChatId]) {
        state.messagesByChat[normalizedChatId] = [];
      }

      // Optimized: Check if message already exists using message ID
      const messageId = message._id?.toString();
      if (!messageId) {
        console.warn("⚠️ Message has no ID, skipping");
        return;
      }

      const exists = state.messagesByChat[normalizedChatId].some(
        (msg) => msg._id?.toString() === messageId
      );

      if (!exists) {
        // Create a new array to ensure React detects the change
        state.messagesByChat[normalizedChatId] = [
          ...state.messagesByChat[normalizedChatId],
          message,
        ];

        // ALWAYS log for debugging
        console.log(`✅ Added message to chat ${normalizedChatId}`);
      } else {
        console.log(`⚠️ Message already exists, not adding again`);
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
        const chatId = message.chat?.toString() || message.chat;

        if (!chatId) {
          console.error("❌ Cannot add sent message: chatId is missing");
          return;
        }

        if (!state.messagesByChat[chatId]) {
          state.messagesByChat[chatId] = [];
        }

        // Remove optimistic message (starts with "temp-") and add real message
        const messages = state.messagesByChat[chatId];
        const optimisticIndex = messages.findIndex(
          (msg) =>
            msg._id?.toString().startsWith("temp-") && msg.status === "sending"
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real message
          state.messagesByChat[chatId] = [
            ...messages.slice(0, optimisticIndex),
            message,
            ...messages.slice(optimisticIndex + 1),
          ];
          console.log("✅ Replaced optimistic message with real message");
        } else {
          // Add message if it doesn't exist (fallback)
          const exists = state.messagesByChat[chatId].some(
            (msg) => msg._id?.toString() === message._id?.toString()
          );
          if (!exists) {
            state.messagesByChat[chatId] = [
              ...state.messagesByChat[chatId],
              message,
            ];
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;

        // Remove optimistic message on failure
        Object.keys(state.messagesByChat).forEach((chatId) => {
          state.messagesByChat[chatId] = state.messagesByChat[chatId].filter(
            (msg) => !msg._id?.toString().startsWith("temp-")
          );
        });
        console.log("❌ Message sending failed, removed optimistic message");
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
