import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trello, CheckSquare } from 'lucide-react';
import axios from 'axios';

import ProjectDashboard from './pages/ProjectDashboard';
import TaskBoard from './pages/TaskBoard';
import TaskDetails from './pages/TaskDetails';

// Backend base URL
const API_BASE = "http://localhost:5000";

const DEMO_PROJECT_ID = 'seed';

function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/tasks', icon: <Trello size={20} />, label: 'Task Board' }
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const seedDB = async () => {
      try {
        console.log("Trying to seed project...");

        const res = await axios.post(`${API_BASE}/api/projects/seed`);
        console.log("Seed success:", res.data);

        setProjectId(res.data._id);

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
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 py-8 px-12 flex flex-col h-screen overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProjectDashboard projectId={projectId} />} />
            <Route path="/tasks" element={<TaskBoard projectId={projectId} />} />
            <Route path="/tasks/:taskId" element={<TaskDetails projectId={projectId} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;