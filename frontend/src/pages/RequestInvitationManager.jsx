import React, { useState, useEffect } from 'react';
import { groupAPI, userAPI, joinRequestAPI, invitationAPI, recommendationAPI } from '../api/api';
import { Check, X, Clock, AlertCircle, Target, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Unified Request & Invitation Manager
 * Combines student requests, leader invitations, and AI-powered skill matching
 * ✅ Request & Invitation Scope
 * ✅ Intelligence Scope (matching, skill gaps, scoring)
 */
const RequestInvitationManager = () => {
  // ============ THEME ============
  const { isDarkMode } = useTheme();

  // ============ STATE ============
  const [activeMode, setActiveMode] = useState('student'); // 'student' or 'leader'
  const [userId, setUserId] = useState(localStorage.getItem('userId')?.trim() || '');
  const [groupId, setGroupId] = useState(localStorage.getItem('groupId') || '');
  const [groupCode, setGroupCode] = useState(''); // For searching by group code
  
  // Recommendations & Requests
  const [recommendations, setRecommendations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [myInvitations, setMyInvitations] = useState([]);
  const [groupInvitations, setGroupInvitations] = useState([]);
  
  // Filtering & Sorting
  const [minScore, setMinScore] = useState(40);
  const [sortBy, setSortBy] = useState('score'); // 'score' or 'tier'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ============ EFFECTS ============
  // Check backend on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await userAPI.getAll();
        console.log('✓ Backend connection successful');
      } catch (err) {
        console.error('✗ Backend connection failed:', err.message);
        setError('❌ Cannot connect to backend. Is it running on port 5001?');
      }
    };
    checkBackend();
  }, []);

  useEffect(() => {
    if (activeMode === 'student' && userId.trim()) {
      fetchStudentData();
    }
  }, [activeMode, userId, minScore]);

  useEffect(() => {
    if (activeMode === 'leader' && groupId) {
      fetchLeaderData();
    }
  }, [activeMode, groupId]);

  // ============ API CALLS ============
  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmedUserId = userId.trim();
      console.log('Fetching student data for userId:', trimmedUserId);
      if (!trimmedUserId) {
        setError('❌ Please enter a valid User ID');
        return;
      }
      
      // Get recommendations
      const recResponse = await recommendationAPI.getGroupsForUser(trimmedUserId);
      console.log('Recommendations response:', recResponse.data);
      setRecommendations(recResponse.data.data || []);

      // Get my requests
      const reqResponse = await joinRequestAPI.getStudentRequests(trimmedUserId);
      console.log('My requests response:', reqResponse.data);
      setMyRequests(reqResponse.data.data || []);

      // Get my invitations
      const invResponse = await invitationAPI.getStudentInvitations(trimmedUserId);
      console.log('My invitations response:', invResponse.data);
      setMyInvitations(invResponse.data.data || []);
      
      setSuccess('✅ Data loaded successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error fetching student data:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error fetching data. Please check if backend is running.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching leader data for groupId:', groupId);
      
      // Get recommendations for this group
      const recResponse = await recommendationAPI.getUsersForGroup(groupId);
      console.log('Recommended users response:', recResponse.data);
      setRecommendations(recResponse.data.data || []);

      // Get requests for this group
      const reqResponse = await joinRequestAPI.getGroupRequests(groupId);
      console.log('Group requests response:', reqResponse.data);
      setGroupRequests(reqResponse.data.data || []);

      // Get invitations sent by this group
      const invResponse = await invitationAPI.getGroupInvitations(groupId);
      console.log('Group invitations response:', invResponse.data);
      setGroupInvitations(invResponse.data.data || []);
      
      setSuccess('✅ Data loaded successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error fetching leader data:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error fetching data. Please check if backend is running.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ============ SEARCH GROUP BY CODE ============
  const formatGroupCode = (value) => {
    if (!value) return '';
    const trimmed = value.trim().toUpperCase();
    if (trimmed.startsWith('IT100-')) {
      return trimmed;
    }
    const sanitized = trimmed.replace(/^IT100-/, '').replace(/[^A-Z0-9]/g, '');
    return `IT100-${sanitized}`;
  };

  const searchGroupByCode = async () => {
    if (!groupCode.trim()) {
      setError('❌ Please enter a group code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const normalizedCode = formatGroupCode(groupCode);
      setGroupCode(normalizedCode);
      console.log('Searching for group with code:', normalizedCode);
      const response = await groupAPI.getByCode(normalizedCode);
      console.log('Group found:', response.data.data);
      
      const foundGroupId = response.data.data._id;
      setGroupId(foundGroupId);
      localStorage.setItem('groupId', foundGroupId);
      
      setSuccess(`✅ Group found: ${response.data.data.title}`);
      setTimeout(() => {
        setSuccess(null);
        fetchLeaderData();
      }, 1500);
    } catch (err) {
      console.error('Error searching group by code:', err);
      const errorMsg = err.response?.data?.message || err.message || `Group code not found`;
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ============ ACTIONS ============
  const handleSendRequest = async (groupObj) => {
    try {
      console.log('Sending request with data:', { userId, groupId: groupObj._id });
      await joinRequestAPI.send({
        userId: userId.trim(),
        groupId: groupObj._id || groupObj.group?._id
      });
      const groupTitle = groupObj.title || groupObj.group?.title;
      setSuccess(`✅ Request sent to ${groupTitle}!`);
      setTimeout(() => {
        setSuccess(null);
        fetchStudentData();
      }, 2000);
    } catch (err) {
      console.error('Error sending request:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error sending request';
      setError(errorMsg);
    }
  };

  const handleSendInvitation = async (userObj) => {
    try {
      console.log('Sending invitation with data:', { studentId: userObj._id, groupId });
      await invitationAPI.send({
        studentId: userObj._id || userObj.user?._id,
        groupId,
        message: `We think you'd be a great fit for our team!`
      });
      const userName = userObj.name || userObj.user?.name;
      setSuccess(`✅ Invitation sent to ${userName}!`);
      setTimeout(() => {
        setSuccess(null);
        fetchLeaderData();
      }, 2000);
    } catch (err) {
      console.error('Error sending invitation:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error sending invitation';
      setError(errorMsg);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      console.log('Accepting request:', requestId);
      await joinRequestAPI.update(requestId, { status: 'accepted' });
      setSuccess('✅ Request accepted!');
      setTimeout(() => {
        setSuccess(null);
        fetchLeaderData();
      }, 2000);
    } catch (err) {
      console.error('Error accepting request:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error accepting request';
      setError(errorMsg);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      console.log('Rejecting request:', requestId);
      await joinRequestAPI.update(requestId, { 
        status: 'rejected',
        responseMessage: 'Thanks for your interest!'
      });
      setSuccess('✅ Request rejected');
      setTimeout(() => {
        setSuccess(null);
        fetchLeaderData();
      }, 2000);
    } catch (err) {
      console.error('Error rejecting request:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error rejecting request';
      setError(errorMsg);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      console.log('Accepting invitation:', invitationId);
      await invitationAPI.accept(invitationId);
      setSuccess('✅ Invitation accepted! You joined the group!');
      setTimeout(() => {
        setSuccess(null);
        fetchStudentData();
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error accepting invitation';
      setError(errorMsg);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      console.log('Declining invitation:', invitationId);
      await invitationAPI.decline(invitationId, { reason: 'Not interested at this time' });
      setSuccess('✅ Invitation declined');
      setTimeout(() => {
        setSuccess(null);
        fetchStudentData();
      }, 2000);
    } catch (err) {
      console.error('Error declining invitation:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error declining invitation';
      setError(errorMsg);
    }
  };

  // ============ FILTERING ============
  const filterAndSort = (items) => {
    let filtered = items.filter(item => {
      const score = item.matchScore || 0;
      const title = item.title || item.name || '';
      return score >= minScore && title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return (b.matchScore || 0) - (a.matchScore || 0);
      }
      return 0;
    });
  };

  // ============ HELPER FUNCTIONS ============
  const getMatchTier = (score) => {
    if (score >= 80) return { tier: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/20', icon: '⭐' };
    if (score >= 60) return { tier: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/20', icon: '✓' };
    if (score >= 40) return { tier: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/20', icon: '!' };
    return { tier: 'Poor', color: 'text-red-500', bg: 'bg-red-500/20', icon: 'x' };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  // Check backend connectivity
  const checkBackendStatus = async () => {
    try {
      const response = await userAPI.getAll();
      console.log('Backend is running ✓');
      return true;
    } catch (err) {
      console.log('Backend check failed:', err.message);
      return false;
    }
  };

  // Seed sample data for testing
  const seedSampleData = async () => {
    setLoading(true);
    try {
        const response = await fetch('http://localhost:5001/api/users/seed/sample');
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ ${data.message}`);
        if (data.testData) {
          setUserId(data.testData.sampleUserId);
          localStorage.setItem('userId', data.testData.sampleUserId);
          console.log('📊 Sample Data Created:');
          console.log('   Student ID:', data.testData.sampleUserId);
          console.log('   Group ID:', data.testData.sampleGroupId);
          setTimeout(() => {
            setSuccess(null);
            fetchStudentData();
          }, 2000);
        }
      } else {
        setError(data.message || 'Failed to seed data');
      }
    } catch (err) {
      console.error('Seed error:', err);
      setError('❌ Error seeding data. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER CARD ============
  const renderMatchCard = (item, isLeader = false) => {
    const matchScore = item.matchScore || 0;
    const matchTier = getMatchTier(matchScore);
    const name = isLeader ? (item.name || item.user?.name) : (item.title || item.group?.title);
    const skills = isLeader ? (item.skills || item.user?.skills) : (item.requiredSkills || item.group?.requiredSkills);
    const userId_item = item._id || (isLeader ? item.user?._id : item.group?._id);

    return (
      <div key={userId_item} className={`border rounded-lg p-4 hover:border-blue-500 transition-all bg-gradient-to-br ${isDarkMode ? 'from-slate-800 to-slate-900 border-slate-700' : 'from-slate-100 to-slate-50 border-slate-300'}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{name}</h3>
            {item.role && <p className={isDarkMode ? 'text-xs text-blue-400' : 'text-xs text-blue-600'}>{item.role}</p>}
          </div>
          <div className={`text-2xl font-bold flex items-center gap-1 ${matchTier.color}`}>
            {matchScore}% {matchTier.icon}
          </div>
        </div>

        {/* Match Tier */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${matchTier.bg} ${matchTier.color}`}>
          {matchTier.tier} Match
        </div>

        {/* Analysis */}
        {item.analysis && (
          <div className={`mb-3 p-2 rounded text-xs ${isDarkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
            📊 {item.analysis}
          </div>
        )}

        {/* Matched Skills */}
        {item.matchedSkills && item.matchedSkills.length > 0 && (
          <div className="mb-3">
            <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Matched Skills ({item.matchedSkills.length})</p>
            <div className="flex gap-1 flex-wrap">
              {item.matchedSkills.map(skill => (
                <span key={skill} className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-200 text-green-700'}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {item.missingSkills && item.missingSkills.length > 0 && (
          <div className="mb-3">
            <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>✗ Missing Skills ({item.missingSkills.length})</p>
            <div className="flex gap-1 flex-wrap">
              {item.missingSkills.map(skill => (
                <span key={skill} className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-200 text-orange-700'}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {item.recommendation && (
          <div className={`mb-4 p-2 rounded text-xs border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-slate-300' : 'bg-blue-100 border-blue-300 text-slate-700'}`}>
            <p className={`font-semibold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>💡 Recommendation</p>
            {item.recommendation}
          </div>
        )}

        {/* Action Button */}
        {!isLeader && (
          <button
            onClick={() => handleSendRequest(item)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Send Request
          </button>
        )}
        {isLeader && (
          <button
            onClick={() => handleSendInvitation(item)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Send Invitation
          </button>
        )}
      </div>
    );
  };

  // ============ RENDER ============
  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          🤝 Smart Request & Invitation Hub
        </h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>AI-powered matching with request management</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveMode('student')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeMode === 'student'
              ? 'bg-blue-600 text-white'
              : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          👤 Student Mode
        </button>
        <button
          onClick={() => setActiveMode('leader')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeMode === 'leader'
              ? 'bg-green-600 text-white'
              : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          👨‍💼 Leader Mode
        </button>
      </div>

      {/* Input Section */}
      <div className={`border rounded-lg p-6 mb-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMode === 'student' && (
            <input
              type="text"
              placeholder="Paste your User ID here"
              value={userId}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setUserId(value);
                  localStorage.setItem('userId', value);
              }}
              className={`rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
            />
          )}
          {activeMode === 'leader' && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Group ID (e.g., IT100-ABC123)"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && searchGroupByCode()}
                className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
              />
              <button
                onClick={searchGroupByCode}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
            />
            <button
              onClick={seedSampleData}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
              title="Create sample data for testing"
            >
              {loading ? '⏳' : '🌱 Seed Data'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className={`text-sm font-semibold block mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Minimum Match Score</label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="w-full"
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{minScore}% or higher</p>
          </div>
          <div>
            <label className={`text-sm font-semibold block mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
            >
              <option value="score">Match Score</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className={`mb-6 p-4 border rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-red-100 border-red-300 text-red-700'}`}>
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}
      {success && (
        <div className={`mb-6 p-4 border rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-green-100 border-green-300 text-green-700'}`}>
          <Check className="w-5 h-5" /> {success}
        </div>
      )}

      {/* Info Section */}
      <div className={`mb-6 p-4 rounded-lg text-sm border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-100 border-blue-300 text-blue-700'}`}>
        <p className="font-semibold mb-2">ℹ️ How to Use:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          {activeMode === 'student' && (
            <>
              <li>Paste your <strong>User ID</strong> in the input field above</li>
              <li>System will load recommended groups and your requests</li>
              <li>Click <strong>[Send Request]</strong> to request joining a group</li>
              <li>Track your requests and respond to invitations below</li>
            </>
          )}
          {activeMode === 'leader' && (
            <>
              <li>Enter your <strong>Group ID</strong> (e.g., IT100-ABC123) in the input field above</li>
              <li>Click <strong>[Search]</strong> to find your group</li>
              <li>System will show recommended students and incoming requests</li>
              <li>Click <strong>[Send Invitation]</strong> to invite students</li>
              <li>Review and approve join requests below</li>
            </>
          )}
        </ul>
      </div>

      {/* Loading */}
      {loading && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loading data...</div>
      )}

      {/* STUDENT MODE */}
      {!loading && activeMode === 'student' && (
        <div className="space-y-8">
          {/* Recommended Groups */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Recommended Groups ({filterAndSort(recommendations).length})
              </h2>
            </div>
            {filterAndSort(recommendations).length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                {!userId ? 'Enter your User ID to see recommendations' : 'No matching groups found'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterAndSort(recommendations).map(item => renderMatchCard(item, false))}
              </div>
            )}
          </div>

          {/* My Requests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Join Requests ({myRequests.length})</h2>
            </div>
            {myRequests.length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No requests sent yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRequests.map(req => (
                  <div key={req._id} className={`rounded-lg p-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.groupId?.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(req.status)}`}>
                        {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                      </span>
                    </div>
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Match: {req.matchScore}%</p>
                    {req.matchedSkills?.length > 0 && (
                      <p className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓ {req.matchedSkills.length} skills matched</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Invitations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Invitations ({myInvitations.length})</h2>
            </div>
            {myInvitations.length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No invitations yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myInvitations.map(inv => (
                  <div key={inv._id} className={`rounded-lg p-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                    <h3 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inv.groupId?.title}</h3>
                    {inv.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptInvitation(inv._id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineInvitation(inv._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {inv.status !== 'pending' && (
                      <p className={'px-2 py-1 rounded text-xs font-semibold border inline-block ' + getStatusColor(inv.status)}>
                        {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEADER MODE */}
      {!loading && activeMode === 'leader' && (
        <div className="space-y-8">
          {/* Recommended Users */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Recommended Users ({filterAndSort(recommendations).length})
              </h2>
            </div>
            {filterAndSort(recommendations).length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                {!groupId ? 'Enter your Group ID to see recommendations' : 'No matching users found'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterAndSort(recommendations).map(item => renderMatchCard(item, true))}
              </div>
            )}
          </div>

          {/* Join Requests */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className={`w-6 h-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Join Requests ({groupRequests.length})</h2>
            </div>
            {groupRequests.length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No requests received</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupRequests.map(req => {
                  const matchTier = getMatchTier(req.matchScore || 0);
                  return (
                    <div key={req._id} className={`rounded-lg p-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.userId?.name}</h3>
                          <p className={`text-sm font-semibold ${matchTier.color}`}>{req.matchScore}% - {matchTier.tier}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(req.status)}`}>
                          {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                        </span>
                      </div>
                      {req.matchedSkills?.length > 0 && (
                        <p className={`text-xs mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Matched: {req.matchedSkills.join(', ')}</p>
                      )}
                      {req.missingSkills?.length > 0 && (
                        <p className={`text-xs mb-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>✗ Missing: {req.missingSkills.join(', ')}</p>
                      )}
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(req._id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req._id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition flex items-center justify-center gap-1"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sent Invitations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sent Invitations ({groupInvitations.length})</h2>
            </div>
            {groupInvitations.length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No invitations sent</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupInvitations.map(inv => (
                  <div key={inv._id} className={`rounded-lg p-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inv.userId?.name}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Match: {inv.matchScore}%</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(inv.status)}`}>
                        {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestInvitationManager;
