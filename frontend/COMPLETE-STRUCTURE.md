# 🎨 GhostChat Frontend - Complete Folder Structure
## Based on Your Existing Setup

---

## 📊 **CURRENT STATUS**

```
✅ You already have:
- src/config/index.js (Axios setup)
- src/config/store/store.js (Redux store - empty)
- src/config/store/action/ (empty)
- src/config/store/reducer/ (empty)
```

---

## 📂 **COMPLETE FOLDER STRUCTURE**

```
frontend/
│
├── 📁 public/
│   ├── 📁 icons/                           # ⏳ Create
│   │   ├── logo.svg
│   │   ├── ghost-icon.svg
│   │   └── favicon.ico
│   └── 📁 images/                          # ⏳ Create
│       ├── hero-bg.jpg
│       └── placeholder-avatar.png
│
├── 📁 src/
│   │
│   ├── 📁 app/                             # Next.js App Router
│   │   ├── layout.js                       # ✅ Exists
│   │   ├── page.js                         # ✅ Exists
│   │   ├── globals.css                     # ✅ Exists
│   │   ├── favicon.ico                     # ✅ Exists
│   │   │
│   │   ├── 📁 (auth)/                      # ⏳ Create
│   │   │   ├── 📁 login/
│   │   │   │   └── page.jsx
│   │   │   └── 📁 register/
│   │   │       └── page.jsx
│   │   │
│   │   ├── 📁 (dashboard)/                 # ⏳ Create
│   │   │   ├── layout.jsx
│   │   │   ├── 📁 chats/
│   │   │   │   ├── page.jsx
│   │   │   │   └── 📁 [chatId]/
│   │   │   │       └── page.jsx
│   │   │   ├── 📁 profile/
│   │   │   │   └── page.jsx
│   │   │   └── 📁 settings/
│   │   │       └── page.jsx
│   │   │
│   │   └── not-found.jsx                   # ⏳ Create
│   │
│   ├── 📁 components/                      # ⏳ Create
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
│   ├── 📁 config/                          # ✅ Exists
│   │   │
│   │   ├── index.js                        # ✅ Exists - Axios config
│   │   │
│   │   └── 📁 store/                       # ✅ Exists - Redux setup
│   │       │
│   │       ├── 📁 action/                  # ✅ Exists (empty)
│   │       │   ├── authAction.js           # ⏳ Create
│   │       │   ├── chatAction.js           # ⏳ Create
│   │       │   ├── messageAction.js        # ⏳ Create
│   │       │   ├── userAction.js           # ⏳ Create
│   │       │   └── socketAction.js         # ⏳ Create
│   │       │
│   │       ├── 📁 reducer/                 # ✅ Exists (empty)
│   │       │   ├── authReducer.js          # ⏳ Create
│   │       │   ├── chatReducer.js          # ⏳ Create
│   │       │   ├── messageReducer.js       # ⏳ Create
│   │       │   ├── userReducer.js          # ⏳ Create
│   │       │   ├── socketReducer.js        # ⏳ Create
│   │       │   └── index.js                # ⏳ Create - Root reducer
│   │       │
│   │       └── store.js                    # ✅ Exists (empty) - Configure
│   │
│   ├── 📁 lib/                             # ⏳ Create
│   │   │
│   │   ├── 📁 api/
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── message.js
│   │   │   ├── user.js
│   │   │   └── file.js
│   │   │
│   │   ├── 📁 encryption/
│   │   │   ├── crypto.js
│   │   │   ├── keys.js
│   │   │   └── e2ee.js
│   │   │
│   │   ├── 📁 socket/
│   │   │   ├── socket.js
│   │   │   └── events.js
│   │   │
│   │   └── 📁 utils/
│   │       ├── formatDate.js
│   │       ├── validation.js
│   │       └── constants.js
│   │
│   └── 📁 styles/                          # ⏳ Create
│       ├── animations.css
│       └── themes.css
│
├── .env.local                              # ⏳ Create
├── .gitignore                              # ✅ Exists
├── next.config.mjs                         # ✅ Exists
├── tailwind.config.js                      # ⏳ Create
├── postcss.config.mjs                      # ✅ Exists
├── jsconfig.json                           # ✅ Exists
├── package.json                            # ✅ Exists
└── README.md                               # ✅ Exists
```

