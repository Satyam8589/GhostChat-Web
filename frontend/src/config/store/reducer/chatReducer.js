/**
 * Chat Redux Reducer
 * Manages chat state including chats list, active chat, loading, and errors
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  createChat,
  fetchUserChats,
  fetchChatById,
  updateChat,
  deleteChat,
  addParticipant,
  removeParticipant,
  markChatAsRead,
  togglePinChat,
  toggleArchiveChat,
} from "../action/chatAction";

const initialState = {
  chats: [], // Array of all user's chats
  activeChat: null, // Currently active/selected chat
  loading: false, // Loading state for async operations
  error: null, // Error message if any operation fails
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Set active chat (local action)
    setActive: (state, action) => {
      state.activeChat = action.payload;
    },

    // Clear active chat (local action)
    clearActive: (state) => {
      state.activeChat = null;
    },

    // Clear error (local action)
    clearError: (state) => {
      state.error = null;
    },

    // Update chat in list (for real-time updates from socket)
    updateChatInList: (state, action) => {
      const index = state.chats.findIndex(
        (chat) => chat._id === action.payload._id
      );
      if (index !== -1) {
        state.chats[index] = { ...state.chats[index], ...action.payload };
      }
    },

    // Add new chat to list (for real-time updates from socket)
    addChatToList: (state, action) => {
      const exists = state.chats.some(
        (chat) => chat._id === action.payload._id
      );
      if (!exists) {
        state.chats.unshift(action.payload);
      }
    },

    // Remove chat from list (for real-time updates from socket)
    removeChatFromList: (state, action) => {
      state.chats = state.chats.filter((chat) => chat._id !== action.payload);
    },

    // Handle incoming chat from socket (CHAT_RECEIVED)
    handleChatReceived: (state, action) => {
      const newChat = action.payload.chat;
      const exists = state.chats.some((chat) => chat._id === newChat._id);
      if (!exists) {
        state.chats.unshift(newChat);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ==================== CREATE CHAT ====================
      .addCase(createChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Add new chat to the beginning of the list
        const newChat = action.payload.chat || action.payload.data;
        state.chats.unshift(newChat);

        // Set as active chat
        state.activeChat = newChat._id;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== FETCH USER CHATS ====================
      .addCase(fetchUserChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.chats = action.payload.chats || action.payload.data || [];
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.chats = [];
      })

      // ==================== FETCH CHAT BY ID ====================
      .addCase(fetchChatById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const chat = action.payload.chat || action.payload.data;

        // Update chat in list if it exists
        const index = state.chats.findIndex((c) => c._id === chat._id);
        if (index !== -1) {
          state.chats[index] = chat;
        } else {
          // Add to list if not exists
          state.chats.push(chat);
        }

        // Set as active chat
        state.activeChat = chat._id;
      })
      .addCase(fetchChatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== UPDATE CHAT ====================
      .addCase(updateChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const updatedChat = action.payload.chat || action.payload.data;
        const index = state.chats.findIndex((c) => c._id === updatedChat._id);

        if (index !== -1) {
          state.chats[index] = { ...state.chats[index], ...updatedChat };
        }
      })
      .addCase(updateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== DELETE CHAT ====================
      .addCase(deleteChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const chatId = action.payload.chatId;

        // Remove from chats list
        state.chats = state.chats.filter((c) => c._id !== chatId);

        // Clear active chat if it was deleted
        if (state.activeChat === chatId) {
          state.activeChat = null;
        }
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== ADD PARTICIPANT ====================
      .addCase(addParticipant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addParticipant.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const updatedChat = action.payload.chat || action.payload.data;
        const index = state.chats.findIndex((c) => c._id === updatedChat._id);

        if (index !== -1) {
          state.chats[index] = updatedChat;
        }
      })
      .addCase(addParticipant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== REMOVE PARTICIPANT ====================
      .addCase(removeParticipant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeParticipant.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const updatedChat = action.payload.chat || action.payload.data;
        const index = state.chats.findIndex((c) => c._id === updatedChat._id);

        if (index !== -1) {
          state.chats[index] = updatedChat;
        }
      })
      .addCase(removeParticipant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== MARK AS READ ====================
      .addCase(markChatAsRead.pending, (state) => {
        // Don't show loading for this action
        state.error = null;
      })
      .addCase(markChatAsRead.fulfilled, (state, action) => {
        state.error = null;

        const chatId = action.payload.chatId;
        const index = state.chats.findIndex((c) => c._id === chatId);

        if (index !== -1) {
          state.chats[index].unreadCount = 0;
        }
      })
      .addCase(markChatAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ==================== TOGGLE PIN ====================
      .addCase(togglePinChat.pending, (state) => {
        state.error = null;
      })
      .addCase(togglePinChat.fulfilled, (state, action) => {
        state.error = null;

        const { chatId, pinned } = action.payload;
        const index = state.chats.findIndex((c) => c._id === chatId);

        if (index !== -1) {
          state.chats[index].pinned = pinned;

          // Move pinned chats to top
          if (pinned) {
            const chat = state.chats.splice(index, 1)[0];
            state.chats.unshift(chat);
          }
        }
      })
      .addCase(togglePinChat.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ==================== TOGGLE ARCHIVE ====================
      .addCase(toggleArchiveChat.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleArchiveChat.fulfilled, (state, action) => {
        state.error = null;

        const { chatId, archived } = action.payload;
        const index = state.chats.findIndex((c) => c._id === chatId);

        if (index !== -1) {
          state.chats[index].archived = archived;
        }
      })
      .addCase(toggleArchiveChat.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setActive,
  clearActive,
  clearError,
  updateChatInList,
  addChatToList,
  removeChatFromList,
  handleChatReceived,
} = chatSlice.actions;

export default chatSlice.reducer;
