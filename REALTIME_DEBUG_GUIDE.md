# Real-Time Message Debugging Guide

## Current Issue
Messages are not appearing in real-time. The console shows:
- ✅ Socket is connected
- ✅ Room join is successful  
- ✅ Room has 2 members
- ❌ `Real-time messages changed: 0 messages` - realtimeMessages array is EMPTY

## Root Cause
The socket event `message:receive` is NOT being received by the frontend, even though:
1. Backend is emitting the event (via `emitToChat`)
2. Users are joined to the chat room
3. Socket connection is established

## Debugging Steps

### Step 1: Check if Socket Listeners are Set Up
After refreshing the page, check the console for these logs:

```
🔧 Setting up socket event listeners...
📡 Socket ID: [socket-id]
📋 Registering listeners for: CONNECT, DISCONNECT, MESSAGE_RECEIVE, ...
```

**If you DON'T see these logs:**
- Socket listeners are not being set up
- Check if `setupSocketListeners` is being called in `socketAction.js`

### Step 2: Check if Message Event is Received
When User A sends a message, User B's console should show:

```
🔥🔥🔥 SOCKET EVENT RECEIVED: message:receive
📦 Raw data: {chatId: "...", message: {...}}
📦 Data type: object
📦 Data keys: chatId, message
📤 Dispatching MESSAGE_RECEIVED action to Redux...
✅ MESSAGE_RECEIVED action dispatched
```

**If you DON'T see these logs:**
- The frontend is NOT receiving the socket event
- This could be a backend emission issue or room membership issue

### Step 3: Check Backend Emission
When User A sends a message, the backend console should show:

```
🔥 EMITTING TO CHAT: Room=chat:[chatId], Event=message:receive
📊 Data: {"chatId":"...","message":{...}}
✅ Emission complete
```

**If you DON'T see these logs:**
- The backend is not emitting the event
- Check if `emitToChat` is being called in `messageController.js`

### Step 4: Verify Room Membership
Both users should be in the same chat room. Check backend logs:

```
✅ User [userId1] (Socket: [socketId1]) joined chat room: [chatId]
📊 Room [chatId] now has 1 member(s)
✅ User [userId2] (Socket: [socketId2]) joined chat room: [chatId]
📊 Room [chatId] now has 2 member(s)
```

**If room size is 1 instead of 2:**
- One user is not in the room
- Check if `chat:join` event is being emitted from frontend
- Check if user is calling `joinChatRoom(chatId)` action

## Common Issues and Fixes

### Issue 1: Socket Listeners Not Set Up
**Symptom**: No `🔧 Setting up socket event listeners...` log

**Fix**: Check `connectSocket` action in `socketAction.js`:
```javascript
export const connectSocket = (token) => {
  return (dispatch) => {
    const socket = initializeSocket(token);
    setupSocketListeners(socket, dispatch); // ← This must be called
  };
};
```

### Issue 2: Users Not in Same Room
**Symptom**: Room size is 1, not 2

**Fix**: Ensure `joinChatRoom` is called when opening a chat:
```javascript
useEffect(() => {
  if (chatId && socket && connected) {
    dispatch(joinChatRoom(chatId));
  }
}, [chatId, socket, connected, dispatch]);
```

### Issue 3: Backend Not Emitting
**Symptom**: No backend emission logs

**Fix**: Check `messageController.js` sendMessage function:
```javascript
// After saving message
emitToChat(chatId, "message:receive", {
  chatId: chatId,
  message: decryptedMessage,
});
```

### Issue 4: Event Name Mismatch
**Symptom**: Backend emits but frontend doesn't receive

**Fix**: Verify event names match:
- Backend emits: `"message:receive"`
- Frontend listens: `SOCKET_EVENTS.MESSAGE_RECEIVE` (should equal `"message:receive"`)

Check `frontend/src/lib/socket/events.js`:
```javascript
export const SOCKET_EVENTS = {
  MESSAGE_RECEIVE: "message:receive", // ← Must match backend
};
```

### Issue 5: CORS Issues
**Symptom**: Socket connects but events don't work

**Fix**: Check backend CORS configuration in `socket.js`:
```javascript
cors: {
  origin: "http://localhost:3000", // ← Must match frontend URL
  credentials: true,
}
```

## Testing Checklist

Run through this checklist to verify everything:

- [ ] Backend server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Socket connection is established (check `Socket ID: xxx, Connected: true`)
- [ ] Socket listeners are set up (check `🔧 Setting up socket event listeners...`)
- [ ] Both users join the chat room (check `Room [chatId] now has 2 member(s)`)
- [ ] User A sends a message
- [ ] Backend emits the event (check `🔥 EMITTING TO CHAT...`)
- [ ] User B receives the event (check `🔥🔥🔥 SOCKET EVENT RECEIVED...`)
- [ ] Redux action is dispatched (check `📤 Dispatching MESSAGE_RECEIVED...`)
- [ ] Message appears in User B's chat

## Next Steps

1. **Refresh both browser windows** to apply the new logging
2. **Open browser console** (F12) for both users
3. **Send a message** from User A
4. **Check the logs** in User B's console
5. **Report back** which logs you see and which you don't see

This will help us pinpoint exactly where the issue is!

## Expected Log Flow

When everything works correctly, you should see this sequence:

### User B's Console (Receiver):
```
1. 🔧 Setting up socket event listeners...
2. 📡 Socket ID: WlAfccVCKKaYNLUpAAD
3. 🎯 Socket connected! Setting up event listeners...
4. ✅ Socket connection confirmed, ID: WlAfccVCKKaYNLUpAAD
5. 🔌 Attempting to join chat room: 6957a9cb01f6950fcaedb032
6. ✅ Room join confirmed
7. 👥 Room members: 2
8. [User A sends message]
9. 🔥🔥🔥 SOCKET EVENT RECEIVED: message:receive
10. 📦 Raw data: {chatId: "...", message: {...}}
11. 📤 Dispatching MESSAGE_RECEIVED action to Redux...
12. ✅ MESSAGE_RECEIVED action dispatched
13. 🔄 Real-time messages changed: 1 messages
14. 📬 New message received: {...}
15. ✅ Adding message to store via Redux action...
16. 📨 Socket message received: {...}
17. ✅ Added message to chat 6957a9cb01f6950fcaedb032
```

If any of these logs are missing, that's where the problem is!
