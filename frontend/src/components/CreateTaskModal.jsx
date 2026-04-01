import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const CreateTaskModal = ({ projectId, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  const today = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.dueDate && formData.dueDate < today()) {
      alert('Due date cannot be in the past. Please select today or a future date.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        ...formData,
        projectId
      });
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg p-8 bg-white text-black rounded-xl shadow-2xl z-[10000]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ color: 'black', fontSize: '24px', fontWeight: 'bold' }}>
            Create New Task
          </h2>

          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-black"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700">
              Task Title
            </label>
            <input 
              required 
              type="text" 
              name="title" 
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g. Design Login Page" 
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700">
              Description
            </label>
            <textarea 
              required 
              name="description" 
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              rows={3} 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Details about this task..." 
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Assign To
              </label>
              <input 
                type="text" 
                name="assignedTo" 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                value={formData.assignedTo} 
                onChange={handleChange} 
                placeholder="Member name" 
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Priority
              </label>
              <select 
                name="priority" 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                value={formData.priority} 
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="mb-5">
            <label className="block mb-2 font-medium text-gray-700">
              Due Date
            </label>
            <input 
              type="date" 
              name="dueDate" 
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              value={formData.dueDate} 
              onChange={handleChange} 
              min={today()}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;