import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trello, CheckSquare, MessageSquare, Sun, Moon, Wand2 } from 'lucide-react';
import axios from 'axios';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProjectDashboard from './pages/ProjectDashboard';
import TaskBoard from './pages/TaskBoard';
import TaskDetails from './pages/TaskDetails';
import GroupsDashboard from './pages/GroupsDashboard';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SmartRequestHub from './pages/SmartRequestHub';
import RequestsPage from './pages/RequestsPage';
import ChatBot from './components/ChatBot';

// Backend base URL
const API_BASE = "http://localhost:5000";

const DEMO_PROJECT_ID = 'seed';

function Sidebar() {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/tasks', icon: <Trello size={18} />, label: 'Task Board' },
    { path: '/groups', icon: <CheckSquare size={18} />, label: 'Groups' },
    { path: '/requests', icon: <MessageSquare size={18} />, label: 'Requests & Invites' },
    { path: '/recommendations', icon: <CheckSquare size={18} />, label: 'Recommendations' }
  ];

  return (
    <div className={`w-[250px] border-r p-6 flex flex-col gap-8 backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white/50'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${isDarkMode ? 'from-slate-500 to-slate-600' : 'from-blue-400 to-blue-500'}`}></div>
        <span className={`text-sm font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Uni Connect</span>
      </div>

      {/* Project Management Section */}
      <div>
        <div className={`px-3 text-xs uppercase tracking-widest font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
          Project Management
        </div>
        <nav className="space-y-1">
          {menuItems.slice(0, 4).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  isActive 
                    ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-950'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Recommendations Section */}
      <div>
        <div className={`px-3 text-xs uppercase tracking-widest font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
          Recommendations
        </div>
        <nav className="space-y-1">
          {menuItems.slice(4).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-200 ${
                  isActive 
                    ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-950'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Theme Toggle - Bottom */}
      <div className={`mt-auto pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-sm">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-sm">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const seedDB = async () => {
      try {
        console.log("Trying to seed project...");
        
        // Clear old localStorage data to avoid stale IDs
        localStorage.removeItem('userId');
        localStorage.removeItem('groupId');
        localStorage.removeItem('groupCode');
        console.log("✓ Cleared old localStorage cache");

        const res = await axios.post(`${API_BASE}/api/projects/seed`);
        console.log("Seed success:", res.data);

        setProjectId(res.data._id);

        // Store seeded user and group IDs in localStorage for later use
        if (res.data.seedData) {
          const { userIds, groupIds } = res.data.seedData;
          if (userIds && userIds.length > 0) {
            localStorage.setItem('userId', userIds[0]); // Set first user as default
            console.log(`✓ Stored new user ID: ${userIds[0]}`);
          }
          if (groupIds && groupIds.length > 0) {
            localStorage.setItem('groupId', groupIds[0]._id);
            localStorage.setItem('groupCode', groupIds[0].groupCode);
            console.log(`✓ Stored new group ID: ${groupIds[0]._id}, code: ${groupIds[0].groupCode}`);
          }
        } else {
          console.warn('⚠️ No seedData returned from backend');
        }

      } catch (error) {
        console.error("Seed error:", error.response || error.message);

        try {
          console.log("Trying fallback...");
          const fallback = await axios.get(`${API_BASE}/api/projects/seed/fallback`);
          console.log("Fallback success:", fallback.data);

          setProjectId(fallback.data._id);

        } catch (e) {
          console.error("Fallback error:", e.response || e.message);

          setError("❌ Cannot connect to backend. Check if server is running on port 5000.");
        }
      } finally {
        setLoading(false);
      }
    };

    seedDB();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500 font-bold">{error}</div>;

  return (
    <ThemeProvider>
      <AppContent projectId={projectId} />
    </ThemeProvider>
  );
}

function AppContent({ projectId }) {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <Sidebar />
        <main className={`flex-1 py-8 px-12 flex flex-col h-screen overflow-y-auto transition-colors duration-300`}>
          <Routes>
            <Route path="/" element={<ProjectDashboard projectId={projectId} />} />
            <Route path="/groups" element={<GroupsDashboard />} />
            <Route path="/create-group" element={<CreateGroupPage />} />
            <Route path="/group/:id" element={<GroupDetailsPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/smart-hub" element={<SmartRequestHub />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/tasks" element={<TaskBoard projectId={projectId} />} />
            <Route path="/tasks/:taskId" element={<TaskDetails projectId={projectId} />} />
          </Routes>
        </main>
      </div>
      <ChatBot />
    </Router>
  );
}

export default App;