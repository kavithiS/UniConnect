import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, Plus, X, Clock, CheckCircle, XCircle, Info, Bell, Layers, Sparkles, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SendRequestModal from '../components/SendRequestModal';
import { detectBackendBaseUrl, getBackendBaseUrl } from '../utils/backendUrl';
import { getAuthToken } from '../services/authService';

const getApiBase = () => getBackendBaseUrl();

export default function RequestsPage({ user: currentUser }) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('received');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedGroupForRequest, setSelectedGroupForRequest] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editMessage, setEditMessage] = useState('');

  const token = getAuthToken();

  // Initialize and fetch
  useEffect(() => {
    const userId = currentUser?._id || localStorage.getItem('userId');
    if (!userId) {
      setError('User ID not found. Please log in.');
      return;
    }

    // Basic validation: ensure userId looks like a Mongo ObjectId (24 hex chars)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    if (!isValidObjectId) {
      setError('Invalid userId. Please log in with a proper account.');
      return;
    }

    fetchAllData(userId);
  }, [currentUser]);

  const fetchAllData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error('User ID not found. Please reload and try again.');
      }
      const apiBase = getApiBase();
      
      // Fetch received requests
      const receivedRes = await fetch(`${apiBase}/api/requests/received?userId=${userId}`);
      if (!receivedRes.ok) {
        const errBody = await receivedRes.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to fetch received requests');
      }
      const receivedData = await receivedRes.json();
      setReceivedRequests(receivedData.requests || []);

      // Fetch sent requests
      const sentRes = await fetch(`${apiBase}/api/requests/sent?userId=${userId}`);
      if (!sentRes.ok) {
        const errBody = await sentRes.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to fetch sent requests');
      }
      const sentData = await sentRes.json();
      setSentRequests(sentData.requests || []);

      // Fetch all groups
      const groupsRes = await fetch(`${apiBase}/api/groups`);
      if (!groupsRes.ok) {
        const errBody = await groupsRes.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to fetch groups');
      }
      const groupsData = await groupsRes.json();
      setGroups(groupsData.data || []);

    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(
        `${getApiBase()}/api/requests/${requestId}/accept`,
        { method: 'PUT' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchAllData(currentUser?._id || localStorage.getItem('userId'));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to accept request');
      console.error('Error accepting request:', err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(
        `${getApiBase()}/api/requests/${requestId}/reject`,
        { method: 'PUT' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchAllData(currentUser?._id || localStorage.getItem('userId'));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const response = await fetch(
        `${getApiBase()}/api/requests/${requestId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchAllData(currentUser?._id || localStorage.getItem('userId'));
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete request');
      console.error('Error deleting request:', err);
    }
  };

  const handleUpdateMessage = async (requestId) => {
    if (!editMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const response = await fetch(
        `${getApiBase()}/api/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: editMessage })
        }
      );
      const data = await response.json();

      if (data.success) {
        setEditingRequestId(null);
        setEditMessage('');
        await fetchAllData(currentUser?._id || localStorage.getItem('userId'));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update request');
    }
  };

  const handleEditMessage = (requestId) => {
    const request = sentRequests.find(r => r._id === requestId);
    if (request) {
      setEditingRequestId(requestId);
      setEditMessage(request.message || '');
    }
  };

  const handleSendRequest = async (groupId, message) => {
    try {
      const userId = currentUser?._id || localStorage.getItem('userId');
      if (!userId) {
        setError('User session is invalid. Please reload and try again.');
        return;
      }

      const response = await fetch(`${getApiBase()}/api/requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          groupId,
          requestType: 'join',
          message,
          fromUserId: userId
        })
      });

      const data = await response.json().catch(() => ({}));

      if (data.success) {
        setShowSendModal(false);
        setSelectedGroupForRequest(null);
        await fetchAllData(userId);
        setError(null);
      } else {
        setError(data.message || 'Failed to send request');
      }
    } catch (err) {
      setError('Failed to send request');
      console.error('Error sending request:', err);
    }
  };

  // Filter requests
  const filteredReceived = filterStatus === 'all' 
    ? receivedRequests 
    : receivedRequests.filter(r => r.status === filterStatus);

  const filteredSent = filterStatus === 'all' 
    ? sentRequests 
    : sentRequests.filter(r => r.status === filterStatus);

  // Get recently processed requests (accepted/rejected from last 7 days)
  const allProcessed = [...receivedRequests.filter(r => r.status !== 'pending'), ...sentRequests.filter(r => r.status !== 'pending')];
  const recentlyProcessed = allProcessed.slice(0, 3);

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return then.toLocaleDateString();
  };

  // Get user avatar initials
  const getInitials = (firstName, lastName) => {
    return ((firstName?.[0] || 'U') + (lastName?.[0] || 'U')).toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = ['from-indigo-500 to-purple-500', 'from-blue-500 to-cyan-500', 'from-emerald-500 to-teal-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500'];
    const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getAccentClasses = (seedSource) => {
    const seed = `${seedSource || ''}`.length % 4;
    const variants = [
      {
        bar: 'from-sky-400 via-cyan-400 to-indigo-500',
        icon: isDarkMode ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-100 text-sky-700',
        chip: isDarkMode ? 'bg-sky-500/15 text-sky-200' : 'bg-sky-100 text-sky-700',
      },
      {
        bar: 'from-violet-400 via-fuchsia-400 to-rose-500',
        icon: isDarkMode ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-100 text-violet-700',
        chip: isDarkMode ? 'bg-violet-500/15 text-violet-200' : 'bg-violet-100 text-violet-700',
      },
      {
        bar: 'from-emerald-400 via-teal-400 to-cyan-500',
        icon: isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700',
        chip: isDarkMode ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-100 text-emerald-700',
      },
      {
        bar: 'from-amber-400 via-orange-400 to-rose-500',
        icon: isDarkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-700',
        chip: isDarkMode ? 'bg-amber-500/15 text-amber-200' : 'bg-amber-100 text-amber-700',
      },
    ];

    return variants[seed];
  };

  const getStatusChipClass = (status) => {
    if (status === 'accepted') {
      return isDarkMode ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700';
    }
    if (status === 'rejected') {
      return isDarkMode ? 'bg-rose-500/15 text-rose-300' : 'bg-rose-100 text-rose-700';
    }
    return isDarkMode ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-100 text-indigo-700';
  };

  const activeTabMeta = {
    received: {
      title: 'Received Requests',
      count: filteredReceived.length,
      empty: 'No requests received yet.',
    },
    sent: {
      title: 'Sent Requests',
      count: filteredSent.length,
      empty: 'No requests sent yet.',
    },
    browse: {
      title: 'Browse Groups',
      count: groups.length,
      empty: 'No groups available right now.',
    },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto relative p-8">
        <div className="pointer-events-none absolute -top-10 left-8 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-16 right-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className={`relative overflow-hidden rounded-[28px] border mb-8 ${isDarkMode ? 'border-slate-800 bg-slate-950/65' : 'border-slate-200 bg-white/85'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_40%)]" />
          <div className="relative p-6 md:p-8 lg:p-10 flex flex-col gap-6">
            <div className="max-w-2xl">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Collaboration hub
              </div>
              <h1 className={`mt-4 text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Requests & Invites
              </h1>
              <p className={`mt-3 max-w-xl text-base md:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage received requests, sent invites, and discover groups with the same visual language as your Groups dashboard.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className={`rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Received</div>
                <div className={`mt-1 text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{receivedRequests.length}</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Sent</div>
                <div className={`mt-1 text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{sentRequests.length}</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Groups</div>
                <div className={`mt-1 text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{groups.length}</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 ${isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Processed</div>
                <div className={`mt-1 text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{recentlyProcessed.length}</div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className={`inline-flex rounded-2xl border p-1.5 ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
                {[
                  { id: 'received', label: 'Received' },
                  { id: 'sent', label: 'Sent' },
                  { id: 'browse', label: 'Browse' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setFilterStatus('all');
                    }}
                    className={`min-w-[88px] rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? isDarkMode
                          ? 'bg-slate-800 text-slate-100 shadow-inner'
                          : 'bg-slate-100 text-slate-900 shadow-sm'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${isDarkMode ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-600 border border-slate-200'}`}>
                <Info size={14} className={isDarkMode ? 'text-violet-300' : 'text-violet-600'} />
                Duplicate requests to the same entity are automatically merged.
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white'}`}>
          <div className={`px-6 md:px-8 py-4 border-b flex items-center justify-between gap-4 ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
            <h3 className={`text-base md:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              {activeTabMeta[activeTab].title}
            </h3>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <Layers className="h-3.5 w-3.5" />
              {activeTabMeta[activeTab].count} items
            </div>
          </div>

          <div className="p-5 md:p-6 space-y-4">
          {error && (
            <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${isDarkMode ? 'bg-rose-950/30 border-rose-900/60' : 'bg-rose-50 border-rose-200'}`}>
              <AlertCircle size={18} className="text-rose-500 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-rose-200' : 'text-rose-700'}`}>Error</p>
                <p className={`text-sm ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>{error}</p>
              </div>
              <button onClick={() => setError(null)} className={`${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>
                <X size={18} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <>
              {activeTab === 'received' && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredReceived.length === 0 ? (
                    <div className={`md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed px-6 py-16 text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
                      <Bell size={42} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      <p className={`text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{activeTabMeta.received.empty}</p>
                    </div>
                  ) : (
                    filteredReceived.map((request) => (
                      <article
                        key={request._id}
                        className={`group relative overflow-hidden rounded-[24px] border transition-all duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]'}`}
                      >
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getAccentClasses(request.groupId?.title || request._id).bar} opacity-80`} />
                        <div className="p-5 md:p-6 h-full flex flex-col">
                          <div className="flex items-start gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getAccentClasses(request.groupId?.title || request._id).icon}`}>
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-lg font-bold leading-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                                {request.groupId?.title || 'Group Invitation'}
                              </h4>
                              <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusChipClass(request.status)}`}>
                                {request.status || 'pending'}
                              </div>
                            </div>
                          </div>

                          <p className={`mt-4 text-sm leading-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Invited by {request.fromUser?.firstName || 'Unknown User'} • {formatTimeAgo(request.createdAt)}
                          </p>

                          <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                            <button
                              onClick={() => handleReject(request._id)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${isDarkMode ? 'border-rose-800 text-rose-300 hover:bg-rose-950/40' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                            >
                              <XCircle size={16} /> Reject
                            </button>
                            <button
                              onClick={() => handleAccept(request._id)}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                            >
                              <CheckCircle size={16} /> Accept
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'sent' && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSent.length === 0 ? (
                    <div className={`md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed px-6 py-16 text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
                      <Bell size={42} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      <p className={`text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{activeTabMeta.sent.empty}</p>
                    </div>
                  ) : (
                    filteredSent.map((request) => (
                      <article
                        key={request._id}
                        className={`group relative overflow-hidden rounded-[24px] border transition-all duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]'}`}
                      >
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getAccentClasses(request.groupId?.title || request._id).bar} opacity-80`} />
                        <div className="p-5 md:p-6 h-full flex flex-col">
                          <div className="flex items-start gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getAccentClasses(request.groupId?.title || request._id).icon}`}>
                              <Send className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-lg font-bold leading-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                                {request.groupId?.title || 'Unknown Group'}
                              </h4>
                              <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusChipClass(request.status)}`}>
                                {request.status || 'pending'}
                              </div>
                            </div>
                          </div>

                          <p className={`mt-4 line-clamp-2 text-sm leading-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {request.message || 'Join request'} • {formatTimeAgo(request.createdAt)}
                          </p>

                          <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                            <button
                              onClick={() => handleCancel(request._id)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${isDarkMode ? 'border-rose-800 text-rose-300 hover:bg-rose-950/40' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                            >
                              <XCircle size={16} /> Cancel
                            </button>
                            <button
                              onClick={() => handleEditMessage(request._id)}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                            >
                              <Plus size={16} /> Connect
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'browse' && (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {groups.length === 0 ? (
                    <div className={`md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed px-6 py-16 text-center ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
                      <Bell size={42} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                      <p className={`text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{activeTabMeta.browse.empty}</p>
                    </div>
                  ) : (
                    groups.map((group) => {
                      const userId = localStorage.getItem('userId');
                      const alreadySentRequest = sentRequests.some((r) => r.groupId?._id === group._id && r.status === 'pending');
                      const alreadyMember = group.members?.some((memberId) => memberId === userId || memberId._id === userId);

                      return (
                        <article
                          key={group._id}
                          className={`group relative overflow-hidden rounded-[24px] border transition-all duration-300 ${isDarkMode ? 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]'}`}
                        >
                          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getAccentClasses(group.title).bar} opacity-80`} />
                          <div className="p-5 md:p-6 h-full flex flex-col">
                            <div className="flex items-start gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getAccentClasses(group.title).icon}`}>
                                <Layers className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className={`text-lg font-bold leading-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                                  {group.title}
                                </h4>
                                <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getAccentClasses(group.title).chip}`}>
                                  {group.members?.length || 0}/{group.memberLimit || 0} members
                                </div>
                              </div>
                            </div>

                            <p className={`mt-4 line-clamp-3 text-sm leading-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {group.description || 'No description provided.'}
                            </p>

                            <div className="mt-auto pt-5">
                              <button
                                onClick={() => {
                                  setSelectedGroupForRequest(group._id);
                                  setShowSendModal(true);
                                }}
                                disabled={alreadySentRequest || alreadyMember}
                                className={`inline-flex w-full justify-center items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${alreadySentRequest || alreadyMember ? (isDarkMode ? 'cursor-not-allowed bg-slate-800 text-slate-500' : 'cursor-not-allowed bg-slate-100 text-slate-400') : (isDarkMode ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200')}`}
                              >
                                <Plus size={16} />
                                {alreadyMember ? 'Member' : alreadySentRequest ? 'Sent' : 'Connect'}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              )}

              {recentlyProcessed.length > 0 && (
                <div className="pt-8">
                  <h2 className={`mb-4 text-sm font-semibold uppercase tracking-[0.16em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Recently Processed
                  </h2>
                  <div className="space-y-3">
                    {recentlyProcessed.map((request) => {
                      const displayName = request.groupId?.title || `${request.fromUser?.firstName || 'Unknown'} ${request.fromUser?.lastName || 'User'}`.trim();
                      const avatarLabel = request.groupId?.title?.[0] || getInitials(request.fromUser?.firstName, request.fromUser?.lastName);

                      return (
                        <div
                          key={request._id}
                          className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${isDarkMode ? 'bg-black/45 border-slate-900' : 'bg-slate-900 border-slate-800'}`}
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-200">
                              {avatarLabel}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-[15px] font-semibold text-slate-100">
                                  {displayName}
                                </h3>
                                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${request.status === 'accepted' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                                  {request.status?.toUpperCase()}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm text-slate-400">
                                {request.status === 'accepted' ? 'You joined this project' : 'Request was declined'} • {formatTimeAgo(request.updatedAt || request.createdAt)}
                              </p>
                            </div>
                          </div>

                          <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white">
                            View Project
                            <span aria-hidden="true">→</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {showSendModal && (
          <SendRequestModal
            groupId={selectedGroupForRequest}
            onSend={(message) => handleSendRequest(selectedGroupForRequest, message)}
            onClose={() => {
              setShowSendModal(false);
              setSelectedGroupForRequest(null);
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
}

