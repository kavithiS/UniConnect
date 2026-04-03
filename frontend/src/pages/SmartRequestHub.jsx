import React, { useState, useMemo } from 'react';
import { 
  Search, Users, Send, Inbox, Trash2, Check, X, Info, Wand2,
  ChevronDown, Settings, Brain, Sparkles, ArrowRight
} from 'lucide-react';

const mockUserData = {
  recommended: [
    { id: 1, name: 'Alex Chen', skills: ['React', 'Node.js', 'TypeScript'], matchScore: 92, avatar: '👨‍💻' },
    { id: 2, name: 'Jordan MVP', skills: ['Python', 'Django', 'PostgreSQL'], matchScore: 85, avatar: '👩‍💻' },
    { id: 3, name: 'Sam Williams', skills: ['React', 'TailwindCSS', 'Next.js'], matchScore: 78, avatar: '🧑‍💻' },
  ],
  joinRequests: [
    { id: 4, name: 'Taylor Brown', skills: ['JavaScript', 'HTML/CSS'], matchScore: 65, avatar: '👨‍🎓' },
    { id: 5, name: 'Morgan Lee', skills: ['React', 'Vue.js'], matchScore: 72, avatar: '👩‍🎓' },
  ],
};

export default function SmartRequestHub() {
  const [mode, setMode] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchScoreFilter, setMatchScoreFilter] = useState(40);
  const [sortBy, setSortBy] = useState('matchScore');
  const [searchError, setSearchError] = useState('');
  
  // State for lists
  const [recommendations, setRecommendations] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [dataSeeded, setDataSeeded] = useState(false);

  // Seed data function
  const handleSeedData = () => {
    setRecommendations(mockUserData.recommended);
    setJoinRequests(mockUserData.joinRequests);
    setSentInvitations([]);
    setDataSeeded(true);
  };

  // Search handler
  const handleSearch = () => {
    setSearchError('');
    if (searchQuery.toUpperCase() === 'IT100') {
      setHasSearched(true);
      if (!dataSeeded) {
        handleSeedData();
      }
    } else if (searchQuery.trim()) {
      setSearchError(`No group found with code "${searchQuery}". Try searching "IT100" for demo.`);
      setHasSearched(false);
    }
  };

  // Invite user
  const handleInvite = (userId) => {
    const user = recommendations.find(u => u.id === userId);
    if (user) {
      setRecommendations(recommendations.filter(u => u.id !== userId));
      setSentInvitations([...sentInvitations, { ...user, status: 'pending', invitedAt: new Date() }]);
    }
  };

  // Accept request
  const handleAcceptRequest = (userId) => {
    const user = joinRequests.find(u => u.id === userId);
    if (user) {
      setJoinRequests(joinRequests.filter(u => u.id !== userId));
      // Could add to accepted members here
    }
  };

  // Decline request
  const handleDeclineRequest = (userId) => {
    setJoinRequests(joinRequests.filter(u => u.id !== userId));
  };

  // Revoke invitation
  const handleRevokeInvitation = (userId) => {
    const user = sentInvitations.find(u => u.id === userId);
    if (user) {
      setSentInvitations(sentInvitations.filter(u => u.id !== userId));
      setRecommendations([...recommendations, { ...user, status: undefined, invitedAt: undefined }]);
    }
  };

  // Filter and sort recommendations
  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations.filter(u => u.matchScore >= matchScoreFilter);
    
    if (sortBy === 'matchScore') {
      filtered.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return filtered;
  }, [recommendations, matchScoreFilter, sortBy]);

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getMatchBg = (score) => {
    if (score >= 80) return 'bg-green-900/20 border-green-700/30';
    if (score >= 60) return 'bg-yellow-900/20 border-yellow-700/30';
    return 'bg-orange-900/20 border-orange-700/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header with Mode Toggle */}
        <header className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Brain className="w-8 h-8 text-indigo-400" />
                  Smart Request Hub
                </h1>
                <p className="text-slate-400 text-sm mt-1">AI-powered group management</p>
              </div>
              
              {/* Mode Toggle */}
              <div className="flex items-center gap-4">
                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                  <button
                    onClick={() => setMode('student')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      mode === 'student'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Student Mode
                  </button>
                  <button
                    onClick={() => setMode('leader')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      mode === 'leader'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Leader Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Control Panel */}
          <div className="mb-8 bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Group Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter group code (try IT100)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </div>

              {/* Match Score Slider */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Min Match: {matchScoreFilter}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={matchScoreFilter}
                  onChange={(e) => setMatchScoreFilter(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700/30 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Sort Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none"
                >
                  <option value="matchScore">Match Score</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Help Info */}
            <details className="mt-4 group">
              <summary className="cursor-pointer flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                <Info className="w-4 h-4" />
                <span>How to use this hub</span>
              </summary>
              <div className="mt-3 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg text-sm text-slate-400 space-y-1">
                <p>📌 <strong>Student Mode:</strong> Find groups to join, send requests, and track invitations</p>
                <p>👥 <strong>Leader Mode:</strong> Review join requests and manage group membership</p>
                <p>🔍 <strong>Search:</strong> Try "IT100" to load sample data</p>
                <p>🌱 <strong>Seed Data:</strong> Click below to populate mock users for testing</p>
              </div>
            </details>
          </div>

          {/* Error Banner */}
          {searchError && (
            <div className="mb-6 p-4 bg-rose-900/20 border border-rose-700/30 rounded-lg flex items-start gap-3">
              <X className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-rose-300">{searchError}</p>
              </div>
            </div>
          )}

          {/* Seed Data Button */}
          {!dataSeeded && (
            <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-700/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <p className="text-indigo-200">No data loaded yet. Click to seed sample data.</p>
              </div>
              <button
                onClick={handleSeedData}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Seed Data
              </button>
            </div>
          )}

          {/* Content Sections */}
          {hasSearched ? (
            <div className="space-y-8">
              {/* Student Mode */}
              {mode === 'student' && (
                <>
                  {/* Recommended Groups Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                      Recommended Groups
                    </h2>
                    
                    {filteredAndSortedRecommendations.length === 0 ? (
                      <div className="text-center py-12 px-6 rounded-xl border border-slate-800/50 bg-slate-900/30">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-400 mb-1">No recommendations</h3>
                        <p className="text-sm text-slate-500">Adjust your match score filter to see more groups</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedRecommendations.map(user => (
                          <div
                            key={user.id}
                            className="group p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg hover:border-slate-700/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="text-3xl">{user.avatar}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{user.name}</h3>
                                <p className={`text-sm font-bold ${getMatchColor(user.matchScore)}`}>
                                  {user.matchScore}% Match
                                </p>
                              </div>
                            </div>

                            <div className={`p-2 rounded-md mb-3 border ${getMatchBg(user.matchScore)}`}>
                              <p className="text-xs text-slate-300">
                                Skills: {user.skills.join(', ')}
                              </p>
                            </div>

                            <button
                              onClick={() => handleInvite(user.id)}
                              className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Invite
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Sent Invitations Section */}
                  {sentInvitations.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Send className="w-6 h-6 text-slate-400" />
                        Sent Invitations
                      </h2>
                      <div className="space-y-3">
                        {sentInvitations.map(user => (
                          <div
                            key={user.id}
                            className="p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg flex items-center justify-between hover:border-slate-700/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{user.avatar}</div>
                              <div>
                                <h3 className="font-semibold text-white">{user.name}</h3>
                                <p className="text-xs text-slate-500">{user.skills.join(', ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-yellow-900/20 border border-yellow-700/30 text-yellow-300 text-xs font-medium rounded-full">
                                Pending
                              </span>
                              <button
                                onClick={() => handleRevokeInvitation(user.id)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {/* Leader Mode */}
              {mode === 'leader' && (
                <>
                  {/* Join Requests Section */}
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Inbox className="w-6 h-6 text-indigo-400" />
                      Join Requests
                    </h2>
                    
                    {joinRequests.length === 0 ? (
                      <div className="text-center py-12 px-6 rounded-xl border border-slate-800/50 bg-slate-900/30">
                        <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-400 mb-1">All caught up!</h3>
                        <p className="text-sm text-slate-500">No pending join requests at the moment</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {joinRequests.map(user => (
                          <div
                            key={user.id}
                            className="p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg flex items-center justify-between hover:border-slate-700/50 transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-2xl">{user.avatar}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{user.name}</h3>
                                <div className="flex items-center gap-3">
                                  <p className="text-xs text-slate-400">{user.skills.join(', ')}</p>
                                  <span className={`text-xs font-bold ${getMatchColor(user.matchScore)}`}>
                                    {user.matchScore}% Match
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptRequest(user.id)}
                                className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-all"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(user.id)}
                                className="p-2 text-rose-400 hover:bg-rose-900/20 rounded-lg transition-all"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Recommended Users to Invite */}
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-indigo-400" />
                      Recommended Users to Invite
                    </h2>
                    
                    {filteredAndSortedRecommendations.length === 0 ? (
                      <div className="text-center py-12 px-6 rounded-xl border border-slate-800/50 bg-slate-900/30">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-400 mb-1">No recommendations</h3>
                        <p className="text-sm text-slate-500">All top candidates have been invited</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedRecommendations.map(user => (
                          <div
                            key={user.id}
                            className="group p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg hover:border-slate-700/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="text-3xl">{user.avatar}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white">{user.name}</h3>
                                <p className={`text-sm font-bold ${getMatchColor(user.matchScore)}`}>
                                  {user.matchScore}% Match
                                </p>
                              </div>
                            </div>

                            <div className={`p-2 rounded-md mb-3 border ${getMatchBg(user.matchScore)}`}>
                              <p className="text-xs text-slate-300">
                                Skills: {user.skills.join(', ')}
                              </p>
                            </div>

                            <button
                              onClick={() => handleInvite(user.id)}
                              className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Send Invite
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Sent Invitations */}
                  {sentInvitations.length > 0 && (
                    <section>
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Send className="w-6 h-6 text-slate-400" />
                        Sent Invitations
                      </h2>
                      <div className="space-y-3">
                        {sentInvitations.map(user => (
                          <div
                            key={user.id}
                            className="p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg flex items-center justify-between hover:border-slate-700/50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{user.avatar}</div>
                              <div>
                                <h3 className="font-semibold text-white">{user.name}</h3>
                                <p className="text-xs text-slate-500">{user.skills.join(', ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-yellow-900/20 border border-yellow-700/30 text-yellow-300 text-xs font-medium rounded-full">
                                Awaiting Response
                              </span>
                              <button
                                onClick={() => handleRevokeInvitation(user.id)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-20 px-6">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-300 mb-2">Ready to get started?</h2>
              <p className="text-slate-500 mb-6">Search for a group code or seed sample data to begin</p>
              <button
                onClick={handleSeedData}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all inline-flex items-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Load Sample Data
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
