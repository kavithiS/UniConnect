import React, { useState, useEffect } from 'react';
import { InboxIcon, SendIcon, AlertCircle, Loader, BookOpen, Plus, X, Edit2, Trash2, TrendingUp, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ReceivedRequestCard from '../components/ReceivedRequestCard';
import SentRequestCard from '../components/SentRequestCard';
import SendRequestModal from '../components/SendRequestModal';

const API_BASE = 'http://localhost:5000';

export default function RequestsPage() {
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

  // Initialize and fetch
  useEffect(() => {
    const user = localStorage.getItem('userId');
    if (!user) {
      setError('User ID not found. Please log in.');
      return;
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('userId');
      
      // Fetch received requests
      const receivedRes = await fetch(
        `${API_BASE}/api/requests/received?userId=${userId}`
      );
      if (!receivedRes.ok) throw new Error('Failed to fetch received requests');
      const receivedData = await receivedRes.json();
      setReceivedRequests(receivedData.requests || []);

      // Fetch sent requests
      const sentRes = await fetch(
        `${API_BASE}/api/requests/sent?userId=${userId}`
      );
      if (!sentRes.ok) throw new Error('Failed to fetch sent requests');
      const sentData = await sentRes.json();
      setSentRequests(sentData.requests || []);

      // Fetch all groups
      const groupsRes = await fetch(`${API_BASE}/api/groups`);
      if (!groupsRes.ok) throw new Error('Failed to fetch groups');
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
        `${API_BASE}/api/requests/${requestId}/accept`,
        { method: 'PUT' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchAllData();
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
        `${API_BASE}/api/requests/${requestId}/reject`,
        { method: 'PUT' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchAllData();
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
        `${API_BASE}/api/requests/${requestId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchAllData();
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete request');
      console.error('Error deleting request:', err);
    }
  };

  const handleEditMessage = (requestId) => {
    const request = sentRequests.find(r => r._id === requestId);
    if (request) {
      setEditingRequestId(requestId);
      setEditMessage(request.message || '');
    }
  };

  const handleUpdateMessage = async (requestId) => {
    if (!editMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/requests/${requestId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: editMessage })
        }
      );
      const data = await response.json();
      
      if (data.success) {
        await fetchAllData();
        setEditingRequestId(null);
        setEditMessage('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update message');
      console.error('Error updating message:', err);
    }
  };

  const handleSendRequest = async (groupId, message) => {
    try {
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          requestType: 'join',
          message,
          fromUserId: userId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowSendModal(false);
        setSelectedGroupForRequest(null);
        await fetchAllData();
        setError(null);
      } else {
        setError(data.message);
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

  // Stats
  const receivedStats = {
    pending: receivedRequests.filter(r => r.status === 'pending').length,
    accepted: receivedRequests.filter(r => r.status === 'accepted').length,
    rejected: receivedRequests.filter(r => r.status === 'rejected').length,
  };

  const sentStats = {
    pending: sentRequests.filter(r => r.status === 'pending').length,
    accepted: sentRequests.filter(r => r.status === 'accepted').length,
    rejected: sentRequests.filter(r => r.status === 'rejected').length,
  };

  const filterButtons = [
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-b ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
        <h1 className={`text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'} mb-2`}>Requests & Invitations</h1>
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Manage your group join requests and invitations</p>
      </div>

      <div className="px-8 py-8">
        {/* Minimal Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {/* Total Requests */}
          <div className={`border rounded-lg p-4 transition-all ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-700' : 'bg-white/50 border-slate-200/50 hover:border-slate-300'}`}>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2`}>Total</p>
            <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sentRequests.length + receivedRequests.length}</p>
          </div>

          {/* Pending */}
          <div className={`border rounded-lg p-4 transition-all ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-700' : 'bg-white/50 border-slate-200/50 hover:border-slate-300'}`}>
            <p className={`text-xs font-medium uppercase tracking-wider text-amber-600 mb-2`}>Pending</p>
            <p className={`text-2xl font-semibold text-amber-500`}>{sentStats.pending + receivedStats.pending}</p>
          </div>

          {/* Accepted */}
          <div className={`border rounded-lg p-4 transition-all ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-700' : 'bg-white/50 border-slate-200/50 hover:border-slate-300'}`}>
            <p className={`text-xs font-medium uppercase tracking-wider text-emerald-600 mb-2`}>Accepted</p>
            <p className={`text-2xl font-semibold text-emerald-500`}>{sentStats.accepted + receivedStats.accepted}</p>
          </div>

          {/* Groups */}
          <div className={`border rounded-lg p-4 transition-all ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-700' : 'bg-white/50 border-slate-200/50 hover:border-slate-300'}`}>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-2`}>Groups</p>
            <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{groups.length}</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`mb-8 p-4 rounded-lg flex items-start gap-3 ${
            isDarkMode 
              ? 'bg-red-900/20 border border-red-800/50' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className={`font-semibold ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                Error
              </p>
              <p className={isDarkMode ? 'text-red-300' : 'text-red-700'}>
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className={`ml-auto px-3 py-1 rounded text-sm font-semibold ${
                isDarkMode 
                  ? 'text-red-200 hover:bg-red-900/30' 
                  : 'text-red-700 hover:bg-red-100'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Minimal Tab Navigation */}
        <div className="mb-8">
          <div className={`flex gap-1 border-b ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
            {[
              { id: 'received', label: 'Received', count: receivedRequests.length },
              { id: 'sent', label: 'Sent', count: sentRequests.length },
              { id: 'browse', label: 'Browse', count: groups.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setFilterStatus('all');
                }}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'border-slate-300 text-slate-200'
                      : 'border-slate-900 text-slate-900'
                    : isDarkMode
                    ? 'border-transparent text-slate-500 hover:text-slate-400'
                    : 'border-transparent text-slate-500 hover:text-slate-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-900'
                        : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Filter Buttons */}
        {activeTab !== 'browse' && (
          <div className="mb-6 flex gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilterStatus(btn.value)}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  filterStatus === btn.value
                    ? isDarkMode
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-slate-900 text-white'
                    : isDarkMode
                    ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Content Sections */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <>
            {/* Received Requests */}
            {activeTab === 'received' && (
              <div>
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Received Requests
                  </h2>
                </div>
                {filteredReceived.length === 0 ? (
                  <div className={`text-center py-16 rounded-lg border-2 border-dashed ${
                    isDarkMode 
                      ? 'border-slate-700 bg-slate-800/30' 
                      : 'border-slate-300 bg-slate-50'
                  }`}>
                    <InboxIcon size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      No requests received yet
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredReceived.map(request => (
                      <ReceivedRequestCard
                        key={request._id}
                        request={request}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sent Requests */}
            {activeTab === 'sent' && (
              <div>
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Sent Requests
                  </h2>
                </div>
                {filteredSent.length === 0 ? (
                  <div className={`text-center py-16 rounded-lg border-2 border-dashed ${
                    isDarkMode 
                      ? 'border-slate-700 bg-slate-800/30' 
                      : 'border-slate-300 bg-slate-50'
                  }`}>
                    <SendIcon size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      No requests sent yet
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSent.map(request => (
                      <SentRequestCard
                        key={request._id}
                        request={request}
                        onEdit={() => handleEditMessage(request._id)}
                        onDelete={handleCancel}
                        editingId={editingRequestId}
                        editMessage={editMessage}
                        onEditChange={(e) => setEditMessage(e.target.value)}
                        onEditSubmit={handleUpdateMessage}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Browse Groups */}
            {activeTab === 'browse' && (
              <div>
                <div className="mb-6">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Available Groups
                  </h2>
                </div>
                {groups.length === 0 ? (
                  <div className={`text-center py-16 rounded-lg border-2 border-dashed ${
                    isDarkMode 
                      ? 'border-slate-700 bg-slate-800/30' 
                      : 'border-slate-300 bg-slate-50'
                  }`}>
                    <BookOpen size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      No groups available
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map(group => {
                      const userId = localStorage.getItem('userId');
                      const alreadySentRequest = sentRequests.some(
                        r => r.groupId?._id === group._id && r.status === 'pending'
                      );
                      const alreadyMember = group.members?.some(memberId => memberId === userId || memberId._id === userId);
                      
                      return (
                        <div
                          key={group._id}
                          className={`border rounded-lg p-4 transition-all ${
                            isDarkMode
                              ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-700'
                              : 'bg-white/50 border-slate-200/50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>
                                {group.title}
                              </h3>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} truncate`}>
                                {group.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`mb-3 text-xs space-y-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <div className="flex items-center justify-between">
                              <span>Members:</span>
                              <span className="font-medium">{group.members?.length || 0}/{group.memberLimit}</span>
                            </div>
                            {group.requiredSkills && group.requiredSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-2">
                                {group.requiredSkills.slice(0, 3).map(skill => (
                                  <span
                                    key={skill}
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      isDarkMode
                                        ? 'bg-slate-700/50 text-slate-300'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setSelectedGroupForRequest(group._id);
                              setShowSendModal(true);
                            }}
                            disabled={alreadySentRequest || alreadyMember}
                            className={`w-full px-3 py-2 rounded text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                              alreadySentRequest || alreadyMember
                                ? isDarkMode
                                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                : isDarkMode
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            <Plus size={14} />
                            {alreadyMember ? 'Member' : alreadySentRequest ? 'Sent' : 'Join'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Send Request Modal */}
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
  );
}

