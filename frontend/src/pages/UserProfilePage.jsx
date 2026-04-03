import React, { useEffect, useMemo, useState } from 'react';
import { fetchFeedbackReceived, getAuthToken, setupUserProfile } from '../services/authService';
import Toast from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Code,
  Edit3,
  GraduationCap,
  Mail,
  Plus,
  Save,
  Star,
  User,
  X,
} from 'lucide-react';

function UserProfilePage({ user }) {
  const { isDarkMode } = useTheme();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [editFormData, setEditFormData] = useState(() => ({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    registrationNumber: user?.registrationNumber || '',
    year: user?.year || '',
    semester: user?.semester || '',
    enrolledYear: user?.enrolledYear || '',
    skills: Array.isArray(user?.skills) ? [...user.skills] : [],
    about: user?.about || '',
  }));

  useEffect(() => {
    setEditFormData({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      registrationNumber: user?.registrationNumber || '',
      year: user?.year || '',
      semester: user?.semester || '',
      enrolledYear: user?.enrolledYear || '',
      skills: Array.isArray(user?.skills) ? [...user.skills] : [],
      about: user?.about || '',
    });
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const loadFeedback = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        if (!token) {
          if (isMounted) {
            setFeedbackList([]);
          }
          return;
        }
        const data = await fetchFeedbackReceived(token);
        if (isMounted) {
          setFeedbackList(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setFeedbackList([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeedback();
    return () => {
      isMounted = false;
    };
  }, []);

  const profileCompletion = useMemo(() => {
    const fields = [
      editFormData.fullName,
      editFormData.email,
      editFormData.registrationNumber,
      editFormData.year,
      editFormData.semester,
      editFormData.enrolledYear,
      editFormData.about,
    ];
    const filled = fields.filter((value) => String(value || '').trim().length > 0).length;
    const skillScore = editFormData.skills.length > 0 ? 1 : 0;
    return Math.min(100, Math.round(((filled + skillScore) / (fields.length + 1)) * 100));
  }, [editFormData]);

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || editFormData.skills.includes(trimmed)) {
      return;
    }
    setEditFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setEditFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Please sign in again to update your profile.');
      }

      await setupUserProfile(token, {
        ...editFormData,
        profileCompleted: true,
      });

      setToast({ message: 'Profile updated successfully.', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      const message = error?.message || 'Update failed.';
      setToast({ message, type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 transition-colors duration-300">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div
        className={`rounded-2xl border overflow-hidden transition-colors ${
          isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'
        }`}
      >
        <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                }`}
              >
                {(user?.fullName || user?.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                  {user?.fullName || user?.name || 'User'}
                </h1>
                <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {user?.registrationNumber || 'Complete your profile'}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-lg font-semibold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <StatCard label="Profile Completion" value={`${profileCompletion}%`} accent="indigo" isDark={isDarkMode} />
          <StatCard label="Skills" value={editFormData.skills.length} accent="purple" isDark={isDarkMode} />
          <StatCard label="Feedback Received" value={feedbackList.length} accent="pink" isDark={isDarkMode} />
          <StatCard label="Verified" value={user?.profileCompleted ? '✓' : '○'} accent="amber" isDark={isDarkMode} />
        </div>
      </div>

      {isEditing ? (
        <div
          className={`rounded-2xl border p-6 space-y-6 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Edit Your Profile
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 border ${
                  isDarkMode
                    ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              name="fullName"
              value={editFormData.fullName}
              onChange={handleEditChange}
              icon={<User size={16} />}
              isDark={isDarkMode}
            />
            <InputField
              label="Email"
              name="email"
              value={editFormData.email}
              onChange={handleEditChange}
              icon={<Mail size={16} />}
              isDark={isDarkMode}
            />
            <InputField
              label="Registration Number"
              name="registrationNumber"
              value={editFormData.registrationNumber}
              onChange={handleEditChange}
              icon={<GraduationCap size={16} />}
              isDark={isDarkMode}
            />
            <InputField
              label="Year"
              name="year"
              value={editFormData.year}
              onChange={handleEditChange}
              icon={<Calendar size={16} />}
              isDark={isDarkMode}
            />
            <InputField
              label="Semester"
              name="semester"
              value={editFormData.semester}
              onChange={handleEditChange}
              icon={<Clock size={16} />}
              isDark={isDarkMode}
            />
            <InputField
              label="Enrolled Year"
              name="enrolledYear"
              value={editFormData.enrolledYear}
              onChange={handleEditChange}
              icon={<BookOpen size={16} />}
              isDark={isDarkMode}
            />
          </div>

          <div className="space-y-3">
            <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Skills & Expertise
            </label>
            <div className="flex flex-wrap gap-2">
              {editFormData.skills.length === 0 ? (
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No skills added yet
                </p>
              ) : (
                editFormData.skills.map((skill) => (
                  <div
                    key={skill}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                      isDarkMode
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                        : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    <span className="text-sm">{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:opacity-70 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                placeholder="Add a skill"
                className={`flex-1 min-w-[180px] px-4 py-2 rounded-lg outline-none transition ${
                  isDarkMode
                    ? 'bg-slate-950/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          <div>
            <label className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              About You
            </label>
            <textarea
              name="about"
              value={editFormData.about}
              onChange={handleEditChange}
              rows="4"
              placeholder="Tell teammates about yourself, your interests, and what you're looking for..."
              className={`w-full mt-2 px-4 py-3 rounded-lg outline-none transition resize-none ${
                isDarkMode
                  ? 'bg-slate-950/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                <GraduationCap size={18} /> Academic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard icon={<User size={16} />} label="Full Name" value={user?.fullName || user?.name || '-'} isDark={isDarkMode} />
                <InfoCard icon={<Mail size={16} />} label="Email" value={user?.email || '-'} isDark={isDarkMode} />
                <InfoCard icon={<GraduationCap size={16} />} label="Registration" value={user?.registrationNumber || '-'} isDark={isDarkMode} />
                <InfoCard icon={<Calendar size={16} />} label="Year" value={user?.year || '-'} isDark={isDarkMode} />
                <InfoCard icon={<Clock size={16} />} label="Semester" value={user?.semester || '-'} isDark={isDarkMode} />
                <InfoCard icon={<BookOpen size={16} />} label="Enrolled" value={user?.enrolledYear || '-'} isDark={isDarkMode} />
              </div>
            </div>

            <div className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
              <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                <Award size={18} /> About
              </h2>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {user?.about || 'Tell teammates about yourself, your interests, and what you want to build.'}
              </p>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
            <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              <Code size={18} /> Skills & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {(user?.skills || []).length === 0 ? (
                <div className={`text-center w-full py-8 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                  <Code size={28} className={`mx-auto mb-3 opacity-50 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No skills added yet
                  </p>
                </div>
              ) : (
                user.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      isDarkMode
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200'
                        : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
          <Star size={20} /> Feedback from Teammates
        </h2>
        {loading ? (
          <div className={`text-center py-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading feedback...
          </div>
        ) : feedbackList.length === 0 ? (
          <div className={`text-center py-10 rounded-xl ${isDarkMode ? 'bg-slate-800/30' : 'bg-slate-100'}`}>
            <Star size={36} className={`mx-auto mb-3 opacity-30 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              No feedback received yet. Collaborate with more teammates!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {feedbackList.map((feedback) => (
              <div
                key={feedback._id}
                className={`p-4 rounded-xl border ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-800/50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {feedback.reviewer?.fullName || feedback.reviewer?.name || 'Anonymous'}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {feedback.reviewer?.registrationNumber || 'Fellow Student'}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                    isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-semibold">{feedback.rating || 0}/5</span>
                  </div>
                </div>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  "{feedback.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, isDark }) {
  const accentMap = {
    indigo: isDark ? 'text-indigo-300' : 'text-indigo-600',
    purple: isDark ? 'text-purple-300' : 'text-purple-600',
    pink: isDark ? 'text-pink-300' : 'text-pink-600',
    amber: isDark ? 'text-amber-300' : 'text-amber-600',
  };
  return (
    <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-2xl font-bold ${accentMap[accent]}`}>{value}</p>
    </div>
  );
}

function InfoCard({ icon, label, value, isDark }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
      <div className={`${isDark ? 'text-indigo-300' : 'text-indigo-500'}`}>{icon}</div>
      <div>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, icon, isDark }) {
  return (
    <label className="space-y-2">
      <span className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        {icon}
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg outline-none transition ${
          isDark
            ? 'bg-slate-950/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
            : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
        }`}
      />
    </label>
  );
}

export default UserProfilePage;
