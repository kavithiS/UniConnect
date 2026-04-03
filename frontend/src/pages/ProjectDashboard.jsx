import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, ListTodo, Activity, Clock, Plus, ClipboardList, Users, FolderKanban, TrendingUp } from 'lucide-react';
import { getApiBaseUrl } from '../utils/backendUrl';
import { useTheme } from '../context/ThemeContext';

const ProjectDashboard = ({ projectId }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [resolvedProjectId, setResolvedProjectId] = useState(projectId || localStorage.getItem('projectId'));
  const [projects, setProjects] = useState([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [addingMember, setAddingMember] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${getApiBaseUrl()}/projects`);
      const fetchedProjects = res?.data?.data || res?.data?.projects || [];
      setProjects(fetchedProjects);

      if (!resolvedProjectId && fetchedProjects.length > 0) {
        const firstProjectId = fetchedProjects[0]._id;
        setResolvedProjectId(firstProjectId);
        localStorage.setItem('projectId', firstProjectId);
      }
    } catch (err) {
      console.error('Failed to fetch project list:', err);
      setProjects([]);
    }
  };

  const fetchDashboard = async () => {
    try {
      if (!resolvedProjectId) {
        setData(null);
        setError(null);
        return;
      }

      const res = await axios.get(`${getApiBaseUrl()}/projects/${resolvedProjectId}/dashboard`);
      setData(res.data);
      setError(null);
    } catch (err) {
      // Handle deleted project (404 error)
      if (err?.response?.status === 404) {
        console.warn('Project not found. It may have been deleted.');
        localStorage.removeItem('projectId');
        
        try {
          const projectsRes = await axios.get(`${getApiBaseUrl()}/projects`);
          const availableProjects = projectsRes?.data?.data || projectsRes?.data?.projects || [];
          
          if (availableProjects.length > 0) {
            // Switch to first available project
            const firstProjectId = availableProjects[0]._id;
            setResolvedProjectId(firstProjectId);
            localStorage.setItem('projectId', firstProjectId);
            
            const fallbackRes = await axios.get(`${getApiBaseUrl()}/projects/${firstProjectId}/dashboard`);
            setData(fallbackRes.data);
            setError(null);
            return;
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback project:', fallbackError);
        }
        
        setError('Project was deleted. No other projects available.');
        setData(null);
        setResolvedProjectId('');
        return;
      }
      
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load project dashboard');
      setData(null);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      setResolvedProjectId(projectId);
      localStorage.setItem('projectId', projectId);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDashboard();
  }, [resolvedProjectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;
    setAddingMember(true);
    try {
      if (!resolvedProjectId) return;

      await axios.post(`${getApiBaseUrl()}/projects/${resolvedProjectId}/members`, newMember);
      setNewMember({ name: '', role: '' });
      setIsAddMemberOpen(false);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMember(false);
    }
  };

  if (!resolvedProjectId) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        <div className="px-8 py-16">
          <div className={`rounded-xl border p-6 ${isDarkMode ? 'border-slate-700/50 bg-slate-800/30 text-slate-300' : 'border-slate-200 bg-white/70 text-slate-700'}`}>
            No project selected yet. Create or select a project first.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        <div className="px-8 py-16">
          <div className={`rounded-xl border p-6 ${isDarkMode ? 'border-red-800/50 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
            <p className="font-semibold mb-2">Error</p>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchProjects();
              }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                isDarkMode
                  ? 'bg-red-900/50 text-red-200 hover:bg-red-900/70'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Reload Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        <div className="px-8 py-16">
          <div className={`rounded-xl border p-6 ${isDarkMode ? 'border-slate-700/50 bg-slate-800/30 text-slate-300' : 'border-slate-200 bg-white/70 text-slate-700'}`}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  const { project, stats, upcomingDeadlines } = data;

  const safeStats = {
    totalTasks: stats?.totalTasks || 0,
    todoTasks: stats?.todoTasks || 0,
    inProgressTasks: stats?.inProgressTasks || 0,
    doneTasks: stats?.doneTasks || 0,
    progress: stats?.progress || 0
  };

  const pageBg = isDarkMode
    ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 to-slate-100';
  const panelClass = isDarkMode
    ? 'border-slate-700/50 bg-slate-800/30'
    : 'border-slate-200/60 bg-white/60';
  const inputClass = isDarkMode
    ? 'w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400/90 focus:ring-2 focus:ring-indigo-500/30'
    : 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/40';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      <div className={`px-8 pt-8 pb-6 border-b ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
        <h1 className={`text-3xl font-semibold tracking-tight mb-2 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
          <FolderKanban size={30} className="text-indigo-400" />
          Project Dashboard
        </h1>
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
          Monitor progress, deadlines, and team activity in one place.
        </p>
      </div>

      <div className="px-8 py-8 space-y-8">
        <div className={`border rounded-xl p-6 ${panelClass}`}>
          <label className={`block text-sm mb-2 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Select Project
          </label>
          <select
            value={resolvedProjectId || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              setResolvedProjectId(selectedId);
              localStorage.setItem('projectId', selectedId);
            }}
            className={inputClass}
          >
            {projects.length === 0 ? (
              <option value="">No projects available</option>
            ) : (
              projects.map((projectOption) => (
                <option key={projectOption._id} value={projectOption._id}>
                  {projectOption.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Total Tasks</p>
            <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{safeStats.totalTasks}</p>
          </div>
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-cyan-500 mb-2">To Do</p>
            <p className="text-2xl font-semibold text-cyan-400">{safeStats.todoTasks}</p>
          </div>
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-amber-500 mb-2">In Progress</p>
            <p className="text-2xl font-semibold text-amber-400">{safeStats.inProgressTasks}</p>
          </div>
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-500 mb-2">Completed</p>
            <p className="text-2xl font-semibold text-emerald-400">{safeStats.doneTasks}</p>
          </div>
        </div>

        <div className={`border rounded-xl p-6 ${panelClass}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{project.title}</h2>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
              <TrendingUp size={12} />
              {safeStats.progress}% Complete
            </span>
          </div>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
            Group: {project.groupId || 'Unassigned'}
          </p>
          <div className={`w-full h-2 rounded overflow-hidden ${isDarkMode ? 'bg-slate-700/70' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-indigo-500 rounded transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, safeStats.progress))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`border rounded-xl p-6 ${panelClass}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Clock size={18} className="text-rose-400" />
              Upcoming Deadlines
            </h3>
            {!upcomingDeadlines || upcomingDeadlines.length === 0 ? (
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>No immediate deadlines coming up.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => (
                  <div
                    key={task._id}
                    className={`flex justify-between p-3 rounded-lg border ${panelClass}`}
                  >
                    <span className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>{task.title}</span>
                    <span className="text-rose-400 text-sm">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`border rounded-xl p-6 ${panelClass}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Users size={18} className="text-indigo-400" />
                Team Members
              </h3>

              <button
                className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition ${
                  isDarkMode ? 'bg-slate-700/70 text-slate-100 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
              >
                <Plus size={16} />
              </button>
            </div>

            {isAddMemberOpen && (
              <form onSubmit={handleAddMember} className={`mb-4 p-4 rounded-lg border space-y-3 ${panelClass}`}>
                <input
                  type="text"
                  placeholder="Member Name"
                  className={inputClass}
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Role"
                  className={inputClass}
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${isDarkMode ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {project.members?.length > 0 ? project.members.map((member, i) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${panelClass}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex justify-center items-center font-bold text-sm">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>{member.name}</span>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {member.role}
                  </span>
                </div>
              )) : (
                <p className={`text-sm italic ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                  No members added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;