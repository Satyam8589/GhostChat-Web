# ⚡ QUICK FIX - WebSocket Connection

## 🎯 THE PROBLEM
WebSocket connection failing: `WebSocket is closed before the connection is established`

## ✅ THE SOLUTION (3 STEPS)

### **Step 1: Set Environment Variable**

#### **Option A: Testing on Vercel (Production)**
1. Go to https://vercel.com/dashboard
2. Select your GhostChat project
3. **Settings** → **Environment Variables**
4. Add new variable:
   ```
   Key: NEXT_PUBLIC_API_URL
   Value: https://ghostchat-backend-api.onrender.com
   ```
5. Select: ✅ Production ✅ Preview ✅ Development
6. Click **Save**

#### **Option B: Testing Locally**
Create `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### **Step 2: Redeploy**

#### **On Vercel:**
- Go to **Deployments** tab
- Click **Redeploy** on latest deployment
- OR push a new commit to trigger deployment

#### **Locally:**
- Restart your dev server:
  ```bash
  cd frontend
  npm run dev
  ```

### **Step 3: Clear Cache & Test**

1. **Clear browser cache:**
   - `Ctrl+Shift+Delete`
   - Check "Cached images and files"
   - Click "Clear data"

2. **Hard refresh:** `Ctrl+Shift+R`

3. **Open console** (F12) and look for:
   ```
   ✅ Socket connected successfully!
   🆔 Socket ID: abc123...
   ```

## 🧪 TEST IT

1. Open chat on **Browser 1** (User A)
2. Open same chat on **Browser 2** (User B)  
3. Send message from User A
4. ✅ **Should appear instantly on User B**

## ❌ If Still Not Working

Check console for:
```
❌ Socket connection error:
📍 Error message: [error details]
📍 Attempted URL: [URL it tried to connect to]
```

**Common fixes:**
- ✅ Verify `NEXT_PUBLIC_API_URL` is set
- ✅ Redeploy after setting env var
- ✅ Clear cache completely
- ✅ Try incognito mode
- ✅ Check backend is running on Render

## 📸 Send Me

After completing steps, send screenshot of browser console showing:
- Socket connection logs
- Any errors (if still failing)

---

**That's it! The code is already fixed, you just need to set the environment variable!** 🚀
