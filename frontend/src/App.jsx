import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Trello, CheckSquare, Sun, Moon } from 'lucide-react';

import ProjectDashboard from './pages/ProjectDashboard';
import TaskBoard from './pages/TaskBoard';
import TaskDetails from './pages/TaskDetails';
import AddProject from './pages/AddProject';

function Sidebar() {
  const location = useLocation();

  return (
    <div className="
      w-[250px] p-8 flex flex-col gap-6 border-r
      bg-slate-900 text-white border-white/10
      dark:bg-slate-900 dark:text-white dark:border-white/10
    ">
      {/* Logo */}
      <div className="text-xl font-bold flex items-center mb-4">
        <CheckSquare size={24} className="mr-2 text-blue-600 dark:text-blue-400" />
        Uni Connect
      </div>

      {/* Navigation Menu */}
      <div className="flex-1">
        <div className="px-2 text-slate-400 dark:text-slate-400 text-xs uppercase tracking-widest mb-3">
          Navigation
        </div>

        <Link
          to="/"
          className={`
            flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all duration-200 mb-1
            ${location.pathname === '/'
              ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-slate-400 dark:text-slate-400 hover:bg-white/10 hover:text-white dark:hover:bg-white/10 dark:hover:text-white'
            }
          `}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        <Link
          to="/tasks"
          className={`
            flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-all duration-200
            ${location.pathname === '/tasks'
              ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-slate-400 dark:text-slate-400 hover:bg-white/10 hover:text-white dark:hover:bg-white/10 dark:hover:text-white'
            }
          `}
        >
          <Trello size={20} />
          Task Board
        </Link>
      </div>
    </div>
  );
}

function App() {
  const [projectId, setProjectId] = useState(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="flex min-h-screen">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 py-8 px-12 flex flex-col h-screen overflow-y-auto bg-white dark:bg-slate-900">
          
          {/* Theme Toggle */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="btn btn-secondary !py-2 !px-4 !rounded-full flex gap-2 items-center text-sm shadow-md"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Routes */}
          <Routes>
            <Route path="/" element={
              projectId ? <ProjectDashboard projectId={projectId} /> : <AddProject setProjectId={setProjectId} />
            } />
            <Route path="/tasks" element={
              projectId ? <TaskBoard projectId={projectId} /> : <AddProject setProjectId={setProjectId} />
            } />
            <Route path="/tasks/:taskId" element={
              projectId ? <TaskDetails projectId={projectId} /> : <AddProject setProjectId={setProjectId} />
            } />
            <Route path="/new-project" element={<AddProject setProjectId={setProjectId} />} />
          </Routes>

        </main>
      </div>
    </Router>
  );
}

export default App;