---

## 🔴 **REDUX STRUCTURE (Based on Your Setup)**

### **Your Current Structure:**
```
src/config/store/
├── action/          # ✅ Folder exists (empty)
├── reducer/         # ✅ Folder exists (empty)
└── store.js         # ✅ File exists (empty)
```

### **Files to Create:**

#### **1. Actions** (src/config/store/action/)
```
action/
├── authAction.js        # Login, register, logout actions
├── chatAction.js        # Chat CRUD actions
├── messageAction.js     # Message actions
├── userAction.js        # User profile actions
└── socketAction.js      # Socket connection actions
```

#### **2. Reducers** (src/config/store/reducer/)
```
reducer/
├── authReducer.js       # Auth state
├── chatReducer.js       # Chats state
├── messageReducer.js    # Messages state
├── userReducer.js       # User state
├── socketReducer.js     # Socket state
└── index.js             # Combine all reducers
```

#### **3. Store** (src/config/store/store.js)
```javascript
// Configure Redux store with all reducers
```

---

## 📦 **DEPENDENCIES TO ADD**

```json
{
  "dependencies": {
    "axios": "^1.13.2",           // ✅ Already added
    "next": "16.1.1",             // ✅ Already added
    "react": "19.2.3",            // ✅ Already added
    "react-dom": "19.2.3",        // ✅ Already added
    "redux": "^5.0.1",            // ⏳ Add
    "react-redux": "^9.0.4",      // ⏳ Add
    "redux-thunk": "^3.1.0",      // ⏳ Add (for async actions)
    "socket.io-client": "^4.7.2"  // ⏳ Add (for real-time)
  }
}
```

---

## 🎯 **BUILD ORDER**

### **Phase 1: Redux Setup (Day 1)**
1. Install dependencies
2. Configure `store.js`
3. Create `reducer/index.js`
4. Create `authReducer.js`
5. Create `authAction.js`
6. Wrap app with Redux Provider

### **Phase 2: Authentication (Day 2-3)**
7. Create login/register pages
8. Create auth components
9. Connect to Redux actions
10. Integrate with backend API

### **Phase 3: Chat System (Day 4-7)**
11. Create chat reducers & actions
12. Create message reducers & actions
13. Build chat components
14. Connect to Redux

### **Phase 4: Real-time (Day 8-10)**
15. Setup Socket.io client
16. Create socket actions
17. Integrate with Redux
18. Real-time message updates

---

## 📝 **FOLDER CREATION COMMANDS**

```bash
# Create all missing folders:

# App routes
mkdir -p src/app/(auth)/login
mkdir -p src/app/(auth)/register
mkdir -p src/app/(dashboard)/chats/[chatId]
mkdir -p src/app/(dashboard)/profile
mkdir -p src/app/(dashboard)/settings

# Components
mkdir -p src/components/auth
mkdir -p src/components/chat
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/media

# Lib
mkdir -p src/lib/api
mkdir -p src/lib/encryption
mkdir -p src/lib/socket
mkdir -p src/lib/utils

# Styles
mkdir -p src/styles

# Public
mkdir -p public/icons
mkdir -p public/images
```

---

## ✅ **SUMMARY**

### **What You Have:**
- ✅ Basic Next.js setup
- ✅ Axios configured
- ✅ Redux folder structure (empty)
- ✅ Path aliases configured

### **What You Need:**
- ⏳ Fill Redux actions & reducers
- ⏳ Create all components
- ⏳ Build authentication pages
- ⏳ Create chat interface
- ⏳ Add Socket.io integration
- ⏳ Implement encryption

---

## 🚀 **NEXT STEPS**

Would you like me to create:

1. **Redux Setup** (store.js, reducers, actions)
2. **Authentication Pages** (login, register)
3. **Chat Components** (ChatList, ChatWindow)
4. **API Integration** (auth.js, chat.js, message.js)
5. **Socket.io Client** (real-time messaging)

**Let me know what to build first!** 🎨
