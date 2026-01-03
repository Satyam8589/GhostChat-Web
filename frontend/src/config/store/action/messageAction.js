/**
 * Message Redux Actions
 * Actions for managing messages in chats
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

// ==================== SEND MESSAGE ====================

/**
 * Send a new message to a chat
 * @param {Object} messageData - Message data
 * @param {string} messageData.chatId - Chat ID
 * @param {string} messageData.encryptedContent - Encrypted message content
 * @param {string} messageData.messageType - Message type (text, image, video, audio, file)
 * @param {string} messageData.mediaUrl - Media URL (optional)
 * @param {Object} messageData.metadata - Additional metadata (optional)
 * @param {string} messageData.replyTo - Message ID being replied to (optional)
 */
export const sendMessage = createAsyncThunk(
  "message/send",
  async (messageData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.post(
        "/api/message/send",
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

// ==================== FETCH MESSAGES ====================

/**
 * Fetch all messages for a specific chat
 * @param {string} chatId - Chat ID
 */
export const fetchMessages = createAsyncThunk(
  "message/fetch",
  async (chatId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.get(
        `/api/message/receive/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue({
        chatId,
        messages: response.data.data || response.data.messages || [],
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

// ==================== MARK MESSAGES AS READ ====================

/**
 * Mark all messages in a chat as read
 * @param {string} chatId - Chat ID
 */
export const markMessagesAsRead = createAsyncThunk(
  "message/markAsRead",
  async (chatId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.get(
        `/api/message/markAsRead/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue({
        chatId,
        markedCount: response.data.data?.markedCount || 0,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to mark messages as read"
      );
    }
  }
);

// ==================== DELETE MESSAGE ====================

/**
 * Delete a message (soft delete)
 * @param {Object} data - Delete data
 * @param {string} data.messageId - Message ID
 * @param {string} data.chatId - Chat ID
 */
export const deleteMessage = createAsyncThunk(
  "message/delete",
  async ({ messageId, chatId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      // Note: Backend route needs to be created for this
      const response = await clientServer.delete(`/api/message/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return thunkAPI.fulfillWithValue({
        messageId,
        chatId,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete message"
      );
    }
  }
);

// ==================== EDIT MESSAGE ====================

/**
 * Edit a message
 * @param {Object} data - Edit data
 * @param {string} data.messageId - Message ID
 * @param {string} data.chatId - Chat ID
 * @param {string} data.encryptedContent - New encrypted content
 */
export const editMessage = createAsyncThunk(
  "message/edit",
  async ({ messageId, chatId, encryptedContent }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      // Note: Backend route needs to be created for this
      const response = await clientServer.put(
        `/api/message/${messageId}`,
        { encryptedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue({
        messageId,
        chatId,
        message: response.data.data || response.data.message,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to edit message"
      );
    }
  }
);

// ==================== EXPORTS ====================

export default {
  sendMessage,
  fetchMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
};
