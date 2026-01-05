"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function SocketTestPage() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testChatId, setTestChatId] = useState("6957a9cb01f6950fcaedb032");
  const [roomMembers, setRoomMembers] = useState(0);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  // Initialize socket
  const connectSocket = () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      addLog("❌ No token found! Please login first.", "error");
      return;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
                       process.env.NEXT_PUBLIC_API_URL || 
                       "https://ghostchat-backend-api.onrender.com";

    addLog(`🔌 Connecting to: ${SOCKET_URL}`, "info");

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      setConnected(true);
      setSocketId(newSocket.id);
      addLog(`✅ Connected! Socket ID: ${newSocket.id}`, "success");
    });

    newSocket.on("disconnect", (reason) => {
      setConnected(false);
      setSocketId(null);
      addLog(`⚠️ Disconnected. Reason: ${reason}`, "warning");
    });

    newSocket.on("connect_error", (error) => {
      addLog(`❌ Connection error: ${error.message}`, "error");
    });

    newSocket.on("chat:joined", (data) => {
      addLog(`✅ Joined room! Members: ${data.roomSize}`, "success");
      setRoomMembers(data.roomSize);
    });

    newSocket.on("message:receive", (data) => {
      try {
        addLog(`📨 Message received from socket!`, "success");
        console.log("Received message data:", data);
        
        // Handle both formats: {message: {...}} and direct message object
        const messageObj = data.message || data;
        
        setReceivedMessages((prev) => [...prev, {
          _id: messageObj._id || Date.now(),
          content: messageObj.content || messageObj.encryptedContent || "No content",
          sender: messageObj.sender || messageObj.senderId || "Unknown",
          timestamp: messageObj.timestamp || messageObj.createdAt || new Date(),
        }]);
      } catch (error) {
        addLog(`❌ Error processing received message: ${error.message}`, "error");
        console.error("Message receive error:", error);
      }
    });

    setSocket(newSocket);
  };

  // Join room
  const joinRoom = () => {
    if (!socket || !connected) {
      addLog("❌ Socket not connected!", "error");
      return;
    }

    addLog(`🚪 Joining room: ${testChatId}`, "info");
    socket.emit("chat:join", { chatId: testChatId });
  };

  // Leave room
  const leaveRoom = () => {
    if (!socket || !connected) {
      addLog("❌ Socket not connected!", "error");
      return;
    }

    addLog(`🚪 Leaving room: ${testChatId}`, "info");
    socket.emit("chat:leave", { chatId: testChatId });
    setRoomMembers(0);
  };

  // Send test message
  const sendTestMessage = () => {
    if (!socket || !connected) {
      addLog("❌ Socket not connected!", "error");
      return;
    }

    if (!message.trim()) {
      addLog("❌ Message is empty!", "error");
      return;
    }

    addLog(`📤 Sending message via socket: "${message}"`, "info");
    
    socket.emit("message:send", {
      chatId: testChatId,
      content: message,
      type: "text",
      timestamp: new Date(),
    });

    setMessage("");
  };

  // Disconnect socket
  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      setSocketId(null);
      addLog("🔌 Disconnected manually", "info");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🧪 Socket.IO Connection Test
        </h1>

        {/* Connection Status */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <p className={`text-lg font-bold ${connected ? "text-green-400" : "text-red-400"}`}>
                {connected ? "🟢 Connected" : "🔴 Disconnected"}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Socket ID</p>
              <p className="text-lg font-mono text-white truncate">
                {socketId || "N/A"}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Room Members</p>
              <p className="text-lg font-bold text-purple-400">
                {roomMembers} {roomMembers === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Controls</h2>
          
          {/* Connection Controls */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Connection</h3>
            <div className="flex gap-3">
              <button
                onClick={connectSocket}
                disabled={connected}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Connect Socket
              </button>
              <button
                onClick={disconnectSocket}
                disabled={!connected}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Room Controls */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Room Management</h3>
            <div className="flex gap-3 items-center mb-3">
              <input
                type="text"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                placeholder="Chat ID"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={joinRoom}
                disabled={!connected}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Join Room
              </button>
              <button
                onClick={leaveRoom}
                disabled={!connected}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Message Controls */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Send Test Message</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendTestMessage()}
                placeholder="Type a test message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              />
              <button
                onClick={sendTestMessage}
                disabled={!connected}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Received Messages */}
        {receivedMessages.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Received Messages</h2>
            <div className="space-y-2">
              {receivedMessages.map((msg, index) => (
                <div key={msg?._id || index} className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-white">{msg?.content || "No content"}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    From: {typeof msg?.sender === 'string' ? msg.sender : (msg?.sender?.name || msg?.sender?._id || "Unknown")}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {new Date(msg?.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Event Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-gray-950 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click "Connect Socket" to start.</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "success"
                      ? "text-green-400"
                      : log.type === "warning"
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-blue-400 font-bold mb-2">📋 Testing Instructions:</h3>
          <ol className="text-gray-300 space-y-1 text-sm">
            <li>1. Click "Connect Socket" to establish connection</li>
            <li>2. Click "Join Room" to join the chat room</li>
            <li>3. Open this page in another browser/tab (different user)</li>
            <li>4. Both should show "Room members: 2"</li>
            <li>5. Send a message from one browser</li>
            <li>6. It should appear instantly on the other browser!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
