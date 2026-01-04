# 🚀 Socket.IO Deployment Guide

## Problem Fixed
The socket connection was failing in deployment due to:
1. ❌ Hardcoded HTTP URLs not working with HTTPS in production
2. ❌ Missing environment variable configuration
3. ❌ CORS blocking deployed origins
4. ❌ WebSocket transport failing before falling back to polling

## ✅ Solutions Implemented

### 1. Frontend Socket Configuration (`frontend/src/lib/socket/socket.js`)
- **Auto-detection**: Automatically detects protocol (http/https) based on window.location
- **Smart fallback**: Uses localhost:5000 for local dev, infers production URL from hostname
- **Transport order**: Polling-first in production for better compatibility
- **Environment variable support**: Respects `NEXT_PUBLIC_SOCKET_URL` if set

### 2. Backend Socket.IO CORS (`backend/socket/socket.js`)
- **Flexible origin validation**: Allows localhost, Vercel deployments, and HTTPS origins
- **Better logging**: Clear console messages for debugging connection issues
- **Increased timeouts**: 60s ping timeout, 25s ping interval for stable connections
- **Transport optimization**: Polling-first with websocket upgrade support

### 3. Express CORS (`backend/server.js`)
- **Matching configuration**: Same CORS rules as Socket.IO
- **Production-ready**: Automatically allows HTTPS origins in production

---

## 📋 Deployment Checklist

### Backend Deployment (e.g., Render, Railway, Heroku)

1. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   PORT=5000  # or your platform's PORT
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   ENCRYPTION_KEY=your_32_character_key
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

2. **Ensure WebSocket Support:**
   - Most platforms support WebSockets by default
   - For Render: Enable "Web Service" (not "Background Worker")
   - For Railway: No special configuration needed
   - For Heroku: Ensure you're using HTTP/1.1 (default)

3. **Check Logs:**
   ```bash
   # You should see:
   ✅ Socket.IO server initialized
   ✅ Allowing HTTPS origin: https://your-frontend.vercel.app
   ```

### Frontend Deployment (Vercel, Netlify)

1. **Set Environment Variables (Optional):**
   ```bash
   # Only if your backend is on a different domain
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

2. **If backend is on same domain:**
   - Leave `NEXT_PUBLIC_SOCKET_URL` empty
   - The auto-detection will use the same domain

3. **For Vercel:**
   - Go to Project Settings → Environment Variables
   - Add variables for Production, Preview, and Development
   - Redeploy after adding variables

---

## 🧪 Testing Socket Connection

### Local Testing:
```javascript
// Open browser console on http://localhost:3000
// You should see:
✅ Socket connected
🔌 Attempting to join chat room: [chatId]
✅ Room join confirmed
```

### Production Testing:
```javascript
// Open browser console on your deployed site
// Check Network tab → WS (WebSocket) or XHR (Polling)
// You should see:
- Initial polling connection (200 OK)
- Upgrade to WebSocket (101 Switching Protocols) - optional
- Regular ping/pong messages
```

---

## 🔧 Troubleshooting

### Issue: "Socket not connecting in production"

**Check 1: Environment Variables**
```bash
# Backend must have:
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.com

# Frontend (optional):
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

**Check 2: CORS Headers**
```bash
# In backend logs, look for:
✅ Allowing HTTPS origin: https://...
# NOT:
❌ CORS blocked origin: https://...
```

**Check 3: Transport Method**
```javascript
// In browser console:
socket.io.engine.transport.name
// Should show: "polling" or "websocket"
```

**Check 4: Network Tab**
- Look for requests to `/socket.io/?EIO=4&transport=polling`
- Should return 200 OK
- Check response contains session ID

### Issue: "Connection established but messages not received"

**Check 1: Room Joining**
```javascript
// In browser console, you should see:
✅ Room join confirmed: { chatId: "...", roomSize: 2 }
```

