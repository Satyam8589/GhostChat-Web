# 🔴 GhostChat Frontend - Complete Redux Architecture
## All API Calls Through Redux

---

## 📂 **COMPLETE FOLDER STRUCTURE**

```
frontend/src/
│
├── 📁 app/                                 # Next.js App Router
│   ├── layout.js                           # ✅ Root layout
│   ├── page.js                             # ✅ Landing page
│   ├── globals.css                         # ✅ Global styles
│   │
│   ├── 📁 (auth)/
│   │   ├── 📁 login/
│   │   │   └── page.jsx                    # Login page (uses Redux)
│   │   └── 📁 register/
│   │       └── page.jsx                    # Register page (uses Redux)
│   │
│   └── 📁 (dashboard)/
│       ├── layout.jsx                      # Dashboard layout
│       ├── 📁 chats/
│       │   ├── page.jsx                    # Chat list (uses Redux)
│       │   └── 📁 [chatId]/
│       │       └── page.jsx                # Chat window (uses Redux)
│       ├── 📁 profile/
│       │   └── page.jsx                    # Profile (uses Redux)
│       └── 📁 settings/
│           └── page.jsx                    # Settings (uses Redux)
│
├── 📁 components/                          # UI Components
│   ├── 📁 auth/
│   │   ├── LoginForm.jsx                   # Dispatches Redux actions
│   │   ├── RegisterForm.jsx                # Dispatches Redux actions
│   │   └── ProtectedRoute.jsx              # Checks Redux auth state
│   │
│   ├── 📁 chat/
│   │   ├── ChatList.jsx                    # Reads from Redux store
│   │   ├── ChatItem.jsx                    # Reads from Redux store
│   │   ├── ChatWindow.jsx                  # Dispatches message actions
│   │   ├── MessageBubble.jsx               # Displays Redux data
│   │   ├── MessageInput.jsx                # Dispatches send message
│   │   ├── TypingIndicator.jsx             # Redux socket state
│   │   └── ReadReceipts.jsx                # Redux message state
│   │
│   ├── 📁 ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   └── Spinner.jsx
│   │
│   ├── 📁 layout/
│   │   ├── Navbar.jsx                      # Shows Redux user state
│   │   ├── Sidebar.jsx                     # Shows Redux chats
│   │   └── Footer.jsx
│   │
│   └── 📁 media/
│       ├── FileUpload.jsx                  # Dispatches file upload action
│       ├── ImagePreview.jsx
│       └── VideoPlayer.jsx
│
├── 📁 config/                              # ✅ Existing
│   │
│   ├── index.js                            # ✅ Axios client (used by actions)
│   │
│   └── 📁 store/                           # ✅ Redux Setup
│       │
│       ├── 📁 action/                      # 🔴 REDUX ACTIONS (API Calls)
│       │   │
│       │   ├── authAction.js               # ⏳ CREATE
│       │   │   ├── registerUser()          # POST /api/auth/register
│       │   │   ├── loginUser()             # POST /api/auth/login
│       │   │   └── logoutUser()            # POST /api/auth/logout
│       │   │
│       │   ├── chatAction.js               # ⏳ CREATE
│       │   │   ├── fetchUserChats()        # GET /api/chat/user-chats
│       │   │   ├── createChat()            # POST /api/chat/createChat
│       │   │   ├── getChatById()           # GET /api/chat/:chatId
│       │   │   └── deleteChat()            # DELETE /api/chat/:chatId
│       │   │
│       │   ├── messageAction.js            # ⏳ CREATE
│       │   │   ├── sendMessage()           # POST /api/message/send
│       │   │   ├── fetchMessages()         # GET /api/message/receive/:chatId
│       │   │   ├── markAsRead()            # GET /api/message/markAsRead/:chatId
│       │   │   └── deleteMessage()         # DELETE /api/message/:messageId
│       │   │
│       │   ├── userAction.js               # ⏳ CREATE
│       │   │   ├── getUserProfile()        # GET /api/user/profile
│       │   │   ├── updateProfile()         # PUT /api/user/update
│       │   │   └── searchUsers()           # GET /api/user/search?query=
│       │   │
│       │   ├── fileAction.js               # ⏳ CREATE
│       │   │   ├── uploadFile()            # POST /api/file/upload
│       │   │   └── downloadFile()          # GET /api/file/download/:filename
│       │   │
│       │   └── socketAction.js             # ⏳ CREATE
│       │       ├── connectSocket()         # Socket.io connect
│       │       ├── disconnectSocket()      # Socket.io disconnect
│       │       ├── joinChat()              # Socket join room
│       │       └── leaveChat()             # Socket leave room
│       │
│       ├── 📁 reducer/                     # 🔴 REDUX REDUCERS (State)
│       │   │
│       │   ├── authReducer.js              # ⏳ CREATE
│       │   │   └── State: { user, token, isAuthenticated, loading, error }
│       │   │
│       │   ├── chatReducer.js              # ⏳ CREATE
│       │   │   └── State: { chats, activeChat, loading, error }
│       │   │
│       │   ├── messageReducer.js           # ⏳ CREATE
│       │   │   └── State: { messages: { chatId: [...] }, sending, error }
│       │   │
│       │   ├── userReducer.js              # ⏳ CREATE
│       │   │   └── State: { profile, searchResults, loading, error }
│       │   │
│       │   ├── socketReducer.js            # ⏳ CREATE
│       │   │   └── State: { connected, typing, onlineUsers }
│       │   │
│       │   └── index.js                    # ⏳ CREATE (Combine all reducers)
│       │
│       └── store.js                        # ⏳ CONFIGURE (Redux store)
│
├── 📁 lib/                                 # Utilities (NO direct API calls)
│   │
│   ├── 📁 encryption/                      # Encryption utilities
│   │   ├── crypto.js                       # AES-256 encryption
│   │   ├── keys.js                         # RSA key management
│   │   └── e2ee.js                         # E2E encryption logic
│   │
│   ├── 📁 socket/                          # Socket.io client
│   │   ├── socket.js                       # Socket instance
│   │   └── events.js                       # Socket event handlers
│   │
│   └── 📁 utils/                           # Helper functions
│       ├── formatDate.js
│       ├── validation.js
│       └── constants.js
│
└── 📁 styles/
    ├── animations.css
    └── themes.css
```

