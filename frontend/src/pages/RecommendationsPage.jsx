import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { groupAPI, userAPI, joinRequestAPI } from '../api/api';
import { Search, Loader, X, AlertCircle, Users, CheckCircle, Clock, XCircle, Zap, ChevronRight, UserCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  calculateAIConfidence, calculateLearningPath, generateAIInsight,
  calculateTrendingScore, estimateSimilarStudents, calculatePercentileRanking,
  generateSmartPitch, smartSort,
} from '../utils/aiRecommendation';

// ── Local match computation ───────────────────────────────────────────────────
const computeMatch = (userSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return { matchScore: 0, matchedSkills: [], missingSkills: [] };
  const ul = userSkills.map(s => s.toLowerCase());
  const matched = requiredSkills.filter(s => ul.includes(s.toLowerCase()));
  const missing  = requiredSkills.filter(s => !ul.includes(s.toLowerCase()));
  return { matchScore: Math.round((matched.length / requiredSkills.length) * 100), matchedSkills: matched, missingSkills: missing };
};

const enrich = (group, userSkills = []) => {
  const { matchScore, matchedSkills, missingSkills } = computeMatch(userSkills, group.requiredSkills);
  const g = { ...group, matchScore, matchedSkills, missingSkills };
  const trending = calculateTrendingScore(g);
  return {
    ...g,
    aiConfidence:    calculateAIConfidence(g, matchedSkills),
    isTrending:      trending.isTrending,
    trendingScore:   trending.trendingScore,
    aiInsight:       generateAIInsight(g),
    learningPath:    missingSkills[0] ? calculateLearningPath(g, missingSkills[0]) : null,
    pitchTemplate:   generateSmartPitch(g, matchedSkills, missingSkills),
    similarStudents: estimateSimilarStudents(g, matchedSkills),
    percentile:      calculatePercentileRanking(matchScore),
    availableSlots:  (group.memberLimit || 5) - (group.members?.length || 0),
  };
};

