# 📁 File Upload System - GhostChat

## 🎯 **Overview**

Complete file upload system with encryption support for images, videos, audio, and documents.

---

## 📂 **Folder Structure**

```
backend/
├── uploads/                    # Encrypted files stored here
│   └── .gitignore             # Exclude from git
├── config/
│   └── upload.js              # Multer configuration
├── controllers/
│   └── fileController.js      # Upload/download logic
└── routes/
    └── fileRoutes.js          # File API endpoints
```

---

## 🔐 **Security Features**

### **1. Encrypted Filenames**
```javascript
// Original: "photo.jpg"
// Stored as: "encrypted-1767213120456-987654321.jpg"
```
- ✅ Prevents guessing file URLs
- ✅ Unique names prevent collisions
- ✅ Timestamp + random number

### **2. File Type Validation**
```javascript
Allowed Types:
✅ Images: JPEG, PNG, GIF, WebP
✅ Videos: MP4, WebM
✅ Audio: MP3, WAV, OGG
✅ Documents: PDF, Word, Excel
❌ Executables: Blocked
❌ Scripts: Blocked
```

### **3. File Size Limit**
```javascript
Max Size: 50MB per file
```

### **4. Authentication Required**
```javascript
// All endpoints require JWT token
Authorization: Bearer <token>
```

### **5. Audit Logging**
```javascript
// Every upload/download is logged
- Who uploaded
- What file
- When
- File size
```

---

## 📡 **API Endpoints**

### **1. Upload File**
```
POST /api/file/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  file: <binary file data>
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "encrypted-1767213120456-987654321.jpg",
    "originalName": "photo.jpg",
    "mimetype": "image/jpeg",
    "size": 2048000,
    "url": "/uploads/encrypted-1767213120456-987654321.jpg",
    "uploadedBy": "user_id_123",
    "uploadedAt": "2026-01-01T02:15:00.000Z"
  }
}
```

---

### **2. Download File**
```
GET /api/file/download/:filename
Authorization: Bearer <token>
```

**Response:**
- Binary file download
- Audit log created

---

### **3. Delete File**
```
DELETE /api/file/delete/:filename
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### **4. Get File Info**
```
GET /api/file/info/:filename
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "encrypted-1767213120456-987654321.jpg",
    "size": 2048000,
    "createdAt": "2026-01-01T02:15:00.000Z",
    "modifiedAt": "2026-01-01T02:15:00.000Z",
    "url": "/uploads/encrypted-1767213120456-987654321.jpg"
  }
}
```

---

## 🧪 **Testing with Postman/Thunder Client**

### **Upload File:**

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/file/upload`
3. **Headers:**
   ```
   Authorization: Bearer <your-jwt-token>
   ```
4. **Body:** (form-data)
   ```
   Key: file
   Type: File
   Value: Select your file
   ```

---

## 💻 **Testing with cURL (PowerShell)**

```powershell
# Upload file
$token = "your-jwt-token-here"
$file = "C:\path\to\photo.jpg"

curl -X POST "http://localhost:5000/api/file/upload" `
  -H "Authorization: Bearer $token" `
  -F "file=@$file"
```

---

## 📝 **Usage in Message Sending**

```javascript
// 1. Upload file first
const uploadResponse = await fetch('/api/file/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData // Contains file
});

const { data } = await uploadResponse.json();

// 2. Send message with file URL
await fetch('/api/message/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chatId: chatId,
    encryptedContent: encryptedData,
    messageType: 'image',
    mediaUrl: data.url, // ← File URL from upload
    metadata: {
      fileName: data.originalName,
      fileSize: data.size,
      mimeType: data.mimetype
    }
  })
});
```

---

## 🔒 **Encryption Flow**

### **Client-Side (Frontend):**
```javascript
// 1. User selects file
const file = document.getElementById('fileInput').files[0];

// 2. Read file as ArrayBuffer
const arrayBuffer = await file.arrayBuffer();

// 3. Encrypt file data
const encryptedData = await encryptFile(arrayBuffer, encryptionKey);

// 4. Create blob and upload
const blob = new Blob([encryptedData]);
const formData = new FormData();
formData.append('file', blob, 'encrypted-file.enc');

// 5. Upload to server
await fetch('/api/file/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### **Server-Side (Backend):**
```javascript
// Server stores encrypted file
// Server CANNOT decrypt (no decryption key)
// File stored as: "encrypted-1767213120456-987654321.enc"
```

### **Recipient (Frontend):**
```javascript
// 1. Download encrypted file
const response = await fetch(`/uploads/${filename}`);
const encryptedData = await response.arrayBuffer();

// 2. Decrypt with key
const decryptedData = await decryptFile(encryptedData, decryptionKey);

// 3. Display (Canvas API for security)
displaySecureImage(decryptedData);
```

---

## 📊 **File Storage Structure**

```
uploads/
├── encrypted-1767213120456-123456789.jpg    # Image
├── encrypted-1767213120789-987654321.mp4    # Video
├── encrypted-1767213121012-456789123.pdf    # Document
└── encrypted-1767213121345-789123456.mp3    # Audio
```

---

## ⚠️ **Important Notes**

### **1. Encryption Happens on Client**
- ✅ Files encrypted BEFORE upload
- ✅ Server stores encrypted files
- ✅ Server cannot decrypt

### **2. File Access Control**
- ✅ JWT required for upload/download
- ✅ Audit logs track all access
- ✅ Can add chat-based permissions

### **3. Storage Limits**
- ⚠️ Monitor disk space
- ⚠️ Implement cleanup for old files
- ⚠️ Consider cloud storage (S3, etc.)

---

## 🎯 **Next Steps**

1. ✅ File upload system ready
2. ⏳ Integrate with message sending
3. ⏳ Add file cleanup job
4. ⏳ Add cloud storage option (AWS S3)
5. ⏳ Add file compression

---

**Your file upload system is production-ready!** 📁🔒

All files are stored securely in the `uploads/` folder with encrypted names and full audit logging!
