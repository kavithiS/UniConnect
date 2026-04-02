import React, { useState } from 'react';
import { Clock, User, Zap, CheckCircle, XCircle } from 'lucide-react';

export default function ReceivedRequestCard({ request, onAccept, onReject, isDarkMode }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept(request._id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(request._id);
    } finally {
      setLoading(false);
    }
  };

  const statusDot = {
    pending: 'bg-amber-400',
    accepted: 'bg-emerald-400',
    rejected: 'bg-red-400',
  };

  const statusText = {
    pending: isDarkMode ? 'text-amber-300' : 'text-amber-700',
    accepted: isDarkMode ? 'text-emerald-300' : 'text-emerald-700',
    rejected: isDarkMode ? 'text-red-300' : 'text-red-700',
  };

  const matchColor = request.skillMatchScore >= 75 
    ? 'text-emerald-500' 
    : request.skillMatchScore >= 50 
    ? 'text-amber-500' 
    : 'text-red-500';

  const textColor = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const titleColor = isDarkMode ? 'text-white' : 'text-slate-900';

  return (
    <div className={`border transition-all ${isDarkMode ? 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700' : 'bg-white/50 border-slate-200/50 hover:border-slate-300'} rounded-lg p-5`}>
      {/* Minimal Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {request.from?.avatar ? (
            <img 
              src={request.from.avatar} 
              alt={request.from.name}
              className="w-10 h-10 rounded-md object-cover"
            />
          ) : (
            <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
              isDarkMode ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <User size={18} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${titleColor} truncate`}>
              {request.from?.name || 'Unknown User'}
            </h3>
            <p className={`text-xs mt-1 ${textColor} truncate`}>
              wants to join {request.groupId?.title || 'a group'}
            </p>
          </div>
        </div>
        
        {/* Minimal Status */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${statusDot[request.status]}`}></div>
          <span className={`text-xs font-medium ${statusText[request.status]} capitalize`}>
            {request.status}
          </span>
        </div>
      </div>

      {/* Compact Details */}
      <div className={`space-y-3 text-xs ${textColor}`}>
        {/* Skill Match */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Match</span>
          </div>
          <span className={`font-semibold ${matchColor}`}>
            {request.skillMatchScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
        }`}>
          <div
            className={`h-full transition-all ${
              request.skillMatchScore >= 75 
                ? 'bg-emerald-500' 
                : request.skillMatchScore >= 50 
                ? 'bg-amber-500' 
                : 'bg-red-500'
            }`}
            style={{ width: `${request.skillMatchScore}%` }}
          />
        </div>

        {/* Skills - Minimal Display */}
        {(request.matchedSkills?.length > 0 || request.missingSkills?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {request.matchedSkills?.slice(0, 2).map(skill => (
              <span
                key={skill}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isDarkMode
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {skill}
              </span>
            ))}
            {request.missingSkills?.slice(0, 1).map(skill => (
              <span
                key={skill}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isDarkMode
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                −{skill}
              </span>
            ))}
          </div>
        )}

        {/* Message - Minimal */}
        {request.message && (
          <p className={`text-xs italic pt-2 border-t ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
            "{request.message}"
          </p>
        )}

        {/* Date - Minimal */}
        <div className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} pt-1`}>
          <Clock size={12} />
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Minimal Actions */}
      {request.status === 'pending' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800/30">
          <button
            onClick={handleAccept}
            disabled={loading}
            className={`p-2 rounded transition-colors flex-1 flex items-center justify-center ${
              isDarkMode
                ? 'hover:bg-emerald-950/30 text-slate-400 hover:text-emerald-400 disabled:opacity-50'
                : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 disabled:opacity-50'
            } disabled:cursor-not-allowed`}
            title="Accept request"
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className={`p-2 rounded transition-colors flex-1 flex items-center justify-center ${
              isDarkMode
                ? 'hover:bg-red-950/30 text-slate-400 hover:text-red-400 disabled:opacity-50'
                : 'hover:bg-red-50 text-slate-500 hover:text-red-600 disabled:opacity-50'
            } disabled:cursor-not-allowed`}
            title="Reject request"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {request.status !== 'pending' && (
        <div className={`text-xs mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-800/30 text-slate-600' : 'border-slate-200 text-slate-500'}`}>
          {request.status === 'accepted' && '✓ Accepted'}
          {request.status === 'rejected' && '✕ Rejected'}
          {request.respondedAt && ` on ${new Date(request.respondedAt).toLocaleDateString()}`}
        </div>
      )}
    </div>
  );
}
