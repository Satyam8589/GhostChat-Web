# 🔴 Socket Connection Failed in Deployment

## Error You're Seeing:
```
Cannot join room - chatId: true, socket: true, connected: false
```

## 🔍 Root Cause:
The socket exists but **`connected: false`** means the frontend cannot establish a connection to the backend Socket.IO server.

---

## ✅ SOLUTIONS (Try in Order)

### Solution 1: Set Frontend Environment Variables

**In Vercel Dashboard:**

1. Go to your frontend project
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```bash
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

**Replace `https://your-backend.onrender.com` with your actual Render backend URL!**

4. Click **Save**
5. Go to **Deployments** → **Redeploy** (click ⋯ menu → Redeploy)

---

### Solution 2: Check Backend CORS Configuration

**The backend must allow your frontend URL!**

1. Go to **Render Dashboard** → Your Backend Service
2. Click **Environment**
3. Ensure `CLIENT_URL` is set to your **exact** frontend URL:

```bash
CLIENT_URL=https://your-app.vercel.app
```

**Important:**
- ✅ Must match exactly (no trailing slash)
- ✅ Must be HTTPS in production
- ✅ Check for typos

4. **Redeploy backend** after changing

---

### Solution 3: Verify Backend is Running

**Check Render Logs:**

1. Go to Render Dashboard → Your Backend Service
2. Click **Logs**
3. Look for these messages:

```
✅ Should see:
🚀 Server is running on port 10000
🔌 Socket.IO is ready for connections
✅ Socket.IO server initialized

❌ Should NOT see:
Application failed to respond
Connection timeout
CORS blocked origin
```

**If backend is not running:**
- Check environment variables are set
- Check MongoDB connection string is correct
- Check for startup errors in logs

---

### Solution 4: Test Backend Directly

**Test if backend is accessible:**

```bash
# Test API endpoint:
curl https://your-backend.onrender.com/api/auth/health

# Test Socket.IO endpoint:
curl "https://your-backend.onrender.com/socket.io/?EIO=4&transport=polling"
```

**Expected responses:**
- API: Should return 200 OK
- Socket.IO: Should return session ID (not 404 or CORS error)

**If you get errors:**
- 404: Backend not deployed or wrong URL
- CORS error: `CLIENT_URL` not set correctly
- Timeout: Backend not running or crashed

---

### Solution 5: Check Socket.IO Transport

**The issue might be WebSocket blocking.**

In `frontend/src/lib/socket/socket.js`, verify this line exists:

```javascript
transports: process.env.NODE_ENV === "production" 
  ? ["polling", "websocket"] 
  : ["websocket", "polling"],
```

This ensures polling is tried first in production (more reliable).

---

### Solution 6: Check Browser Console

**Open your deployed frontend:**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors:

```
❌ Common errors:
- "Failed to load resource: net::ERR_CONNECTION_REFUSED"
  → Backend URL is wrong or backend is down

- "Access to XMLHttpRequest blocked by CORS"
  → CLIENT_URL not set correctly in backend

- "WebSocket connection failed"
  → Normal, should fall back to polling

- "Authentication error: Invalid token"
  → User needs to re-login
```

4. Go to **Network** tab
5. Filter by **WS** (WebSocket) or **XHR** (Polling)
6. Look for requests to `/socket.io/?EIO=4&transport=polling`
7. Check status codes:
   - ✅ 200 OK = Good
   - ❌ 404 = Wrong URL
   - ❌ 0 (failed) = CORS or backend down

---

## 🎯 Complete Deployment Checklist

### Backend (Render):

- [ ] **Service is running** (check Render dashboard)
- [ ] **Environment variables set:**
  ```bash
  NODE_ENV=production
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=your_secret
  ENCRYPTION_KEY=your_32_char_key
  CLIENT_URL=https://your-frontend.vercel.app
  ```
- [ ] **Start command:** `npm start` (not `npm run dev`)
- [ ] **Logs show:** "Socket.IO is ready for connections"
- [ ] **MongoDB connected:** Check Atlas allows `0.0.0.0/0`

### Frontend (Vercel):

- [ ] **Environment variables set:**
  ```bash
  NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
  NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
  ```
- [ ] **Redeployed** after setting variables
- [ ] **No build errors** in Vercel logs

### Testing:

- [ ] **Backend responds:**
  ```bash
  curl https://your-backend.onrender.com/socket.io/?EIO=4&transport=polling
  ```
- [ ] **Frontend console shows:**
  ```
  ✅ Socket connected
  NOT: connected: false
  ```
