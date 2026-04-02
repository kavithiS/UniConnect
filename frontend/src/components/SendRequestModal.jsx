import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function SendRequestModal({ groupId, onSend, onClose, isDarkMode }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      await onSend(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${
      isDarkMode ? 'bg-black/70' : 'bg-black/30'
    }`}>
      <div className={`rounded-lg max-w-md w-full ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Send Request
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-all ${
              isDarkMode
                ? 'hover:bg-slate-700 text-slate-400'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Message (required)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the group why you want to join..."
              rows="5"
              maxLength="500"
              className={`w-full p-3 rounded border transition-all resize-none ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
              }`}
              autoFocus
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              {message.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded font-semibold transition-all ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
              }`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded font-semibold transition-all flex items-center justify-center gap-2 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-900'
                  : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
              }`}
              disabled={loading || !message.trim()}
            >
              <Send size={18} />
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
