"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiSettings,
  FiBell,
  FiLock,
  FiUser,
  FiMoon,
  FiSun,
  FiShield,
  FiEye,
  FiEyeOff,
  FiCheck,
} from "react-icons/fi";

export default function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    notifications: {
      messages: true,
      friendRequests: true,
      groupInvites: true,
      soundEnabled: true,
    },
    privacy: {
      showOnlineStatus: true,
      readReceipts: true,
      showLastSeen: true,
      allowGroupInvites: true,
    },
    appearance: {
      darkMode: true,
      compactMode: false,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
    },
  });

  const toggleSetting = (category, key) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !settings[category][key],
      },
    });
  };

  const tabs = [
    { id: "general", label: "General", icon: FiSettings },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "privacy", label: "Privacy", icon: FiEye },
    { id: "security", label: "Security", icon: FiLock },
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="h-full max-w-5xl mx-auto relative z-10 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:overflow-hidden">
          {/* Sidebar */}
          <div className="col-span-1 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 ring-1 ring-white/20 shadow-2xl p-3 overflow-y-auto">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Panel */}
          <div className="col-span-3 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-white/10 ring-1 ring-white/20 shadow-2xl p-6 overflow-y-auto">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    General Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        {settings.appearance.darkMode ? (
                          <FiMoon className="w-5 h-5 text-purple-400" />
                        ) : (
                          <FiSun className="w-5 h-5 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">Dark Mode</p>
                          <p className="text-gray-400 text-sm">
                            Use dark theme for the interface
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSetting("appearance", "darkMode")}
                        className={`relative w-12 h-6 rounded-full transition-all ${
                          settings.appearance.darkMode
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : "bg-gray-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.appearance.darkMode ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <FiSettings className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Compact Mode</p>
                          <p className="text-gray-400 text-sm">
                            Show more content with less spacing
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          toggleSetting("appearance", "compactMode")
                        }
                        className={`relative w-12 h-6 rounded-full transition-all ${
                          settings.appearance.compactMode
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : "bg-gray-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.appearance.compactMode
                              ? "translate-x-6"
                              : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Notification Preferences
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: "messages",
                        label: "Message Notifications",
                        description: "Get notified when you receive messages",
                      },
                      {
                        key: "friendRequests",
                        label: "Friend Requests",
                        description: "Get notified of new friend requests",
                      },
                      {
                        key: "groupInvites",
                        label: "Group Invites",
                        description: "Get notified when invited to groups",
                      },
                      {
                        key: "soundEnabled",
                        label: "Sound Effects",
                        description: "Play sound for notifications",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <FiBell className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">
                              {item.label}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            toggleSetting("notifications", item.key)
                          }
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            settings.notifications[item.key]
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.notifications[item.key]
                                ? "translate-x-6"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Privacy Settings
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: "showOnlineStatus",
                        label: "Show Online Status",
                        description: "Let others see when you're online",
                      },
                      {
                        key: "readReceipts",
                        label: "Read Receipts",
                        description: "Show double tick when you read messages",
                      },
                      {
                        key: "showLastSeen",
                        label: "Last Seen",
                        description: "Show your last active time",
                      },
                      {
                        key: "allowGroupInvites",
                        label: "Group Invites",
                        description: "Allow others to add you to groups",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <FiEye className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">
                              {item.label}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting("privacy", item.key)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            settings.privacy[item.key]
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.privacy[item.key] ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">
                    Security Settings
                  </h2>

                  <div className="space-y-4">
                    {[
                      {
                        key: "twoFactorAuth",
                        label: "Two-Factor Authentication",
                        description: "Add an extra layer of security",
                      },
                      {
                        key: "loginAlerts",
                        label: "Login Alerts",
                        description: "Get notified of new login attempts",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <FiShield className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-white font-medium">
                              {item.label}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSetting("security", item.key)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            settings.security[item.key]
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gray-600"
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              settings.security[item.key] ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </div>
                    ))}

                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg mt-6">
                      <p className="text-purple-400 text-sm flex items-center gap-2">
                        <FiCheck className="w-4 h-4" />
                        Your messages are encrypted with AES-256 encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
