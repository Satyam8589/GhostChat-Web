# 🎨 GhostChat Frontend - Redux-Based Folder Structure

## 📂 **COMPLETE FOLDER STRUCTURE WITH REDUX**

```
frontend/
│
├── 📁 public/
│   ├── 📁 icons/
│   │   ├── logo.svg
│   │   ├── ghost-icon.svg
│   │   └── favicon.ico
│   └── 📁 images/
│       ├── hero-bg.jpg
│       └── placeholder-avatar.png
│
├── 📁 src/
│   │
│   ├── 📁 app/                             # Next.js App Router
│   │   ├── layout.js                       # ✅ Root layout
│   │   ├── page.js                         # ✅ Landing page
│   │   ├── globals.css                     # ✅ Global styles
│   │   ├── favicon.ico                     # ✅ Favicon
│   │   │
│   │   ├── 📁 (auth)/                      # Auth route group
│   │   │   ├── 📁 login/
│   │   │   │   └── page.jsx
│   │   │   └── 📁 register/
│   │   │       └── page.jsx
│   │   │
│   │   ├── 📁 (dashboard)/                 # Protected routes
│   │   │   ├── layout.jsx                  # Dashboard layout
│   │   │   │
│   │   │   ├── 📁 chats/
│   │   │   │   ├── page.jsx                # Chat list
│   │   │   │   └── 📁 [chatId]/
│   │   │   │       └── page.jsx            # Individual chat
│   │   │   │
│   │   │   ├── 📁 profile/
│   │   │   │   └── page.jsx
│   │   │   │
│   │   │   └── 📁 settings/
│   │   │       └── page.jsx
│   │   │
│   │   └── not-found.jsx                   # 404 page
│   │
│   ├── 📁 components/                      # Reusable components
│   │   │
│   │   ├── 📁 auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── 📁 chat/
│   │   │   ├── ChatList.jsx
│   │   │   ├── ChatItem.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── ReadReceipts.jsx
│   │   │
│   │   ├── 📁 ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Spinner.jsx
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   └── 📁 media/
│   │       ├── FileUpload.jsx
│   │       ├── ImagePreview.jsx
│   │       └── VideoPlayer.jsx
│   │
│   ├── 📁 redux/                           # 🔴 REDUX STATE MANAGEMENT
│   │   │
│   │   ├── 📁 slices/                      # Redux Toolkit slices
│   │   │   ├── authSlice.js                # User authentication
│   │   │   ├── chatSlice.js                # Chats state
│   │   │   ├── messageSlice.js             # Messages state
│   │   │   ├── userSlice.js                # User profile
│   │   │   ├── socketSlice.js              # Socket connection
│   │   │   └── uiSlice.js                  # UI state (modals, etc.)
│   │   │
│   │   ├── 📁 thunks/                      # Async actions
│   │   │   ├── authThunks.js               # Login, register, logout
│   │   │   ├── chatThunks.js               # Fetch chats, create chat
│   │   │   ├── messageThunks.js            # Send, receive messages
│   │   │   └── userThunks.js               # User operations
│   │   │
│   │   ├── 📁 middleware/                  # Custom middleware
│   │   │   ├── socketMiddleware.js         # Socket.io integration
│   │   │   └── encryptionMiddleware.js     # Auto-encrypt messages
│   │   │
│   │   ├── store.js                        # Redux store config
│   │   └── hooks.js                        # Typed hooks (useAppDispatch, useAppSelector)
│   │
│   ├── 📁 lib/                             # Utilities & helpers
│   │   │
│   │   ├── 📁 api/                         # API calls
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── message.js
│   │   │   ├── user.js
│   │   │   └── file.js
│   │   │
│   │   ├── 📁 encryption/                  # E2E encryption
│   │   │   ├── crypto.js
│   │   │   ├── keys.js
│   │   │   └── e2ee.js
│   │   │
│   │   ├── 📁 socket/                      # Socket.io
│   │   │   ├── socket.js
│   │   │   └── events.js
│   │   │
│   │   └── 📁 utils/                       # Helpers
│   │       ├── formatDate.js
│   │       ├── validation.js
│   │       └── constants.js
│   │
│   ├── 📁 config/                          # ✅ Configuration
│   │   ├── index.js                        # ✅ Axios config
│   │   └── 📁 store/                       # ✅ (can be removed if using redux/)
│   │
│   └── 📁 styles/                          # Additional styles
│       ├── animations.css
│       └── themes.css
│
├── .env.local                              # Environment variables
├── .gitignore                              # ✅ Git ignore
├── next.config.mjs                         # ✅ Next.js config
├── tailwind.config.js                      # Tailwind config
├── postcss.config.mjs                      # ✅ PostCSS config
├── jsconfig.json                           # ✅ Path aliases
├── package.json                            # ✅ Dependencies
└── README.md                               # ✅ Documentation
```

