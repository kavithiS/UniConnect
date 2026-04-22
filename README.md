# UniConnect

UniConnect is a full-stack university collaboration platform for student profiles, group chats, project/task management, teammate discovery, invitations, feedback, and AI-assisted support.

## Features

- Student profiles and account management
- Real-time group chat with Socket.IO
- Project and task tracking
- Group creation, invitations, and join requests
- Recommendation and suggestion workflows
- Feedback and profile completion tools
- AI chat endpoints for assisted interactions

## Project Structure

- `backend/` - Express + MongoDB API server
- `frontend/` - Vite + React client
- `md files/` - implementation notes, reports, and API collections

## Requirements

- Node.js 18 or newer
- MongoDB Atlas or a local MongoDB instance

## Setup

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the values your environment needs:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Optional local fallbacks supported by the server:

```env
MONGO_URI=mongodb://127.0.0.1:27017/uniconnect
LOCAL_MONGO_URI=mongodb://127.0.0.1:27017/uniconnect
USE_MEMORY_DB=true
```

Start the backend:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` if you want to point the app at a custom API base URL:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

## Available Scripts

### Backend

- `npm start` - run the server
- `npm run dev` - run the server with nodemon

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - build the production bundle
- `npm run lint` - run ESLint
- `npm run preview` - preview the production build

## API

The backend serves routes under `/api`, including:

- `/api/auth`
- `/api/users`
- `/api/groups`
- `/api/projects`
- `/api/tasks`
- `/api/chat`
- `/api/feedback`
- `/api/recommend`
- `/api/aichat`

The root API route returns a simple health response at `/`.

## Notes

- The frontend will use `VITE_BACKEND_URL` when it is set.
- If no persistent MongoDB connection is available, the backend can fall back to a local MongoDB instance or an in-memory database when `USE_MEMORY_DB` is enabled.


