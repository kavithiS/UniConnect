# Student Profile & Group Chat System

A comprehensive full-stack platform for university students to manage profiles and communicate in real-time group chats

### ✅ What's Implemented

**Student Profile Management:**

- Full CRUD operations ✅
- Auto-initialization with smart defaults ✅
- Profile picture upload (Base64) ✅
- Real-time form validation ✅
- Professional card layout ✅

**Group Chat Platform:**

- Real-time messaging with Socket.IO ✅
- Message persistence (3-layer strategy) ✅
- Reply & Mention functionality ✅
- Message editing with history ✅
- Delete for me / Delete for everyone ✅
- Message starring & pinning ✅
- Message forwarding (same/other groups) ✅
- Bulk operations (select, delete, forward) ✅
- File attachments (images, documents) ✅
- Typing indicators ✅
- Voice Messaging ✅
- Custom scrollbars & dark mode ✅

## 🛠️ Tech Stack

### Frontend

| Technology       | Version | Purpose                              |
| ---------------- | ------- | ------------------------------------ |
| React.js         | 18.2.0  | UI Framework with Hooks              |
| Tailwind CSS     | 3.4.1   | Utility-first styling                |
| Socket.IO Client | 4.8.3   | Real-time WebSocket communication    |
| React Router DOM | 7.13.1  | Client-side routing                  |
| Axios            | 1.13.6  | HTTP requests                        |
| React Icons      | 5.5.0   | Icon library (FaStar, FaShare, etc.) |

### Backend

| Technology | Version | Purpose                       |
| ---------- | ------- | ----------------------------- |
| Node.js    | Latest  | Runtime environment           |
| Express.js | 5.2.1   | Web server framework          |
| MongoDB    | Cloud   | NoSQL database                |
| Mongoose   | 9.2.3   | MongoDB ODM                   |
| Socket.IO  | 4.8.3   | WebSocket server              |
| Multer     | 2.1.0   | File upload middleware        |
| CORS       | 2.8.6   | Cross-origin resource sharing |
| dotenv     | 17.3.1  | Environment variables         |

## 📂 Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── controllers/
│   │   ├── studentController.js       # Student CRUD operations
│   │   └── chatController.js          # Chat operations (15+ endpoints)
│   ├── models/
│   │   ├── Student.js                 # Student schema
│   │   ├── Group.js                   # Group schema
│   │   └── Message.js                 # Message schema (with advanced features)
│   ├── routes/
│   │   ├── studentRoutes.js           # Student API routes
│   │   └── chatRoutes.js              # Chat API routes
│   ├── uploads/                       # File upload directory
│   ├── .env                           # Environment variables
│   ├── server.js                      # Main server + Socket.IO
│   ├── seedDummyData.js               # Data seeding script
│   └── package.json
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── demo-user.js               # Demo user data
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx             # App header
    │   │   ├── Toast.jsx              # Toast notifications
    │   │   ├── ThemeToggle.jsx        # Dark mode toggle
    │   │   ├── profile_page_components/
    │   │   │   ├── ProfileCard.jsx    # Profile display
    │   │   │   └── ProfileForm.jsx    # Profile editor
    │   │   ├── sidebar_components/
    │   │   │   └── Sidebar.jsx        # Navigation sidebar
    │   │   └── chat_area_components/
    │   │       ├── MessageItem.jsx    # Message bubble
    │   │       ├── MessageContextMenu.jsx  # Right-click menu
    │   │       └── MentionDropdown.jsx     # @mention autocomplete
    │   ├── pages/
    │   │   ├── profile_page/
    │   │   │   └── StudentProfile.jsx # Profile page
    │   │   └── chat_area_page/
    │   │       └── GroupChat.jsx      # Main chat (~1650 lines)
    │   ├── services/
    │   │   ├── studentService.js      # Student API calls
    │   │   └── chatService.js         # Chat API calls (15+ functions)
    │   ├── context/
    │   │   └── ThemeContext.jsx       # Dark mode context
    │   ├── App.js                     # Routing
    │   ├── index.js                   # Entry point
    │   └── index.css                  # Global styles + custom scrollbar
    ├── tailwind.config.js             # Tailwind configuration
    ├── postcss.config.js              # PostCSS config
    └── package.json
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. The `.env` file is already configured with MongoDB URI and port
4. Start the backend server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the React development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🚀 Usage Guide

### Initial Setup

1. **Start Backend Server** (Terminal 1):

```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

2. **Start Frontend Server** (Terminal 2):

```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

