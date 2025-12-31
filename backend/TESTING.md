# 🧪 GhostChat API Testing Guide

## 📋 Available Test Files

### 1. **test-auth.js** - Comprehensive Test Suite
Runs all authentication tests automatically:
- ✅ Register new user
- ✅ Login with registered user
- ✅ Duplicate registration (should fail)
- ✅ Invalid login (should fail)

**Run:**
```bash
node test-auth.js
```

### 2. **test-simple.js** - Quick Manual Test
Simple test for register → login flow

**Run:**
```bash
node test-simple.js
```

---

## 🚀 Quick Test Commands

### PowerShell Commands

#### Test Register:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"bob_test","email":"bob@example.com","password":"password123"}'
```

#### Test Login:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"bob@example.com","password":"password123"}'
```

#### Test Health Check:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/"
```

---

## 📝 Manual Testing with Thunder Client / Postman

### 1. Register User

**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "deviceId": "device_chrome_001",
  "deviceName": "Chrome on Windows"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profilePicture": null,
    "bio": "",
    "status": "offline",
    "createdAt": "2026-01-01T01:00:00.000Z"
  }
}
```

---

### 2. Login User

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "deviceId": "device_safari_002",
  "deviceName": "Safari on iPhone"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profilePicture": null,
    "bio": "",
    "status": "offline",
    "createdAt": "2026-01-01T01:00:00.000Z"
  }
}
```

---

## ❌ Error Scenarios

### Missing Fields (400)
```json
{
  "success": false,
  "message": "Username, email, and password are required"
}
```

### Duplicate Email (400)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Duplicate Username (400)
```json
{
  "success": false,
  "message": "Username already taken"
}
```

### User Not Found (401)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Invalid Password (401)
```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

## 🔍 Verify in MongoDB

Check if users are being created:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use ghostchat

# View all users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({ email: "john@example.com" })
```

---

## 📊 Test Checklist

- [ ] Register with valid data → Success (201)
- [ ] Register with duplicate email → Error (400)
- [ ] Register with duplicate username → Error (400)
- [ ] Register with missing fields → Error (400)
- [ ] Register with short password → Error (400)
- [ ] Login with valid credentials → Success (200)
- [ ] Login with wrong password → Error (401)
- [ ] Login with non-existent email → Error (401)
- [ ] Login with missing fields → Error (400)
- [ ] Token is generated and returned
- [ ] Password is hashed in database
- [ ] Device information is stored

---

## 🎯 Next Steps

After testing authentication:
1. Create JWT middleware for protected routes
2. Build Chat model
3. Build Message model
4. Implement real-time messaging with Socket.io

---

**Happy Testing! 🚀**
