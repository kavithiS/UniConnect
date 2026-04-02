import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { groupAPI, recommendationAPI, invitationAPI } from '../api/api';
import { ArrowLeft, Users, Zap, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GroupDetailsPage = () => {
  const { isDarkMode } = useTheme();
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [invitedUsers, setInvitedUsers] = useState(new Set());

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const groupResponse = await groupAPI.getById(id);
      setGroup(groupResponse.data.data);

      const usersResponse = await recommendationAPI.getUsersForGroup(id);
      setRecommendedUsers(usersResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (userId) => {
    try {
      await invitationAPI.send({
        studentId: userId,
        groupId: id,
        message: `You are invited to join ${group.title}`
      });
      setInvitedUsers(prev => new Set(prev).add(userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  if (loading) return <div className={`p-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loading...</div>;
  if (error) return <div className={`p-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</div>;
  if (!group) return <div className={`p-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Group not found</div>;

  const memberPercentage = (group.members.length / group.memberLimit) * 100;

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className="mb-8">
        <a href="/groups" className={`flex items-center gap-2 mb-4 hover:opacity-80 transition ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
          <ArrowLeft className="w-5 h-5" />
          Back to Groups
        </a>
        <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{group.title}</h1>
        <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{group.description}</p>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`border rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Members</p>
          <div className="flex items-end justify-between">
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {group.members.length}/{group.memberLimit}
            </p>
            <div className={`w-24 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}>
              <div
                className={`h-full transition-all ${
                  memberPercentage > 75 ? 'bg-red-500' :
                  memberPercentage > 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(memberPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status</p>
          <p className={`text-2xl font-bold capitalize ${
            group.status === 'active' ? 'text-green-500' :
            group.status === 'closed' ? 'text-yellow-500' :
            'text-slate-500'
          }`}>
            {group.status}
          </p>
        </div>

        <div className={`border rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Required Skills</p>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{group.requiredSkills.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-4 mb-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
        {['details', 'members', 'recommendations'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold transition border-b-2 ${
              activeTab === tab
                ? isDarkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600'
                : isDarkMode ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'details' ? 'Details' : tab === 'members' ? 'Members' : 'Recommended'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={`border rounded-lg p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Required Skills</h2>
            <div className="flex gap-2 flex-wrap">
              {group.requiredSkills.map(skill => (
                <span key={skill} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-200 text-blue-700'}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Group Members</h2>
            {group.members.length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No members yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.map(member => (
                  <div key={member._id} className={`border rounded-lg p-4 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{member.name}</h3>
                          {member.role && (
                            <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'text-blue-400 bg-blue-500/20' : 'text-blue-700 bg-blue-200'}`}>
                              {member.role}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>ID: {member._id}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {member.skills?.map(skill => (
                        <span key={skill} className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-slate-600 text-slate-200' : 'bg-slate-300 text-slate-700'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recommended Users</h2>
            {recommendedUsers.length === 0 ? (
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No user recommendations available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedUsers.map(user => {
                  const matchScore = user.matchScore || 0;
                  const matchTier = matchScore >= 80 ? 'Excellent' : matchScore >= 60 ? 'Good' : matchScore >= 40 ? 'Fair' : 'Poor';
                  const tierColor = matchScore >= 80 ? (isDarkMode ? 'text-green-500 bg-green-500/20' : 'text-green-700 bg-green-200') : 
                                   matchScore >= 60 ? (isDarkMode ? 'text-blue-500 bg-blue-500/20' : 'text-blue-700 bg-blue-200') : 
                                   matchScore >= 40 ? (isDarkMode ? 'text-yellow-500 bg-yellow-500/20' : 'text-yellow-700 bg-yellow-200') : 
                                   (isDarkMode ? 'text-red-500 bg-red-500/20' : 'text-red-700 bg-red-200');
                  
                  return (
                    <div key={user._id} className={`border rounded-lg p-4 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-300'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</h3>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${tierColor}`}>
                            {matchTier}
                          </span>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${tierColor}`}>
                          {matchScore}%
                        </div>
                      </div>

                      {/* Analysis Text */}
                      {user.analysis && (
                        <div className={`mb-3 p-2 rounded text-xs ${isDarkMode ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-300 text-slate-700'}`}>
                          {user.analysis}
                        </div>
                      )}

                      {/* Matched Skills */}
                      {user.matchedSkills && user.matchedSkills.length > 0 && (
                        <div className="mb-3">
                          <p className={`text-xs mb-1 font-semibold ${isDarkMode ? 'text-slate-400 text-green-400' : 'text-slate-600 text-green-600'}`}>
                            ✓ Matched ({user.matchedSkills.length})
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {user.matchedSkills.map(skill => (
                              <span key={skill} className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-200 text-green-700'}`}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {user.missingSkills && user.missingSkills.length > 0 && (
                        <div className="mb-3">
                          <p className={`text-xs mb-1 font-semibold ${isDarkMode ? 'text-slate-400 text-orange-400' : 'text-slate-600 text-orange-600'}`}>
                            ✗ Missing ({user.missingSkills.length})
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {user.missingSkills.map(skill => (
                              <span key={skill} className={`px-2 py-1 rounded text-xs ${isDarkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-200 text-orange-700'}`}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      {user.recommendation && (
                        <div className={`mb-3 p-2 rounded border text-xs ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-slate-300' : 'bg-blue-100 border-blue-300 text-slate-700'}`}>
                          <p className={`font-semibold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Rec:</p>
                          {user.recommendation}
                        </div>
                      )}

                      <button
                        onClick={() => handleInviteUser(user._id)}
                        disabled={invitedUsers.has(user._id)}
                        className={`w-full py-2 px-3 rounded-lg font-semibold transition ${
                          invitedUsers.has(user._id)
                            ? isDarkMode ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-slate-400 text-slate-100 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        }`}
                      >
                        {invitedUsers.has(user._id) ? 'Invited' : 'Invite'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
