"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchUserChats,
  createChat,
  setActiveChat,
  togglePinChat,
  toggleArchiveChat,
  deleteChat,
} from "@/config/store/action/chatAction";
import { updateChatWithNewMessage } from "@/config/store/reducer/chatReducer";
import {
  FiSearch,
  FiPlus,
  FiUsers,
  FiMessageSquare,
  FiMoreVertical,
  FiStar,
  FiArchive,
  FiTrash2,
  FiX,
  FiImage,
} from "react-icons/fi";
import { getSocket } from "@/lib/socket/socket";
import {
  addMessageFromSocket,
  updateMessageFromSocket,
} from "@/config/store/reducer/messageReducer";

export default function ChatsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { chats, loading, error } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { connected } = useSelector((state) => state.socket);
  const socket = getSocket();

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
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Auto-dismiss error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Fetch chats on mount
  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  // Join all chat rooms when socket is connected and chats are loaded
  useEffect(() => {
    if (socket && connected && chats.length > 0) {
      console.log(`🔌 Joining all ${chats.length} chat rooms...`);

      chats.forEach((chat) => {
        if (chat._id) {
          socket.emit("chat:join", { chatId: chat._id });
          console.log(`✅ Joined room: chat:${chat._id}`);
        }
      });

      // Listen for new messages on all chats
      const handleNewMessage = (data) => {
        console.log("📨 New message received on chats page:", data);

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
        // Being on the chats list page doesn't mean the user has seen the message
      };

      // Listen for message status updates
      const handleMessageDelivered = (data) => {
        console.log("✅ Message delivered:", data);
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
        console.log("👁️ Message read:", data);
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
        console.log("🧹 Leaving all chat rooms...");
        socket.off("message:receive", handleNewMessage);
        socket.off("message:status:delivered", handleMessageDelivered);
        socket.off("message:status:read", handleMessageRead);

        chats.forEach((chat) => {
          if (chat._id) {
            socket.emit("chat:leave", { chatId: chat._id });
            console.log(`👋 Left room: chat:${chat._id}`);
          }
        });
      };
    } else if (!connected && socket) {
      console.log("⏳ Socket not connected yet, waiting...");
    }
  }, [socket, connected, chats, dispatch, user]);

  // Filter chats
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participants?.some((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (activeFilter === "pinned") return matchesSearch && chat.pinned;
    if (activeFilter === "archived") return matchesSearch && chat.archived;
    if (activeFilter === "unread") return matchesSearch && chat.unreadCount > 0;

    return matchesSearch && !chat.archived;
  });

  const handleChatClick = (chatId) => {
    dispatch(setActiveChat(chatId));
    // Navigate to chat detail page using Next.js router
    router.push(`/chats/${chatId}`);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 sm:p-6 pb-24 lg:pb-6 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="h-full max-w-7xl mx-auto relative z-10 flex flex-col">
        {/* Error Message Banner */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center justify-between animate-slide-down">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              className="p-1 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-gray-500">All your conversations in one place</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 text-white font-medium"
            >
              <FiUsers className="w-4 h-4" />
              Create Group
            </button>

            <button
              onClick={() => setShowCreateChat(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 text-white font-medium"
            >
              <FiMessageSquare className="w-4 h-4" />
              Add New
            </button>
          </div>
        </div>

        {/* Main Container */}
        <div className="flex-1 lg:overflow-hidden bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 ring-1 ring-white/20 shadow-2xl flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-800/50">
            {/* Search Bar */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {["all", "unread", "pinned", "archived"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-purple-500 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chats...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500">Error: {error}</div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiMessageSquare className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No conversations yet</p>
                <p className="text-sm">Start a new chat to get started!</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <ChatItem
                  key={chat._id}
                  chat={chat}
                  currentUserId={user?.id || user?._id}
                  onClick={() => handleChatClick(chat._id)}
                  onPin={async () => {
                    try {
                      await dispatch(
                        togglePinChat({
                          chatId: chat._id,
                          pinned: !chat.pinned,
                        })
                      ).unwrap();
                    } catch (err) {
                      setErrorMessage(err || "Failed to toggle pin");
                    }
                  }}
                  onArchive={() =>
                    dispatch(
                      toggleArchiveChat({
                        chatId: chat._id,
                        archived: !chat.archived,
                      })
                    )
                  }
                  onDelete={() => {
                    if (confirm("Delete this chat?")) {
                      dispatch(deleteChat(chat._id));
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Chat Modal */}
      {showCreateChat && (
        <CreateChatModal
          onClose={() => setShowCreateChat(false)}
          onSubmit={(participantId) => {
            dispatch(createChat({ type: "private", participantId }));
            setShowCreateChat(false);
          }}
        />
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onSubmit={(groupData) => {
            dispatch(createChat({ type: "group", ...groupData }));
            setShowCreateGroup(false);
          }}
        />
      )}
    </div>
  );
}

// Chat Item Component
function ChatItem({
  chat,
  currentUserId,
  onClick,
  onPin,
  onArchive,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

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

  // Get other participant for private chats
  const otherParticipant =
    chat.type === "private"
      ? chat.participants?.find((p) => {
          const participantId = p._id?.toString();
          const userId = currentUserId?.toString();
          return participantId !== userId;
        })
      : null;

  const displayName =
    chat.type === "group"
      ? chat.name
      : otherParticipant?.name || otherParticipant?.username || "Unknown User";

  return (
    <div
      className="relative flex items-center gap-4 p-4 hover:bg-gray-800/50 cursor-pointer transition-all border-b border-gray-800/30 group"
      onClick={onClick}
    >
      {/* Pinned Star Indicator - Always visible when pinned */}
      {chat.pinned && (
        <div className="absolute top-3 left-3 z-20">
          <div className="relative drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">
            <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse drop-shadow-lg" />
            <div className="absolute inset-0 animate-ping opacity-75">
              <FiStar className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl overflow-hidden">
          {chat.type === "group" && chat.groupIcon ? (
            <img
              src={chat.groupIcon}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : otherParticipant?.profilePicture ? (
            <img
              src={otherParticipant.profilePicture}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{displayName?.charAt(0)?.toUpperCase() || "👤"}</span>
          )}
        </div>
        {otherParticipant?.status === "online" && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-white truncate">{displayName}</h3>
          <span className="text-xs text-gray-500">
            {chat.lastMessageTime
              ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-gray-400 truncate flex-1">
            {chat.lastMessage ? (
              <>
                {chat.lastMessage.messageType === "text" &&
                  sanitizePreview(
                    chat.lastMessage.encryptedContent ||
                      chat.lastMessage.content ||
                      "Message"
                  )}
                {chat.lastMessage.messageType === "image" && "📷 Photo"}
                {chat.lastMessage.messageType === "video" && "🎥 Video"}
                {chat.lastMessage.messageType === "audio" && "🎵 Audio"}
                {chat.lastMessage.messageType === "file" && "📎 File"}
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
        <div className="flex-shrink-0 min-w-[24px] h-6 px-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg shadow-purple-500/50 animate-pulse">
          {chat.unreadCount}
        </div>
      )}

      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="flex-shrink-0 p-2 hover:bg-gray-700 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
      >
        <FiMoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-4 top-16 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[150px]"
        >
          {" "}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left text-white"
          >
            <FiStar className="w-4 h-4" />
            {chat.pinned ? "Unpin" : "Pin"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left text-white"
          >
            <FiArchive className="w-4 h-4" />
            {chat.archived ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-700 text-left text-red-500"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Create Chat Modal
function CreateChatModal({ onClose, onSubmit }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Search for users - only exact matches
  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/user/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Filter to only show exact matches (case-insensitive for username)
        const exactMatches = (data.data || []).filter(
          (user) =>
            user.username.toLowerCase() === query.toLowerCase() ||
            user._id === query
        );
        setSuggestions(exactMatches);
        setShowSuggestions(exactMatches.length > 0);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUsername(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (user) => {
    setUsername(user.username);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      await onSubmit(username);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-4" ref={suggestionsRef}>
          <label className="block text-sm text-gray-400 mb-2">
            Username or User ID
          </label>
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-10">
              {suggestions.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleSuggestionClick(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{user.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user.username}
                    </p>
                    {user.email && (
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Searching indicator */}
          {searching && (
            <div className="absolute right-3 top-[42px] flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
              Searching...
            </div>
          )}

          {/* No results message */}
          {showSuggestions &&
            !searching &&
            suggestions.length === 0 &&
            username.trim().length >= 2 && (
              <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-center text-gray-400 text-sm">
                No users found
              </div>
            )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!username || loading}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Group Modal
function CreateGroupModal({ onClose, onSubmit }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setGroupImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setGroupImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (groupName) {
      onSubmit({
        name: groupName,
        description,
        image: groupImage,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Create Group</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Group Image Upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Group preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 transition-colors"
                    type="button"
                  >
                    <FiX className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:opacity-80 transition-opacity border-4 border-purple-500/20"
                  type="button"
                >
                  <FiImage className="w-10 h-10 text-white" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              type="button"
            >
              {imagePreview ? "Change Image" : "Add Group Image"}
            </button>
            <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
          </div>

          <input
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <textarea
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
          />

          <p className="text-sm text-gray-400">
            You can add members after creating the group.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!groupName}
            className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white transition-all"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