3. **Seed Demo Data** (Optional, Terminal 3):

```bash
cd backend
node seedDummyData.js
# Creates demo students and groups
```

### Using Student Profile

1. Navigate to **My Profile** in sidebar
2. Profile auto-initializes with demo data
3. Click **Edit Profile** to update information
4. Upload profile picture (Base64 encoded)
5. Add skills and interests as tags
6. Update academic details (University, Degree, GPA, etc.)
7. Changes save with success notification

### Using Group Chat

#### Basic Messaging

1. Navigate to **Group Chat** in sidebar
2. Type message in input box at bottom
3. Press Enter or click Send button
4. Messages appear instantly for all users
5. Scroll to view message history

#### Reply to Message

1. Right-click on any message
2. Select "Reply" from context menu
3. Original message shows in reply bar
4. Type your reply and send
5. Reply displays with original message preview

#### Mention Members

1. Type `@` in message input
2. Autocomplete dropdown appears
3. Select member from list
4. Or continue typing to filter
5. Member gets highlighted mention badge

#### Star Important Messages

1. Right-click on message
2. Click "Star" (or "Unstar" if already starred)
3. Star count shows next to message
4. Your starred messages highlighted in yellow

#### Pin Messages

1. Right-click on message
2. Click "Pin" (up to 3 pins per group)
3. Pinned messages appear in top strip
4. Click pinned message to jump to original
5. Unpin from context menu or top strip

#### Edit Your Messages

1. Right-click on your own message
2. Click "Edit"
3. Message text loads in input box
4. Make changes and press Enter
5. "(edited)" indicator appears

#### Delete Messages

1. Right-click on your message
2. Click "Delete"
3. **Delete Dialog** appears with options:
   - **Delete for me**: Only you won't see it (stored in localStorage)
   - **Delete for everyone**: Marked as "[This message was deleted]"
4. Delete again to completely remove "[This message was deleted]"

#### Forward Messages

1. Right-click on message
2. Click "Forward"
3. **Forward Dialog** appears:
   - **This Group**: Forward to current group
   - **Another Group**: Enter target group ID
4. Forwarded messages show ⤷ tag

#### Bulk Operations

1. **Double-click** any message to enter selection mode
2. **Single-click** messages to select/deselect
3. Checkboxes appear on selected messages
4. Use action buttons at top-right:
   - **× Cancel**: Exit selection mode
   - **Share icon**: Forward selected messages
   - **Trash icon**: Delete selected messages
5. Bulk delete shows same "Delete for me/everyone" options

#### File Attachments

1. Click paperclip icon (📎) in input area
2. Select image or document
3. File uploads and displays inline (images) or as download link
4. Supported formats: Images display, others show file name

#### Context Menu Actions

- Right-click any message for quick actions:
  - 🔄 Reply
  - ↗️ Forward
  - ⭐ Star/Unstar
  - 📌 Pin/Unpin
  - ✏️ Edit (own messages only)
  - 🗑️ Delete (own messages only)

## 🔌 API Endpoints

### Student Routes (`/api/students`)

| Method | Endpoint        | Description                       |
| ------ | --------------- | --------------------------------- |
| POST   | `/initialize` | Initialize/create student profile |
| GET    | `/:userId`    | Get student profile by userId     |
| PUT    | `/:userId`    | Update student profile            |
| DELETE | `/:userId`    | Delete student profile            |

### Chat Routes (`/api/chat`)

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| GET    | `/messages/:groupId`          | Get all messages in group |
| POST   | `/message`                    | Send new message          |
| POST   | `/upload`                     | Upload file attachment    |
| PUT    | `/message/:messageId`         | Edit message              |
| DELETE | `/message/:messageId`         | Delete message            |
| POST   | `/message/:messageId/pin`     | Pin message               |
| DELETE | `/message/:messageId/unpin`   | Unpin message             |
| POST   | `/message/:messageId/star`    | Star/unstar message       |
| POST   | `/message/:messageId/forward` | Forward message           |
| GET    | `/group/:groupId/pinned`      | Get pinned messages       |
| GET    | `/group/:groupId`             | Get group details         |
| GET    | `/group/:groupId/members`     | Get group members         |

## 📝 Development Notes

### Dummy Data Setup

The project includes dummy data for testing:

- **DUMMY_GROUP_ID**: `69a6b8012520940d041dd453`
- **DUMMY_SENDER_ID**: `69a6b8012520940d041dd44e`
- **DUMMY_SENDER_NAME**: `John Smith`

Run `backend/seedDummyData.js` to populate database with test data.
