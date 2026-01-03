import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import socketReducer from "./reducer/socketReducer";
import chatReducer from "./reducer/chatReducer";
import messageReducer from "./reducer/messageReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    chat: chatReducer,
    message: messageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
