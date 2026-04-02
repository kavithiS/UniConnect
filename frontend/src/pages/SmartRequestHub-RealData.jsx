import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Check, X, Clock, Users, Inbox, AlertCircle, ChevronDown, Loader } from 'lucide-react';

const API_BASE = "http://localhost:5000";

const SmartRequestHub = () => {
  // ============ STATE ============
  const [mode, setMode] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchScore, setMatchScore] = useState(40);
  const [sortBy, setSortBy] = useState('match');
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Current user
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);

  // Data state
  const [recommendations, setRecommendations] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);

  // ============ INITIALIZATION ============
  useEffect(() => {
    // Get current user ID from localStorage (set during app initialization)
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
    } else {
      setError('⚠️ No user logged in. Please log in first.');
    }
  }, []);

  // ============ HELPER FUNCTIONS ============
  
  /**
   * Get avatar emoji based on role
   */
  const getAvatarEmoji = (role) => {
    const roleEmojis = {
      'Developer': '👨‍💻',
      'Designer': '👨‍🎨',
      'Manager': '👨‍💼',
      'Leader': '👔',
      'Student': '🎓'
    };
    return roleEmojis[role] || '👤';
  };

  /**
   * Transform backend user to component format
   */
  const transformUserData = (backendUser, matchScore = 0, matchedSkills = []) => {
    return {
      id: backendUser._id,
      name: backendUser.name,
      role: backendUser.role,
      skills: backendUser.skills || [],
      matchScore: matchScore || 75,
      avatar: getAvatarEmoji(backendUser.role),
      matchedSkills: matchedSkills,
      _id: backendUser._id
    };
  };

  /**
   * Transform group to component format
   */
  const transformGroupData = (group) => {
    return {
      id: group._id,
      name: group.title,
      description: group.description,
      required: group.requiredSkills || [],
      members: group.members?.length || 0,
      limit: group.memberLimit || 5,
      code: group.groupCode,
      _id: group._id
    };
  };

  // ============ STUDENT MODE HANDLERS ============

  /**
   * Load recommended groups for current student
   */
  const loadStudentRecommendations = async () => {
    if (!currentUserId) {
      setError('Please log in first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch recommended groups
      const response = await axios.get(
        `${API_BASE}/api/recommend/groups/${currentUserId}`
      );

      // Transform data with match scores
      const transformedGroups = response.data.map(group => ({
        id: group._id,
        _id: group._id,
        name: group.title,
        description: group.description,
        role: 'Group',
        skills: group.requiredSkills || [],
        matchScore: group.matchScore || 75,
        avatar: '👥',
        code: group.groupCode,
        memberLimit: group.memberLimit,
        members: group.members?.length || 0
      }));

      // Fetch student's existing requests
      const requestsResponse = await axios.get(
        `${API_BASE}/api/requests/student/${currentUserId}`
      );

      const pendingRequests = requestsResponse.data.filter(
        r => r.status === 'pending'
      );

      setRecommendations(transformedGroups);
      setSentInvitations(pendingRequests);
      setHasSearched(true);

    } catch (error) {
      console.error('Error loading student data:', error);
      setError(`Failed to load recommendations: ${error.response?.data?.message || error.message}`);
      setHasSearched(true);
      setRecommendations([]);
      setSentInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Student sends request to join a group
   */
  const handleRequestToJoin = async (group) => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE}/api/requests`,
        {
          userId: currentUserId,
          groupId: group._id || group.id,
          requestType: 'student-request'
        }
      );

      // Add to sent invitations
      setSentInvitations([...sentInvitations, response.data]);

      // Remove from recommendations
      setRecommendations(
        recommendations.filter(r => r._id !== (group._id || group.id))
      );

      setError(null);

    } catch (error) {
      console.error('Error sending request:', error);
      setError(`Failed to send request: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Student cancels a request
   */
  const handleRevokeRequest = async (request) => {
    try {
      setLoading(true);

      await axios.delete(
        `${API_BASE}/api/requests/${request._id}`
      );

      setSentInvitations(
        sentInvitations.filter(r => r._id !== request._id)
      );

      setError(null);

    } catch (error) {
      console.error('Error revoking request:', error);
      setError(`Failed to revoke request: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============ LEADER MODE HANDLERS ============

  /**
   * Leader searches for their group by code
   */
  const handleSearchGroup = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a group code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search for group by code
      const groupResponse = await axios.get(
        `${API_BASE}/api/groups/code/${searchQuery.toUpperCase()}`
      );

      const group = groupResponse.data;
      if (!group) {
        setError(`No group found with code "${searchQuery}"`);
        setHasSearched(false);
        setLoading(false);
        return;
      }

      setCurrentGroup(group);

      // Fetch join requests for this group
      const requestsResponse = await axios.get(
        `${API_BASE}/api/requests/group/${group._id}`
      );

      // Filter pending requests only
      const pendingRequests = requestsResponse.data.filter(
        r => r.status === 'pending'
      );

      // Fetch recommended users for this group
      const usersResponse = await axios.get(
        `${API_BASE}/api/recommend/users/${group._id}`
      );

      setJoinRequests(pendingRequests);
      setRecommendations(usersResponse.data.map(user => transformUserData(user)));
      setHasSearched(true);

    } catch (error) {
      console.error('Error searching group:', error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
      setHasSearched(false);
      
      // Show empty state for leader mode
      setRecommendations([]);
      setJoinRequests([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Leader accepts a join request
   */
  const handleAcceptRequest = async (request) => {
    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/api/requests/${request._id}`,
        {
          status: 'accepted',
          responseMessage: 'Welcome to the group!'
        }
      );

      // Remove from pending
      setJoinRequests(
        joinRequests.filter(r => r._id !== request._id)
      );

      setError(null);

    } catch (error) {
      console.error('Error accepting request:', error);
      setError(`Failed to accept: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Leader declines a join request
   */
  const handleDeclineRequest = async (request) => {
    try {
      setLoading(true);

      await axios.put(
        `${API_BASE}/api/requests/${request._id}`,
        {
          status: 'rejected',
          responseMessage: 'We decided to go with other candidates'
        }
      );

      setJoinRequests(
        joinRequests.filter(r => r._id !== request._id)
      );

      setError(null);

    } catch (error) {
      console.error('Error declining request:', error);
      setError(`Failed to decline: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Leader sends invitation to a user
   */
  const handleSendInvitation = async (user) => {
    if (!currentGroup) {
      setError('Group not selected');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE}/api/requests`,
        {
          userId: user._id || user.id,
          groupId: currentGroup._id,
          requestType: 'leader-invitation'
        }
      );

      // Add to sent invitations
      setSentInvitations([...sentInvitations, response.data]);

      // Remove from recommendations
      setRecommendations(
        recommendations.filter(r => r._id !== (user._id || user.id))
      );

      setError(null);

    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(`Failed to send invitation: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Leader revokes an invitation
   */
  const handleRevokeInvitation = async (invitation) => {
    try {
      setLoading(true);

      await axios.delete(
        `${API_BASE}/api/requests/${invitation._id}`
      );

      setSentInvitations(
        sentInvitations.filter(r => r._id !== invitation._id)
      );

      setError(null);

    } catch (error) {
      console.error('Error revoking invitation:', error);
      setError(`Failed to revoke: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============ COMPONENTS ============

  const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-slate-600 mb-4">
        <Icon size={48} />
      </div>
      <h3 className="text-slate-300 font-medium text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs text-center">{description}</p>
    </div>
  );

  const UserCard = ({ user, actionLabel, onAction, actionVariant = 'primary' }) => {
    const btnClass = actionVariant === 'primary'
      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
      : 'bg-rose-600 hover:bg-rose-700 text-white';

    return (
      <div className="group bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 transition-all hover:border-slate-600 hover:shadow-lg hover:shadow-slate-950/20">
        <div className="flex items-start gap-4 mb-3">
          <div className="text-3xl">{user.avatar}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-100 font-semibold text-sm truncate">{user.name}</h3>
            <p className="text-slate-400 text-xs truncate">{user.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-2xl font-bold text-indigo-400">{user.matchScore}%</div>
              <div className="h-1.5 bg-slate-700 flex-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                  style={{ width: `${user.matchScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {user.skills?.slice(0, 2).map(skill => (
            <span key={skill} className="bg-slate-700/50 text-slate-300 text-xs px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
          {user.skills?.length > 2 && (
            <span className="text-slate-500 text-xs px-2 py-0.5">+{user.skills.length - 2}</span>
          )}
        </div>

        <button
          onClick={() => onAction(user)}
          disabled={loading}
          className={`w-full ${btnClass} text-sm font-medium py-2 rounded transition-colors disabled:opacity-50`}
        >
          {loading ? '...' : actionLabel}
        </button>
      </div>
    );
  };

  const PendingInvitationItem = ({ user, onRevoke }) => (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between group hover:border-slate-600 transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-2xl">{user.avatar}</div>
        <div className="min-w-0">
          <h3 className="text-slate-100 font-semibold text-sm truncate">{user.name}</h3>
          <p className="text-slate-400 text-xs truncate">{user.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-full whitespace-nowrap">
          Pending
        </span>
        <button
          onClick={() => onRevoke(user)}
          disabled={loading}
          className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 hover:bg-rose-500/10 rounded disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  const JoinRequestItem = ({ user, onAccept, onDecline }) => (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 flex items-center justify-between group hover:border-slate-600 transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-2xl">{user.avatar || '👤'}</div>
        <div className="min-w-0">
          <h3 className="text-slate-100 font-semibold text-sm truncate">{user.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-lg font-bold text-indigo-400">{user.matchScore || 75}%</div>
            <p className="text-slate-400 text-xs">Match • {user.role}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={() => onAccept(user)}
          disabled={loading}
          className="text-slate-400 hover:text-green-400 transition-colors p-1.5 hover:bg-green-500/10 rounded disabled:opacity-50"
        >
          <Check size={18} />
        </button>
        <button
          onClick={() => onDecline(user)}
          disabled={loading}
          className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 hover:bg-rose-500/10 rounded disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );

  // ============ RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              🤝 Smart Request Hub
            </h1>
            <p className="text-slate-400 text-sm">Intelligent group matching and management</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 rounded-full p-1 w-fit">
            <button
              onClick={() => setMode('student')}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                mode === 'student'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Student Mode
            </button>
            <button
              onClick={() => setMode('leader')}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                mode === 'leader'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Leader Mode
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm rounded-xl p-6 mb-8 hover:border-slate-600/50 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div className="md:col-span-1 flex gap-2">
              <input
                type="text"
                placeholder={mode === 'leader' ? 'Group Code (e.g., IT100)' : 'Search groups...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (mode === 'leader' ? handleSearchGroup() : loadStudentRecommendations())}
                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
              <button
                onClick={mode === 'leader' ? handleSearchGroup : loadStudentRecommendations}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                {mode === 'leader' ? 'Search' : 'Load'}
              </button>
            </div>

            {/* Match Score Slider */}
            <div className="md:col-span-1">
              <label className="text-slate-400 text-xs font-medium block mb-2">Min Match: {matchScore}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={matchScore}
                onChange={(e) => setMatchScore(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(79, 70, 229) 0%, rgb(79, 70, 229) ${matchScore}%, rgb(71, 85, 105) ${matchScore}%, rgb(71, 85, 105) 100%)`
                }}
              />
            </div>

            {/* Sort */}
            <div className="md:col-span-1 relative">
              <label className="text-slate-400 text-xs font-medium block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="match">Match Score</option>
                <option value="recent">Most Recent</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-9 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <details className="group">
            <summary className="cursor-pointer text-slate-400 hover:text-slate-300 text-xs font-medium flex items-center gap-2 transition-colors">
              <span>ℹ️ How to Use</span>
              <ChevronDown size={14} className="transform group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-slate-500 text-xs mt-3 leading-relaxed">
              {mode === 'leader'
                ? 'Enter your group code to search and view join requests from students.'
                : 'Click "Load" to see recommended groups based on your skills.'}
            </p>
          </details>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-rose-200 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader size={24} className="text-indigo-400 animate-spin mr-3" />
            <p className="text-slate-400">Loading data...</p>
          </div>
        )}

        {/* Content Sections */}
        {!loading && hasSearched ? (
          <div className="space-y-8">
            {/* STUDENT MODE */}
            {mode === 'student' && (
              <>
                {/* Recommended Groups */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users size={24} className="text-indigo-400" />
                        Recommended Groups
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">Groups that match your skills</p>
                    </div>
                  </div>

                  {recommendations.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No recommendations"
                      description="No groups match your skills at the moment"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendations.map(user => (
                        <UserCard
                          key={user._id}
                          user={user}
                          actionLabel="Request to Join"
                          onAction={handleRequestToJoin}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Your Requests */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Send size={24} className="text-indigo-400" />
                        Your Requests
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">Track groups you've requested to join</p>
                    </div>
                    {sentInvitations.length > 0 && (
                      <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
                        {sentInvitations.length} pending
                      </span>
                    )}
                  </div>

                  {sentInvitations.length === 0 ? (
                    <EmptyState
                      icon={Send}
                      title="No requests sent"
                      description="Your requests will appear here"
                    />
                  ) : (
                    <div className="space-y-2">
                      {sentInvitations.map(req => (
                        <PendingInvitationItem
                          key={req._id}
                          user={{ ...req, name: req.groupId?.title || 'Group', avatar: '👥', role: 'Group' }}
                          onRevoke={handleRevokeRequest}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* LEADER MODE */}
            {mode === 'leader' && (
              <>
                {currentGroup && (
                  <div className="bg-slate-800/40 border border-indigo-500/20 rounded-lg p-4 mb-6">
                    <p className="text-slate-300 text-sm">
                      <span className="font-semibold">{currentGroup.title}</span> • Code: <span className="font-mono text-indigo-400">{currentGroup.groupCode}</span>
                    </p>
                  </div>
                )}

                {/* Join Requests */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Clock size={24} className="text-amber-400" />
                        Join Requests
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">Students requesting to join</p>
                    </div>
                    {joinRequests.length > 0 && (
                      <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                        {joinRequests.length} pending
                      </span>
                    )}
                  </div>

                  {joinRequests.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="No pending requests"
                      description="Student requests will appear here"
                    />
                  ) : (
                    <div className="space-y-2">
                      {joinRequests.map(req => (
                        <JoinRequestItem
                          key={req._id}
                          user={{
                            _id: req.userId?._id,
                            name: req.userId?.name || 'Unknown',
                            role: req.userId?.role || 'Developer',
                            avatar: getAvatarEmoji(req.userId?.role),
                            matchScore: req.matchScore
                          }}
                          onAccept={() => handleAcceptRequest(req)}
                          onDecline={() => handleDeclineRequest(req)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Recommended Users */}
                {recommendations.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <Users size={24} className="text-indigo-400" />
                          Recommended Students
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Students who match your group</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendations.map(user => (
                        <UserCard
                          key={user._id}
                          user={user}
                          actionLabel="Send Invitation"
                          onAction={handleSendInvitation}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Sent Invitations */}
                {sentInvitations.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <Send size={24} className="text-amber-400" />
                          Sent Invitations
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Track your sent invitations</p>
                      </div>
                      <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                        {sentInvitations.length} pending
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sentInvitations.map(req => (
                        <PendingInvitationItem
                          key={req._id}
                          user={{
                            _id: req.userId?._id,
                            name: req.userId?.name || 'Unknown',
                            role: req.userId?.role || 'Developer',
                            avatar: getAvatarEmoji(req.userId?.role)
                          }}
                          onRevoke={() => handleRevokeInvitation(req)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ) : !loading && !hasSearched ? (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="text-slate-500 mb-6">
              <Search size={56} />
            </div>
            <h3 className="text-slate-300 font-semibold text-2xl mb-3">Ready to get started?</h3>
            <p className="text-slate-500 text-center max-w-md mb-8">
              {mode === 'leader'
                ? 'Enter your group code to view requests and manage members.'
                : 'Click "Load" to see groups recommended for you based on your skills.'}
            </p>
            <button
              onClick={mode === 'leader' ? handleSearchGroup : loadStudentRecommendations}
              disabled={loading || !currentUserId}
              className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 text-slate-300 hover:text-slate-100 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {mode === 'leader' ? '🔍 Search My Group' : '🌱 Load Recommendations'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SmartRequestHub;