// ── Minimal Status Badge ──────────────────────────────────────────────────────
const StatusBadge = ({ status, isDarkMode }) => {
  if (!status) return null;
  const cfg = {
    pending:  { label: 'Pending',  cls: isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-100 text-amber-700 border-amber-200' },
    accepted: { label: 'Accepted', cls: isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', cls: isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-100 text-red-700 border-red-200' },
    expired:  { label: 'Expired',  cls: isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-blue-100 text-blue-600 border-blue-200' },
  }[status] || { label: status, cls: isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-blue-50 text-blue-500 border-blue-200' };

  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Modern Group Card ──────────────────────────────────────────────────────────
const GroupCard = ({ group, reqStatus, onRequest, canSend, isDarkMode }) => {
  const isFull = group.availableSlots <= 0;

  return (
    <div className={`flex flex-col border rounded-2xl overflow-hidden transition-all duration-300 ${
      isDarkMode
        ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20'
        : 'bg-[#f4f7fb] border-[#e2e8f0] shadow-sm hover:shadow-md hover:border-[#ccd6e4]'
    }`}>
      {/* Top Header */}
      <div className={`px-5 py-4 border-b flex justify-between items-start gap-4 ${isDarkMode ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
        <div className="flex-1 min-w-0">
          <h3 className={`text-[15px] font-bold truncate ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>{group.title}</h3>
          <p className={`text-[13px] mt-1 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-[#475569]'}`}>{group.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-black tracking-tight ${
            group.matchScore >= 80 ? (isDarkMode ? 'text-emerald-400' : 'text-[#059669]') :
            group.matchScore >= 50 ? (isDarkMode ? 'text-blue-400' : 'text-[#0284c7]') :
            isDarkMode ? 'text-slate-500' : 'text-[#64748b]'
          }`}>
            {group.matchScore}%
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-[#64748b]'}`}>Match</span>
        </div>
      </div>

      {/* Skills body */}
      <div className="px-5 py-4 flex-1">
        {(group.matchedSkills?.length > 0 || group.missingSkills?.length > 0) ? (
          <div className="space-y-3">
            {group.matchedSkills?.length > 0 && (
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-500' : 'text-[#059669]'}`}>
                  <CheckCircle size={12} strokeWidth={2.5} /> Matched
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.matchedSkills.map(s => (
                    <span key={s} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe]'}`}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {group.missingSkills?.length > 0 && (
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDarkMode ? 'text-slate-500' : 'text-[#64748b]'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" /> Missing
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.missingSkills.map(s => (
                    <span key={s} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${isDarkMode ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-[#e2e8f0]/40 text-[#475569] border border-[#cbd5e1]'}`}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 opacity-60">
            {group.requiredSkills?.map(s => (
              <span key={s} className={`px-2 py-0.5 rounded text-[11px] font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#e2e8f0] text-[#334155]'}`}>{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Details & Action */}
      <div className={`p-4 mt-auto border-t flex flex-col gap-3 ${isDarkMode ? 'bg-[#0b1221] border-slate-800' : 'bg-[#eef2f6] border-[#e2e8f0]'}`}>
        <div className="flex items-center justify-between text-[12px] font-bold">
          <span className={`inline-flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-[#475569]'}`}>
            <UserCircle size={15} /> {group.members?.length || 0} / {group.memberLimit} joined
          </span>
          {isFull ? (
            <span className="text-[#ef4444] flex items-center gap-1"><XCircle size={12} strokeWidth={3} /> Full</span>
          ) : (
            <span className={isDarkMode ? 'text-emerald-400' : 'text-[#059669]'}>{group.availableSlots} spots left</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {reqStatus ? (
            <div className="flex-1 flex justify-center py-2"><StatusBadge status={reqStatus} isDarkMode={isDarkMode} /></div>
          ) : (
            <button
              disabled={!canSend || isFull}
              onClick={() => onRequest(group._id)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                !canSend || isFull
                  ? isDarkMode ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#cbd5e1] text-[#64748b] cursor-not-allowed'
                  : isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white shadow shadow-blue-500/20'
              }`}
            >
              Request to Join
            </button>
          )}
          <Link
            to={`/group/${group._id}`}
            className={`px-3 py-2.5 rounded-xl text-[13px] font-bold border transition-all no-underline ${
              isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-[#cbd5e1] bg-white text-[#334155] hover:bg-[#f1f5f9]'
            }`}
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── MOCK FALLBACK ─────────────────────────────────────────────────────────────
const MOCK = [
  { _id: 'm1', title: 'Full-Stack Web Dev', description: 'React + Node.js project team building a modern SaaS product', requiredSkills: ['React', 'Node.js', 'MongoDB'], members: [{_id:'u1'},{_id:'u2'}], memberLimit: 5, status: 'active' },
  { _id: 'm2', title: 'Mobile App Crew', description: 'iOS & Android development with React Native', requiredSkills: ['React Native', 'JavaScript', 'Figma'], members: [{_id:'u1'}], memberLimit: 4, status: 'active' },
];

export default function RecommendationsPage() {
  const { isDarkMode } = useTheme();

  const [userId, setUserId]         = useState(localStorage.getItem('userId') || '');
  const [userSkills, setUserSkills] = useState([]);
  const [allGroups, setAllGroups]   = useState([]);
  const [enriched, setEnriched]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy]         = useState('match');
  const [requestMap, setRequestMap] = useState({});

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await groupAPI.getAll();
      const groups = res.data?.data || res.data || [];
      return groups.length ? groups : MOCK;
    } catch { return MOCK; } finally { setLoading(false); }
  }, []);

  const fetchUserSkills = useCallback(async (uid) => {
    if (!uid?.trim()) return [];
    try {
      const res = await userAPI.getById(uid.trim());
      const skills = res.data?.data?.skills || res.data?.skills || [];
      setUserSkills(skills);
      return skills;
    } catch { setUserSkills([]); return []; }
  }, []);

  const fetchRequests = useCallback(async (uid) => {
    if (!uid?.trim()) return;
    try {
      const res  = await joinRequestAPI.getStudentRequests(uid.trim());
      const reqs = res.data?.requests || res.data?.data || [];
      const map  = {};
      reqs.forEach(r => {
        const gid = r.groupId?._id || r.groupId;
        if (!map[gid] || r.status === 'accepted' || r.status === 'pending') map[gid] = r.status;
      });
      setRequestMap(map);
    } catch { setRequestMap({}); }
  }, []);

  useEffect(() => { if (allGroups.length) setEnriched(allGroups.map(g => enrich(g, userSkills))); }, [allGroups, userSkills]);

  useEffect(() => {
    const uid = localStorage.getItem('userId') || '';
    fetchGroups().then(setAllGroups);
    if (uid) { fetchUserSkills(uid); fetchRequests(uid); }
  }, []);

  const handleLoad = async () => {
    const uid = userId.trim();
    localStorage.setItem('userId', uid);
    const groups = await fetchGroups();
    setAllGroups(groups);
    const skills = await fetchUserSkills(uid);
    setUserSkills(skills);
    fetchRequests(uid);
  };

  const handleRequest = async (groupId) => {
    if (!userId.trim()) return;
    try {
      await joinRequestAPI.send({ fromUserId: userId.trim(), groupId, requestType: 'join', message: '' });
      setRequestMap(prev => ({ ...prev, [groupId]: 'pending' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
      setTimeout(() => setError(null), 4000);
    }
  };

  const displayed = smartSort(
    enriched.filter(g => {
      if (!searchTerm.trim()) return true;
      const t = searchTerm.toLowerCase();
      return (g.title?.toLowerCase().includes(t) || g.description?.toLowerCase().includes(t) || g.requiredSkills?.some(s => s.toLowerCase().includes(t)));
    }),
    sortBy
  );

  const SORT_TABS = [
    { id: 'match',      label: 'Highest Match'  },
    { id: 'trending',   label: 'Trending'       },
    { id: 'slots',      label: 'Open Spots'     },
    { id: 'growth',     label: 'Learning Path'  },
  ];

  const openCount = enriched.filter(g => g.availableSlots > 0).length;
  const sentCount = Object.keys(requestMap).length;
  const avgMatch  = enriched.length ? Math.round(enriched.reduce((a, g) => a + g.matchScore, 0) / enriched.length) : 0;

  return (
    <div className="min-h-full">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className={`text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Recommendations</h1>
        <p className={`text-[15px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-[#64748b]'}`}>Groups perfectly matched to your skill profile.</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Matches', value: enriched.length },
          { label: 'Open Groups',   value: openCount },
          { label: 'Avg Match',     value: `${avgMatch}%` },
          { label: 'Requests Sent', value: sentCount },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border ${isDarkMode ? 'bg-[#0f172a] border-slate-800 shadow-lg shadow-black/10' : 'bg-[#f4f7fb] border-[#e2e8f0]'}`}>
            <p className={`text-[11px] font-black uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'}`}>{s.label}</p>
            <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${isDarkMode ? 'bg-red-950/30 border-red-900 text-red-400' : 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'}`}>
          <AlertCircle size={18} />
          <p className="flex-1 text-[13px] font-bold">{error}</p>
          <button onClick={() => setError(null)}><X size={16} className="opacity-70 hover:opacity-100" /></button>
        </div>
      )}

      {/* ── Tools Row (User ID & Search) ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* User ID block */}
        <div className={`flex-1 p-1.5 rounded-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-[#eef2f6] border-[#dbeafe]'}`}>
          <div className="flex">
            <input
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLoad()}
              placeholder="Enter User ID to load matching"
              className={`flex-1 px-5 py-3 bg-transparent text-[14px] font-bold outline-none ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-[#1e293b] placeholder-[#94a3b8]'}`}
            />
            <button onClick={handleLoad} className={`px-8 py-3 rounded-xl text-[13px] font-black tracking-wide transition-all ${isDarkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow shadow-blue-500/20'}`}>LOAD</button>
          </div>
        </div>
        {/* Search block */}
        <div className={`md:w-72 p-1.5 rounded-2xl border flex items-center ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-[#e2e8f0] shadow-sm'}`}>
          <Search size={18} strokeWidth={2.5} className={`ml-4 ${isDarkMode ? 'text-slate-600' : 'text-[#cbd5e1]'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search groups..."
            className={`flex-1 px-3 py-3 bg-transparent text-[14px] font-bold outline-none ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-[#1e293b] placeholder-[#94a3b8]'}`}
          />
        </div>
      </div>

      {/* ── Current Skills ── */}
      {userSkills.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <span className={`text-[12px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-[#64748b]'}`}>Your Profile:</span>
          <div className="flex gap-2">
            {userSkills.map(s => (
              <span key={s} className={`px-4 py-1.5 rounded-full text-[12px] font-black tracking-wide ${isDarkMode ? 'bg-slate-800 text-slate-300 border border-slate-700 shadow-md shadow-black/20' : 'bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe]'}`}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Sort Tabs ── */}
      <div className={`mb-8 flex gap-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
        {SORT_TABS.map(t => (
           <button
             key={t.id}
             onClick={() => setSortBy(t.id)}
             className={`px-5 py-4 text-[14px] font-black transition-all border-b-[3px] -mb-px ${
               sortBy === t.id
                 ? isDarkMode ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-[#2563eb] text-[#2563eb]'
                 : isDarkMode ? 'border-transparent text-slate-500 hover:text-slate-300' : 'border-transparent text-[#94a3b8] hover:text-[#475569]'
             }`}
           >
             {t.label}
           </button>
        ))}
      </div>

      {/* ── Content Grid ── */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader className="animate-spin text-[#3b82f6]" size={40} /></div>
      ) : displayed.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayed.map(group => (
             <GroupCard key={group._id} group={group} reqStatus={requestMap[group._id]} onRequest={handleRequest} canSend={!!userId.trim()} isDarkMode={isDarkMode} />
          ))}
        </div>
      ) : (
        <div className={`text-center py-24 rounded-[32px] border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white border border-[#e2e8f0]'}`}>
            <Search size={32} strokeWidth={2.5} className={isDarkMode ? 'text-slate-500' : 'text-[#94a3b8]'} />
          </div>
          <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>No matches found</h3>
          <p className={`font-semibold ${isDarkMode ? 'text-slate-500' : 'text-[#64748b]'}`}>Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}
