import React, { useState, useEffect } from 'react';
import { InboxIcon, SendIcon, AlertCircle, Loader, BookOpen, Plus, X, Edit2, Trash2 } from 'lucide-react';
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
      setGroups(groupsData.groups || []);

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
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Requests & Invitations
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
            Manage your group join requests and invitations with messages
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            {[
              { id: 'received', label: 'Received', icon: '📥', count: receivedRequests.length },
              { id: 'sent', label: 'Sent', icon: '📤', count: sentRequests.length },
              { id: 'browse', label: 'Browse Groups', icon: '📚', count: groups.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-semibold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-600 text-blue-600'
                    : isDarkMode
                    ? 'border-transparent text-slate-400 hover:text-slate-300'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Error Alert */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              isDarkMode 
                ? 'bg-red-900/50 border border-red-700' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`font-semibold ${isDarkMode ? 'text-red-100' : 'text-red-800'}`}>
                  Error
                </p>
                <p className={isDarkMode ? 'text-red-200' : 'text-red-700'}>
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className={`ml-auto px-3 py-1 rounded text-sm font-semibold ${
                  isDarkMode 
                    ? 'text-red-200 hover:bg-red-900' 
                    : 'text-red-700 hover:bg-red-100'
                }`}
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading...</p>
            </div>
          )}

          {/* Content */}
          {!loading && (
            <>
              {/* Filter Buttons (except for browse tab) */}
              {activeTab !== 'browse' && (
                <div className={`flex gap-3 mb-8 flex-wrap p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-white border-slate-200'
                }`}>
                  {filterButtons.map(btn => (
                    <button
                      key={btn.value}
                      onClick={() => setFilterStatus(btn.value)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        filterStatus === btn.value
                          ? isDarkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-500 text-white'
                          : isDarkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Received Requests Tab */}
              {activeTab === 'received' && (
                <div>
                  <div className="mb-6 flex items-center gap-3">
                    <InboxIcon size={28} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                    <div>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Requests Received
                      </h2>
                      <p className={isDarkMode ? 'text-slate-400 text-sm' : 'text-slate-600 text-sm'}>
                        {receivedStats.pending} pending • {receivedStats.accepted} accepted
                      </p>
                    </div>
                  </div>

                  {filteredReceived.length === 0 ? (
                    <div className={`text-center py-16 rounded-lg border-2 border-dashed ${
                      isDarkMode 
                        ? 'border-slate-700 bg-slate-800/50' 
                        : 'border-slate-300 bg-slate-100'
                    }`}>
                      <InboxIcon size={48} className={`mx-auto mb-4 ${
                        isDarkMode ? 'text-slate-600' : 'text-slate-400'
                      }`} />
                      <p className={`text-lg font-semibold ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        No requests received
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
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

              {/* Sent Requests Tab */}
              {activeTab === 'sent' && (
                <div>
                  <div className="mb-6 flex items-center gap-3">
                    <SendIcon size={28} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                    <div>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Sent Requests
                      </h2>
                      <p className={isDarkMode ? 'text-slate-400 text-sm' : 'text-slate-600 text-sm'}>
                        {sentStats.pending} pending • {sentStats.accepted} accepted
                      </p>
                    </div>
                  </div>

                  {filteredSent.length === 0 ? (
                    <div className={`text-center py-16 rounded-lg border-2 border-dashed ${
                      isDarkMode 
                        ? 'border-slate-700 bg-slate-800/50' 
                        : 'border-slate-300 bg-slate-100'
                    }`}>
                      <SendIcon size={48} className={`mx-auto mb-4 ${
                        isDarkMode ? 'text-slate-600' : 'text-slate-400'
                      }`} />
                      <p className={`text-lg font-semibold ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        No requests sent
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredSent.map(request => (
                        <div key={request._id}>
                          {editingRequestId === request._id ? (
                            // Edit Message Form
                            <div className={`border rounded-lg p-6 ${
                              isDarkMode 
                                ? 'bg-slate-800 border-slate-700' 
                                : 'bg-white border-slate-200'
                            }`}>
                              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Edit Message
                              </h3>
                              <textarea
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                className={`w-full p-3 rounded border mb-4 ${
                                  isDarkMode
                                    ? 'bg-slate-700 border-slate-600 text-white'
                                    : 'bg-slate-100 border-slate-300 text-slate-900'
                                }`}
                                rows="4"
                                placeholder="Enter your message..."
                              />
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleUpdateMessage(request._id)}
                                  className={`flex-1 px-4 py-2 rounded font-semibold transition-all ${
                                    isDarkMode
                                      ? 'bg-green-600 hover:bg-green-700 text-white'
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                                  }`}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingRequestId(null);
                                    setEditMessage('');
                                  }}
                                  className={`flex-1 px-4 py-2 rounded font-semibold transition-all ${
                                    isDarkMode
                                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                      : 'bg-slate-300 hover:bg-slate-400 text-slate-900'
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Request Card with Edit/Delete
                            <SentRequestCard
                              request={request}
                              onCancel={handleCancel}
                              onEdit={() => {
                                setEditingRequestId(request._id);
                                setEditMessage(request.message || '');
                              }}
                              isDarkMode={isDarkMode}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Browse Groups Tab */}
              {activeTab === 'browse' && (
                <div>
                  <div className="mb-6 flex items-center gap-3">
                    <BookOpen size={28} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                    <div>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Available Groups
                      </h2>
                      <p className={isDarkMode ? 'text-slate-400 text-sm' : 'text-slate-600 text-sm'}>
                        Browse all groups and send join requests
                      </p>
                    </div>
                  </div>

                  {groups.length === 0 ? (
                    <div className={`text-center py-16 rounded-lg border-2 border-dashed ${
                      isDarkMode 
                        ? 'border-slate-700 bg-slate-800/50' 
                        : 'border-slate-300 bg-slate-100'
                    }`}>
                      <BookOpen size={48} className={`mx-auto mb-4 ${
                        isDarkMode ? 'text-slate-600' : 'text-slate-400'
                      }`} />
                      <p className={`text-lg font-semibold ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        No groups available
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {groups.map(group => {
                        const alreadySentRequest = sentRequests.some(
                          r => r.groupId?._id === group._id && r.status === 'pending'
                        );
                        const alreadyMember = group.members?.includes(localStorage.getItem('userId'));
                        
                        return (
                          <div
                            key={group._id}
                            className={`rounded-lg p-5 border transition-all ${
                              isDarkMode
                                ? 'bg-slate-800 border-slate-700 hover:border-blue-500'
                                : 'bg-white border-slate-200 hover:border-blue-500'
                            }`}
                          >
                            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {group.title}
                            </h3>
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {group.description}
                            </p>
                            
                            <div className={`mb-4 text-sm space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              <div>
                                📍 <strong>Members:</strong> {group.members?.length || 0} / {group.memberLimit}
                              </div>
                              {group.requiredSkills && group.requiredSkills.length > 0 && (
                                <div>
                                  <strong>Required Skills:</strong>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {group.requiredSkills.map(skill => (
                                      <span
                                        key={skill}
                                        className={`px-2 py-1 rounded text-xs ${
                                          isDarkMode
                                            ? 'bg-blue-900 text-blue-200'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setSelectedGroupForRequest(group._id);
                                setShowSendModal(true);
                              }}
                              disabled={alreadySentRequest || alreadyMember}
                              className={`w-full px-4 py-2 rounded font-semibold transition-all flex items-center justify-center gap-2 ${
                                alreadySentRequest || alreadyMember
                                  ? isDarkMode
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                  : isDarkMode
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              <Plus size={18} />
                              {alreadyMember 
                                ? 'Already Member'
                                : alreadySentRequest 
                                ? 'Request Sent'
                                : 'Send Request'}
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
      </div>
    </div>
  );
}
