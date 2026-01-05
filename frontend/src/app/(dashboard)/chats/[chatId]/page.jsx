"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  FiArrowLeft,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiSend,
  FiPaperclip,
  FiSmile,
  FiImage,
  FiMic,
  FiInfo,
} from "react-icons/fi";
import {
  sendMessage,
  fetchMessages,
  markMessagesAsRead,
} from "@/config/store/action/messageAction";
import { fetchChatById } from "@/config/store/action/chatAction";
import {
  emitUserTyping,
  emitUserStopTyping,
  joinChatRoom,
  leaveChatRoom,
} from "@/config/store/action/socketAction";
import { addMessageFromSocket } from "@/config/store/reducer/messageReducer";
import { getSocket } from "@/lib/socket/socket";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const chatId = params.chatId;
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  const [message, setMessage] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRoomNotification, setShowRoomNotification] = useState(false);

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { chats, loading: chatLoading } = useSelector((state) => state.chat);
  const {
    messagesByChat,
    loading: messageLoading,
    sending,
  } = useSelector((state) => state.message);
  const { connected, typingUsers } = useSelector((state) => state.socket);

  // Get socket instance from socket.js module
  const socket = getSocket();

  // Get current chat and messages
  const currentChat = chats.find(
    (chat) => chat._id?.toString() === chatId?.toString()
  );
  // Normalize chatId to string to match reducer normalization
  const normalizedChatId = chatId?.toString();
  const messages = messagesByChat[normalizedChatId] || [];

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Check if someone is typing in this chat
  const currentUserId = (user?.id || user?._id)?.toString();
  const isTyping = typingUsers[chatId]?.some(
    (userId) => userId?.toString() !== currentUserId
  );

  // Fetch chat details and messages on mount
  useEffect(() => {
    if (chatId) {
      // Fetch chat if not in store
      if (!currentChat) {
        dispatch(fetchChatById(chatId));
      }

      // Fetch messages on mount
      dispatch(fetchMessages(chatId));

      // Mark messages as read when opening chat
      dispatch(markMessagesAsRead(chatId));
    }
  }, [chatId, dispatch, currentChat]);

  // Join/leave socket room - MUST include socket and connected in dependencies!
  useEffect(() => {
    if (chatId && socket && connected) {
      console.log(`🔌 Attempting to join chat room: ${chatId}`);
      console.log(`📡 Socket ID: ${socket.id}, Connected: ${connected}`);

      // Join chat room via socket
      dispatch(joinChatRoom(chatId));

      // Listen for room join confirmation
      const handleRoomJoined = (data) => {
        console.log(`✅ Room join confirmed:`, data);
        console.log(`👥 Room members: ${data.roomSize}`);

        if (data.chatId === chatId) {
          setShowRoomNotification(true);
          // Hide notification after 3 seconds
          setTimeout(() => {
            setShowRoomNotification(false);
          }, 3000);
        }
      };

      socket.on("chat:joined", handleRoomJoined);

      // Cleanup: Remove event listener and leave room when changing chats
      return () => {
        console.log(`🧹 Leaving room: ${chatId}`);
        socket.off("chat:joined", handleRoomJoined);
        // Leave room when switching to a different chat
        dispatch(leaveChatRoom(chatId));
      };
    } else {
      console.warn(
        `⚠️ Cannot join room - chatId: ${!!chatId}, socket: ${!!socket}, connected: ${connected}`
      );
    }
  }, [chatId, socket, connected, dispatch]); // FIXED: Added socket and connected to dependencies!

  // DIRECT SOCKET MESSAGE LISTENER - Same as test page!
  useEffect(() => {
    if (!socket || !chatId) return;

    console.log("🎧 Setting up DIRECT socket message listener for chat:", chatId);

    const handleDirectMessage = (data) => {
      try {
        console.log("\\n" + "=".repeat(60));
        console.log("🔥 DIRECT MESSAGE RECEIVED VIA SOCKET!");
        console.log("=".repeat(60));
        console.log("📦 Raw data:", data);
        console.log("📍 Message chatId:", data.chatId);
        console.log("📍 Current chatId:", chatId);
        
        // Handle both formats: {message: {...}} and direct message object
        const messageObj = data.message || data;
        
        // Only process if message is for this chat
        if (data.chatId === chatId || messageObj.chat === chatId) {
          console.log("✅ Message is for THIS chat! Adding directly...");
          
          // Add message directly to Redux store
          dispatch(addMessageFromSocket(data));
          
          console.log("✅ Message added to store via direct socket listener!");
        } else {
          console.log("⚠️ Message is for different chat, ignoring");
        }
        console.log("=".repeat(60) + "\\n");
      } catch (error) {
        console.error("❌ Error in direct message handler:", error);
      }
    };

    // Listen for message:receive event directly on socket
    socket.on("message:receive", handleDirectMessage);
    console.log("✅ Direct socket listener registered for message:receive");

    // Cleanup
    return () => {
      console.log("🧹 Removing direct socket listener");
      socket.off("message:receive", handleDirectMessage);
    };
  }, [socket, chatId, dispatch]);

  // Listen for real-time messages - use ref to track last processed message
  const { realtimeMessages } = useSelector((state) => state.socket);
  const lastProcessedMessageRef = useRef(null);
  
  useEffect(() => {
    // Check if there's a new message that we haven't processed yet
    if (realtimeMessages && realtimeMessages.length > 0) {
      const latestMessage = realtimeMessages[0]; // Most recent message
      const messageId = latestMessage.message?._id || latestMessage._id;
      
      // Only process if this is a new message we haven't seen before
      if (messageId && messageId !== lastProcessedMessageRef.current) {
        console.log("📬 New message received:", latestMessage);
        console.log("📍 Message chatId:", latestMessage.chatId);
        console.log("📍 Message chat:", latestMessage.message?.chat);
        
        // ALWAYS add message to store, regardless of which chat is open
        // This ensures messages are stored even if user is on a different chat
        console.log("✅ Adding message to store via Redux action...");
        dispatch(addMessageFromSocket(latestMessage));
        
        // Mark this message as processed
        lastProcessedMessageRef.current = messageId;
      }
    }
  }, [realtimeMessages, dispatch]);


  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(messages.length);
  const isInitialLoadRef = useRef(true);
  const hasScrolledToBottomRef = useRef(false);

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    if (
      messages.length > 0 &&
      isInitialLoadRef.current &&
      !hasScrolledToBottomRef.current
    ) {
      const container = messagesContainerRef.current;

      if (container) {
        // Use requestAnimationFrame to ensure DOM is ready
        const scrollToBottom = () => {
          requestAnimationFrame(() => {
            if (container.scrollHeight > 0) {
              container.scrollTop = container.scrollHeight;
              hasScrolledToBottomRef.current = true;
              isInitialLoadRef.current = false;
            }
          });
        };

        // Multiple attempts with increasing delays
        scrollToBottom();
        setTimeout(scrollToBottom, 100);
        setTimeout(scrollToBottom, 300);
        setTimeout(scrollToBottom, 600);
      }
    }
  }, [messages]);

  // Reset initial load flag when changing chats
  useEffect(() => {
    isInitialLoadRef.current = true;
    hasScrolledToBottomRef.current = false;
    setUserHasScrolled(false);
  }, [chatId]);

  // Scroll to bottom when NEW messages arrive - only if user is at bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    // Check if there are new messages
    const hasNewMessages = messages.length > prevMessageCountRef.current;

    // Only auto-scroll if:
    // 1. There are new messages AND
    // 2. User is at the bottom (or hasn't scrolled up)
    // 3. It's not the initial load (handled separately)
    if (
      hasNewMessages &&
      (isAtBottom || !userHasScrolled) &&
      !isInitialLoadRef.current
    ) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }

    // Update previous message count
    prevMessageCountRef.current = messages.length;
  }, [messages, userHasScrolled]);

  // Detect when user manually scrolls
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let scrollTimeout;
    const handleScroll = () => {
      // Clear previous timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // Wait a bit to see if user is done scrolling
      scrollTimeout = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

        // Update scroll state based on position
        setUserHasScrolled(!isAtBottom);
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Mark messages as read when new messages arrive
  useEffect(() => {
    if (chatId && messages.length > 0) {
      // Mark messages as read after a short delay to ensure they're visible
      const timer = setTimeout(() => {
        dispatch(markMessagesAsRead(chatId));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages, chatId, dispatch]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isUserTyping && socket && connected) {
      setIsUserTyping(true);
      dispatch(emitUserTyping(chatId));
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && connected) {
        setIsUserTyping(false);
        dispatch(emitUserStopTyping(chatId));
      }
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      const messageText = message.trim();
      setMessage("");

      // Stop typing indicator
      if (isUserTyping && socket && connected) {
        setIsUserTyping(false);
        dispatch(emitUserStopTyping(chatId));
      }

      // Reset scroll flag so new message scrolls to bottom
      setUserHasScrolled(false);

      // Send message through Redux
      await dispatch(
        sendMessage({
          chatId,
          encryptedContent: messageText,
          messageType: "text",
        })
      );

      // Keep input focused (prevents keyboard from closing on mobile)
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Get other participant info
  const getOtherParticipant = () => {
    if (!currentChat || !user) {
      return null;
    }

    // Get user ID - could be 'id' or '_id'
    const currentUserId = (user.id || user._id)?.toString();

    if (!currentUserId) {
      return null;
    }

    if (currentChat.type === "group") {
      return {
        name: currentChat.name || "Group Chat",
        avatar: currentChat.avatar || "👥",
        online: false,
        status: `${currentChat.participants?.length || 0} members`,
      };
    }

    // For private chats, find the other user (same logic as chat list)
    const otherUser = currentChat.participants?.find((p) => {
      if (!p) return false;
      const participantId = (p._id || p)?.toString();
      if (!participantId || !currentUserId) return false;
      return participantId !== currentUserId;
    });

    if (!otherUser) {
      return null;
    }

    // Helper function to check if a string looks like encrypted data
    const isEncryptedOrInvalid = (str) => {
      if (!str || typeof str !== "string") return true;
      const trimmed = str.trim();
      // Check if it looks like base64, encrypted data, or is too long
      if (trimmed.length > 100) return true;
      if (/^[A-Za-z0-9+/=]{50,}$/.test(trimmed)) return true;
      if (trimmed.includes("<") || trimmed.includes(">")) return true;
      return false;
    };

    // Get valid name, preferring name over username
    let displayName = "Unknown User";
    if (otherUser.name && !isEncryptedOrInvalid(otherUser.name)) {
      displayName = otherUser.name;
    } else if (
      otherUser.username &&
      !isEncryptedOrInvalid(otherUser.username)
    ) {
      displayName = otherUser.username;
    }

    return {
      name: displayName,
      avatar: otherUser.profilePicture || otherUser.avatar || "👤",
      online: otherUser.status === "online" || otherUser.online || false,
      status:
        otherUser.status === "online" || otherUser.online
          ? "Active now"
          : "Offline",
    };
  };

  // Format message time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Sanitize message text to prevent encoding issues
  const sanitizeMessageText = (text) => {
    if (!text) return "";

    // Convert to string and trim
    let sanitized = String(text).trim();

    // If it looks like base64 or encrypted (long string with no spaces and special chars)
    // it might be encrypted content that should be displayed as-is
    const isLikelyEncrypted =
      sanitized.length > 50 && !/\s/.test(sanitized) && /[+/=]/.test(sanitized);

    if (isLikelyEncrypted) {
      // For encrypted content, just show a placeholder
      return "[Encrypted Message]";
    }

    // For normal text, return as-is
    return sanitized;
  };

  // Loading state - only show during actual loading operations
  if (chatLoading || messageLoading) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Get other participant info
  const otherParticipant = getOtherParticipant();

  // Chat not found - show if loading is complete but no chat or user data
  if (!currentChat || !user) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-400 text-lg">Chat not found</p>
          <button
            onClick={() => router.push("/chats")}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="h-full max-w-7xl mx-auto w-full relative z-10 flex flex-col p-4">
        {/* Chat Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-t-2xl border border-white/10 ring-1 ring-white/20 shadow-2xl p-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and user info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/chats")}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl overflow-hidden">
                    {otherParticipant?.avatar &&
                    (otherParticipant.avatar.startsWith("data:") ||
                      otherParticipant.avatar.startsWith("http")) ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{otherParticipant?.avatar || "👤"}</span>
                    )}
                  </div>
                  {otherParticipant?.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {otherParticipant?.name || "Unknown User"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {otherParticipant?.status || "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                title="Voice Call"
              >
                <FiPhone className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              <button
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                title="Video Call"
              >
                <FiVideo className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              <button
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                title="Chat Info"
              >
                <FiInfo className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
              <button
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                title="More Options"
              >
                <FiMoreVertical className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 bg-gray-900/30 backdrop-blur-xl border-x border-white/10 ring-1 ring-white/20 shadow-2xl overflow-y-auto p-6 space-y-4"
        >
          {/* Room Connection Notification */}
          {showRoomNotification && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">
                  You are now connected to the room
                </span>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const currentUserId = (user?.id || user?._id)?.toString();
              const senderId = (msg.sender?._id || msg.sender)?.toString();
              const isMine = senderId === currentUserId;

              // Check if message has been read by checking readBy array
              const isRead =
                msg.readBy &&
                msg.readBy.some(
                  (read) => read.userId?.toString() !== currentUserId
                );

              return (
                <div
                  key={msg._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%]`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isMine
                          ? "bg-green-600 text-white"
                          : "bg-gray-800/50 text-white border border-gray-700/50"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {sanitizeMessageText(msg.encryptedContent || msg.text)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-2 mt-1 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <p className="text-xs text-gray-600">
                        {formatTime(msg.createdAt)}
                      </p>
                      {isMine && (
                        <span className="text-xs">
                          {isRead ? (
                            // Double tick (blue) for read messages
                            <span className="text-blue-400" title="Read">
                              ✓✓
                            </span>
                          ) : (
                            // Single tick (gray) for sent/delivered messages
                            <span className="text-gray-500" title="Sent">
                              ✓
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-400"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-b-2xl border border-white/10 ring-1 ring-white/20 shadow-2xl p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3"
          >
            {/* Attachment Button */}
            <button
              type="button"
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
              title="Attach File"
            >
              <FiPaperclip className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {/* Image Button */}
            <button
              type="button"
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
              title="Send Image"
            >
              <FiImage className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {/* Message Input */}
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-1 bg-gray-950/50 border border-gray-800/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
              autoComplete="off"
            />

            {/* Emoji Button */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300 ${
                  showEmojiPicker ? "bg-gray-800/50" : ""
                }`}
                title="Add Emoji"
              >
                <FiSmile
                  className={`w-5 h-5 ${
                    showEmojiPicker
                      ? "text-yellow-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                />
              </button>

              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 w-80 max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      "😀",
                      "😃",
                      "😄",
                      "😁",
                      "😆",
                      "😅",
                      "🤣",
                      "😂",
                      "🙂",
                      "🙃",
                      "😉",
                      "😊",
                      "😇",
                      "🥰",
                      "😍",
                      "🤩",
                      "😘",
                      "😗",
                      "😚",
                      "😙",
                      "🥲",
                      "😋",
                      "😛",
                      "😜",
                      "🤪",
                      "😝",
                      "🤑",
                      "🤗",
                      "🤭",
                      "🤫",
                      "🤔",
                      "🤐",
                      "🤨",
                      "😐",
                      "😑",
                      "😶",
                      "😏",
                      "😒",
                      "🙄",
                      "😬",
                      "🤥",
                      "😌",
                      "😔",
                      "😪",
                      "🤤",
                      "😴",
                      "😷",
                      "🤒",
                      "🤕",
                      "🤢",
                      "🤮",
                      "🤧",
                      "🥵",
                      "🥶",
                      "😶‍🌫️",
                      "😵",
                      "🤯",
                      "🤠",
                      "🥳",
                      "🥸",
                      "😎",
                      "🤓",
                      "🧐",
                      "😕",
                      "😟",
                      "🙁",
                      "☹️",
                      "😮",
                      "😯",
                      "😲",
                      "😳",
                      "🥺",
                      "😦",
                      "😧",
                      "😨",
                      "😰",
                      "😥",
                      "😢",
                      "😭",
                      "😱",
                      "😖",
                      "😣",
                      "😞",
                      "😓",
                      "😩",
                      "😫",
                      "🥱",
                      "😤",
                      "😡",
                      "😠",
                      "🤬",
                      "😈",
                      "👿",
                      "💀",
                      "☠️",
                      "💩",
                      "🤡",
                      "👹",
                      "👺",
                      "👻",
                      "👽",
                      "👾",
                      "🤖",
                      "😺",
                      "😸",
                      "😹",
                      "😻",
                      "😼",
                      "😽",
                      "🙀",
                      "😿",
                      "😾",
                      "👋",
                      "🤚",
                      "🖐️",
                      "✋",
                      "🖖",
                      "👌",
                      "🤌",
                      "🤏",
                      "✌️",
                      "🤞",
                      "🤟",
                      "🤘",
                      "🤙",
                      "👈",
                      "👉",
                      "👆",
                      "🖕",
                      "👇",
                      "☝️",
                      "👍",
                      "👎",
                      "✊",
                      "👊",
                      "🤛",
                      "🤜",
                      "👏",
                      "🙌",
                      "👐",
                      "🤲",
                      "🤝",
                      "🙏",
                      "✍️",
                      "💅",
                      "🤳",
                      "💪",
                      "🦾",
                      "🦿",
                      "🦵",
                      "🦶",
                      "👂",
                      "🦻",
                      "👃",
                      "🧠",
                      "🫀",
                      "🫁",
                      "🦷",
                      "🦴",
                      "👀",
                      "👁️",
                      "👅",
                      "👄",
                      "💋",
                      "🩸",
                      "❤️",
                      "🧡",
                      "💛",
                      "💚",
                      "💙",
                      "💜",
                      "🖤",
                      "🤍",
                      "🤎",
                      "💔",
                      "❤️‍🔥",
                      "💕",
                      "💞",
                      "💓",
                      "💗",
                      "💖",
                      "💘",
                      "💝",
                      "💟",
                      "☮️",
                      "✝️",
                      "☪️",
                      "🕉️",
                      "☸️",
                      "✡️",
                      "🔯",
                      "🕎",
                      "☯️",
                      "☦️",
                      "🛐",
                      "⛎",
                      "♈",
                      "♉",
                      "♊",
                      "♋",
                      "♌",
                      "♍",
                      "♎",
                      "♏",
                      "♐",
                      "♑",
                      "♒",
                      "♓",
                      "🆔",
                      "⚛️",
                      "🉑",
                      "☢️",
                      "☣️",
                      "📴",
                      "📳",
                      "🈶",
                      "🈚",
                      "🈸",
                      "🈺",
                      "🈷️",
                      "✴️",
                      "🆚",
                      "💮",
                      "🉐",
                      "㊙️",
                      "㊗️",
                      "🈴",
                      "🈵",
                      "🈹",
                      "🈲",
                      "🅰️",
                      "🅱️",
                      "🆎",
                      "🆑",
                      "🅾️",
                      "🆘",
                      "❌",
                      "⭕",
                      "🛑",
                      "⛔",
                      "📛",
                      "🚫",
                      "💯",
                      "💢",
                      "♨️",
                      "🚷",
                      "🚯",
                      "🚳",
                      "🚱",
                      "🔞",
                      "📵",
                      "🚭",
                      "❗",
                      "❕",
                      "❓",
                      "❔",
                      "‼️",
                      "⁉️",
                      "🔅",
                      "🔆",
                      "〽️",
                      "⚠️",
                      "🚸",
                      "🔱",
                      "⚜️",
                      "🔰",
                      "♻️",
                      "✅",
                      "🈯",
                      "💹",
                      "❇️",
                      "✳️",
                      "❎",
                      "🌐",
                      "💠",
                      "Ⓜ️",
                      "🌀",
                      "💤",
                      "🏧",
                      "🚾",
                      "♿",
                      "🅿️",
                      "🛗",
                      "🈳",
                      "🈂️",
                      "🛂",
                      "🛃",
                      "🛄",
                      "🛅",
                      "🚹",
                      "🚺",
                      "🚼",
                      "⚧️",
                      "🚻",
                      "🚮",
                      "🎦",
                      "📶",
                      "🈁",
                      "🔣",
                      "ℹ️",
                      "🔤",
                      "🔡",
                      "🔠",
                      "🆖",
                      "🆗",
                      "🆙",
                      "🆒",
                      "🆕",
                      "🆓",
                      "0️⃣",
                      "1️⃣",
                      "2️⃣",
                      "3️⃣",
                      "4️⃣",
                      "5️⃣",
                      "6️⃣",
                      "7️⃣",
                      "8️⃣",
                      "9️⃣",
                      "🔟",
                      "🔢",
                      "#️⃣",
                      "*️⃣",
                      "⏏️",
                      "▶️",
                      "⏸️",
                      "⏯️",
                      "⏹️",
                      "⏺️",
                      "⏭️",
                      "⏮️",
                      "⏩",
                      "⏪",
                      "⏫",
                      "⏬",
                      "◀️",
                      "🔼",
                      "🔽",
                      "➡️",
                      "⬅️",
                      "⬆️",
                      "⬇️",
                      "↗️",
                      "↘️",
                      "↙️",
                      "↖️",
                      "↕️",
                      "↔️",
                      "↪️",
                      "↩️",
                      "⤴️",
                      "⤵️",
                      "🔀",
                      "🔁",
                      "🔂",
                      "🔄",
                      "🔃",
                      "🎵",
                      "🎶",
                      "➕",
                      "➖",
                      "➗",
                      "✖️",
                      "🟰",
                      "♾️",
                      "💲",
                      "💱",
                      "™️",
                      "©️",
                      "®️",
                      "〰️",
                      "➰",
                      "➿",
                      "🔚",
                      "🔙",
                      "🔛",
                      "🔝",
                      "🔜",
                      "✔️",
                      "☑️",
                      "🔘",
                      "🔴",
                      "🟠",
                      "🟡",
                      "🟢",
                      "🔵",
                      "🟣",
                      "⚫",
                      "⚪",
                      "🟤",
                      "🔺",
                      "🔻",
                      "🔸",
                      "🔹",
                      "🔶",
                      "🔷",
                      "🔳",
                      "🔲",
                      "▪️",
                      "▫️",
                      "◾",
                      "◽",
                      "◼️",
                      "◻️",
                      "🟥",
                      "🟧",
                      "🟨",
                      "🟩",
                      "🟦",
                      "🟪",
                      "⬛",
                      "⬜",
                      "🟫",
                      "🔈",
                      "🔇",
                      "🔉",
                      "🔊",
                      "🔔",
                      "🔕",
                      "📣",
                      "📢",
                      "👁️‍🗨️",
                      "💬",
                      "💭",
                      "🗯️",
                      "♠️",
                      "♣️",
                      "♥️",
                      "♦️",
                      "🃏",
                      "🎴",
                      "🀄",
                      "🕐",
                      "🕑",
                      "🕒",
                      "🕓",
                      "🕔",
                      "🕕",
                      "🕖",
                      "🕗",
                      "🕘",
                      "🕙",
                      "🕚",
                      "🕛",
                      "🕜",
                      "🕝",
                      "🕞",
                      "🕟",
                      "🕠",
                      "🕡",
                      "🕢",
                      "🕣",
                      "🕤",
                      "🕥",
                      "🕦",
                      "🕧",
                    ].map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setMessage(message + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl hover:bg-gray-800 rounded p-1 transition-all duration-200 hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voice Message Button */}
            <button
              type="button"
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
              title="Voice Message"
            >
              <FiMic className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className={`p-3 rounded-xl transition-all duration-300 ${
                message.trim() && !sending
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30"
                  : "bg-gray-800/50 cursor-not-allowed"
              }`}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiSend className="w-5 h-5 text-white" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
