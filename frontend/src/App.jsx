import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CheckSquare, MessageSquare, Sun, Moon, Users } from 'lucide-react';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import GroupsDashboard from './pages/GroupsDashboard';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SmartRequestHub from './pages/SmartRequestHub';
import RequestsPage from './pages/RequestsPage';
import ChatBot from './components/ChatBot';

function Sidebar() {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { path: '/', icon: <Users size={18} />, label: 'Groups' },
    { path: '/requests', icon: <MessageSquare size={18} />, label: 'Requests & Invites' },
    { path: '/recommendations', icon: <CheckSquare size={18} />, label: 'Recommendations' },
  ];

  return (
    <div className={`w-[250px] border-r p-6 flex flex-col gap-8 backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white/50'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${isDarkMode ? 'from-slate-500 to-slate-600' : 'from-blue-400 to-blue-500'}`}></div>
        <span className={`text-sm font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Uni Connect</span>
      </div>

      {/* Navigation */}
      <div>
        <div className={`px-3 text-xs uppercase tracking-widest font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
          Navigation
        </div>
        <nav className="space-y-1">
          {menuItems.map(item => {
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
            );
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

function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <Sidebar />
        <main className="flex-1 py-8 px-12 flex flex-col h-screen overflow-y-auto transition-colors duration-300">
          <Routes>
            <Route path="/" element={<GroupsDashboard />} />
            <Route path="/groups" element={<GroupsDashboard />} />
            <Route path="/create-group" element={<CreateGroupPage />} />
            <Route path="/group/:id" element={<GroupDetailsPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/smart-hub" element={<SmartRequestHub />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
          </Routes>
        </main>
      </div>
      <ChatBot />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;