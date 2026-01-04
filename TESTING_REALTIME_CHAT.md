# Testing Real-Time Chat Fix

## Quick Test Steps

### Test 1: Basic Real-Time Messaging
1. **Open two browser windows side by side:**
   - Window 1: Login as User A
   - Window 2: Login as User B (use incognito/private mode)

2. **Start a chat:**
   - In Window 1, navigate to chats and select/create a chat with User B
   - In Window 2, navigate to the same chat

3. **Send messages:**
   - Type a message in Window 1 and send
   - **Expected:** Message should appear in Window 2 **instantly** without refresh
   - Type a message in Window 2 and send
   - **Expected:** Message should appear in Window 1 **instantly** without refresh

### Test 2: Check Console Logs
Open browser DevTools (F12) and check the Console tab:

**Expected logs when receiving a message:**
```
📨 Socket message received: {chatId: "...", message: {...}}
✅ Adding new message to chat 67890...
```

**Socket connection logs:**
```
🔌 Attempting to join chat room: 67890...
📡 Socket ID: abc123, Connected: true
✅ Room join confirmed: {...}
👥 Room members: 2
```

### Test 3: Typing Indicators
1. Start typing in Window 1 (don't send)
2. **Expected:** Window 2 should show "typing..." indicator
3. Stop typing for 2 seconds
4. **Expected:** Typing indicator should disappear

### Test 4: Multiple Messages
1. Send 5 messages rapidly from Window 1
2. **Expected:** All 5 messages appear in Window 2 in correct order
3. Check console for duplicate warnings
4. **Expected:** No "⚠️ Message already exists" warnings

### Test 5: Reconnection
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Send a message (it will fail)
4. Set back to "Online"
5. **Expected:** Socket should reconnect automatically
6. Send another message
7. **Expected:** Message should appear in other window

## Troubleshooting

### Issue: Messages not appearing in real-time

**Check 1: Socket Connection**
```javascript
// In browser console:
window.socket = require('@/lib/socket/socket').getSocket()
console.log('Socket connected:', window.socket?.connected)
console.log('Socket ID:', window.socket?.id)
```

**Check 2: Redux State**
```javascript
// In browser console (if Redux DevTools installed):
// Check if messagesByChat is updating
```

**Check 3: Backend Logs**
Look for these in backend console:
```
✅ User connected: 123abc (Socket: xyz789)
✅ User 123abc (Socket: xyz789) joined chat room: 67890
📊 Room 67890 now has 2 member(s)
```

### Issue: "Cannot add message: chatId is missing"

**Cause:** Socket payload structure mismatch
**Fix:** Check backend is sending `{ chatId, message }` format

### Issue: Messages appear but with delay

**Possible causes:**
1. Network latency (check Network tab)
2. React not re-rendering (check if array reference is changing)
3. Too many console.logs (remove debug logs in production)

### Issue: Duplicate messages

**Cause:** Message being added twice (once from API, once from socket)
**Check:** Look for "⚠️ Message already exists" in console
**Expected:** This warning is normal and prevents duplicates

## Performance Checks

### Memory Leaks
1. Open/close chat multiple times
2. Check browser Task Manager (Shift+Esc in Chrome)
3. **Expected:** Memory should not keep increasing

### Socket Listeners
1. Navigate between different chats
2. Check console for cleanup logs
3. **Expected:** "📤 Leaving chat room" when switching chats

## Success Criteria

✅ Messages appear instantly (< 500ms)
✅ No page refresh needed
✅ Typing indicators work
✅ No duplicate messages
✅ No console errors
✅ Socket reconnects after network issues
✅ Multiple users can chat simultaneously
✅ Messages persist after refresh (loaded from DB)

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Socket not connecting | Check NEXT_PUBLIC_SOCKET_URL in .env |
| CORS errors | Verify backend CORS allows frontend URL |
| Messages encrypted in UI | Backend should decrypt before socket emit |
| Old messages not loading | Check fetchMessages API call |
| Can't send messages | Verify JWT token is valid |
