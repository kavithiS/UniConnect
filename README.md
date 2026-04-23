# UniConnect

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4A2A?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-black?logo=socket.io)](https://socket.io/)

UniConnect is a full-stack student collaboration platform for university teams, study groups, and project-based learning. It helps students find teammates, manage work, chat in real time, and stay organized in one place.

The app combines profile-based discovery, group collaboration, project tracking, feedback, and AI-assisted support into a single workflow designed for modern student life.

## Highlights

- Smart student matching based on skills and interests
- Group creation, invitations, and join requests
- Real-time chat with Socket.IO
- Project and task management
- Personalized dashboards and recommendations
- Feedback, profiles, and AI support

## Features

### ✨Smart Matching
Find collaborators who fit your skills, goals, and project needs.

### ✨Group Collaboration
Create groups, manage members, and work together with a shared structure.

### ✨Real-Time Chat
Send live messages inside group rooms with instant Socket.IO updates.

### ✨Project and Task Management
Track work using project dashboards, task boards, and task detail views.

### ✨Join Requests and Invitations
Handle group membership through a clean request and invitation workflow.

### ✨Personalized Experience
Move through login, profile setup, and the main dashboard with role-aware routing.

### ✨Feedback and Profile System
Build a stronger student presence and support peer feedback.

### ✨AI Chat Assistant
Ask for help, get guidance, and move around the platform faster.

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client
- Lucide React
- React Icons
- xlsx
- @hello-pangea/dnd

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs
- Multer
- dotenv
- cors

## Project Structure

- frontend/ - React client application
- backend/ - Express API and Socket.IO server
- md files/ - Documentation, API collections, setup guides, and implementation notes

## Quick Start

### Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas connection string
- Two terminals, one for the frontend and one for the backend

### Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Configure Environment

Create a backend `.env` file with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Create a frontend `.env` file with:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### Run the App

```bash
# backend
cd backend
npm run dev

# frontend
cd ../frontend
npm run dev
```

## Available Scripts

### Backend
- `npm run start` - start the backend server
- `npm run dev` - start the backend with nodemon

### Frontend
- `npm run dev` - start the Vite development server
- `npm run build` - build the production app
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

## Environment Variables

### Backend
- `MONGODB_URI` or `MONGO_URI` - MongoDB connection string
- `LOCAL_MONGO_URI` - optional local MongoDB URI
- `JWT_SECRET` - authentication secret
- `PORT` - backend port, defaults to `5000`
- `USE_MEMORY_DB` - enables in-memory MongoDB fallback for development

### Frontend
- `VITE_BACKEND_URL` - backend base URL, for example `http://localhost:5000`

## Main Routes

### Frontend Routes
- `/` - landing page
- `/login` - login page
- `/register` - registration page
- `/profile-setup` - profile completion
- `/dashboard` - authenticated app area
- `/dashboard/home` - personalized home
- `/recommendations` - student recommendations
- `/groups` - group dashboard
- `/projects` - project dashboard
- `/tasks` - task board
- `/chat` - group chat area
- `/feedback` - feedback page
- `/profile` - user profile
- `/requests` - request management
- `/ai-chat` - AI assistant

### Backend API Routes
- `/api/auth`
- `/api/profile`
- `/api/students`
- `/api/users`
- `/api/groups`
- `/api/chat`
- `/api/projects`
- `/api/tasks`
- `/api/requests`
- `/api/invitations`
- `/api/recommend`
- `/api/aichat`
- `/api/suggestions`
- `/api/feedback`

## Real-Time Messaging

The backend includes Socket.IO for live group chat. Users can join group rooms, send messages, reply to messages, and exchange messages instantly with other group members.

## File Uploads

Uploaded files are served from the backend at `/uploads`.

## Notes

- The backend defaults to port `5000`.
- The frontend can auto-detect the backend URL in local development.
- CORS is configured for common local development ports.
- If MongoDB Atlas is unavailable, the backend can fall back to local MongoDB.
- The project includes extensive documentation and API collections inside the `md files/` folder.

## Troubleshooting

### Backend Will Not Start
- Check that MongoDB is running.
- Confirm `MONGODB_URI` or `MONGO_URI` is valid.
- Verify the backend port is free.

### Frontend Cannot Reach API
- Make sure the backend is running.
- Check `VITE_BACKEND_URL`.
- Confirm the backend is reachable at `http://localhost:5000` or your configured port.

### Authentication Issues
- Ensure `JWT_SECRET` is set.
- Clear old local storage if you changed auth settings.

## Recommended Flow

1. Start MongoDB.
2. Run the backend server.
3. Run the frontend dev server.
4. Open the app in the browser.
5. Register or log in.
6. Complete your profile.
7. Explore recommendations, groups, chat, projects, and feedback.

## About the Project

UniConnect is built to support student collaboration beyond simple messaging. It focuses on matching the right people, reducing setup friction, and making it easier to build productive study groups and project teams.


