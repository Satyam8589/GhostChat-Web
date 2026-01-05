import { createSlice } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateProfile,
} from "../action/authAction";
import { updateUserStatus } from "../action/statusAction";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false, // Track if we've checked localStorage
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserFromStorage: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true; // Mark as initialized
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    // Manual status update (for immediate UI update)
    updateStatus: (state, action) => {
      if (state.user) {
        state.user.status = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Extract user from response - could be in user or data field
        state.user =
          action.payload.user ||
          action.payload.data?.user ||
          action.payload.data;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Extract user from response - could be in user or data field
        state.user =
          action.payload.user ||
          action.payload.data?.user ||
          action.payload.data;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user =
          action.payload.user ||
          action.payload.data?.user ||
          action.payload.data;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        if (state.user) {
          state.user.status = action.payload.status;
          state.user.lastSeen = action.payload.lastSeen;
        }
      });
  },
});

export const { clearError, setUserFromStorage, setInitialized, updateStatus } =
  authSlice.actions;
export default authSlice.reducer;
