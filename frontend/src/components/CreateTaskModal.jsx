import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getApiBaseUrl } from '../utils/backendUrl';

const CreateTaskModal = ({ projectId, projectMembers = [], onClose, onTaskCreated }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubtask = () => {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    setSubtasks([...subtasks, { title: trimmed, status: 'todo' }]);
    setSubtaskInput('');
  };

  const handleSubtaskKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
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
        subtasks,
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
    <div
      className={`fixed inset-0 backdrop-blur-md flex justify-center items-center z-50 animate-fadeIn ${isDarkMode ? 'bg-slate-950/70' : 'bg-black/50'}`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg rounded-[28px] border shadow-[0_30px_90px_rgba(0,0,0,0.45)] flex flex-col animate-slideUp overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500" />
        {/* Header — always visible */}
        <div className={`flex justify-between items-center px-8 pt-7 pb-4 flex-shrink-0 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Create New Task</h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Add work items to the selected project.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-2 transition-colors bg-transparent border-none cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable body */}
          <div className={`flex-1 overflow-y-auto px-8 pb-2 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
            {/* Task Title */}
            <div className="mb-5">
              <label className={`block mb-1.5 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Task Title</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Design Login Page"
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDarkMode ? 'border border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30' : 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30'}`}
              />
            </div>

            {/* User Story / Description */}
            <div className="mb-5">
              <label className={`block mb-1.5 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>User Story / Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="As a [user], I want [goal] so that [benefit]..."
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${isDarkMode ? 'border border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30' : 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30'}`}
              />
            </div>

            {/* Subtasks */}
            <div className="mb-5">
              <label className={`block mb-1.5 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Subtasks</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  placeholder="Add a subtask..."
                  className={`flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDarkMode ? 'border border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30' : 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30'}`}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-colors shadow-lg"
                >
                  Add
                </button>
              </div>
              {subtasks.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {subtasks.map((s, i) => (
                    <li
                      key={i}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${isDarkMode ? 'bg-slate-900/70 border border-slate-800 text-slate-200' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
                    >
                      <span>{s.title}</span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(i)}
                        className={`ml-2 bg-transparent border-none cursor-pointer text-base leading-none transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Assign To + Priority */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={`block mb-1.5 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Assign To</label>
                {projectMembers.length > 0 ? (
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDarkMode ? 'border border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30' : 'border border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30'}`}
                  >
                    <option value="" className={isDarkMode ? 'bg-slate-900 text-slate-100' : ''}>Select member</option>
                    {projectMembers.map((member) => (
                      <option key={member} value={member} className={isDarkMode ? 'bg-slate-900 text-slate-100' : ''}>{member}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Member name"
                    className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDarkMode ? 'border border-slate-700 bg-slate-900/80 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30' : 'border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30'}`}
                  />
                )}
              </div>

              <div>
                <label className={`block mb-1.5 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDarkMode ? 'border border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30' : 'border border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30'}`}
                >
                  <option value="Low" className={isDarkMode ? 'bg-slate-900 text-slate-100' : ''}>Low</option>
                  <option value="Medium" className={isDarkMode ? 'bg-slate-900 text-slate-100' : ''}>Medium</option>
                  <option value="High" className={isDarkMode ? 'bg-slate-900 text-slate-100' : ''}>High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="mb-5">
              <label className={`block mb-1.5 text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDarkMode ? 'border border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30' : 'border border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30'}`}
              />
            </div>

            {submitError && (
              <p className="mb-3 text-sm text-rose-400">{submitError}</p>
            )}
          </div>

          {/* Footer — always visible */}
          <div className={`flex justify-end gap-3 px-8 py-5 border-t flex-shrink-0 ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 rounded-xl border text-sm font-medium transition-colors ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-lg"
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
