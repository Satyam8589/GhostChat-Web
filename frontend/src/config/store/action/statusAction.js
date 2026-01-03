/**
 * Status Redux Action
 * Action for updating user status
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

// ==================== UPDATE USER STATUS ====================

/**
 * Update user status
 * @param {string} status - Status to set (online, offline, away, busy)
 */
export const updateUserStatus = createAsyncThunk(
  "auth/updateStatus",
  async (status, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("No authentication token found");
      }

      const response = await clientServer.put(
        "/api/status/update",
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return thunkAPI.fulfillWithValue({
        status: response.data.data.status,
        lastSeen: response.data.data.lastSeen,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

export default { updateUserStatus };
