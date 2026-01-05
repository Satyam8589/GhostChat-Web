"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserChats } from "@/config/store/action/chatAction";
import { updateChatWithNewMessage } from "@/config/store/reducer/chatReducer";
import {
  addMessageFromSocket,
  updateMessageFromSocket,
} from "@/config/store/reducer/messageReducer";
import { getSocket } from "@/lib/socket/socket";
import Link from "next/link";
import {
  FiMessageCircle,
  FiCalendar,
  FiBell,
  FiUser,
  FiSearch,
  FiMoreVertical,
  FiArrowRight,
  FiMail,
  FiEdit3,
  FiStar,
} from "react-icons/fi";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats } = useSelector((state) => state.chat);
  const { connected } = useSelector((state) => state.socket);
  const socket = getSocket();
  const [isPinned, setIsPinned] = useState(user?.isPinned || false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get calendar data
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();
  const currentDay = today.getDate();

  // Fetch chats on mount
  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  // Join all chat rooms and listen for real-time updates
  useEffect(() => {
    if (socket && connected && chats.length > 0) {
      console.log(`🎯 Dashboard: Joining all ${chats.length} chat rooms...`);

      chats.forEach((chat) => {
        if (chat._id) {
          socket.emit("chat:join", { chatId: chat._id });
          console.log(`✅ Dashboard joined room: chat:${chat._id}`);
        }
      });

      // Listen for new messages on all chats
      const handleNewMessage = (data) => {
        console.log("📨 Dashboard: New message received:", data);

        // Add message to Redux store
        dispatch(addMessageFromSocket(data));

        // Update chat metadata (last message, timestamp, unread count)
        const messageObj = data.message || data;
        const currentUserId = (user?.id || user?._id)?.toString();

        dispatch(
          updateChatWithNewMessage({
            chatId: data.chatId,
            message: messageObj,
            currentUserId: currentUserId,
          })
        );

        // DO NOT emit delivered status here - only the chat detail page should do that
        // Being on the dashboard doesn't mean the user has seen the message
      };

      // Listen for message status updates
      const handleMessageDelivered = (data) => {
        console.log("✅ Dashboard: Message delivered:", data);
        dispatch(
          updateMessageFromSocket({
            messageId: data.messageId,
            chatId: data.chatId,
            status: "delivered",
            updates: { deliveredAt: data.deliveredAt },
          })
        );
      };

      const handleMessageRead = (data) => {
        console.log("👁️ Dashboard: Message read:", data);
        dispatch(
          updateMessageFromSocket({
            messageId: data.messageId,
            chatId: data.chatId,
            status: "read",
            updates: { readAt: data.readAt },
          })
        );
      };

      socket.on("message:receive", handleNewMessage);
      socket.on("message:status:delivered", handleMessageDelivered);
      socket.on("message:status:read", handleMessageRead);

      // Cleanup: leave all rooms when component unmounts
      return () => {
        console.log("🧹 Dashboard: Leaving all chat rooms...");
        socket.off("message:receive", handleNewMessage);
        socket.off("message:status:delivered", handleMessageDelivered);
        socket.off("message:status:read", handleMessageRead);

        chats.forEach((chat) => {
          if (chat._id) {
            socket.emit("chat:leave", { chatId: chat._id });
            console.log(`👋 Dashboard left room: chat:${chat._id}`);
          }
        });
      };
    } else if (!connected && socket) {
      console.log("⏳ Dashboard: Socket not connected yet, waiting...");
    }
  }, [socket, connected, chats, dispatch, user]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get pinned chats (max 3)
  const pinnedChats = chats.filter((chat) => chat.pinned).slice(0, 3);

  // Sanitize message preview to prevent showing encrypted content
  const sanitizePreview = (text) => {
    if (!text) return "";
    const str = String(text).trim();
    // If looks like encrypted (long, no spaces, has base64 chars)
    if (str.length > 50 && !/\s/.test(str) && /[+/=]/.test(str)) {
      return "🔒 Encrypted message";
    }
    return str.length > 50 ? str.substring(0, 50) + "..." : str;
  };

  // Motivational quotes that change on refresh
  const motivationalQuotes = [
    "Believe in yourself and all that you are. Keep pushing forward!",
    "Every day is a new beginning. Take a deep breath and start again.",
    "Success is not final, failure is not fatal. Keep going!",
    "Your limitation—it's only your imagination. Dream big!",
    "Great things never come from comfort zones. Challenge yourself!",
    "Don't watch the clock; do what it does. Keep going!",
    "The harder you work, the luckier you get. Stay focused!",
    "Dream bigger. Do bigger. Be bigger. You've got this!",
    "Wake up with determination. Go to bed with satisfaction.",
    "Little things make big days. Celebrate small wins!",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't stop when you're tired. Stop when you're done!",
  ];

  // Get random quote on component render
  const randomQuote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const events = [
    {
      id: 1,
      title: "Team Meeting",
      time: "10:00 AM",
      date: "2",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 2,
      title: "Project Review",
      time: "2:00 PM",
      date: "5",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 3,
      title: "Client Call",
      time: "4:30 PM",
      date: "8",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "message",
      user: "Sarah Johnson",
      action: "sent you a message",
      time: "2m ago",
      avatar: "👩‍💼",
      read: false,
    },
    {
      id: 2,
      type: "event",
      user: "System",
      action: "Team Meeting starts in 30 minutes",
      time: "28m ago",
      avatar: "📅",
      read: false,
    },
    {
      id: 3,
      type: "like",
      user: "Mike Chen",
      action: "liked your post",
      time: "1h ago",
      avatar: "👨‍💻",
      read: true,
    },
    {
      id: 4,
      type: "comment",
      user: "Emma Wilson",
      action: "commented on your post",
      time: "2h ago",
      avatar: "👩‍🎨",
      read: true,
    },
    {
      id: 5,
      type: "follow",
      user: "Alex Turner",
      action: "started following you",
      time: "3h ago",
      avatar: "👨‍🚀",
      read: true,
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="h-full max-w-7xl mx-auto relative z-10 flex flex-col">
        {/* Header - Compact */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Main Grid Layout - Reorganized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* Left Column - Messages, Calendar & Notifications */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
            {/* Pinned Chats Preview */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 ring-1 ring-white/20 shadow-2xl overflow-hidden flex-shrink-0 h-[280px]">
              <div className="p-4 border-b border-gray-800/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiMessageCircle className="text-purple-400" />
                    Pinned Chats
                  </h2>
                  <Link
                    href="/chats"
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium transition-all duration-300"
                  >
                    View All
                    <FiArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Pinned Chat List */}
              <div className="divide-y divide-gray-800/30 h-[calc(280px-73px)] overflow-y-auto custom-scrollbar">
                {pinnedChats.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <FiStar className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm">No pinned chats yet</p>
                    <p className="text-xs mt-1">
                      Pin up to 3 important conversations
                    </p>
                  </div>
                ) : (
                  pinnedChats.map((chat) => {
                    const otherParticipant =
                      chat.type === "private"
                        ? chat.participants?.find(
                            (p) => p._id?.toString() !== user?.id?.toString()
                          )
                        : null;
                    const displayName =
                      chat.type === "group"
                        ? chat.name
                        : otherParticipant?.name ||
                          otherParticipant?.username ||
                          "Unknown";

                    return (
                      <Link
                        key={chat._id}
                        href={`/chats/${chat._id}`}
                        className="block p-3 hover:bg-gray-800/30 transition-all duration-300 cursor-pointer group relative"
                      >
                        {/* Glowing Star Indicator */}
                        <div className="absolute top-2 left-2 z-10">
                          <div className="relative drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
                            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse drop-shadow-lg" />
                            <div className="absolute inset-0 animate-ping opacity-75">
                              <FiStar className="w-4 h-4 text-yellow-400" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-6">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg overflow-hidden">
                              {otherParticipant?.profilePicture ? (
                                <img
                                  src={otherParticipant.profilePicture}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white">
                                  {displayName?.charAt(0)?.toUpperCase() ||
                                    "👤"}
                                </span>
                              )}
                            </div>
                            {otherParticipant?.status === "online" && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                            )}
                          </div>

                          {/* Chat Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-white text-sm truncate">
                                {displayName}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {chat.lastMessageTime
                                  ? new Date(
                                      chat.lastMessageTime
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-gray-400 truncate flex-1">
                                {chat.lastMessage ? (
                                  <>
                                    {chat.lastMessage.messageType === "text" &&
                                      sanitizePreview(
                                        chat.lastMessage.encryptedContent ||
                                          chat.lastMessage.content ||
                                          "Message"
                                      )}
                                    {chat.lastMessage.messageType === "image" &&
                                      "📷 Photo"}
                                    {chat.lastMessage.messageType === "video" &&
                                      "🎥 Video"}
                                    {chat.lastMessage.messageType === "audio" &&
                                      "🎵 Audio"}
                                    {chat.lastMessage.messageType === "file" &&
                                      "📎 File"}
                                  </>
                                ) : (
                                  "No messages yet"
                                )}
                              </p>
                              {/* Unread count text */}
                              {chat.unreadCount > 0 && (
                                <span className="text-xs text-purple-400 font-semibold whitespace-nowrap">
                                  {chat.unreadCount} new
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Unread Badge */}
                          {chat.unreadCount > 0 && (
                            <div className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-purple-500/50 animate-pulse">
                              {chat.unreadCount}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Row - Calendar & Notifications Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Calendar Section */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 ring-1 ring-white/20 shadow-2xl p-3 flex flex-col">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FiCalendar className="text-blue-400" />
                    {currentMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <div className="text-blue-400 text-base font-mono font-bold">
                    {currentTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0.5 mb-1.5 flex-shrink-0">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                    <div
                      key={idx}
                      className="text-center text-gray-500 text-[10px] font-semibold py-0.5"
                    >
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 42 }, (_, i) => {
                    const dayNumber = i - firstDayOfMonth + 1;
                    const isValidDay =
                      dayNumber > 0 && dayNumber <= daysInMonth;
                    const isToday = isCurrentMonth && dayNumber === currentDay;
                    const hasEvent = events.some(
                      (e) => parseInt(e.date) === dayNumber
                    );
                    return (
                      <div
                        key={i}
                        className={`h-7 flex items-center justify-center rounded text-[10px] transition-all duration-300 cursor-pointer ${
                          isToday
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30"
                            : isValidDay
                            ? hasEvent
                              ? "bg-gray-800/50 text-white hover:bg-gray-700/50 border border-gray-700/50"
                              : "text-gray-400 hover:bg-gray-800/30"
                            : "text-gray-800"
                        }`}
                      >
                        {isValidDay ? dayNumber : ""}
                      </div>
                    );
                  })}
                </div>

                {/* Welcome Message */}
                <div className="mt-0.5 p-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl flex-shrink-0">
                  <h3 className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
                    <span className="text-base">👋</span>
                    Welcome Back, {user?.name || user?.username || "User"}!
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                    {randomQuote}
                  </p>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 ring-1 ring-white/20 shadow-2xl p-4 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiBell className="text-yellow-400" />
                    Notifications
                  </h2>
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-medium">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                        notification.read
                          ? "bg-gray-800/20 border-gray-800/50"
                          : "bg-purple-500/10 border-purple-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0">
                          {notification.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white mb-0.5">
                            <span className="font-semibold">
                              {notification.user}
                            </span>{" "}
                            <span className="text-gray-500">
                              {notification.action}
                            </span>
                          </p>
                          <p className="text-xs text-gray-600">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-3 py-1.5 text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors duration-300">
                  Mark all as read
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Card Only */}
          <div className="flex flex-col overflow-hidden">
            {/* Profile Card */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 ring-1 ring-white/20 shadow-2xl p-4 overflow-hidden relative h-full">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiUser className="text-pink-400" />
                    Profile
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPinned(!isPinned)}
                      className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                      title={isPinned ? "Unpin Profile" : "Pin Profile"}
                    >
                      {isPinned ? (
                        <div className="relative">
                          <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                          <div className="absolute inset-0 animate-ping">
                            <FiStar className="w-5 h-5 text-yellow-400 opacity-75" />
                          </div>
                        </div>
                      ) : (
                        <FiStar className="w-5 h-5 text-gray-500 hover:text-yellow-400 transition-colors" />
                      )}
                    </button>
                    <button className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-all duration-300">
                      <FiMoreVertical className="text-gray-500 w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative mb-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-1">
                      <div className="w-full h-full rounded-full bg-gray-950 flex items-center justify-center text-4xl overflow-hidden">
                        {user?.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-2xl">
                            {user?.name?.charAt(0)?.toUpperCase() || "👤"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-3 border-gray-900"></div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    @{user?.username || "username"}
                  </p>

                  {/* Contact Info */}
                  <div className="w-full space-y-2 mb-4">
                    {/* Email */}
                    {user?.email && (
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
                        <FiMail className="w-3.5 h-3.5" />
                        <span>{user.email}</span>
                      </div>
                    )}

                    {/* Phone */}
                    {user?.phone && (
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>{user.phone}</span>
                      </div>
                    )}

                    {/* Location */}
                    {user?.location && (
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{user.location}</span>
                      </div>
                    )}

                    {/* Member Since */}
                    {user?.createdAt && (
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          Member since{" "}
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" }
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {user?.bio && (
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 px-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="w-full space-y-2 mt-auto">
                    <Link
                      href="/profile"
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      Edit Profile
                    </Link>
                    <Link
                      href="/profile"
                      className="block w-full py-2.5 bg-gray-800/30 border border-gray-800/50 rounded-lg text-white text-sm font-medium hover:bg-gray-800/50 transition-all duration-300 text-center"
                    >
                      View Full Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
