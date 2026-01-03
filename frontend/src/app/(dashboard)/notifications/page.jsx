"use client";

import { useState } from "react";
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiMessageCircle,
  FiUserPlus,
  FiInfo,
} from "react-icons/fi";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "message",
      title: "New Message",
      message: "You have a new message from Sarah",
      time: "2 minutes ago",
      read: false,
      avatar: "👩",
    },
    {
      id: 2,
      type: "friend",
      title: "Friend Request",
      message: "John Doe sent you a friend request",
      time: "1 hour ago",
      read: false,
      avatar: "👨",
    },
    {
      id: 3,
      type: "info",
      title: "System Update",
      message: "New features have been added to GhostChat",
      time: "3 hours ago",
      read: true,
      avatar: "🔔",
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "message":
        return <FiMessageCircle className="w-5 h-5" />;
      case "friend":
        return <FiUserPlus className="w-5 h-5" />;
      case "info":
        return <FiInfo className="w-5 h-5" />;
      default:
        return <FiBell className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="h-full max-w-4xl mx-auto relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all"
            >
              <FiCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FiBell className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-900/50 backdrop-blur-xl rounded-xl border ring-1 ring-white/20 shadow-2xl p-4 transition-all duration-300 hover:scale-[1.01] ${
                  notification.read
                    ? "border-white/10 opacity-60"
                    : "border-purple-500/30 bg-purple-500/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar/Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                      notification.read
                        ? "bg-gray-800"
                        : "bg-gradient-to-br from-purple-500 to-pink-500"
                    }`}
                  >
                    {notification.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all text-sm"
                        >
                          <FiCheck className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all text-sm"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
