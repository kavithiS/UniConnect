import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchFeedbackReceived,
  getAuthToken,
  setupUserProfile,
} from "../services/authService";
import { groupAPI } from "../api/api";
import Toast from "../components/Toast";
import { useTheme } from "../context/ThemeContext";
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
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";

function UserProfilePage({ user, onUserUpdate }) {
  const { isDarkMode } = useTheme();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [editFormData, setEditFormData] = useState(() => ({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    registrationNumber: user?.registrationNumber || "",
    year: user?.year || "",
    semester: user?.semester || "",
    enrolledYear: user?.enrolledYear || "",
    skills: Array.isArray(user?.skills) ? [...user.skills] : [],
    achievements: Array.isArray(user?.achievements)
      ? [...user.achievements]
      : [],
    about: user?.about || "",
  }));

  useEffect(() => {
    setEditFormData({
      fullName: user?.fullName || user?.name || "",
      email: user?.email || "",
      registrationNumber: user?.registrationNumber || "",
      year: user?.year || "",
      semester: user?.semester || "",
      enrolledYear: user?.enrolledYear || "",
      skills: Array.isArray(user?.skills) ? [...user.skills] : [],
      achievements: Array.isArray(user?.achievements)
        ? [...user.achievements]
        : [],
      about: user?.about || "",
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

  useEffect(() => {
    let isMounted = true;

    const normalizeMemberId = (member) => {
      if (!member) return "";
      if (typeof member === "string") return member;
      return member._id || "";
    };

    const loadJoinedGroups = async () => {
      try {
        const currentUserId =
          user?._id ||
          localStorage.getItem("userId") ||
          localStorage.getItem("currentUserId") ||
          "";
        if (!currentUserId) {
          if (isMounted) setJoinedGroups([]);
          return;
        }

        const response = await groupAPI.getAll();
        const allGroups = response?.data?.data || response?.data || [];
        const joined = (Array.isArray(allGroups) ? allGroups : [])
          .filter((group) =>
            (group.members || []).some(
              (member) =>
                normalizeMemberId(member)?.toString() ===
                currentUserId.toString(),
            ),
          )
          .map((group) => ({
            id: group._id,
            name: group.title,
          }))
          .filter((group) => group.id && group.name);

        if (isMounted) {
          setJoinedGroups(joined);
        }
      } catch {
        if (isMounted) {
          setJoinedGroups([]);
        }
      }
    };

    const handleGroupMembershipChanged = () => {
      loadJoinedGroups();
    };

    loadJoinedGroups();
    window.addEventListener(
      "group-membership-changed",
      handleGroupMembershipChanged,
    );

    return () => {
      isMounted = false;
      window.removeEventListener(
        "group-membership-changed",
        handleGroupMembershipChanged,
      );
    };
  }, [user?._id]);

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
    const filled = fields.filter(
      (value) => String(value || "").trim().length > 0,
    ).length;
    const skillScore = editFormData.skills?.length > 0 ? 1 : 0;
    const achievementScore = editFormData.achievements?.length > 0 ? 1 : 0;
    return Math.min(
      100,
      Math.round(
        ((filled + skillScore + achievementScore) / (fields.length + 2)) * 100,
      ),
    );
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
    setNewSkill("");
  };

  const handleRemoveSkill = (skill) => {
    setEditFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };

  const handleAddAchievement = () => {
    const trimmed = newAchievement.trim();
    if (!trimmed || editFormData.achievements.includes(trimmed)) {
      return;
    }
    setEditFormData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, trimmed],
    }));
    setNewAchievement("");
  };

  const handleRemoveAchievement = (achievement) => {
    setEditFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((item) => item !== achievement),
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Please sign in again to update your profile.");
      }

      console.log("Saving profile data:", editFormData);

      const updatedUser = await setupUserProfile(token, {
        ...editFormData,
        profileCompleted: true,
      });

      console.log("Updated user from API:", updatedUser);

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setToast({ message: "Profile updated successfully.", type: "success" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      const message = error?.message || "Update failed.";
      setToast({ message, type: "error" });
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 transition-colors duration-300">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className={`rounded-3xl border overflow-hidden shadow-sm ${
          isDarkMode
            ? "border-slate-800 bg-slate-900/50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="px-6 sm:px-8 pt-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5 sm:gap-6 flex-1 min-w-0">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-lg shrink-0 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                }`}
              >
                {(user?.fullName || user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className={`text-2xl sm:text-3xl font-bold tracking-tight truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  {user?.fullName || user?.name || "User"}
                </h1>
                <p
                  className={`flex items-center gap-2 mt-1.5 font-medium truncate ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}
                >
                  <GraduationCap size={18} className="shrink-0" />
                  <span className="truncate">
                    {user?.registrationNumber || "Complete your profile"}
                  </span>
                </p>
              </div>
            </div>

            {!isEditing && (
              <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          <div
            className={`pt-6 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Profile Completion"
                value={`${profileCompletion}%`}
                progress={profileCompletion}
                accent="indigo"
                isDark={isDarkMode}
              />
              <StatCard
                label="Skills"
                value={editFormData.skills.length}
                accent="purple"
                isDark={isDarkMode}
              />
              <StatCard
                label="Feedback"
                value={feedbackList.length}
                accent="pink"
                isDark={isDarkMode}
              />
              <StatCard
                label="Groups"
                value={joinedGroups.length}
                accent="amber"
                isDark={isDarkMode}
              />
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div
          className={`rounded-3xl border p-6 sm:p-8 space-y-8 shadow-sm ${
            isDarkMode
              ? "border-slate-800 bg-slate-900/50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2
              className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              <Edit3 size={20} className="text-indigo-500" /> Edit Your Profile
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(false)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                  isDarkMode
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
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
              readOnly={true}
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

          <div className="space-y-4">
            <label
              className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
            >
              <Code size={16} className="text-indigo-500" /> Skills & Expertise
            </label>
            <div className="flex flex-wrap gap-2">
              {editFormData.skills.length === 0 ? (
                <p
                  className={`text-sm px-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  No skills added yet
                </p>
              ) : (
                editFormData.skills.map((skill) => (
                  <div
                    key={skill}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${
                      isDarkMode
                        ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 hover:border-indigo-400/50"
                        : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300"
                    }`}
                  >
                    <span className="text-sm font-medium">{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:opacity-60 transition-opacity p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <input
                type="text"
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                placeholder="Type a skill..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-300 hover:border-indigo-500/50 hover:shadow-sm ${
                  isDarkMode
                    ? "bg-slate-950/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:bg-slate-900/80"
                    : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95"
              >
                <Plus size={18} />
                Add Skill
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label
              className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
            >
              <Trophy size={16} className="text-blue-500" /> Achievements &
              Certificates
            </label>
            <div className="flex flex-col gap-3">
              {editFormData.achievements.length === 0 ? (
                <p
                  className={`text-sm px-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  No achievements or certificates to display yet
                </p>
              ) : (
                editFormData.achievements.map((achievement) => (
                  <div
                    key={achievement}
                    className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm ${
                      isDarkMode
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/50"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                    }`}
                  >
                    <span className="text-sm font-medium leading-relaxed break-words flex-1 min-w-0">
                      {achievement}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(achievement)}
                      className="hover:opacity-60 transition-opacity p-1 shrink-0 mt-0.5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <input
                type="text"
                value={newAchievement}
                onChange={(event) => setNewAchievement(event.target.value)}
                placeholder="Type an achievement or certificate..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAchievement();
                  }
                }}
                className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all duration-300 hover:border-blue-500/50 hover:shadow-sm ${
                  isDarkMode
                    ? "bg-slate-950/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:bg-slate-900/80"
                    : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label
              className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}
            >
              <Award size={16} className="text-indigo-500" /> About You
            </label>
            <textarea
              name="about"
              value={editFormData.about}
              onChange={handleEditChange}
              rows="4"
              placeholder="Tell teammates about yourself, your interests, and what you're looking for..."
              className={`w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 resize-none hover:border-indigo-500/50 hover:shadow-sm ${
                isDarkMode
                  ? "bg-slate-950/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:bg-slate-900/80"
                  : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 hover:bg-white"
              }`}
            />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {user?.about && (
              <div
                className={`rounded-3xl border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-500/30 ${isDarkMode ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50" : "border-slate-200 bg-white hover:bg-slate-50/50"}`}
              >
                <h2
                  className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  <Award size={20} className="text-indigo-500" /> About Me
                </h2>
                <p
                  className={`leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                >
                  {user.about}
                </p>
              </div>
            )}

            <div
              className={`rounded-3xl border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-500/30 ${isDarkMode ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50" : "border-slate-200 bg-white hover:bg-slate-50/50"}`}
            >
              <h2
                className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                <GraduationCap size={20} className="text-indigo-500" /> Academic
                Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoCard
                  icon={<User size={18} />}
                  label="Full Name"
                  value={user?.fullName || user?.name || "-"}
                  isDark={isDarkMode}
                />
                <InfoCard
                  icon={<Mail size={18} />}
                  label="Email"
                  value={user?.email || "-"}
                  isDark={isDarkMode}
                />
                <InfoCard
                  icon={<GraduationCap size={18} />}
                  label="Registration"
                  value={user?.registrationNumber || "-"}
                  isDark={isDarkMode}
                />
                <InfoCard
                  icon={<Calendar size={18} />}
                  label="Year"
                  value={user?.year || "-"}
                  isDark={isDarkMode}
                />
                <InfoCard
                  icon={<Clock size={18} />}
                  label="Semester"
                  value={user?.semester || "-"}
                  isDark={isDarkMode}
                />
                <InfoCard
                  icon={<BookOpen size={18} />}
                  label="Enrolled"
                  value={user?.enrolledYear || "-"}
                  isDark={isDarkMode}
                />
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-500/30 ${isDarkMode ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50" : "border-slate-200 bg-white hover:bg-slate-50/50"}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2
                  className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  <Star size={20} className="text-amber-500" /> Feedback from
                  Teammates
                </h2>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full w-fit ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                >
                  {feedbackList.length} reviews
                </span>
              </div>

              {loading ? (
                <div
                  className={`text-center py-10 rounded-2xl ${isDarkMode ? "text-slate-400 bg-slate-800/20" : "text-slate-500 bg-slate-50"}`}
                >
                  Loading feedback...
                </div>
              ) : feedbackList.length === 0 ? (
                <div
                  className={`text-center py-10 rounded-2xl border border-dashed ${isDarkMode ? "border-slate-700 bg-slate-800/20" : "border-slate-200 bg-slate-50"}`}
                >
                  <Star
                    size={36}
                    className={`mx-auto mb-3 opacity-30 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  />
                  <p
                    className={`${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    No feedback received yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {feedbackList.map((feedback) => (
                    <div
                      key={feedback._id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30 ${
                        isDarkMode
                          ? "border-slate-800/60 bg-slate-800/20 hover:bg-slate-800/40"
                          : "border-slate-100 bg-slate-50/50 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-bold text-sm truncate ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                          >
                            {feedback.reviewer?.fullName ||
                              feedback.reviewer?.name ||
                              "Anonymous"}
                          </p>
                          <p
                            className={`text-xs mt-0.5 truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                          >
                            {feedback.reviewer?.registrationNumber ||
                              "Fellow Student"}
                          </p>
                        </div>
                        <div
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg ${
                            isDarkMode
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-bold">
                            {feedback.rating || 0}
                            <span className="opacity-60 font-medium">/5</span>
                          </span>
                        </div>
                      </div>
                      <p
                        className={`text-sm leading-relaxed break-words ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                      >
                        "{feedback.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div
              className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-indigo-500/30 ${isDarkMode ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50" : "border-slate-200 bg-white hover:bg-slate-50/50"}`}
            >
              <h2
                className={`text-lg font-bold mb-5 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                <Code size={20} className="text-indigo-500" /> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(user?.skills || []).length === 0 ? (
                  <div
                    className={`text-center w-full py-8 rounded-2xl border border-dashed ${isDarkMode ? "border-slate-700 bg-slate-800/20" : "border-slate-200 bg-slate-50"}`}
                  >
                    <Code
                      size={24}
                      className={`mx-auto mb-2 opacity-30 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <p
                      className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      No skills added
                    </p>
                  </div>
                ) : (
                  user.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                        isDarkMode
                          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300"
                      }`}
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-blue-500/30 ${isDarkMode ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50" : "border-slate-200 bg-white hover:bg-slate-50/50"}`}
            >
              <h2
                className={`text-lg font-bold mb-5 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                <Trophy size={20} className="text-blue-500" /> Achievements &
                Certificates
              </h2>
              <div className="flex flex-col gap-3">
                {(user?.achievements || []).length === 0 ? (
                  <div
                    className={`text-center w-full py-8 rounded-2xl border border-dashed ${isDarkMode ? "border-slate-700 bg-slate-800/20" : "border-slate-200 bg-slate-50"}`}
                  >
                    <Trophy
                      size={24}
                      className={`mx-auto mb-2 opacity-30 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                    />
                    <p
                      className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      No achievements or certificates to display yet
                    </p>
                  </div>
                ) : (
                  user.achievements.map((achievement) => (
                    <div
                      key={achievement}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                        isDarkMode
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400/50"
                          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                      }`}
                    >
                      <Trophy
                        size={16}
                        className={`shrink-0 mt-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}
                      />
                      <span className="text-sm font-medium leading-relaxed break-words flex-1 min-w-0">
                        {achievement}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-emerald-500/30 ${isDarkMode ? "border-slate-800 bg-slate-900/50 hover:bg-slate-800/50" : "border-slate-200 bg-white hover:bg-slate-50/50"}`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  <Users size={20} className="text-emerald-500" /> Groups
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                >
                  {joinedGroups.length}
                </span>
              </div>

              {joinedGroups.length === 0 ? (
                <div
                  className={`text-center w-full py-8 rounded-2xl border border-dashed ${isDarkMode ? "border-slate-700 bg-slate-800/20" : "border-slate-200 bg-slate-50"}`}
                >
                  <Users
                    size={24}
                    className={`mx-auto mb-2 opacity-30 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                  />
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Not in any groups
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {joinedGroups.map((group) => (
                    <Link
                      key={group.id}
                      to={`/dashboard/group/${group.id}`}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        isDarkMode
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                          : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
                      }`}
                    >
                      {group.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, isDark, progress }) {
  const accentMap = {
    indigo: isDark ? "text-indigo-300" : "text-indigo-600",
    purple: isDark ? "text-purple-300" : "text-purple-600",
    pink: isDark ? "text-pink-300" : "text-pink-600",
    amber: isDark ? "text-amber-300" : "text-amber-600",
  };

  const hasProgress = progress !== undefined;

  const getProgressColor = (p) => {
    if (p <= 30) return "bg-red-500";
    if (p <= 60) return "bg-orange-500";
    if (p <= 90) return "bg-lime-500";
    return "bg-emerald-500";
  };

  const getProgressTextColor = (p) => {
    if (p <= 30) return isDark ? "text-red-500" : "text-red-500";
    if (p <= 60) return isDark ? "text-orange-500" : "text-orange-500";
    if (p <= 90) return isDark ? "text-lime-500" : "text-lime-500";
    return isDark ? "text-green-500" : "text-green-500";
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-300 hover:shadow-md min-w-0 flex flex-col h-full ${isDark ? "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80" : "bg-slate-50 border-slate-100 hover:bg-white"}`}
    >
      <div className="flex-1 flex flex-col justify-center">
        <p
          className={`text-xs sm:text-sm font-medium mb-1 truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {label}
        </p>
        <p
          className={`text-2xl sm:text-3xl font-bold tracking-tight truncate transition-colors duration-500 ${hasProgress ? getProgressTextColor(progress) : accentMap[accent]}`}
        >
          {value}
        </p>
      </div>

      {hasProgress && (
        <div className="mt-3 w-full">
          <div
            className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
          >
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value, isDark }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border min-w-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30 ${isDark ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800/80" : "border-slate-200 bg-slate-50 hover:bg-white"}`}
    >
      <div
        className={`shrink-0 ${isDark ? "text-indigo-300" : "text-indigo-500"}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          {label}
        </p>
        <p
          className={`text-sm font-semibold break-all sm:break-words ${isDark ? "text-slate-100" : "text-slate-900"}`}
          style={{ wordBreak: "break-word" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, icon, isDark, readOnly }) {
  return (
    <label className="space-y-2 group">
      <span
        className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${readOnly ? "" : "group-hover:text-indigo-500"} ${isDark ? "text-slate-200" : "text-slate-800"}`}
      >
        {icon}
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full px-4 py-3 rounded-lg outline-none transition-all duration-300 ${
          readOnly
            ? isDark
              ? "bg-slate-800/60 border border-slate-700/50 text-slate-400 cursor-not-allowed opacity-80"
              : "bg-slate-200/60 border border-slate-200 text-slate-500 cursor-not-allowed opacity-80"
            : `hover:shadow-sm hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                isDark
                  ? "bg-slate-950/50 border border-slate-700 text-slate-100 placeholder-slate-500 hover:bg-slate-900/80"
                  : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 hover:bg-white"
              }`
        }`}
      />
    </label>
  );
}

export default UserProfilePage;
