# 🚀 Render Deployment Fix Guide

## ❌ Error You're Seeing
```
sh: 1: nodemon: not found
==> Exited with status 127
```

## 🔍 Root Cause
Render runs in **production mode** by default, which means:
- Only `dependencies` are installed (NOT `devDependencies`)
- `nodemon` is in `devDependencies`
- Running `npm run dev` fails because nodemon isn't available

---

## ✅ Solution (Choose One)

### **Option 1: Use Production Start Command (RECOMMENDED)**

**In Render Dashboard:**

1. Go to your backend service
2. Click **"Settings"** or **"Environment"**
3. Find **"Start Command"**
4. Change from: `npm run dev`
5. Change to: **`npm start`**
6. Click **"Save Changes"**
7. **Redeploy** (Manual Deploy → Deploy latest commit)

**Why this works:**
- `npm start` runs `node server.js` (no nodemon needed)
- Works in production without dev dependencies
- Faster startup time
- Industry standard for production

---

### **Option 2: Install Dev Dependencies in Production (NOT RECOMMENDED)**

**In Render Dashboard:**

1. Go to your backend service
2. Click **"Environment"**
3. Add environment variable:
   - **Key:** `NPM_CONFIG_PRODUCTION`
   - **Value:** `false`
4. Keep start command as: `npm run dev`
5. **Redeploy**

**Why this is NOT recommended:**
- Installs unnecessary packages in production
- Slower deployments
- Larger build size
- Nodemon auto-restart not needed in production

---

## 📋 Recommended Render Configuration

### **Build & Deploy Settings:**

```yaml
Build Command: npm install
Start Command: npm start
```

### **Environment Variables:**

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key
CLIENT_URL=https://your-frontend.vercel.app
```

**Important:**
- ✅ Set `NODE_ENV=production` for production optimizations
- ✅ Render automatically sets `PORT` - you can override if needed
- ✅ `CLIENT_URL` must match your frontend URL exactly (for CORS)

---

## 🧪 Testing After Deployment

### 1. Check Deployment Logs

Look for these success messages:
```
==> Installing dependencies...
==> Build successful!
==> Starting service with 'npm start'...
🚀 Server is running on http://0.0.0.0:5000
🔌 Socket.IO is ready for connections
✅ Socket.IO server initialized
```

### 2. Test API Endpoint

```bash
curl https://your-backend.onrender.com/api/auth/health
# Should return 200 OK
```

### 3. Test Socket.IO Connection

```bash
curl "https://your-backend.onrender.com/socket.io/?EIO=4&transport=polling"
# Should return session ID
```

---

## 🔧 Common Render Issues & Fixes

### Issue 1: "Application failed to respond"

**Cause:** Server not listening on correct port

**Fix:** Ensure your server uses `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue 2: "Build failed - Cannot find module"

**Cause:** Missing dependency in package.json

**Fix:** 
```bash
# Locally, add the missing package:
npm install <package-name>

# Commit and push:
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

### Issue 3: "Database connection failed"

**Cause:** MongoDB URI not set or incorrect

**Fix:**
1. Go to Render Dashboard → Environment
2. Add `MONGODB_URI` with your connection string
3. Ensure IP whitelist in MongoDB Atlas includes `0.0.0.0/0` (allow all)
4. Redeploy

### Issue 4: "CORS errors in frontend"

**Cause:** `CLIENT_URL` doesn't match frontend URL

**Fix:**
1. Check your frontend URL (e.g., `https://myapp.vercel.app`)
2. Set `CLIENT_URL` to EXACT match (no trailing slash)
3. Redeploy backend
4. Check logs for: `✅ Allowing HTTPS origin: https://...`

---

## 📊 Render-Specific Optimizations

### 1. Health Check Endpoint

Add to your `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
```

Configure in Render:
- **Health Check Path:** `/health`
- **Health Check Interval:** 30 seconds

### 2. Auto-Deploy from GitHub

1. Connect your GitHub repository
2. Enable **"Auto-Deploy"**
3. Choose branch (usually `main` or `master`)
4. Every push will trigger automatic deployment

### 3. Custom Domain (Optional)

1. Go to **Settings** → **Custom Domain**
2. Add your domain (e.g., `api.myapp.com`)
3. Update DNS records as instructed
4. Update `CLIENT_URL` if frontend needs to know backend URL

---

## 🎯 Complete Deployment Checklist

- [ ] **Code Changes:**
  - [ ] Server listens on `process.env.PORT`
  - [ ] Server binds to `0.0.0.0` (not just `localhost`)
  - [ ] All secrets use environment variables (no hardcoded values)

- [ ] **Render Configuration:**
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start` (not `npm run dev`)
  - [ ] Environment variables set (see list above)
  - [ ] Auto-deploy enabled (optional)

- [ ] **Database:**
  - [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
  - [ ] Connection string is correct
  - [ ] Database user has proper permissions

- [ ] **Testing:**
  - [ ] Deployment logs show success
  - [ ] Health endpoint responds
  - [ ] Socket.IO connects from frontend
  - [ ] CORS allows frontend origin

---

## 🚨 Emergency Rollback

If deployment breaks:

1. **Render Dashboard** → **Manual Deploy**
2. Find previous successful deployment
3. Click **"Redeploy"** on that commit
4. Fix issues locally, then redeploy

---

## 📝 Render vs Local Development

| Aspect | Local | Render Production |
|--------|-------|-------------------|
| Start Command | `npm run dev` | `npm start` |
| Dependencies | All (including dev) | Production only |
| Auto-restart | Yes (nodemon) | No (not needed) |
| Port | 5000 | `process.env.PORT` |
| Host | localhost | 0.0.0.0 |
| Environment | development | production |

---

## ✅ Success Indicators

When everything works, you'll see:

**Render Logs:**
```
==> Build successful!
==> Your service is live 🎉
🚀 Server is running on http://0.0.0.0:10000
✅ MongoDB connected successfully
🔌 Socket.IO is ready for connections
```

**Frontend Console:**
```
✅ Socket connected
🔌 Attempting to join chat room
✅ Room join confirmed
```

**Network Tab:**
- ✅ API calls return 200 OK
- ✅ Socket.IO polling succeeds
- ✅ No CORS errors

---

## 🆘 Still Having Issues?

1. **Check Render Logs:**
   - Dashboard → Logs → View full logs
   - Look for error messages

2. **Check Environment Variables:**
   - Dashboard → Environment
   - Ensure all required vars are set

3. **Test Locally First:**
   ```bash
   NODE_ENV=production npm start
   # Should work without errors
   ```

4. **Check MongoDB Connection:**
   - Atlas → Network Access
   - Ensure `0.0.0.0/0` is whitelisted

5. **Verify Package.json:**
   - All dependencies in `dependencies` (not `devDependencies`)
   - `"type": "module"` if using ES6 imports

---

## 📞 Quick Fix Commands

```bash
# Test production build locally:
NODE_ENV=production npm start

# Check if server responds:
curl http://localhost:5000/health

# Test socket connection:
curl "http://localhost:5000/socket.io/?EIO=4&transport=polling"

# View Render logs:
# Go to Render Dashboard → Your Service → Logs
```

---

**Your backend should now deploy successfully on Render!** 🎉

**Next Steps:**
1. Change Start Command to `npm start` in Render
2. Set all environment variables
3. Redeploy
4. Test socket connection from frontend
