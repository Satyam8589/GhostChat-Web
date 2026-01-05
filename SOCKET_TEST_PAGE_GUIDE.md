# 🧪 Socket Connection Test Page

## 🎯 Purpose

This is a **simple, standalone page** to test if your Socket.IO connection is working, completely separate from your complex chat UI.

## 🚀 How to Use

### **Step 1: Access the Test Page**

1. Make sure your dev server is running:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000/socket-test
   ```

### **Step 2: Test Connection**

1. **Click "Connect Socket"**
   - Watch the logs
   - Should see: `✅ Connected! Socket ID: abc123...`
   - Status should turn green: `🟢 Connected`

2. **Click "Join Room"**
   - Uses the default chat ID: `6957a9cb01f6950fcaedb032`
   - Should see: `✅ Joined room! Members: 1`
   - Room Members count should update

### **Step 3: Test Real-Time (Two Browsers)**

1. **Browser 1:**
   - Go to `http://localhost:3000/socket-test`
   - Login (if needed)
   - Click "Connect Socket"
   - Click "Join Room"
   - Should show: `Room members: 1`

2. **Browser 2 (Incognito):**
   - Open incognito window
   - Go to `http://localhost:3000/socket-test`
   - Login as different user
   - Click "Connect Socket"
   - Click "Join Room"
   - Should show: `Room members: 2`

3. **Send Test Message:**
   - In Browser 1, type: "Hello from browser 1"
   - Click "Send"
   - **Browser 2 should receive it instantly!**

## 📊 What to Look For

### **✅ SUCCESS Indicators:**

**Connection:**
```
✅ Connected! Socket ID: abc123xyz
```

**Room Join:**
```
✅ Joined room! Members: 2
```

**Message Received:**
```
📨 Message received from socket!
[Message appears in "Received Messages" section]
```

### **❌ FAILURE Indicators:**

**Connection Failed:**
```
❌ Connection error: [error message]
```

**No Token:**
```
❌ No token found! Please login first.
```

**Socket Not Connected:**
```
❌ Socket not connected!
```

## 🔍 Features

### **Connection Status Panel**
- Shows if socket is connected (green/red)
- Displays your socket ID
- Shows number of members in the room

### **Controls**
- **Connect Socket** - Establish socket connection
- **Disconnect** - Close socket connection
- **Join Room** - Join the chat room
- **Leave Room** - Leave the chat room
- **Send** - Send a test message

### **Event Logs**
- Real-time logs of all socket events
- Color-coded:
  - 🟢 Green = Success
  - 🔴 Red = Error
  - 🟡 Yellow = Warning
  - ⚪ Gray = Info

### **Received Messages**
- Shows all messages received via socket
- Displays sender information
- Updates in real-time

## 🧪 Test Scenarios

### **Test 1: Basic Connection**
1. Click "Connect Socket"
2. ✅ Should see green status
3. ✅ Should see socket ID

### **Test 2: Room Join**
1. Connect socket
2. Click "Join Room"
3. ✅ Should see "Members: 1"

### **Test 3: Two Users**
1. Open two browsers
2. Connect both
3. Join room on both
4. ✅ Both should show "Members: 2"

### **Test 4: Real-Time Messaging**
1. Two browsers, both connected and in room
2. Send message from Browser 1
3. ✅ Browser 2 receives it instantly

## 🐛 Troubleshooting

### **"No token found"**
**Solution:** Login first at `http://localhost:3000/login`

### **"Connection error"**
**Solution:** 
- Check if backend is running
- Check environment variable `NEXT_PUBLIC_API_URL`
- Check browser console for errors

### **"Room members: 0" on backend**
**Solution:**
- Make sure you clicked "Join Room"
- Check event logs for "Joined room" message
- Verify socket is connected (green status)

### **Messages not appearing**
**Solution:**
- Both browsers must be connected
- Both must have joined the same room
- Check "Room Members" shows 2
- Check event logs for errors

## 📸 Expected Results

### **Browser 1 Logs:**
```
[12:00:00] 🔌 Connecting to: https://ghostchat-backend-api.onrender.com
[12:00:01] ✅ Connected! Socket ID: abc123xyz
[12:00:02] 🚪 Joining room: 6957a9cb01f6950fcaedb032
[12:00:02] ✅ Joined room! Members: 1
[12:00:05] ✅ Joined room! Members: 2  ← When Browser 2 joins
[12:00:10] 📤 Sending message via socket: "Hello"
```

### **Browser 2 Logs:**
```
[12:00:03] 🔌 Connecting to: https://ghostchat-backend-api.onrender.com
[12:00:04] ✅ Connected! Socket ID: xyz789abc
[12:00:05] 🚪 Joining room: 6957a9cb01f6950fcaedb032
[12:00:05] ✅ Joined room! Members: 2
[12:00:10] 📨 Message received from socket!  ← Receives Browser 1's message
```

### **Backend Logs (Render):**
```
✅ User connected: user1_id (Socket: abc123xyz)
✅ User abc123xyz joined chat room: 6957a9cb01f6950fcaedb032
📊 Room 6957a9cb01f6950fcaedb032 now has 1 member(s)

✅ User connected: user2_id (Socket: xyz789abc)
✅ User xyz789abc joined chat room: 6957a9cb01f6950fcaedb032
📊 Room 6957a9cb01f6950fcaedb032 now has 2 member(s)

🔥 EMITTING MESSAGE TO CHAT ROOM
👥 Members in room: 2  ← Should be 2!
✅ Message emitted to 2 member(s)
```

## ✅ Success Criteria

Socket is working correctly when:
- [ ] Connection status shows green
- [ ] Socket ID is displayed
- [ ] Room join shows "Members: 1"
- [ ] Second browser shows "Members: 2"
- [ ] Messages appear in "Received Messages"
- [ ] Backend logs show "Members in room: 2"
- [ ] No errors in event logs

## 🎯 Advantages of This Test Page

1. **Simple** - No complex UI to debug
2. **Visual** - Clear status indicators
3. **Isolated** - Tests socket independently
4. **Real-time Logs** - See exactly what's happening
5. **Two-way Test** - Can send and receive messages
6. **No Dependencies** - Doesn't rely on your chat components

---

**This page will definitively show if your socket connection is working!** 🚀
