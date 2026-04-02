# React Frontend Implementation Guide

## FOLDER STRUCTURE SETUP

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── groups/
│   │   ├── GroupsList.jsx          # Discover groups
│   │   ├── GroupDetails.jsx        # Single group view
│   │   ├── GroupCard.jsx           # Group card component
│   │   ├── GroupForm.jsx           # Create/Edit group
│   │   └── CreateGroupModal.jsx
│   ├── requests/
│   │   ├── JoinRequestForm.jsx     # Send join request
│   │   ├── ReceivedRequests.jsx    # Inbox - received
│   │   ├── SentRequests.jsx        # Sent requests
│   │   ├── RequestCard.jsx         # Single request card
│   │   ├── RequestDetails.jsx      # Full request view
│   │   └── InvitationForm.jsx      # Send invitation
│   └── profile/
│       ├── UserProfile.jsx
│       └── EditProfile.jsx
├── pages/
│   ├── GroupsPage.jsx              # Groups discovery
│   ├── RequestsPage.jsx            # Requests inbox (main hub)
│   ├── MyGroupsPage.jsx            # Groups I created
│   └── ProfilePage.jsx
├── hooks/
│   ├── useRequests.js              # Custom hook for requests
│   ├── useGroups.js                # Custom hook for groups
│   └── useSkillMatch.js            # Custom hook for skill calculation
├── context/
│   └── RequestContext.jsx          # Global request state (optional)
├── services/
│   ├── api.js                      # Centralized API calls
│   ├── requestApi.js               # Request-specific API
│   └── groupApi.js                 # Group-specific API
├── utils/
│   ├── skillMatcher.js             # Skill matching logic (frontend)
│   └── helpers.js                  # Helper functions
└── App.jsx
```

---

## CUSTOM HOOKS

### hooks/useRequests.js
```javascript
import { useState, useEffect } from 'react';
import { requestApi } from '../services/requestApi';