---

## 🔴 **REDUX STRUCTURE EXPLAINED**

### **1. Redux Slices** (State Management)

```javascript
redux/slices/
├── authSlice.js          // User login, token, profile
├── chatSlice.js          // All chats, active chat
├── messageSlice.js       // Messages for each chat
├── userSlice.js          // User profile, settings
├── socketSlice.js        // Socket connection status
└── uiSlice.js            // Modals, notifications, theme
```

**Example - authSlice.js:**
```javascript
{
  user: { id, username, email, token },
  isAuthenticated: true,
  loading: false,
  error: null
}
```

**Example - chatSlice.js:**
```javascript
{
  chats: [{ id, name, participants, lastMessage }],
  activeChat: chatId,
  loading: false
}
```

**Example - messageSlice.js:**
```javascript
{
  messages: {
    chat_123: [{ id, content, sender, timestamp }],
    chat_456: [...]
  },
  sending: false
}
```

---

### **2. Redux Thunks** (Async Actions)

```javascript
redux/thunks/
├── authThunks.js         // login(), register(), logout()
├── chatThunks.js         // fetchChats(), createChat()
├── messageThunks.js      // sendMessage(), fetchMessages()
└── userThunks.js         // updateProfile(), searchUsers()
```

**Example - authThunks.js:**
```javascript
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    const response = await authAPI.login(email, password);
    return response.data;
  }
);
```

---

### **3. Redux Middleware** (Custom Logic)

```javascript
redux/middleware/
├── socketMiddleware.js       // Listen to socket events
└── encryptionMiddleware.js   // Auto-encrypt before sending
```

**Example - socketMiddleware.js:**
```javascript
// Automatically dispatch actions when socket events occur
socket.on('new_message', (message) => {
  dispatch(addMessage(message));
});
```

---

### **4. Redux Store** (Configuration)

```javascript
// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import messageReducer from './slices/messageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    message: messageReducer,
    user: userReducer,
    socket: socketReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware, encryptionMiddleware),
});
```

---

### **5. Redux Hooks** (Typed Hooks)

```javascript
// redux/hooks.js
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
```

---

## 📦 **REQUIRED DEPENDENCIES**

Add these to `package.json`:

```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "socket.io-client": "^4.7.2",
    "axios": "^1.13.2",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  }
}
```

---

## 🎯 **HOW REDUX WILL BE USED**

### **In Components:**
```javascript
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { login } from '@/redux/thunks/authThunks';

function LoginForm() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);
  
  const handleLogin = async (email, password) => {
    await dispatch(login({ email, password }));
  };
  
  return <form onSubmit={handleLogin}>...</form>;
}
```

### **In Pages:**
```javascript
'use client';
import { useAppSelector } from '@/redux/hooks';

export default function ChatsPage() {
  const chats = useAppSelector(state => state.chat.chats);
  
  return (
    <div>
      {chats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
    </div>
  );
}
```

---

## ✅ **FOLDER CREATION CHECKLIST**

```bash
# Create all folders at once:

mkdir -p src/app/(auth)/login
mkdir -p src/app/(auth)/register
mkdir -p src/app/(dashboard)/chats/[chatId]
mkdir -p src/app/(dashboard)/profile
mkdir -p src/app/(dashboard)/settings
mkdir -p src/components/auth
mkdir -p src/components/chat
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/media
mkdir -p src/redux/slices
mkdir -p src/redux/thunks
mkdir -p src/redux/middleware
mkdir -p src/lib/api
mkdir -p src/lib/encryption
mkdir -p src/lib/socket
mkdir -p src/lib/utils
mkdir -p src/styles
mkdir -p public/icons
mkdir -p public/images
```

---

## 🚀 **BUILD ORDER WITH REDUX**

### **Phase 1: Redux Setup**
1. Install Redux Toolkit & React-Redux
2. Create store.js
3. Create authSlice.js
4. Create hooks.js
5. Wrap app with Redux Provider

### **Phase 2: Authentication**
6. Create authThunks.js
7. Create login/register pages
8. Connect forms to Redux

### **Phase 3: Chat System**
9. Create chatSlice.js & messageSlice.js
10. Create chatThunks.js & messageThunks.js
11. Build chat components
12. Connect to Redux

### **Phase 4: Real-time**
13. Create socketMiddleware.js
14. Integrate Socket.io
15. Auto-update Redux on socket events

---

**This is your complete Redux-based folder structure! Ready to build?** 🔴🚀
