import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, ListTodo, Activity, Clock } from 'lucide-react';

const ProjectDashboard = ({ projectId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${projectId}/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, [projectId]);

  if (!data) return <div className="text-slate-400">Loading Dashboard...</div>;

  const { project, stats, upcomingDeadlines } = data;

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
      <p className="text-slate-400">Group: {project.groupId} | Central Workspace</p>

      <div className="glass-panel p-8 mt-8">
        <h2 className="text-2xl font-semibold">Project Progress</h2>
        <div className="flex justify-between items-center mt-4 text-slate-400">
          <span>Overall Completion</span>
          <span className="font-bold text-slate-50">{stats.progress}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-success rounded transition-all duration-1000 ease-in-out" style={{ width: `${stats.progress}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-6 mt-8">
        <div className="glass-panel p-6 flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <h3 className="text-xl font-semibold">Total Tasks</h3>
            <ListTodo size={24} className="text-primary" />
          </div>
          <div className="text-4xl font-bold">{stats.totalTasks}</div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <h3 className="text-xl font-semibold">In Progress</h3>
            <Activity size={24} className="text-warning" />
          </div>
          <div className="text-4xl font-bold">{stats.inProgressTasks}</div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-4 transition-transform duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <h3 className="text-xl font-semibold">Completed</h3>
             <Target size={24} className="text-success" />
          </div>
          <div className="text-4xl font-bold">{stats.doneTasks}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-danger" /> Upcoming Deadlines
          </h3>
          {upcomingDeadlines.length === 0 ? (
             <p className="text-slate-400">No immediate deadlines coming up.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingDeadlines.map(task => (
                <div key={task._id} className="flex justify-between p-3 bg-white/5 rounded-md">
                  <span>{task.title}</span>
                  <span className="text-danger text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <div className="flex flex-col gap-3">
            {project.members.map((member, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex justify-center items-center font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <span>{member.name}</span>
                </div>
                <span className="text-slate-400 text-sm">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
