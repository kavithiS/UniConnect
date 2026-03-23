import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, ListTodo, Activity, Clock, Plus, ClipboardList, Users } from 'lucide-react';

const ProjectDashboard = ({ projectId }) => {
  const [data, setData] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [addingMember, setAddingMember] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${projectId}/dashboard`);
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
      await axios.post(`http://localhost:5000/api/projects/${projectId}/members`, newMember);
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
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
      <p className="text-slate-400">
        Group: {project.groupId} | Central Workspace
      </p>

      {/* ✅ Progress */}
      <div className="glass-panel p-8 mt-8">
        <h2 className="text-2xl font-semibold">Project Progress</h2>

        <div className="flex justify-between items-center mt-4 text-slate-400">
          <span>Overall Completion</span>
          <span className="font-bold text-slate-50">
            {safeStats.progress}%
          </span>
        </div>

        <div className="w-full h-2 bg-white/10 rounded mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-success rounded transition-all duration-1000 ease-in-out"
            style={{ width: `${safeStats.progress}%` }}
          ></div>
        </div>
      </div>

      {/* ✅ Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-6 mt-8">

        {/* Total */}
        <div className="glass-panel p-6 flex flex-col gap-4 hover:-translate-y-1 transition">
          <div className="flex justify-between items-center text-slate-400">
            <h3 className="text-xl font-semibold">Total Tasks</h3>
            <ListTodo size={24} className="text-primary" />
          </div>
          <div className="text-4xl font-bold">{safeStats.totalTasks}</div>
        </div>

        {/* To Do */}
        <div className="glass-panel p-6 flex flex-col gap-4 hover:-translate-y-1 transition">
          <div className="flex justify-between items-center text-slate-400">
            <h3 className="text-xl font-semibold">To Do</h3>
            <ClipboardList size={24} className="text-info text-cyan-400" />
          </div>
          <div className="text-4xl font-bold">{safeStats.todoTasks}</div>
        </div>

        {/* In Progress */}
        <div className="glass-panel p-6 flex flex-col gap-4 hover:-translate-y-1 transition">
          <div className="flex justify-between items-center text-slate-400">
            <h3 className="text-xl font-semibold">In Progress</h3>
            <Activity size={24} className="text-warning" />
          </div>
          <div className="text-4xl font-bold">{safeStats.inProgressTasks}</div>
        </div>

        {/* Done */}
        <div className="glass-panel p-6 flex flex-col gap-4 hover:-translate-y-1 transition">
          <div className="flex justify-between items-center text-slate-400">
            <h3 className="text-xl font-semibold">Completed</h3>
            <Target size={24} className="text-success" />
          </div>
          <div className="text-4xl font-bold">{safeStats.doneTasks}</div>
        </div>

      </div>

      {/* ✅ Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* Deadlines */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-danger" /> Upcoming Deadlines
          </h3>

          {(!upcomingDeadlines || upcomingDeadlines.length === 0) ? (
            <p className="text-slate-400">No immediate deadlines coming up.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingDeadlines.map(task => (
                <div key={task._id} className="flex justify-between p-3 bg-white/5 rounded-md">
                  <span>{task.title}</span>
                  <span className="text-danger text-sm">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="glass-panel p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users size={20} className="text-primary" /> Team Members
            </h3>
            <button 
              className="text-primary hover:text-white transition p-1 bg-white/5 rounded-full" 
              onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
              title="Add Member"
            >
              <Plus size={16} className={`transform transition-transform ${isAddMemberOpen ? 'rotate-45 text-danger' : ''}`} />
            </button>
          </div>

          {isAddMemberOpen && (
            <form onSubmit={handleAddMember} className="mb-4 p-4 bg-black/20 rounded-lg flex flex-col gap-3 animate-fadeIn">
              <input 
                type="text" 
                placeholder="Member Name" 
                className="form-control text-sm py-2"
                value={newMember.name}
                onChange={e => setNewMember({...newMember, name: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Role (e.g. Developer)" 
                className="form-control text-sm py-2"
                value={newMember.role}
                onChange={e => setNewMember({...newMember, role: e.target.value})}
                required
              />
              <button 
                type="submit" 
                className="btn btn-primary text-sm py-2"
                disabled={addingMember}
              >
                {addingMember ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {project.members && project.members.length > 0 ? project.members.map((member, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-md hover:bg-white/10 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex justify-center items-center font-bold text-sm shadow-lg">
                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="text-slate-400 text-sm px-2 py-1 bg-white/5 rounded">{member.role}</span>
              </div>
            )) : (
              <p className="text-slate-400 text-sm italic">No members added yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDashboard;