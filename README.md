# UniConnect - MERN Stack Application

A modern full-stack web application built with **MongoDB**, **Express**, **React**, and **Node.js** (MERN).

## 📁 Project Structure

```
UniConnect/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # Database & app configuration
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, error handling
│   │   ├── services/          # Business logic
│   │   ├── validators/        # Request validation
│   │   ├── utils/             # Helper functions
│   │   ├── tests/             # Unit & integration tests
│   │   └── index.js           # App entry point
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/               # API client (axios)
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── features/          # Feature-specific folders
│   │   ├── hooks/             # Custom React hooks
│   │   ├── contexts/          # Context API setup
│   │   ├── styles/            # Global & component styles
│   │   ├── tests/             # Unit & E2E tests
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── .github/workflows/         # GitHub Actions CI/CD
├── docker-compose.yml         # Docker composition for local dev
├── .gitignore
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                 # Prettier formatting
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas URI)
- Docker & Docker Compose (optional)

### Local Development (Without Docker)

1. **Clone and setup:**
   ```bash
   git clone https://github.com/kavithiS/UniConnect.git
   cd UniConnect
   ```

2. **Backend setup:**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Server runs on `http://localhost:5000`

3. **Frontend setup (new terminal):**
   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```
   App runs on `http://localhost:5173`

### Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://root:password@localhost:27017`

## 📦 Available Scripts

### Backend
- `npm run dev` — Start dev server with auto-reload (nodemon)
- `npm start` — Start production server
- `npm test` — Run tests
- `npm run lint` — Lint code

### Frontend
- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm test` — Run tests
- `npm run lint` — Lint code

## 🔑 Environment Variables

**Backend (.env):**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/uniconnect
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=UniConnect
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🔧 Tech Stack

- **Backend:** Express.js, Mongoose, JWT, Bcryptjs
- **Frontend:** React 18, React Router, Axios, Zustand
- **Database:** MongoDB
- **DevOps:** Docker, Docker Compose, GitHub Actions
- **Code Quality:** ESLint, Prettier, Husky, Lint-staged

## 👥 Team Contribution

1. Create a feature branch: `git checkout -b feature/<initials>-<description>`
2. Commit changes: `git commit -m "feat: description"`
3. Push to branch: `git push origin feature/<initials>-<description>`
4. Open a Pull Request

## 📝 License

ISC

## 📞 Support

For issues and questions, open an issue on [GitHub](https://github.com/kavithiS/UniConnect/issues).
