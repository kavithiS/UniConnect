import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const CreateTaskModal = ({ projectId, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    subtasks: []
  });
  const [loading, setLoading] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

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

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setFormData({
        ...formData,
        subtasks: [...formData.subtasks, { title: newSubtask.trim(), status: 'todo' }]
      });
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((_, i) => i !== index)
    });
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
        className="w-full max-w-lg max-h-[90vh] bg-white text-black rounded-xl shadow-2xl z-[10000] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-8 pb-4 flex-shrink-0">
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

        {/* Scrollable Form Content */}
        <div className="px-8 pb-4 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
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
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                User Story / Description
              </label>
              <textarea 
                required 
                name="description" 
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                rows={4} 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="As a [user], I want [goal] so that [benefit]..." 
              />
            </div>

            {/* Subtasks */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Subtasks
              </label>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-md bg-white text-black"
                  placeholder="Add a subtask..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                />
                <button 
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              {formData.subtasks.length > 0 && (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.subtasks.map((subtask, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                      <span className="text-gray-800 flex-1 mr-2">{subtask.title}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveSubtask(index)}
                        className="text-red-600 hover:text-red-800 flex-shrink-0"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
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
            <div>
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
          </form>
        </div>

        {/* Buttons - Fixed at bottom */}
        <div className="flex justify-end gap-4 p-8 pt-4 border-t border-gray-200 flex-shrink-0">
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
            onClick={handleSubmit}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;