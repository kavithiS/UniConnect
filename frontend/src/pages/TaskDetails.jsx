import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Paperclip, Calendar, User, Flag, CheckCircle } from 'lucide-react';

const TaskDetails = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTaskDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/${taskId}`);
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
      await axios.post(`http://localhost:5000/api/tasks/${taskId}/comments`, {
        text: commentText,
        author: 'Current User' // Simulating current user
      });
      setCommentText('');
      fetchTaskDetails(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-slate-400">Loading Task Details...</div>;
  if (!task) return <div className="text-slate-400">Task not found</div>;

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto w-full">
      <Link to="/tasks" className="btn btn-secondary inline-flex mb-6 text-sm py-2 px-4 bg-transparent hover:bg-white/5">
        <ArrowLeft size={16} /> Back to Board
      </Link>

      <div className="glass-panel p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-3">{task.title}</h1>
            <div className="flex flex-wrap gap-4 text-slate-400 mb-8 max-w-2xl">
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className={task.status === 'Done' ? 'text-success' : 'text-slate-500'} /> {task.status}
              </span>
              <span className="flex items-center gap-2">
                <Flag size={16} /> <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
              </span>
              <span className="flex items-center gap-1">
                <User size={16} /> {task.assignedTo || 'Unassigned'}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={16} className="text-danger" /> {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-xl mb-8">
          <h3 className="mb-4 text-lg font-semibold">Description</h3>
          <p className="leading-relaxed text-slate-100 whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </p>
        </div>

        <div className="mb-8">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
            <Paperclip size={20} /> Attachments (Simulated)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors duration-200">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Paperclip size={24} className="text-primary" />
              </div>
              <div>
                <div className="font-semibold">Project_Requirements.pdf</div>
                <div className="text-slate-400 text-sm">2.4 MB</div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-t border-white/10 my-8" />

        <div>
          <h3 className="flex items-center gap-2 mb-6 text-lg font-semibold">
            <MessageSquare size={20} /> Discussion & Comments
          </h3>

          <div className="flex flex-col gap-6 mb-8">
            {task.comments && task.comments.map((c, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex justify-center items-center font-bold flex-shrink-0">
                  {c.author.charAt(0)}
                </div>
                <div className="bg-white/5 p-4 rounded-xl flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{c.author}</span>
                    <span className="text-slate-400 text-sm">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-200">{c.text}</p>
                </div>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <div className="text-slate-400 text-center p-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                No comments yet. Start the discussion!
              </div>
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-white/10 flex justify-center items-center font-bold shadow-inner">
              U
            </div>
            <div className="flex-1">
              <textarea 
                className="form-control mb-4 resize-y bg-slate-900/60" 
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