export const useRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch received requests
  const fetchReceivedRequests = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestApi.getReceivedRequests(status);
      setReceivedRequests(data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sent requests
  const fetchSentRequests = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestApi.getSentRequests(status);
      setSentRequests(data.requests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send request
  const sendRequest = async (groupId, requestType, message = '', toUserId = null) => {
    try {
      setLoading(true);
      setError(null);
      const payload = { groupId, requestType, message };
      if (toUserId) payload.toUserId = toUserId;
      
      const response = await requestApi.sendRequest(payload);
      await fetchSentRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Accept request
  const acceptRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApi.acceptRequest(requestId);
      await fetchReceivedRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject request
  const rejectRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApi.rejectRequest(requestId);
      await fetchReceivedRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel request
  const cancelRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApi.cancelRequest(requestId);
      await fetchSentRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load both on mount
  useEffect(() => {
    fetchReceivedRequests();
    fetchSentRequests();
  }, []);

  return {
    receivedRequests,
    sentRequests,
    loading,
    error,
    fetchReceivedRequests,
    fetchSentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest
  };
};
```

### hooks/useGroups.js
```javascript
import { useState, useEffect } from 'react';
import { groupApi } from '../services/groupApi';

export const useGroups = () => {
  const [allGroups, setAllGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all active groups
  const fetchAllGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupApi.getAllGroups();
      setAllGroups(data.groups);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups created by user
  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupApi.getMyGroups();
      setMyGroups(data.groups);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new group
  const createGroup = async (groupData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupApi.createGroup(groupData);
      await fetchMyGroups(); // Refresh
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGroups();
    fetchMyGroups();
  }, []);

  return {
    allGroups,
    myGroups,
    loading,
    error,
    fetchAllGroups,
    fetchMyGroups,
    createGroup
  };
};
```

### hooks/useSkillMatch.js
```javascript
import { useMemo } from 'react';

export const useSkillMatch = (userSkills, requiredSkills) => {
  const matchScore = useMemo(() => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;

    const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    const matchedCount = requiredSkillsLower.filter(skill =>
      userSkillsLower.includes(skill)
    ).length;

    return Math.round((matchedCount / requiredSkillsLower.length) * 100);
  }, [userSkills, requiredSkills]);

  return matchScore;
};
```

---

## SERVICES / API CALLS

### services/requestApi.js
```javascript
import api from './api';

export const requestApi = {
  // Send request or invitation
  sendRequest: async (payload) => {
    try {
      const response = await api.post('/api/requests', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get received requests
  getReceivedRequests: async (status = null) => {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await api.get(`/api/requests/received${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get sent requests
  getSentRequests: async (status = null) => {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await api.get(`/api/requests/sent${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Accept request
  acceptRequest: async (requestId) => {
    try {
      const response = await api.put(`/api/requests/${requestId}/accept`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject request
  rejectRequest: async (requestId) => {
    try {
      const response = await api.put(`/api/requests/${requestId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel request
  cancelRequest: async (requestId) => {
    try {
      const response = await api.delete(`/api/requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
```

### services/groupApi.js
```javascript
import api from './api';

export const groupApi = {
  // Get all groups
  getAllGroups: async () => {
    try {
      const response = await api.get('/api/groups');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get group by ID
  getGroupById: async (groupId) => {
    try {
      const response = await api.get(`/api/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get my groups (created by user)
  getMyGroups: async () => {
    try {
      const response = await api.get('/api/groups/created');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get groups I've joined
  getJoinedGroups: async () => {
    try {
      const response = await api.get('/api/groups/joined');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create group
  createGroup: async (groupData) => {
    try {
      const response = await api.post('/api/groups', groupData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update group
  updateGroup: async (groupId, groupData) => {
    try {
      const response = await api.put(`/api/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Close/archive group
  closeGroup: async (groupId) => {
    try {
      const response = await api.delete(`/api/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
```

---

## REACT COMPONENTS

### components/groups/GroupsList.jsx
```javascript
import React, { useState } from 'react';
import { useGroups } from '../../hooks/useGroups';
import { useAuth } from '../../hooks/useAuth'; // Auth hook
import GroupCard from './GroupCard';
import CreateGroupModal from './CreateGroupModal';

export default function GroupsList() {
  const { allGroups, loading, error, createGroup } = useGroups();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  // Filter groups
  const filteredGroups = allGroups.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !filterSkill || group.requiredSkills.includes(filterSkill);
    return matchesSearch && matchesSkill;
  });

  const allSkills = Array.from(new Set(allGroups.flatMap(g => g.requiredSkills)));

  if (loading) return <div className="text-center py-8">Loading groups...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Discover Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Create Group
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <select
          value={filterSkill}
          onChange={(e) => setFilterSkill(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">Filter by skill...</option>
          {allSkills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <GroupCard key={group._id} group={group} currentUser={user} />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No groups found. Try adjusting your filters or create one!
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createGroup}
        />
      )}
    </div>
  );
}
```

### components/groups/GroupCard.jsx
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSkillMatch } from '../../hooks/useSkillMatch';

export default function GroupCard({ group, currentUser }) {
  const navigate = useNavigate();
  const skillMatch = useSkillMatch(currentUser?.skills, group.requiredSkills);
  const availableSlots = group.memberLimit - group.members.length;
  const isMember = group.members.includes(currentUser?._id);

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition bg-white">
      <h3 className="text-xl font-bold mb-2">{group.title}</h3>
      
      <p className="text-gray-600 text-sm mb-3">{group.description.substring(0, 100)}...</p>
      
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-700">Members:</span>
          <span className="font-semibold">{group.members.length}/{group.memberLimit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Available Slots:</span>
          <span className="font-semibold">{availableSlots}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Your Match:</span>
          <span className={`font-semibold ${skillMatch >= 75 ? 'text-green-600' : skillMatch >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {skillMatch}%
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-600 font-semibold">Required Skills:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {group.requiredSkills.map(skill => (
            <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/groups/${group._id}`)}
          className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 text-sm"
        >
          View Details
        </button>
        <button
          onClick={() => navigate(`/groups/${group._id}/request`)}
          disabled={isMember || availableSlots === 0}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMember ? 'Member' : 'Join Request'}
        </button>
      </div>
    </div>
  );
}
```

### components/requests/ReceivedRequests.jsx
```javascript
import React, { useState } from 'react';
import { useRequests } from '../../hooks/useRequests';
import RequestCard from './RequestCard';

export default function ReceivedRequests() {
  const { receivedRequests, loading, error, acceptRequest, rejectRequest } = useRequests();
  const [filterStatus, setFilterStatus] = useState('pending');

  const filteredRequests = filterStatus === 'all' 
    ? receivedRequests 
    : receivedRequests.filter(r => r.status === filterStatus);

  if (loading) return <div className="text-center py-8">Loading requests...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const stats = {
    pending: receivedRequests.filter(r => r.status === 'pending').length,
    accepted: receivedRequests.filter(r => r.status === 'accepted').length,
    rejected: receivedRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Requests Received</h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded ${filterStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus('accepted')}
          className={`px-4 py-2 rounded ${filterStatus === 'accepted' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded ${filterStatus === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Rejected ({stats.rejected})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {filterStatus === 'all' ? '' : filterStatus} requests
          </div>
        ) : (
          filteredRequests.map(request => (
            <RequestCard
              key={request._id}
              request={request}
              type="received"
              onAccept={() => acceptRequest(request._id)}
              onReject={() => rejectRequest(request._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

### components/requests/SentRequests.jsx
```javascript
import React, { useState } from 'react';
import { useRequests } from '../../hooks/useRequests';
import RequestCard from './RequestCard';

export default function SentRequests() {
  const { sentRequests, loading, error, cancelRequest } = useRequests();
  const [filterStatus, setFilterStatus] = useState('pending');

  const filteredRequests = filterStatus === 'all' 
    ? sentRequests 
    : sentRequests.filter(r => r.status === filterStatus);

  if (loading) return <div className="text-center py-8">Loading requests...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  const stats = {
    pending: sentRequests.filter(r => r.status === 'pending').length,
    accepted: sentRequests.filter(r => r.status === 'accepted').length,
    rejected: sentRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Requests Sent</h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded ${filterStatus === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus('accepted')}
          className={`px-4 py-2 rounded ${filterStatus === 'accepted' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded ${filterStatus === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Rejected ({stats.rejected})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {filterStatus === 'all' ? '' : filterStatus} sent requests
          </div>
        ) : (
          filteredRequests.map(request => (
            <RequestCard
              key={request._id}
              request={request}
              type="sent"
              onCancel={() => cancelRequest(request._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

### components/requests/RequestCard.jsx
```javascript
import React, { useState } from 'react';

export default function RequestCard({ request, type, onAccept, onReject, onCancel }) {
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
    pending: 'bg-yellow-50 border-yellow-200',
    accepted: 'bg-green-50 border-green-200',
    rejected: 'bg-red-50 border-red-200',
  };

  const statusBadgeColor = {
    pending: 'bg-yellow-200 text-yellow-800',
    accepted: 'bg-green-200 text-green-800',
    rejected: 'bg-red-200 text-red-800',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${statusColor[request.status]}`}>
      {error && <div className="text-red-600 text-sm mb-4">Error: {error}</div>}

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">
            {type === 'received' 
              ? `${request.from.name} wants to join` 
              : `Requested to join`}
          </h3>
          <p className="text-gray-700 font-semibold">{request.groupId.title}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeColor[request.status]}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Skill Match:</span>
          <span className={`font-semibold ${request.skillMatchScore >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
            {request.skillMatchScore}%
          </span>
        </div>
        {request.message && (
          <div>
            <span className="text-gray-600">Message:</span>
            <p className="text-gray-700 italic mt-1">"{request.message}"</p>
          </div>
        )}
        <div className="text-gray-500 text-xs">
          Sent: {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>

      {type === 'received' && request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            ✓ Accept
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            ✗ Reject
          </button>
        </div>
      )}

      {type === 'sent' && request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
          >
            Cancel Request
          </button>
        </div>
      )}
    </div>
  );
}
```

### components/requests/JoinRequestForm.jsx
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../../hooks/useRequests';
import { useAuth } from '../../hooks/useAuth';
import { useSkillMatch } from '../../hooks/useSkillMatch';

export default function JoinRequestForm({ group }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendRequest } = useRequests();
  const skillMatch = useSkillMatch(user?.skills, group.requiredSkills);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await sendRequest(group._id, 'join', message);
      alert('Join request sent successfully!');
      navigate('/requests');
    } catch (err) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  // Skills analysis
  const userSkillsLower = (user?.skills || []).map(s => s.toLowerCase());
  const skillAnalysis = group.requiredSkills.map(skill => ({
    skill,
    hasSkill: userSkillsLower.includes(skill.toLowerCase())
  }));

  const hasAllSkills = skillAnalysis.every(s => s.hasSkill);
  const missingSkillsCount = skillAnalysis.filter(s => !s.hasSkill).length;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Join Request: {group.title}</h2>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{error}</div>}

      {/* Skill Analysis */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-3">Skill Match Analysis: {skillMatch}%</h3>
        <div className="space-y-2">
          {skillAnalysis.map(({ skill, hasSkill }) => (
            <div key={skill} className="flex items-center gap-2">
              <span className={hasSkill ? 'text-green-600' : 'text-red-600'}>
                {hasSkill ? '✓' : '✗'}
              </span>
              <span className={hasSkill ? 'text-green-800' : 'text-red-800'}>
                {skill} {hasSkill ? '(You have it)' : '(You need to learn)'}
              </span>
            </div>
          ))}
        </div>
        {!hasAllSkills && (
          <p className="text-sm mt-3 text-blue-700">
            You're missing {missingSkillsCount} skill{missingSkillsCount !== 1 ? 's' : ''}. 
            You can still join and learn from the group!
          </p>
        )}
      </div>

      {/* Optional Message */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Optional Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the group why you're interested in joining..."
          maxLength={500}
          rows={4}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-600 mt-1">{message.length}/500</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Join Request'}
        </button>
      </div>
    </form>
  );
}
```

---

## ROUTING SETUP (App.jsx additions)

```javascript
import GroupsList from './components/groups/GroupsList';
import GroupDetails from './components/groups/GroupDetails';
import JoinRequestForm from './components/requests/JoinRequestForm';
import ReceivedRequests from './components/requests/ReceivedRequests';
import SentRequests from './components/requests/SentRequests';

<Routes>
  {/* Groups */}
  <Route path="/groups" element={<GroupsList />} />
  <Route path="/groups/:id" element={<GroupDetails />} />
  <Route path="/groups/:id/request" element={<JoinRequestForm />} />

  {/* Requests */}
  <Route path="/requests" element={
    <div className="flex">
      <div className="flex-1">
        <ReceivedRequests />
      </div>
    </div>
  } />
  <Route path="/requests/sent" element={<SentRequests />} />
</Routes>
```

---

## CONSTANTS & HELPERS

### utils/skillMatcher.js
```javascript
export const calculateSkillMatch = (userSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;

  const userSkillsLower = (userSkills || []).map(s => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

  const matchedCount = requiredSkillsLower.filter(skill =>
    userSkillsLower.includes(skill)
  ).length;

  return Math.round((matchedCount / requiredSkillsLower.length) * 100);
};

export const getMatchQuality = (score) => {
  if (score >= 90) return { label: 'Excellent', color: 'green' };
  if (score >= 70) return { label: 'Good', color: 'blue' };
  if (score >= 50) return { label: 'Fair', color: 'yellow' };
  return { label: 'Low', color: 'red' };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

---

## TESTING CHECKLIST (Frontend)

```
GROUPS DISCOVERY:
[ ] Display all active groups with filters
[ ] Search by title/description works
[ ] Filter by skill works
[ ] Shows skill match score
[ ] "View Details" button navigates correctly
[ ] "Join Request" button navigates to request form
[ ] "Member" button shows for user's own groups

JOIN REQUEST FORM:
[ ] Shows skill analysis (have/missing skills)
[ ] Optional message field is optional
[ ] Send button creates request
[ ] Shows success message
[ ] Errors shown to user

RECEIVED REQUESTS:
[ ] Lists all received requests
[ ] Filter by status works (pending/accepted/rejected)
[ ] Shows requester info, group name, match score
[ ] "Accept" button works
[ ] "Reject" button works
[ ] Confirmation dialogs before major actions

SENT REQUESTS:
[ ] Lists all sent requests
[ ] Filter by status works
[ ] Shows group name, status, match score
[ ] "Cancel" button works (pending only)
[ ] Proper error messages shown

STATE MANAGEMENT:
[ ] Requests auto-refresh after action
[ ] Loading states shown during API calls
[ ] Error messages are clear and helpful
[ ] No stale data after updates
```
