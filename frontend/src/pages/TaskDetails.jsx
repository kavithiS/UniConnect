import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Paperclip, Calendar, User, Flag, CheckCircle } from 'lucide-react';

const TaskDetails = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:5000';

  const resolveAttachmentUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `${API_BASE_URL}${url}`;
  };

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

  useEffect(() => {
    if (task?.attachments && Array.isArray(task.attachments)) {
      setAttachments(task.attachments);
    } else {
      setAttachments([]);
    }
  }, [task]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const res = await axios.post(
        `http://localhost:5000/api/tasks/${taskId}/attachments`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setTask(res.data);
      setAttachments(res.data.attachments || []);
      await fetchTaskDetails();
    } catch (error) {
      console.error('Attachment upload failed:', error);
      alert('Failed to upload attachments. Please try again.');
    } finally {
      e.target.value = null;
    }
  };

  const handleRemoveAttachment = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/tasks/${taskId}/attachments/${id}`);
      setTask(res.data);
      setAttachments(res.data.attachments || []);
      await fetchTaskDetails();
    } catch (error) {
      console.error('Attachment deletion failed:', error);
      alert('Failed to remove attachment. Please try again.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/tasks/${taskId}/comments`, {
        text: commentText,
        author: 'Current User'
      });
      setCommentText('');
      fetchTaskDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const formatStatus = (status) => {
    if (status === "todo") return "To Do";
    if (status === "inprogress") return "In Progress";
    if (status === "done") return "Done";
    return status;
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        status: newStatus
      });
      fetchTaskDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-gray-600 dark:text-slate-400">Loading Task Details...</div>;
  if (!task) return <div className="text-gray-600 dark:text-slate-400">Task not found</div>;

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto w-full">

      {/* Back */}
      <Link to="/tasks" className="btn btn-secondary inline-flex mb-6 text-sm py-2 px-4">
        <ArrowLeft size={16} /> Back to Board
      </Link>

      <div className="glass-panel p-8">

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
          {task.title}
        </h1>

        {/* 🔥 STATUS BUTTONS (FIXED) */}
        <div className="flex gap-2 mb-4">

          <button
            onClick={() => updateStatus("todo")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${task.status === "todo"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white"}
            `}
          >
            To Do
          </button>

          <button
            onClick={() => updateStatus("inprogress")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${task.status === "inprogress"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white"}
            `}
          >
            In Progress
          </button>

          <button
            onClick={() => updateStatus("done")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${task.status === "done"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white"}
            `}
          >
            Done
          </button>

        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mb-8 max-w-2xl text-gray-600 dark:text-slate-400">

          <span className="flex items-center gap-1">
            <CheckCircle 
              size={16} 
              className={task.status === 'done' ? 'text-green-500' : 'text-gray-400 dark:text-slate-500'} 
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
            <span className="flex items-center gap-1 text-red-500">
              <Calendar size={16} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="
          p-6 rounded-xl mb-8
          bg-gray-100 text-gray-900
          dark:bg-slate-900/40 dark:text-slate-100
        ">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Description
          </h3>

          <p className="leading-relaxed whitespace-pre-wrap">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Attachments */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            <Paperclip size={20} /> Attachments
          </h3>

          <div className="mb-4">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {attachments.length > 0 ? (
            <ul className="space-y-3">
              {attachments.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-100 rounded-lg text-sm text-gray-800 dark:bg-white/10 dark:text-slate-100"
                >
                  <div className="flex-1">
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadedAt).toLocaleString()}
                    </div>
                    {file.type?.startsWith('image/') && (
                      <img
                        src={resolveAttachmentUrl(file.url)}
                        alt={file.name}
                        className="mt-2 max-h-40 rounded border border-gray-300" 
                      />
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={resolveAttachmentUrl(file.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-xs"
                      >
                        View
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(file.id)}
                    className="px-2 py-1 text-xs text-red-600 rounded-md hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/30"
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">No attachments yet. Add files using upload above.</p>
          )}
        </div>

        <hr className="border-t border-gray-200 dark:border-white/10 my-8" />

        {/* Comments */}
        <div>
          <h3 className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            <MessageSquare size={20} /> Discussion & Comments
          </h3>

          <div className="flex flex-col gap-6 mb-8">
            {task.comments && task.comments.map((c, i) => (
              <div key={i} className="flex gap-4">

                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex justify-center items-center font-bold">
                  {c.author.charAt(0)}
                </div>

                <div className="
                  p-4 rounded-xl flex-1
                  bg-gray-100 text-gray-900
                  dark:bg-white/5 dark:text-white
                ">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{c.author}</span>

                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex gap-4 items-start">

            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-white flex justify-center items-center font-bold">
              U
            </div>

            <div className="flex-1">
              <textarea
                className="form-control mb-4 resize-y"
                rows="3"
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                required
              />

              <button type="submit" className="btn btn-primary float-right">
                Post Comment
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default TaskDetails;