- [ ] **Network tab shows:**
  - Polling requests with status 200
  - No CORS errors

---

## 🔧 Quick Fixes

### Fix 1: Wrong Backend URL

**Check your backend URL in Render:**
1. Render Dashboard → Your Service
2. Copy the URL (e.g., `https://ghostchat-backend.onrender.com`)
3. Set in Vercel environment variables:
   ```bash
   NEXT_PUBLIC_SOCKET_URL=https://ghostchat-backend.onrender.com
   ```
4. Redeploy frontend

### Fix 2: CORS Blocking

**In Render Environment Variables:**
```bash
CLIENT_URL=https://your-exact-frontend-url.vercel.app
```

**Then redeploy backend**

### Fix 3: Backend Not Running

**Check Render logs for errors:**
- MongoDB connection failed → Fix connection string
- Port binding error → Should bind to `process.env.PORT`
- Encryption key error → Set `ENCRYPTION_KEY` (32 chars)

---

## 🧪 Debug Steps

### Step 1: Test Backend Locally

```bash
# In backend directory:
NODE_ENV=production npm start

# Should see:
🚀 Server is running on port 5000
🔌 Socket.IO is ready for connections
```

### Step 2: Test Socket Connection Locally

```bash
# In another terminal:
curl "http://localhost:5000/socket.io/?EIO=4&transport=polling"

# Should return session ID, not error
```

### Step 3: Test Deployed Backend

```bash
curl "https://your-backend.onrender.com/socket.io/?EIO=4&transport=polling"

# Should return session ID
# If 404: Backend not deployed correctly
# If CORS error: CLIENT_URL not set
```

### Step 4: Check Frontend Environment

**In Vercel Dashboard:**
1. Settings → Environment Variables
2. Verify `NEXT_PUBLIC_SOCKET_URL` is set
3. Click on the variable to see its value
4. Ensure it matches your backend URL exactly

### Step 5: Check Browser Network Tab

**On deployed frontend:**
1. Open DevTools → Network
2. Reload page
3. Filter by "socket.io"
4. Check request URL and status
5. If no requests: Frontend not trying to connect
6. If 404: Wrong URL
7. If CORS: Backend CORS issue

---

## 📊 Common Scenarios

### Scenario 1: Backend URL Wrong

**Symptom:** No socket.io requests in Network tab

**Fix:**
```bash
# Vercel environment variables:
NEXT_PUBLIC_SOCKET_URL=https://your-correct-backend-url.onrender.com
```

### Scenario 2: CORS Blocking

**Symptom:** Console shows "CORS policy" error

**Fix:**
```bash
# Render environment variables:
CLIENT_URL=https://your-frontend.vercel.app
```

### Scenario 3: Backend Crashed

**Symptom:** "Connection refused" or timeout

**Fix:**
- Check Render logs for errors
- Verify MongoDB connection
- Check all environment variables set

### Scenario 4: Authentication Failed

**Symptom:** "Authentication error: Invalid token"

**Fix:**
- User needs to logout and login again
- Check JWT_SECRET is same across deployments

---

## ✅ Success Indicators

**Backend Render Logs:**
```
🚀 Server is running on port 10000
✅ MongoDB connected successfully
🔌 Socket.IO is ready for connections
✅ Socket.IO server initialized
✅ User connected: [userId] (Socket: [socketId])
```

**Frontend Browser Console:**
```
✅ Socket connected
🔌 Attempting to join chat room: [chatId]
✅ Room join confirmed: { chatId: "...", roomSize: 2 }
```

**Frontend Network Tab:**
```
✅ socket.io/?EIO=4&transport=polling - Status: 200
✅ Regular ping/pong packets
✅ No CORS errors
```

---

## 🆘 Still Not Working?

### Provide These Details:

1. **Backend URL:** (from Render)
2. **Frontend URL:** (from Vercel)
3. **Render Logs:** (last 50 lines)
4. **Browser Console Errors:** (screenshot)
5. **Network Tab:** (screenshot of socket.io requests)
6. **Environment Variables:** (confirm they're set, don't share values)

---

## 🎯 Most Likely Issue

Based on your error, the most likely cause is:

**Frontend doesn't know the backend URL**

**Quick Fix:**
1. Get your backend URL from Render (e.g., `https://ghostchat-abc123.onrender.com`)
2. Go to Vercel → Settings → Environment Variables
3. Add:
   ```bash
   NEXT_PUBLIC_SOCKET_URL=https://ghostchat-abc123.onrender.com
   ```
4. Redeploy frontend
5. Test again

---

**The socket should connect after setting the correct backend URL in Vercel!** 🚀
