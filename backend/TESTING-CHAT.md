# 🧪 Chat API Testing Guide

## 📋 Test Files Created

### 1. **test-create-chat.js** - Automated Full Test
Automatically tests:
- ✅ Register 2 users
- ✅ Create private chat
- ✅ Create group chat
- ✅ Test duplicate private chat detection

**Run:**
```bash
node test-create-chat.js
```

### 2. **test-chat-manual.js** - Manual Test
For testing with your own tokens and user IDs

**Run:**
```bash
node test-chat-manual.js
```

---

## 🚀 Quick Test (Automated)

```bash
node test-create-chat.js
```

This will:
1. Register 2 test users
2. Create a private chat between them
3. Create a group chat
4. Test duplicate chat detection

---

## 📝 Manual Testing Steps

### Step 1: Get User IDs

First, register or login to get tokens and user IDs:

```bash
node test-register.js
```

Save the `token` and `user.id` from the response.

### Step 2: Create Private Chat

**Endpoint:** `POST http://localhost:5000/api/chat/createChat`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Body:**
```json
{
  "type": "private",
  "participants": ["user_id_1", "user_id_2"]
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Private chat created successfully",
  "data": {
    "_id": "chat_id_123",
    "type": "private",
    "participants": [
      {
        "_id": "user_id_1",
        "username": "alice",
        "email": "alice@example.com",
        "profilePicture": null,
        "status": "offline"
      },
      {
        "_id": "user_id_2",
        "username": "bob",
        "email": "bob@example.com",
        "profilePicture": null,
        "status": "offline"
      }
    ],
    "isActive": true,
    "createdAt": "2026-01-01T01:30:00.000Z",
    "updatedAt": "2026-01-01T01:30:00.000Z"
  }
}
```

---

### Step 3: Create Group Chat

**Endpoint:** `POST http://localhost:5000/api/chat/createChat`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Body:**
```json
{
  "type": "group",
  "name": "Team Alpha",
  "description": "Project discussion group",
  "participants": ["user_id_1", "user_id_2", "user_id_3"],
  "groupKey": "encrypted-symmetric-key-abc123",
  "groupIcon": "https://example.com/icon.jpg"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Group chat created successfully",
  "data": {
    "_id": "chat_id_456",
    "type": "group",
    "name": "Team Alpha",
    "description": "Project discussion group",
    "participants": [...],
    "admin": {
      "_id": "user_id_1",
      "username": "alice",
      "email": "alice@example.com"
    },
    "groupKey": "encrypted-symmetric-key-abc123",
    "groupIcon": "https://example.com/icon.jpg",
    "isActive": true,
    "createdAt": "2026-01-01T01:30:00.000Z"
  }
}
```

---

## ❌ Error Scenarios

### Missing Chat Type (400)
```json
{
  "success": false,
  "message": "Chat type is required"
}
```

### Missing Participants (400)
```json
{
  "success": false,
  "message": "Participants are required"
}
```

### Invalid Participant (400)
```json
{
  "success": false,
  "message": "One or more participants not found"
}
```

### Private Chat Wrong Participant Count (400)
```json
{
  "success": false,
  "message": "Private chat must have exactly 2 participants"
}
```

### Group Missing Name (400)
```json
{
  "success": false,
  "message": "Group name is required"
}
```

### Group Missing Encryption Key (400)
```json
{
  "success": false,
  "message": "Group encryption key is required"
}
```

### No Token (401)
```json
{
  "success": false,
  "message": "No token provided"
}
```

### Duplicate Private Chat (200)
```json
{
  "success": true,
  "message": "Chat already exists",
  "data": { existing chat object }
}
```

---

## 🔍 Verify in MongoDB

```bash
# Connect to MongoDB
mongosh

# Switch to database
use ghostchat

# View all chats
db.chats.find().pretty()

# Count chats
db.chats.countDocuments()

# Find private chats
db.chats.find({ type: "private" }).pretty()

# Find group chats
db.chats.find({ type: "group" }).pretty()

# Find chats for specific user
db.chats.find({ participants: ObjectId("user_id") }).pretty()
```

---

## 📊 Test Checklist

- [ ] Create private chat with 2 users → Success (201)
- [ ] Create private chat with 1 user → Error (400)
- [ ] Create private chat with 3 users → Error (400)
- [ ] Create duplicate private chat → Returns existing (200)
- [ ] Create group chat with valid data → Success (201)
- [ ] Create group without name → Error (400)
- [ ] Create group without groupKey → Error (400)
- [ ] Create group with 1 participant → Error (400)
- [ ] Create chat without token → Error (401)
- [ ] Create chat with invalid token → Error (401)
- [ ] Verify participants are populated
- [ ] Verify admin is set for groups
- [ ] Verify groupKey is stored

---

## 🎯 PowerShell Commands

### Create Private Chat:
```powershell
$token = "your-jwt-token-here"
$body = @{
    type = "private"
    participants = @("user_id_1", "user_id_2")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/chat/createChat" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $body
```

### Create Group Chat:
```powershell
$token = "your-jwt-token-here"
$body = @{
    type = "group"
    name = "Test Group"
    description = "Testing"
    participants = @("user_id_1", "user_id_2")
    groupKey = "encrypted-key-123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/chat/createChat" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $body
```

---

**Happy Testing! 🚀**
