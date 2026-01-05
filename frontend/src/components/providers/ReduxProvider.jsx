"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import store from "@/config/store/store";
import { setUserFromStorage, setInitialized } from "@/config/store/reducer/authReducer";

function ReduxInitializer({ children }) {
  useEffect(() => {
    // Load user from localStorage on app startup
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("🔄 Loading user from localStorage:", user);
        store.dispatch(setUserFromStorage({ user, token }));
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        store.dispatch(setInitialized());
      }
    } else {
      // No user in localStorage, mark as initialized
      store.dispatch(setInitialized());
    }
  }, []);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <ReduxInitializer>{children}</ReduxInitializer>
    </Provider>
  );
}
