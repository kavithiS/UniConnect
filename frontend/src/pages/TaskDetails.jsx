import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Paperclip, Calendar, User, Flag, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TaskDetails = () => {
  const { isDarkMode } = useTheme();
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTaskDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/tasks/${taskId}`);
      setTask(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchTaskDetails();
  }, [taskId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axios.post(`http://localhost:5001/api/tasks/${taskId}/comments`, {
        text: commentText,
        author: 'Current User'
      });
      setCommentText('');
      fetchTaskDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ NEW: format status nicely
  const formatStatus = (status) => {
    if (status === "todo") return "To Do";
    if (status === "inprogress") return "In Progress";
    if (status === "done") return "Done";
    return status;
  };

  // ✅ NEW: update status
  const updateStatus = async (newStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/tasks/${taskId}/status`, {
        status: newStatus
      });
      fetchTaskDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading Task Details...</div>;
  if (!task) return <div className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Task not found</div>;

  return (
    <div className={`animate-fadeIn max-w-4xl mx-auto w-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Link to="/tasks" className={`btn btn-secondary inline-flex mb-6 text-sm py-2 px-4 transition ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-200 hover:bg-slate-300'}`}>
        <ArrowLeft size={16} /> Back to Board
      </Link>

      <div className={`glass-panel p-8 border rounded-lg ${isDarkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{task.title}</h1>

            {/* ✅ NEW: Status Buttons */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => updateStatus("todo")} className={`btn btn-secondary text-sm ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>To Do</button>
              <button onClick={() => updateStatus("inprogress")} className={`btn btn-secondary text-sm ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'}`}>In Progress</button>
              <button onClick={() => updateStatus("done")} className={`btn btn-success text-sm ${isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-200 hover:bg-green-300'}`}>Done</button>
            </div>

            <div className={`flex flex-wrap gap-4 mb-8 max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <span className="flex items-center gap-1">
                <CheckCircle 
                  size={16} 
                  className={task.status === 'done' ? 'text-success' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')} 
                /> 
                {formatStatus(task.status)}
              </span>

              <span className="flex items-center gap-2">
                <Flag size={16} /> 
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority}
                </span>
              </span>

              <span className="flex items-center gap-1">
                <User size={16} /> {task.assignedTo || 'Unassigned'}
              </span>

              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={16} className="text-danger" /> 
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl mb-8 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-100'}`}>
          <h3 className={`mb-4 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Description</h3>
          <p className={`leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>
            {task.description || 'No description provided.'}
          </p>
        </div>

        <div className="mb-8">
          <h3 className={`flex items-center gap-2 mb-4 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Paperclip size={20} /> Attachments (Simulated)
          </h3>
        </div>

        <hr className={`my-8 ${isDarkMode ? 'border-white/10' : 'border-slate-300'}`} />

        <div>
          <h3 className={`flex items-center gap-2 mb-6 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <MessageSquare size={20} /> Discussion & Comments
          </h3>

          <div className="flex flex-col gap-6 mb-8">
            {task.comments && task.comments.map((c, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold flex-shrink-0 ${isDarkMode ? 'bg-gradient-to-br from-primary to-accent' : 'bg-blue-400'}`}>
                  {c.author.charAt(0)}
                </div>
                <div className={`p-4 rounded-xl flex-1 ${isDarkMode ? 'bg-white/5' : 'bg-slate-200'}`}>
                  <div className="flex justify-between mb-2">
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.author}</span>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-4 items-start">
            <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold shadow-inner ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`}>
              U
            </div>
            <div className="flex-1">
              <textarea 
                className={`form-control mb-4 resize-y border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-slate-900/60 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`} 
                rows="3" 
                placeholder="Write a comment..." 
                value={commentText} 
                onChange={e => setCommentText(e.target.value)} 
                required
              />
              <button type="submit" className="btn btn-primary float-right">Post Comment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;