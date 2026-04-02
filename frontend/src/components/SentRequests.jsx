import React, { useState } from 'react';
import { useRequests } from '../hooks/useRequests';
import RequestCard from './RequestCard';
import { useTheme } from '../context/ThemeContext';
import { SendIcon, AlertCircle } from 'lucide-react';

export default function SentRequests() {
  const { sentRequests, loading, error, cancelRequest } = useRequests();
  const { isDarkMode } = useTheme();
  const [filterStatus, setFilterStatus] = useState('pending');

  const filteredRequests = filterStatus === 'all' 
    ? sentRequests 
    : sentRequests.filter(r => r.status === filterStatus);

  if (loading) {
    return (
      <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        <div className="animate-spin text-4xl mb-4">⏳</div>
        Loading requests...
      </div>
    );
  }

  const stats = {
    pending: sentRequests.filter(r => r.status === 'pending').length,
    accepted: sentRequests.filter(r => r.status === 'accepted').length,
    rejected: sentRequests.filter(r => r.status === 'rejected').length,
  };

  const filterButtons = [
    { name: 'Pending', value: 'pending', label: `Pending (${stats.pending})` },
    { name: 'Accepted', value: 'accepted', label: `Accepted (${stats.accepted})` },
    { name: 'Rejected', value: 'rejected', label: `Rejected (${stats.rejected})` },
    { name: 'All', value: 'all', label: 'All' }
  ];

  return (
    <div className={`flex-1 p-8 min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SendIcon size={32} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            My Sent Requests
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-3 mb-8 flex-wrap p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilterStatus(btn.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === btn.value
                  ? isDarkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500 text-white'
                  : isDarkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${isDarkMode ? 'bg-red-900/50 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-semibold ${isDarkMode ? 'text-red-100' : 'text-red-800'}`}>Error</p>
              <p className={isDarkMode ? 'text-red-200' : 'text-red-700'}>{error}</p>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className={`text-center py-16 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-300 bg-slate-100'}`}>
              <SendIcon size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No {filterStatus === 'all' ? '' : filterStatus} sent requests
              </p>
              <p className={isDarkMode ? 'text-slate-500' : 'text-slate-500'}>
                Send your first request to a group!
              </p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <RequestCard
                key={request._id}
                request={request}
                type="sent"
                isDarkMode={isDarkMode}
                onCancel={() => cancelRequest(request._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