---

## 🔴 **REDUX FLOW - ALL API CALLS**

### **How It Works:**

```
Component → Dispatch Action → API Call → Update Reducer → Component Re-renders
```

### **Example: User Login**

```javascript
// 1. Component dispatches action
LoginForm.jsx
  ↓
dispatch(loginUser({ email, password }))
  ↓
// 2. Action makes API call
authAction.js → POST /api/auth/login
  ↓
// 3. Reducer updates state
authReducer.js → { user, token, isAuthenticated: true }
  ↓
// 4. Component reads new state
LoginForm.jsx → useSelector(state => state.auth)
```

---

## 📋 **REDUX ACTIONS - ALL API ENDPOINTS**

### **1. Auth Actions** (authAction.js)

```javascript
// Register User
export const registerUser = (userData) => async (dispatch) => {
  dispatch({ type: 'REGISTER_REQUEST' });
  
  try {
    const response = await clientServer.post('/api/auth/register', userData);
    
    dispatch({
      type: 'REGISTER_SUCCESS',
      payload: response.data
    });
    
    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    
  } catch (error) {
    dispatch({
      type: 'REGISTER_FAIL',
      payload: error.response?.data?.message || 'Registration failed'
    });
  }
};

// Login User
export const loginUser = (credentials) => async (dispatch) => {
  dispatch({ type: 'LOGIN_REQUEST' });
  
  try {
    const response = await clientServer.post('/api/auth/login', credentials);
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: response.data
    });
    
    localStorage.setItem('token', response.data.token);
    
  } catch (error) {
    dispatch({
      type: 'LOGIN_FAIL',
      payload: error.response?.data?.message || 'Login failed'
    });
  }
};

// Logout User
export const logoutUser = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    
    await clientServer.post('/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({ type: 'LOGOUT_SUCCESS' });
    localStorage.removeItem('token');
    
  } catch (error) {
    dispatch({ type: 'LOGOUT_FAIL' });
  }
};
```

---

### **2. Chat Actions** (chatAction.js)

```javascript
// Fetch User Chats
export const fetchUserChats = () => async (dispatch) => {
  dispatch({ type: 'FETCH_CHATS_REQUEST' });
  
  try {
    const token = localStorage.getItem('token');
    const response = await clientServer.get('/api/chat/user-chats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({
      type: 'FETCH_CHATS_SUCCESS',
      payload: response.data.data
    });
    
  } catch (error) {
    dispatch({
      type: 'FETCH_CHATS_FAIL',
      payload: error.response?.data?.message
    });
  }
};

// Create Chat
export const createChat = (chatData) => async (dispatch) => {
  dispatch({ type: 'CREATE_CHAT_REQUEST' });
  
  try {
    const token = localStorage.getItem('token');
    const response = await clientServer.post('/api/chat/createChat', chatData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({
      type: 'CREATE_CHAT_SUCCESS',
      payload: response.data.data
    });
    
  } catch (error) {
    dispatch({
      type: 'CREATE_CHAT_FAIL',
      payload: error.response?.data?.message
    });
  }
};
```

---

### **3. Message Actions** (messageAction.js)