**Check 2: Backend Logs**
```bash
# Should show:
✅ User connected: [userId] (Socket: [socketId])
✅ User [userId] joined chat room: [chatId]
📊 Room [chatId] now has 2 member(s)
```

**Check 3: Event Listeners**
```javascript
// Verify socket listeners are set up:
socket.listeners('message:receive').length > 0
```

### Issue: "Socket connects then immediately disconnects"

**Possible causes:**
1. **JWT Token expired** - Check authentication middleware
2. **Database connection failed** - User status update failing
3. **Timeout too short** - Increased to 60s in our fix

**Solution:**
```javascript
// Check browser console for:
Socket authentication error: Invalid token
// If yes, user needs to re-login
```

---

## 🎯 Common Deployment Scenarios

### Scenario 1: Frontend and Backend on Different Domains
```bash
# Frontend: https://myapp.vercel.app
# Backend: https://myapp-api.railway.app

# Backend .env:
CLIENT_URL=https://myapp.vercel.app

# Frontend .env:
NEXT_PUBLIC_SOCKET_URL=https://myapp-api.railway.app
NEXT_PUBLIC_API_URL=https://myapp-api.railway.app
```

### Scenario 2: Frontend and Backend on Same Domain (with proxy)
```bash
# Both on: https://myapp.com
# Frontend: https://myapp.com
# Backend: https://myapp.com/api (proxied)

# Backend .env:
CLIENT_URL=https://myapp.com

# Frontend .env:
# Leave empty - auto-detection will work
```

### Scenario 3: Vercel Frontend + Render Backend
```bash
# Frontend: https://myapp.vercel.app
# Backend: https://myapp.onrender.com

# Backend .env:
CLIENT_URL=https://myapp.vercel.app
NODE_ENV=production

# Frontend .env:
NEXT_PUBLIC_SOCKET_URL=https://myapp.onrender.com
```

---

## 📊 Performance Optimization

### For Production:
1. **Polling first**: More reliable through firewalls/proxies
2. **Longer timeouts**: Reduces reconnection overhead
3. **Compression**: Socket.IO automatically compresses messages
4. **Connection pooling**: Reuse existing connections

### Monitoring:
```javascript
// Add to frontend for monitoring:
socket.on('connect', () => {
  console.log('Connected at:', new Date().toISOString());
  console.log('Transport:', socket.io.engine.transport.name);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

**Backend Logs:**
```
🚀 Server is running on http://localhost:5000
🔌 Socket.IO is ready for connections
✅ Socket.IO server initialized
✅ User connected: 507f1f77bcf86cd799439011 (Socket: abc123)
✅ User 507f1f77bcf86cd799439011 joined chat room: 507f191e810c19729de860ea
```

**Frontend Console:**
```
🔌 Attempting to join chat room: 507f191e810c19729de860ea
📡 Socket ID: abc123, Connected: true
✅ Room join confirmed: { chatId: "507f191e810c19729de860ea", roomSize: 2 }
```

**Network Tab:**
- ✅ Status 200 for `/socket.io/?EIO=4&transport=polling`
- ✅ Status 101 for WebSocket upgrade (if upgraded)
- ✅ Regular ping/pong packets every 25 seconds

---

## 🆘 Still Having Issues?

1. **Check browser console** for error messages
2. **Check backend logs** for connection attempts
3. **Verify environment variables** are set correctly
4. **Test with curl** to ensure backend is accessible:
   ```bash
   curl https://your-backend-url.com/socket.io/?EIO=4&transport=polling
   ```
5. **Check firewall/proxy settings** if on corporate network

---

## 📝 Notes

- The auto-detection feature works for most deployment scenarios
- You can always override with `NEXT_PUBLIC_SOCKET_URL` if needed
- Polling-first approach is more reliable but slightly slower than WebSocket
- The system will automatically upgrade to WebSocket when possible
- All changes are backward compatible with local development
