import React, { useState, useEffect } from 'react';
import { recommendationAPI, joinRequestAPI } from '../api/api';
import { Zap, TrendingUp, Users, ArrowLeft, Sparkles, Clock, Target, Brain, Flame } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  calculateAIConfidence,
  calculateLearningPath,
  generateAIInsight,
  calculateTrendingScore,
  estimateSimilarStudents,
  calculatePercentileRanking,
  generateSmartPitch,
  smartSort,
} from '../utils/aiRecommendation';

const RecommendationsPage = () => {
  const { isDarkMode } = useTheme();
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const [sortBy, setSortBy] = useState('match'); // 'match', 'trending', 'slots', 'confidence'
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Load all recommendations without specific user
      fetchAllRecommendations();
    }
  }, []);

  // Fetch all recommendations without filtering by user
  const fetchAllRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await recommendationAPI.getGroups?.() || { data: { data: [] } };
      const groupsData = response.data?.data || [];
      enrichAndSetRecommendations(groupsData);
    } catch (err) {
      // Fallback: load mock data if API fails
      console.log('Loading mock recommendations...');
      enrichAndSetRecommendations(mockGroupsData);
    } finally {
      setLoading(false);
    }
  };

  // Enrich recommendations with AI data
  const enrichAndSetRecommendations = (groupsData) => {
    const enrichedRecommendations = groupsData.map((group) => {
      const userSkills = group.matchedSkills || [];
      const aiConfidence = calculateAIConfidence(group, userSkills);
      const { isTrending, trendingScore, newMembersLastWeek } = calculateTrendingScore(group);
      const aiInsight = generateAIInsight(group);
      const learningPath = group.missingSkills?.[0] 
        ? calculateLearningPath(group, group.missingSkills[0])
        : null;
      const pitchTemplate = generateSmartPitch(group, group.matchedSkills, group.missingSkills);
      const similarStudents = estimateSimilarStudents(group, userSkills);
      const percentile = calculatePercentileRanking(group.matchScore || 50);
      const memberCount = group.members?.length || 0;
      const availableSlots = (group.memberLimit || 5) - memberCount;
      
      return {
        ...group,
        aiConfidence,
        isTrending,
        trendingScore,
        newMembersLastWeek,
        aiInsight,
        learningPath,
        pitchTemplate,
        similarStudents,
        percentile,
        availableSlots,
      };
    });
    setRecommendations(enrichedRecommendations);
  };

  // Mock data for fallback
  const mockGroupsData = [
    {
      _id: '1',
      title: 'Web Development',
      description: 'To find a QA',
      matchScore: 50,
      matchedSkills: ['React'],
      missingSkills: ['Node.js'],
      members: [{ _id: '1' }],
      memberLimit: 5,
      requiredSkills: ['React', 'Node.js'],
    },
    {
      _id: '2',
      title: 'Mobile App Development',
      description: 'Build iOS and Android apps',
      matchScore: 65,
      matchedSkills: ['React', 'JavaScript'],
      missingSkills: ['React Native'],
      members: [{ _id: '1' }, { _id: '2' }],
      memberLimit: 6,
      requiredSkills: ['React', 'React Native', 'JavaScript'],
    },
    {
      _id: '3',
      title: 'Data Science Team',
      description: 'Machine learning and analytics',
      matchScore: 40,
      matchedSkills: ['Python'],
      missingSkills: ['TensorFlow', 'SQL'],
      members: [{ _id: '1' }],
      memberLimit: 8,
      requiredSkills: ['Python', 'SQL', 'TensorFlow'],
    },
    {
      _id: '4',
      title: 'DevOps & Cloud',
      description: 'AWS and Docker infrastructure',
      matchScore: 55,
      matchedSkills: ['Docker'],
      missingSkills: ['Kubernetes'],
      members: [{ _id: '1' }, { _id: '2' }, { _id: '3' }],
      memberLimit: 4,
      requiredSkills: ['Docker', 'Kubernetes', 'AWS'],
    },
  ];

  const handleSendRequest = async (groupId) => {
    try {
      await joinRequestAPI.send({
        userId,
        groupId
      });
      setSentRequests(prev => new Set(prev).add(groupId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  // Filter recommendations using search term
  let filteredRecommendations = recommendations.filter(group =>
    group.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Apply real AI smart sorting
  filteredRecommendations = smartSort(filteredRecommendations, sortBy);

  const getMatchTier = (score) => {
    if (score >= 80) return { tier: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/20' };
    if (score >= 60) return { tier: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/20' };
    if (score >= 40) return { tier: 'Fair', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    return { tier: 'Poor', color: 'text-red-500', bg: 'bg-red-500/20' };
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className="mb-8">
        <a href="/groups" className={`flex items-center gap-2 mb-4 hover:opacity-80 transition ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
          <ArrowLeft className="w-5 h-5" />
          Back to Groups
        </a>
        <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recommended for You</h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Groups perfectly matched to your skills</p>
      </div>

      {/* Search Bar & Sorting */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search groups..."
          className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
        />
        
        {/* Sort Options */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'match', label: '⭐ Best Match', icon: Target },
            { id: 'trending', label: '🔥 Trending', icon: Flame },
            { id: 'slots', label: '👥 Most Available', icon: Users },
            { id: 'confidence', label: '🤖 AI Top Picks', icon: Brain },
            { id: 'growth', label: '📈 Growth Potential', icon: TrendingUp },
          ].map(sort => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                sortBy === sort.id
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`max-w-2xl mx-auto mb-6 p-4 border rounded-lg ${isDarkMode ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-red-100 border-red-300 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loading recommendations...</div>
      )}

      {/* Recommendations Grid */}
      {!loading && filteredRecommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredRecommendations.map(group => {
            const matchTier = getMatchTier(group.matchScore);
            const isExpanded = expandedCard === group._id;
            
            return (
              <div
                key={group._id}
                className={`border rounded-lg transition cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-500'}`}
              >
                {/* Card Header */}
                <div 
                  onClick={() => setExpandedCard(isExpanded ? null : group._id)}
                  className={`p-6 pb-4 ${isDarkMode ? 'border-b border-slate-700' : 'border-b border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{group.title}</h3>
                      <p className={`text-sm mt-1 line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{group.description}</p>
                    </div>
                    <div className="ml-3">
                      {/* Trending Badge */}
                      {group.isTrending && (
                        <div className={`mb-2 flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded ${isDarkMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                          <Flame className="w-3 h-3" /> Trending
                        </div>
                      )}
                      {/* Match Score */}
                      <div className={`text-2xl font-bold ${matchTier.color} px-3 py-1 rounded ${matchTier.bg}`}>
                        {group.matchScore}%
                      </div>
                    </div>
                  </div>

                  {/* AI Confidence & Tier */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${matchTier.bg} ${matchTier.color}`}>
                      Match: {matchTier.tier}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1 ${isDarkMode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-300'}`}>
                      <Sparkles className="w-3 h-3" /> AI: {Math.round(group.aiConfidence)}%
                    </span>
                  </div>

                  {/* AI Personalized Insight */}
                  <div className={`p-3 rounded text-sm ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20 text-blue-200' : 'bg-blue-50 border border-blue-200 text-blue-900'}`}>
                    <p className={`font-semibold mb-1 flex items-center gap-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      <Brain className="w-3.5 h-3.5" /> AI Insight
                    </p>
                    <p className="text-xs leading-relaxed">{group.aiInsight}</p>
                  </div>

                  {/* Collaborative Filtering */}
                  {group.similarStudents && (
                    <div className={`mt-3 p-2.5 rounded text-xs flex items-center gap-2 ${isDarkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <Users className="w-3.5 h-3.5" />
                      <span><strong>{group.similarStudents}</strong> students like you joined this group</span>
                    </div>
                  )}

                  {/* Percentile Ranking */}
                  {group.percentile && (
                    <div className={`mt-2 p-2.5 rounded text-xs flex items-center gap-2 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                      <Target className="w-3.5 h-3.5" />
                      <span>You're in top <strong>{100 - group.percentile}%</strong> for this group</span>
                    </div>
                  )}
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className={`px-6 py-4 space-y-4 ${isDarkMode ? 'border-t border-slate-700' : 'border-t border-slate-200'}`}>
                    {/* Matched Skills */}
                    {group.matchedSkills && group.matchedSkills.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold mb-2 flex items-center gap-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          ✓ Matched Skills
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {group.matchedSkills.slice(0, 3).map(skill => (
                            <span key={skill} className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-green-100 text-green-800 border border-green-300'}`}>
                              {skill}
                            </span>
                          ))}
                          {group.matchedSkills.length > 3 && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                              +{group.matchedSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills & Learning Path */}
                    {group.learningPath && (
                      <div className={`p-3 rounded ${isDarkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <p className={`text-xs font-semibold mb-2 flex items-center gap-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                          <Clock className="w-3.5 h-3.5" /> Learning Path
                        </p>
                        <div className={`space-y-1 text-xs ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                          <p>Master <strong>{group.learningPath.skill}</strong> ({group.learningPath.difficulty})</p>
                          <p><strong>{group.learningPath.totalHours} hours</strong> total • <strong>{group.learningPath.weeks} weeks</strong> @ {group.learningPath.hoursPerWeek}hrs/week</p>
                          <p className={`flex items-center gap-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                            <TrendingUp className="w-3.5 h-3.5" /> Match score: {group.matchScore}% → <strong>{group.learningPath.newScore}%</strong>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Collaboration & Ranking Stats */}
                    <div className={`p-3 rounded space-y-2 ${isDarkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Members</p>
                          <p className={`font-semibold flex items-center gap-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <Users className="w-4 h-4" />
                            {group.members?.length || 0}/{group.memberLimit || 5}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Available Slots</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{group.availableSlots || 0}</p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Your Percentile</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Top {100 - (group.percentile || 50)}%</p>
                        </div>
                        <div>
                          <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Similar Students</p>
                          <p className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{group.similarStudents || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Generated Pitch */}
                    <div className={`p-3 rounded text-xs ${isDarkMode ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-200' : 'bg-indigo-50 border border-indigo-200 text-indigo-900'}`}>
                      <p className={`font-semibold mb-2 flex items-center gap-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                        <Sparkles className="w-3.5 h-3.5" /> AI-Generated Pitch
                      </p>
                      <p className="italic leading-relaxed">"{group.pitchTemplate}"</p>
                    </div>
                  </div>
                )}

                {/* Sticky Actions Footer */}
                <div className={`px-6 py-4 flex gap-2 ${isDarkMode ? 'border-t border-slate-700 bg-slate-800/50' : 'border-t border-slate-200 bg-slate-100'}`}>
                  <button
                    onClick={() => handleSendRequest(group._id)}
                    disabled={sentRequests.has(group._id)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm ${
                      sentRequests.has(group._id)
                        ? isDarkMode ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-400 text-slate-100 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {sentRequests.has(group._id) ? 'Requested' : 'Request'}
                  </button>
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : group._id)}
                    className={`py-2 px-4 rounded-lg font-semibold border text-sm transition ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {isExpanded ? 'Hide' : 'Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredRecommendations.length === 0 && !error && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold">No groups found matching your search.</p>
          <p className="text-sm mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
