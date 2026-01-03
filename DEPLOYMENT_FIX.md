# Deployment Fix Guide - Registration & Login Issues

## Problem
Registration and login are failing in the deployed environment but work locally.

## Root Causes

### 1. **Missing Environment Variables**
Your deployment is missing critical environment variables that the application needs to function.

### 2. **CORS Configuration**
The backend might be blocking requests from your deployed frontend domain.

### 3. **API URL Configuration**
The frontend doesn't know where to send API requests in production.

---

## Solutions

### Backend Environment Variables (.env)

Create or update your backend `.env` file with these variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Encryption (for messages)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (IMPORTANT - Update this with your deployed frontend URL)
CLIENT_URL=https://your-frontend-domain.com
```

**Important Notes:**
- `JWT_SECRET` must be at least 32 characters long
- `ENCRYPTION_KEY` must be exactly 32 characters (for AES-256)
- `CLIENT_URL` should be your deployed frontend URL (e.g., Vercel URL)
- `MONGO_URI` should be your MongoDB Atlas connection string

### Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Important:**
- Replace `https://your-backend-domain.com` with your actual deployed backend URL
- The variable MUST start with `NEXT_PUBLIC_` to be accessible in the browser
- For Vercel deployment, add this in the Vercel dashboard under Environment Variables

---

## Deployment Platform Specific Instructions

### If deploying to **Render/Railway/Heroku** (Backend):

1. Go to your backend service dashboard
2. Navigate to Environment Variables section
3. Add all the variables from the backend `.env` section above
4. Make sure to set `CLIENT_URL` to your frontend's deployed URL
5. Redeploy the backend service

### If deploying to **Vercel** (Frontend):

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
4. Redeploy the frontend

---

## CORS Fix

Your backend `server.js` already has CORS configured, but make sure the `CLIENT_URL` environment variable is set correctly:

```javascript
cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
})
```

If you need to allow multiple origins (e.g., preview deployments), update the CORS configuration:

```javascript
cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      // Add your Vercel preview URLs pattern if needed
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
})
```

---

## Quick Checklist

- [ ] Backend `.env` file has all required variables
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `ENCRYPTION_KEY` is exactly 32 characters
- [ ] `MONGO_URI` is correct and accessible
- [ ] `CLIENT_URL` points to deployed frontend URL
- [ ] Frontend has `NEXT_PUBLIC_API_URL` environment variable
- [ ] `NEXT_PUBLIC_API_URL` points to deployed backend URL
- [ ] Backend is redeployed after adding environment variables
- [ ] Frontend is redeployed after adding environment variables
- [ ] CORS is configured to allow your frontend domain

---

## Testing After Deployment

1. **Test Backend Health:**
   ```bash
   curl https://your-backend-url.com/api/auth
   ```
   Should return: `{"message":"API is working"}`

2. **Check Browser Console:**
   - Open your deployed frontend
   - Open browser DevTools (F12)
   - Go to Console tab
   - Try to register/login
   - Look for CORS errors or network errors

3. **Check Network Tab:**
   - Open DevTools → Network tab
   - Try to register/login
   - Check if the API request is going to the correct URL
   - Check the response status code and error message

---

## Common Error Messages & Solutions

### "Network Error" or "Failed to fetch"
- **Cause:** Frontend can't reach backend
- **Solution:** Check `NEXT_PUBLIC_API_URL` is set correctly

### "CORS policy: No 'Access-Control-Allow-Origin' header"
- **Cause:** Backend CORS not configured for your frontend domain
- **Solution:** Set `CLIENT_URL` environment variable on backend

### "Invalid token" or "jwt malformed"
- **Cause:** `JWT_SECRET` not set or different between deployments
- **Solution:** Set `JWT_SECRET` environment variable on backend

### "Encryption key must be 32 characters"
- **Cause:** `ENCRYPTION_KEY` not set or wrong length
- **Solution:** Generate a 32-character key and set it

---

## Generate Secure Keys

Use these commands to generate secure keys:

### For JWT_SECRET (Node.js):
```javascript
require('crypto').randomBytes(64).toString('hex')
```

### For ENCRYPTION_KEY (32 characters):
```javascript
require('crypto').randomBytes(16).toString('hex')
```

Or use online tools:
- https://generate-secret.vercel.app/32
- https://randomkeygen.com/

---

## Need More Help?

If issues persist:
1. Check backend logs in your deployment platform
2. Check browser console for specific error messages
3. Verify MongoDB connection is working
4. Test API endpoints directly using Postman or curl