```javascript
// Send Message
export const sendMessage = (messageData) => async (dispatch) => {
  dispatch({ type: 'SEND_MESSAGE_REQUEST' });
  
  try {
    const token = localStorage.getItem('token');
    const response = await clientServer.post('/api/message/send', messageData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({
      type: 'SEND_MESSAGE_SUCCESS',
      payload: response.data.data
    });
    
  } catch (error) {
    dispatch({
      type: 'SEND_MESSAGE_FAIL',
      payload: error.response?.data?.message
    });
  }
};

// Fetch Messages
export const fetchMessages = (chatId) => async (dispatch) => {
  dispatch({ type: 'FETCH_MESSAGES_REQUEST' });
  
  try {
    const token = localStorage.getItem('token');
    const response = await clientServer.get(`/api/message/receive/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({
      type: 'FETCH_MESSAGES_SUCCESS',
      payload: { chatId, messages: response.data.data }
    });
    
  } catch (error) {
    dispatch({
      type: 'FETCH_MESSAGES_FAIL',
      payload: error.response?.data?.message
    });
  }
};

// Mark As Read
export const markMessagesAsRead = (chatId) => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    const response = await clientServer.get(`/api/message/markAsRead/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({
      type: 'MARK_AS_READ_SUCCESS',
      payload: { chatId, count: response.data.data.markedCount }
    });
    
  } catch (error) {
    console.error('Mark as read failed:', error);
  }
};
```

---

### **4. User Actions** (userAction.js)

```javascript
// Get User Profile
export const getUserProfile = () => async (dispatch) => {
  dispatch({ type: 'GET_PROFILE_REQUEST' });
  
  try {
    const token = localStorage.getItem('token');
    const response = await clientServer.get('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({
      type: 'GET_PROFILE_SUCCESS',
      payload: response.data.data
    });
    
  } catch (error) {
    dispatch({
      type: 'GET_PROFILE_FAIL',
      payload: error.response?.data?.message
    });
  }
};

// Search Users
export const searchUsers = (query) => async (dispatch) => {
  dispatch({ type: 'SEARCH_USERS_REQUEST' });
  
  try {
    const token = localStorage.getItem('token');
    const response = await clientServer.get(`/api/user/search?query=${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    dispatch({
      type: 'SEARCH_USERS_SUCCESS',
      payload: response.data.data
    });
    
  } catch (error) {
    dispatch({
      type: 'SEARCH_USERS_FAIL',
      payload: error.response?.data?.message
    });
  }
};
```

---

### **5. File Actions** (fileAction.js)

```javascript
// Upload File
export const uploadFile = (fileData) => async (dispatch) => {
  dispatch({ type: 'UPLOAD_FILE_REQUEST' });
  
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', fileData);
    
    const response = await clientServer.post('/api/file/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    dispatch({
      type: 'UPLOAD_FILE_SUCCESS',
      payload: response.data.data
    });
    
    return response.data.data; // Return file URL
    
  } catch (error) {
    dispatch({
      type: 'UPLOAD_FILE_FAIL',
      payload: error.response?.data?.message
    });
  }
};
```

---

## 🎯 **HOW TO USE IN COMPONENTS**

### **Example 1: Login Form**

```javascript
'use client';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/config/store/action/authAction';

export default function LoginForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    // Dispatch Redux action (NO direct API call)
    await dispatch(loginUser({ email, password }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

---

### **Example 2: Chat List**

```javascript
'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserChats } from '@/config/store/action/chatAction';

export default function ChatList() {
  const dispatch = useDispatch();
  const { chats, loading } = useSelector(state => state.chat);
  
  useEffect(() => {
    // Fetch chats on mount (NO direct API call)
    dispatch(fetchUserChats());
  }, [dispatch]);
  
  if (loading) return <div>Loading chats...</div>;
  
  return (
    <div>
      {chats.map(chat => (
        <ChatItem key={chat._id} chat={chat} />
      ))}
    </div>
  );
}
```

---

### **Example 3: Send Message**

```javascript
'use client';
import { useDispatch } from 'react-redux';
import { sendMessage } from '@/config/store/action/messageAction';

export default function MessageInput({ chatId }) {
  const dispatch = useDispatch();
  
  const handleSend = async (text) => {
    // Dispatch Redux action (NO direct API call)
    await dispatch(sendMessage({
      chatId,
      encryptedContent: encryptText(text),
      messageType: 'text'
    }));
  };
  
  return <input onKeyPress={(e) => e.key === 'Enter' && handleSend(e.target.value)} />;
}
```

---

## ✅ **SUMMARY**

### **✅ ALL API Calls Through Redux:**
- ✅ Authentication → authAction.js
- ✅ Chats → chatAction.js
- ✅ Messages → messageAction.js
- ✅ Users → userAction.js
- ✅ Files → fileAction.js
- ✅ Socket → socketAction.js

### **✅ Components NEVER call API directly:**
- ✅ Only dispatch Redux actions
- ✅ Only read from Redux store
- ✅ Clean separation of concerns

---

**Ready to start building the Redux actions and reducers?** 🔴🚀
