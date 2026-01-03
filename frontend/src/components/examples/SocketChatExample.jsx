'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  sendSocketMessage,
  emitUserTyping,
  emitUserStopTyping,
  joinChatRoom,
  leaveChatRoom,
  markMessageRead,
} from '@/config/store/action/socketAction';

/**
 * Example Chat Component with Socket.IO Integration
 * Demonstrates real-time messaging, typing indicators, and online status
 */
export default function SocketChatExample({ chatId, receiverId }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Get socket state from Redux
  const { connected, onlineUsers, typingUsers, realtimeMessages } = useSelector(
    (state) => state.socket
  );

  // Check if receiver is online
  const isReceiverOnline = onlineUsers.includes(receiverId);

  // Check if receiver is typing in this chat
  const isReceiverTyping = typingUsers[chatId]?.includes(receiverId);

  // Join chat room on mount, leave on unmount
  useEffect(() => {
    if (chatId && connected) {
      dispatch(joinChatRoom(chatId));
      console.log('✅ Joined chat room:', chatId);
    }

    return () => {
      if (chatId && connected) {
        dispatch(leaveChatRoom(chatId));
        console.log('👋 Left chat room:', chatId);
      }
    };
  }, [chatId, connected, dispatch]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessage(e.target.value);

    // Emit typing event
    if (connected && e.target.value.length > 0) {
      dispatch(emitUserTyping(chatId));

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Stop typing after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        dispatch(emitUserStopTyping(chatId));
      }, 3000);

      setTypingTimeout(timeout);
    } else if (e.target.value.length === 0) {
      dispatch(emitUserStopTyping(chatId));
    }
  };

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !connected) return;

    // Send message via socket
    dispatch(
      sendSocketMessage({
        chatId,
        receiverId,
        content: message.trim(),
        type: 'text',
        timestamp: new Date().toISOString(),
      })
    );

    // Clear input and stop typing
    setMessage('');
    dispatch(emitUserStopTyping(chatId));

    // Clear typing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  // Mark messages as read when they appear
  useEffect(() => {
    realtimeMessages
      .filter((msg) => msg.chatId === chatId && msg.senderId === receiverId)
      .forEach((msg) => {
        if (msg.status !== 'read') {
          dispatch(markMessageRead(msg._id));
        }
      });
  }, [realtimeMessages, chatId, receiverId, dispatch]);

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Chat Room</h2>
            <div className="flex items-center gap-2 text-sm">
              {/* Connection Status */}
              <span className={`${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
              
              {/* Online Status */}
              {connected && (
                <span className="text-gray-500">
                  • {isReceiverOnline ? '🟢 Online' : '⚫ Offline'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {realtimeMessages
          .filter((msg) => msg.chatId === chatId)
          .map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.senderId === receiverId ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.senderId === receiverId
                    ? 'bg-gray-800 text-white'
                    : 'bg-purple-500 text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  {msg.senderId !== receiverId && (
                    <span className="text-xs">
                      {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓' : '⏱'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

        {/* Typing Indicator */}
        {isReceiverTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        {!connected && (
          <div className="mb-2 text-center text-red-400 text-sm">
            ⚠️ Not connected to server. Messages won't be sent.
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder={connected ? "Type a message..." : "Connecting..."}
            disabled={!connected}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!connected || !message.trim()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all duration-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Usage Example:
 * 
 * import SocketChatExample from '@/components/examples/SocketChatExample';
 * 
 * function ChatPage() {
 *   return <SocketChatExample chatId="123" receiverId="user456" />;
 * }
 */
