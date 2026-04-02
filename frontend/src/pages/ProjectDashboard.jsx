import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, ListTodo, Activity, Clock, Plus, Users, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ProjectDashboard = ({ projectId }) => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [addingMember, setAddingMember] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/projects/${projectId}/dashboard`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDashboard();
    }
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;
    setAddingMember(true);
    try {
      await axios.post(`http://localhost:5001/api/projects/${projectId}/members`, newMember);
      setNewMember({ name: '', role: '' });
      setIsAddMemberOpen(false);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingMember(false);
    }
  };

  if (!data) return <div className="text-slate-400">Loading Dashboard...</div>;

  const { project, stats, upcomingDeadlines } = data;

  // ✅ SAFETY (avoid crashes)
  const safeStats = {
    totalTasks: stats?.totalTasks || 0,
    todoTasks: stats?.todoTasks || 0,
    inProgressTasks: stats?.inProgressTasks || 0,
    doneTasks: stats?.doneTasks || 0,
    progress: stats?.progress || 0
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-slate-800/50 bg-slate-900/50' : 'border-slate-200 bg-white/50'} backdrop-blur-md sticky top-0 z-50`}>
        <div className="px-8 py-4">
          <h1 className={`text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
            {project.title}
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
            Workspace Overview
          </p>
        </div>
      </div>

      <div className="px-8 py-8 max-w-7xl mx-auto">
        {/* Progress Section */}
        <div className={`rounded-xl border p-6 mb-8 transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Project Progress</h2>
            <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{safeStats.progress}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${safeStats.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {/* Total Tasks */}
          <div className={`rounded-xl border p-6 transition-all hover:border-opacity-100 group ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-wider font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Total Tasks</p>
                <p className={`text-4xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{safeStats.totalTasks}</p>
              </div>
              <ListTodo className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-slate-700 group-hover:text-slate-600' : 'text-slate-400 group-hover:text-slate-300'}`} />
            </div>
          </div>

          {/* To Do */}
          <div className={`rounded-xl border p-6 transition-all hover:border-opacity-100 group ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-wider font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>To Do</p>
                <p className={`text-4xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{safeStats.todoTasks}</p>
              </div>
              <Target className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-slate-700 group-hover:text-slate-600' : 'text-slate-400 group-hover:text-slate-300'}`} />
            </div>
          </div>

          {/* In Progress */}
          <div className={`rounded-xl border p-6 transition-all hover:border-opacity-100 group ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-wider font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>In Progress</p>
                <p className={`text-4xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{safeStats.inProgressTasks}</p>
              </div>
              <Activity className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-slate-700 group-hover:text-slate-600' : 'text-slate-400 group-hover:text-slate-300'}`} />
            </div>
          </div>

          {/* Completed */}
          <div className={`rounded-xl border p-6 transition-all hover:border-opacity-100 group ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-wider font-medium mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Completed</p>
                <p className={`text-4xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{safeStats.doneTasks}</p>
              </div>
              <BarChart3 className={`w-8 h-8 transition-colors ${isDarkMode ? 'text-slate-700 group-hover:text-slate-600' : 'text-slate-400 group-hover:text-slate-300'}`} />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <div className={`rounded-xl border p-6 transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              <Clock className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              Upcoming Deadlines
            </h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Next 7 days</p>

            {(!upcomingDeadlines || upcomingDeadlines.length === 0) ? (
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>No immediate deadlines</p>
            ) : (
              <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {upcomingDeadlines.map(task => (
                  <div key={task._id} className={`py-3 flex justify-between items-center ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-colors px-3 -mx-3`}>
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{task.title}</span>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className={`rounded-xl border p-6 transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                <Users className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                Team Members
              </h3>
              <button
                onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" /> Add
              </button>
            </div>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>(At least 2 required)</p>

            {isAddMemberOpen && (
              <form onSubmit={handleAddMember} className={`p-4 rounded-lg mb-4 border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                <input
                  type="text"
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded mb-2 border transition-colors ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-slate-600 focus:outline-none'
                      : 'bg-white border-slate-300 text-slate-950 placeholder-slate-500 focus:border-slate-400 focus:outline-none'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className={`w-full px-3 py-2 rounded mb-3 border transition-colors ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-slate-600 focus:outline-none'
                      : 'bg-white border-slate-300 text-slate-950 placeholder-slate-500 focus:border-slate-400 focus:outline-none'
                  }`}
                />
                <button
                  type="submit"
                  disabled={addingMember}
                  className={`w-full py-2 rounded text-sm font-medium transition-all  ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                      : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                  }`}
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </form>
            )}

            {project.members && project.members.length > 0 ? (
              <div className={`overflow-x-auto`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Name</th>
                      <th className={`text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Role</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
                    {project.members.map((member, idx) => (
                      <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                        <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{member.name}</td>
                        <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{member.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>No team members yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;