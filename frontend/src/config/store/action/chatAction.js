/**
 * Chat Redux Actions
 * Actions for managing chats and conversations
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

// ==================== CREATE CHAT ====================

/**
 * Create a new chat (1-on-1 or group)
 * @param {Object} chatData - Chat data
 * @param {string} chatData.type - 'private' or 'group'
 * @param {string} chatData.participantId - For private chats
 * @param {string} chatData.name - For group chats
 * @param {Array} chatData.participants - For group chats
 */
export const createChat = createAsyncThunk(
  "chat/create",
  async (chatData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.post(
        "/api/chat/create",
        chatData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create chat"
      );
    }
  }
);

// ==================== FETCH USER CHATS ====================

/**
 * Fetch all chats for the current user
 */
export const fetchUserChats = createAsyncThunk(
  "chat/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.get("/api/chat/user-chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch chats"
      );
    }
  }
);

// ==================== FETCH SINGLE CHAT ====================

/**
 * Fetch a single chat by ID
 * @param {string} chatId - Chat ID
 */
export const fetchChatById = createAsyncThunk(
  "chat/fetchById",
  async (chatId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.get(`/api/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch chat"
      );
    }
  }
);

// ==================== UPDATE CHAT ====================

/**
 * Update chat details (name, avatar, etc.)
 * @param {Object} data - Update data
 * @param {string} data.chatId - Chat ID
 * @param {Object} data.updates - Fields to update
 */
export const updateChat = createAsyncThunk(
  "chat/update",
  async ({ chatId, updates }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.put(
        `/api/chat/${chatId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update chat"
      );
    }
  }
);

// ==================== DELETE CHAT ====================

/**
 * Delete a chat
 * @param {string} chatId - Chat ID
 */
export const deleteChat = createAsyncThunk(
  "chat/delete",
  async (chatId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.delete(`/api/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return thunkAPI.fulfillWithValue({ chatId, ...response.data });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete chat"
      );
    }
  }
);

// ==================== ADD PARTICIPANT ====================

/**
 * Add participant to group chat
 * @param {Object} data - Participant data
 * @param {string} data.chatId - Chat ID
 * @param {string} data.userId - User ID to add
 */
export const addParticipant = createAsyncThunk(
  "chat/addParticipant",
  async ({ chatId, userId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.post(
        `/api/chat/${chatId}/participants`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add participant"
      );
    }
  }
);

// ==================== REMOVE PARTICIPANT ====================

/**
 * Remove participant from group chat
 * @param {Object} data - Participant data
 * @param {string} data.chatId - Chat ID
 * @param {string} data.userId - User ID to remove
 */
export const removeParticipant = createAsyncThunk(
  "chat/removeParticipant",
  async ({ chatId, userId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.delete(
        `/api/chat/${chatId}/participants/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to remove participant"
      );
    }
  }
);

// ==================== MARK CHAT AS READ ====================

/**
 * Mark all messages in a chat as read
 * @param {string} chatId - Chat ID
 */
export const markChatAsRead = createAsyncThunk(
  "chat/markAsRead",
  async (chatId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.put(
        `/api/chat/${chatId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue({ chatId, ...response.data });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to mark chat as read"
      );
    }
  }
);

// ==================== PIN/UNPIN CHAT ====================

/**
 * Pin or unpin a chat
 * @param {Object} data - Pin data
 * @param {string} data.chatId - Chat ID
 * @param {boolean} data.pinned - Pin status
 */
export const togglePinChat = createAsyncThunk(
  "chat/togglePin",
  async ({ chatId, pinned }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.put(
        `/api/chat/${chatId}/pin`,
        { pinned },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue({ chatId, pinned, ...response.data });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to toggle pin"
      );
    }
  }
);

// ==================== ARCHIVE/UNARCHIVE CHAT ====================

/**
 * Archive or unarchive a chat
 * @param {Object} data - Archive data
 * @param {string} data.chatId - Chat ID
 * @param {boolean} data.archived - Archive status
 */
export const toggleArchiveChat = createAsyncThunk(
  "chat/toggleArchive",
  async ({ chatId, archived }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.put(
        `/api/chat/${chatId}/archive`,
        { archived },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue({ chatId, archived, ...response.data });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to toggle archive"
      );
    }
  }
);

// ==================== SET ACTIVE CHAT ====================

/**
 * Set the currently active chat (local state only)
 * @param {string} chatId - Chat ID
 */
export const setActiveChat = (chatId) => ({
  type: "chat/setActive",
  payload: chatId,
});

/**
 * Clear active chat (local state only)
 */
export const clearActiveChat = () => ({
  type: "chat/clearActive",
});

// ==================== CLEAR ERROR ====================

/**
 * Clear chat error
 */
export const clearChatError = () => ({
  type: "chat/clearError",
});

export default {
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
  setActiveChat,
  clearActiveChat,
  clearChatError,
};
