import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trello, CheckSquare, PlusCircle, Sun, Moon } from 'lucide-react';
import axios from 'axios';

import ProjectDashboard from './pages/ProjectDashboard';
import TaskBoard from './pages/TaskBoard';
import TaskDetails from './pages/TaskDetails';
import AddProject from './pages/AddProject';

// Backend base URL
const API_BASE = "http://localhost:5000";

const DEMO_PROJECT_ID = 'seed';

function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/tasks', icon: <Trello size={20} />, label: 'Task Board' },
    { path: '/new-project', icon: <PlusCircle size={20} />, label: 'New Project' }
  ];

  return (
    <div className="w-[250px] border-r border-panel-border p-8 flex flex-col gap-6 bg-slate-900/80 backdrop-blur-md">
      <div className="text-xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-4 flex items-center">
        <CheckSquare size={24} className="inline mr-2 align-middle text-primary" />
        Uni Connect
      </div>
      <div className="px-2 text-slate-400 text-xs uppercase tracking-widest mb-2">
        Project Management
      </div>
      {menuItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-row items-center gap-3 px-4 py-3 rounded-md font-medium no-underline transition-all duration-300 hover:bg-white/5 hover:text-slate-50 hover:translate-x-1 ${
              isActive ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-slate-400'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      })}
    </div>
  );
}

function App() {
  const [projectId, setProjectId] = useState(null);
  const [isDark, setIsDark] = useState(true);

  // Apply dark class to document gracefully on change
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
        <Sidebar />
        <main className="flex-1 py-8 px-12 flex flex-col h-screen overflow-y-auto">
          
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="btn btn-secondary !py-2 !px-4 !rounded-full flex gap-2 items-center text-sm shadow-md"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

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