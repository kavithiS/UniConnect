import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import GroupsDashboard from './pages/GroupsDashboard';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SmartRequestHub from './pages/SmartRequestHub';
import RequestsPage from './pages/RequestsPage';
import ChatBot from './components/ChatBot';

// Main branch components
import GroupChat from './pages/chat_area_page/GroupChat';

// Other missing components
import AddProject from './pages/AddProject';
import ProjectDashboard from './pages/ProjectDashboard';
import TaskBoard from './pages/TaskBoard';
import TaskDetails from './pages/TaskDetails';
import { detectBackendBaseUrl, getApiBaseUrl } from './utils/backendUrl';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfileSetupPage from './pages/auth/ProfileSetupPage';
import PersonalizedHomePage from './pages/PersonalizedHomePage';
import FeedbackPage from './pages/FeedbackPage';
import UserProfilePage from './pages/UserProfilePage';
import LandingPage from './pages/LandingPage';
import { clearAuthToken, fetchCurrentUser, getAuthToken } from './services/authService';

function AuthRequired({ authLoading, user }) {
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-300">Checking authentication...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function ProfileCompleteRequired({ user }) {
  if (user && !user.profileCompleted) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <Outlet />;
}

function ProfileIncompleteOnly({ user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.profileCompleted) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

function AppContent() {
  const navigate = useNavigate();
  const [projectId, setProjectId] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  const handleLogout = React.useCallback(() => {
    clearAuthToken();
    setUser(null);
    navigate('/', { replace: true });
  }, [navigate]);

  // Initialize backend detection first on mount
  React.useEffect(() => {
    const initBackend = async () => {
      try {
        await detectBackendBaseUrl();
        console.log('✅ Backend initialized');
      } catch (err) {
        console.warn('⚠️ Backend detection failed:', err);
      }
    };

    initBackend();
  }, []);

  React.useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      const token = getAuthToken();

      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const me = await fetchCurrentUser(token);
        setUser(me);
      } catch (err) {
        clearAuthToken();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // Load first project from backend on mount
  React.useEffect(() => {
    const loadFirstProject = async () => {
      try {
        let response = await fetch(`${getApiBaseUrl()}/projects`);
        if (!response.ok) {
          await detectBackendBaseUrl();
          response = await fetch(`${getApiBaseUrl()}/projects`);
        }
        
        if (response.ok) {
          const data = await response.json();
          const projects = data.data || data.projects || (data._id ? [data] : []);
          
          if (projects.length > 0) {
            setProjectId(projects[0]._id);
            localStorage.setItem('projectId', projects[0]._id);
          } else {
            setProjectId(null);
          }
        } else {
          setProjectId(null);
        }
      } catch (err) {
        console.warn('Could not load projects:', err.message);
        // Try to use saved projectId from localStorage
        const savedId = localStorage.getItem('projectId');
        if (savedId) setProjectId(savedId);
      } finally {
        setLoading(false);
      }
    };

    loadFirstProject();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Landing Page - MAIN ENTRY POINT */}
        {/* Authenticated users are redirected to dashboard */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard/home" replace /> : <LandingPage />}
        />
        
        {/* Auth Routes - Public */}
        <Route
          path="/login"
          element={user ? <Navigate to={user.profileCompleted ? '/dashboard' : '/profile-setup'} replace /> : <LoginPage onAuthSuccess={setUser} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={user.profileCompleted ? '/dashboard' : '/profile-setup'} replace /> : <RegisterPage onAuthSuccess={setUser} />}
        />

        {/* Protected Routes */}
        <Route element={<AuthRequired authLoading={authLoading} user={user} />}>
          <Route element={<ProfileIncompleteOnly user={user} />}>
            <Route path="/profile-setup" element={<ProfileSetupPage onProfileUpdated={setUser} />} />
          </Route>

          <Route element={<ProfileCompleteRequired user={user} />}>
            <Route path="/dashboard" element={<MainLayout user={user} onLogout={handleLogout} />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<PersonalizedHomePage user={user} />} />
              <Route path="groups" element={<GroupsDashboard />} />
              <Route path="create-group" element={<CreateGroupPage />} />
              <Route path="group/:id" element={<GroupDetailsPage />} />
              <Route path="requests" element={<RequestsPage user={user} />} />
              <Route path="smart-hub" element={<SmartRequestHub />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="feedback" element={<FeedbackPage user={user} />} />

              {/* Main Branch Routes */}
              <Route path="profile" element={<UserProfilePage user={user} />} />
              <Route path="chat" element={<GroupChat />} />

              {/* Added Extra Pages */}
              <Route path="add-project" element={<AddProject setProjectId={setProjectId} />} />
              <Route path="project-dashboard" element={<ProjectDashboard projectId={projectId} />} />
              <Route path="tasks" element={<TaskBoard projectId={projectId} />} />
              <Route path="tasks/:taskId" element={<TaskDetails />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && user.profileCompleted && <ChatBot />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;