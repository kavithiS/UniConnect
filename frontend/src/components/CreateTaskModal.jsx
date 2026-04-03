import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { getApiBaseUrl } from '../utils/backendUrl';

const CreateTaskModal = ({ projectId, projects = [], projectMembers = [], onProjectChange, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      setSubmitError('Please select a project before creating a task.');
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      await axios.post(`${getApiBaseUrl()}/tasks`, {
        ...formData,
        projectId
      });
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-lg p-8 animate-slideUp glass-panel" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Task</h2>
          <button onClick={onClose} className="bg-transparent border-none text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 font-medium text-slate-400">Project</label>
            <select
              required
              className="form-control"
              value={projectId || ''}
              onChange={(e) => onProjectChange?.(e.target.value)}
              disabled={loading || projects.length === 0}
            >
              <option value="" className="bg-slate-800">
                {projects.length === 0 ? 'No projects available' : 'Select a project'}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id} className="bg-slate-800">
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium text-slate-400">Task Title</label>
            <input required type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} placeholder="e.g. Design Login Page" />
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium text-slate-400">Description</label>
            <textarea required name="description" className="form-control" rows={3} value={formData.description} onChange={handleChange} placeholder="Details about this task..." />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block mb-2 font-medium text-slate-400">Assign To</label>
              {projectMembers.length > 0 ? (
                <select
                  name="assignedTo"
                  className="form-control"
                  value={formData.assignedTo}
                  onChange={handleChange}
                >
                  <option value="" className="bg-slate-800">Select member</option>
                  {projectMembers.map((member) => (
                    <option key={member} value={member} className="bg-slate-800">
                      {member}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="assignedTo"
                  className="form-control"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  placeholder="Member name"
                />
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-400">Priority</label>
              <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
                <option value="Low" className="bg-slate-800">Low</option>
                <option value="Medium" className="bg-slate-800">Medium</option>
                <option value="High" className="bg-slate-800">High</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block mb-2 font-medium text-slate-400">Due Date</label>
            <input type="date" name="dueDate" className="form-control" value={formData.dueDate} onChange={handleChange} />
          </div>

          {submitError && (
            <p className="mt-2 text-sm text-red-400">{submitError}</p>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
