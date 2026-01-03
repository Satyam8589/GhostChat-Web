import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";
import { connectSocket, disconnectSocketAction } from "./socketAction";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/api/auth/register", user);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        thunkAPI.dispatch(connectSocket(response.data.token));
      }
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const response = await clientServer.post("/api/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        thunkAPI.dispatch(connectSocket(response.data.token));
      }
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      await clientServer.post(
        "/api/auth/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      thunkAPI.dispatch(disconnectSocketAction());
      return null;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      thunkAPI.dispatch(disconnectSocketAction());
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await clientServer.put(
        "/api/user/profile",
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update localStorage with new user data
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Profile update failed"
      );
    }
  }
);

export { clearError } from "../reducer/authReducer";
