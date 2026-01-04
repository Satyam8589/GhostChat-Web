# ⚡ RENDER DEPLOYMENT - QUICK FIX

## 🔴 Error: "nodemon: not found"

## ✅ IMMEDIATE FIX (2 minutes)

### Step 1: Go to Render Dashboard
1. Open [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service

### Step 2: Change Start Command
1. Click **"Settings"** (left sidebar)
2. Scroll to **"Start Command"**
3. Change from: `npm run dev`
4. Change to: **`npm start`**
5. Click **"Save Changes"**

### Step 3: Redeploy
1. Go to **"Manual Deploy"** (top right)
2. Click **"Deploy latest commit"**
3. Wait 2-3 minutes

### Step 4: Verify
Check logs for:
```
✅ Build successful!
🚀 Server is running on http://0.0.0.0:10000
```

---

## 📋 Required Environment Variables

Set these in Render → Environment:

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_random_string_here
ENCRYPTION_KEY=your_32_character_encryption_key
CLIENT_URL=https://your-frontend.vercel.app
```

**Important:**
- `CLIENT_URL` must match your frontend URL EXACTLY
- No trailing slash in URLs
- Use strong random values for secrets

---

## 🧪 Test After Deploy

```bash
# Test API:
curl https://your-backend.onrender.com/health

# Test Socket.IO:
curl "https://your-backend.onrender.com/socket.io/?EIO=4&transport=polling"
```

---

## ❓ Why This Happens

| Issue | Explanation |
|-------|-------------|
| `npm run dev` uses nodemon | Nodemon is for development only |
| Render runs in production | Only installs production dependencies |
| Nodemon is in devDependencies | Not installed in production |
| **Solution:** Use `npm start` | Uses `node` which is always available |

---

## 🎯 Correct Configuration

```json
// package.json
{
  "scripts": {
    "start": "node server.js",     ← Use this in Render
    "dev": "nodemon server.js",    ← Use this locally
    "prod": "NODE_ENV=production node server.js"
  }
}
```

**Render Settings:**
- **Build Command:** `npm install`
- **Start Command:** `npm start` ✅

---

## 🚨 Common Mistakes

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| Start: `npm run dev` | Start: `npm start` |
| Start: `nodemon server.js` | Start: `node server.js` |
| Missing `NODE_ENV` | Set `NODE_ENV=production` |
| Wrong `CLIENT_URL` | Match frontend URL exactly |

---

## ✅ Success Checklist

- [ ] Start Command changed to `npm start`
- [ ] All environment variables set
- [ ] `CLIENT_URL` matches frontend URL
- [ ] MongoDB IP whitelist includes `0.0.0.0/0`
- [ ] Deployment logs show "Build successful"
- [ ] Server responds to health check
- [ ] Socket connects from frontend

---

**Need more help?** See `RENDER_DEPLOYMENT_GUIDE.md`
