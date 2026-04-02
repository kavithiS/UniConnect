import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

export default function RequestCard({ request, type, onAccept, onReject, onCancel, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    try {
      setLoading(true);
      await onAccept();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await onReject();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await onCancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: isDarkMode ? 'bg-yellow-950 border-yellow-700' : 'bg-yellow-50 border-yellow-200',
    accepted: isDarkMode ? 'bg-green-950 border-green-700' : 'bg-green-50 border-green-200',
    rejected: isDarkMode ? 'bg-red-950 border-red-700' : 'bg-red-50 border-red-200',
  };

  const statusBadgeColor = {
    pending: isDarkMode ? 'bg-yellow-700 text-yellow-100' : 'bg-yellow-200 text-yellow-800',
    accepted: isDarkMode ? 'bg-green-700 text-green-100' : 'bg-green-200 text-green-800',
    rejected: isDarkMode ? 'bg-red-700 text-red-100' : 'bg-red-200 text-red-800',
  };

  const textColor = isDarkMode ? 'text-slate-300' : 'text-gray-700';
  const titleColor = isDarkMode ? 'text-white' : 'text-slate-900';

  return (
    <div className={`border-2 rounded-lg p-5 transition-all ${statusColor[request.status]}`}>
      {error && <div className={`text-red-600 text-sm mb-4 p-2 rounded ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>Error: {error}</div>}

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <User size={18} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
            <h3 className={`font-bold text-lg ${titleColor}`}>
              {type === 'received' 
                ? `${request.from?.name || 'Unknown'} wants to join` 
                : `Requested to join`}
            </h3>
          </div>
          <p className={`font-semibold mt-1 ${titleColor}`}>{request.groupId?.title || 'Unknown Group'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeColor[request.status]}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className={`mb-4 space-y-2 text-sm ${textColor}`}>
        <div className="flex justify-between items-center">
          <span>Skill Match:</span>
          <span className={`font-semibold ${request.skillMatchScore >= 75 ? 'text-green-500' : request.skillMatchScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {request.skillMatchScore}%
          </span>
        </div>
        {request.message && (
          <div>
            <span>Message:</span>
            <p className={`italic mt-1 p-2 rounded ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-100'}`}>
              "{request.message}"
            </p>
          </div>
        )}
        <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'} flex items-center gap-1`}>
          <Clock size={14} />
          Sent: {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>

      {type === 'received' && request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
              isDarkMode
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-900'
                : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            <CheckCircle size={16} />
            {loading ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded font-semibold transition-all ${
              isDarkMode
                ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-900'
                : 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            <XCircle size={16} />
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      )}

      {type === 'sent' && request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded font-semibold transition-all flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 disabled:bg-slate-900'
                : 'bg-gray-400 hover:bg-gray-500 text-white disabled:opacity-50'
            } disabled:cursor-not-allowed`}
          >
            <XCircle size={16} />
            {loading ? 'Cancelling...' : 'Cancel Request'}
          </button>
        </div>
      )}
    </div>
  );
}
