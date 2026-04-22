import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { groupAPI } from "../api/api";
import {
  Plus,
  Layers,
  ChevronRight,
  Trash2,
  Edit2,
  X,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { fetchCurrentUser, fetchUsers, getAuthToken } from "../services/authService";

const GroupsDashboard = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("userId") ||
      localStorage.getItem("currentUserId") ||
      "",
  );
  const [groups, setGroups] = useState([]);
  const [userPhotos, setUserPhotos] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    memberLimit: 5,
    status: "active",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const handleGroupMembershipChanged = () => {
      fetchGroups();
    };

    window.addEventListener(
      "group-membership-changed",
      handleGroupMembershipChanged,
    );

    return () => {
      window.removeEventListener(
        "group-membership-changed",
        handleGroupMembershipChanged,
      );
    };
  }, []);

  useEffect(() => {
    const resolveCurrentUserId = async () => {
      if (currentUserId) return;

      const token = getAuthToken();
      if (!token) return;

      try {
        const me = await fetchCurrentUser(token);
        const resolvedId = me?._id || me?.id || "";

        if (resolvedId) {
          localStorage.setItem("userId", resolvedId);
          localStorage.setItem("currentUserId", resolvedId);
          setCurrentUserId(resolvedId);
        }
      } catch (err) {
        console.warn(
          "Could not resolve current user id from auth session",
          err,
        );
      }
    };

    resolveCurrentUserId();
  }, [currentUserId]);

  useEffect(() => {
    const loadUserPhotos = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const users = await fetchUsers(token);
        const photoMap = {};

        users.forEach((user) => {
          const userId = user?._id || user?.id;
          if (userId && user.profilePicture) {
            photoMap[userId.toString()] = user.profilePicture;
          }
        });

        setUserPhotos(photoMap);
      } catch (err) {
        console.warn("Could not load user photos for group avatars", err);
      }
    };

    loadUserPhotos();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await groupAPI.getAll();
      const allGroups = response.data.data || response.data || [];
      setGroups(
        allGroups.map((group) => ({
          ...group,
          members: Array.isArray(group.members) ? group.members : [],
          requiredSkills: Array.isArray(group.requiredSkills)
            ? group.requiredSkills
            : [],
        })),
      );
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setEditFormData({
      title: group.title,
      description: group.description,
      requiredSkills: Array.isArray(group.requiredSkills)
        ? group.requiredSkills.join(", ")
        : "",
      memberLimit: group.memberLimit,
      status: group.status,
    });
    setShowEditModal(true);
    setEditError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "memberLimit" ? parseInt(value) : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    try {
      const payload = {
        ...editFormData,
        requiredSkills: editFormData.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
      };

      await groupAPI.update(editingGroup._id, payload);

      // Refresh groups list
      await fetchGroups();
      setShowEditModal(false);
      setEditingGroup(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update group");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (group) => {
    setDeleteConfirm(group);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await groupAPI.delete(deleteConfirm._id);
      console.log("Delete response:", response);

      // Refresh groups list
      await fetchGroups();
      setDeleteConfirm(null);
      setDeleteLoading(false);
    } catch (err) {
      console.error("Error deleting group:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete group";
      setDeleteError(errorMessage);
      setDeleteLoading(false);
    }
  };

  const normalizeMemberId = (member) => {
    if (!member) return "";
    if (typeof member === "string") return member;
    return member._id || "";
  };

  const normalizeCreatedById = (createdBy) => {
    if (!createdBy) return "";
    if (typeof createdBy === "string") return createdBy;
    return createdBy._id || "";
  };

  const resolvedUserId =
    currentUserId ||
    localStorage.getItem("userId") ||
    localStorage.getItem("currentUserId") ||
    "";

  const isUserMember = (group) => {
    if (!resolvedUserId) return false;
    return (group.members || []).some(
      (member) =>
        normalizeMemberId(member)?.toString() === resolvedUserId.toString(),
    );
  };

  const isGroupCreatedByCurrentUser = (group) => {
    if (!resolvedUserId) return false;
    return (
      normalizeCreatedById(group.createdBy)?.toString() ===
      resolvedUserId.toString()
    );
  };

  const userGroups = groups.filter(
    (group) => isUserMember(group) || isGroupCreatedByCurrentUser(group),
  );
  const availableGroups = groups.filter(
    (group) => !isUserMember(group) && !isGroupCreatedByCurrentUser(group),
  );

  const handleRowClick = (groupId) => {
    navigate(`/dashboard/group/${groupId}`);
  };

  const getGroupCode = (group) => {
    const fallbackId = group._id ? group._id.slice(-6).toUpperCase() : "N/A";
    const rawCode = group.groupCode || fallbackId;
    const normalizedCode = rawCode?.toString().toUpperCase() || fallbackId;
    return normalizedCode.startsWith("IT100-")
      ? normalizedCode
      : `IT100-${normalizedCode.replace(/^IT100-/, "")}`;
  };

  const getMatchPercent = (group) => {
    const directScore = group.matchScore || group.recommendations?.[0]?.matchScore;
    if (typeof directScore === "number") return directScore;

    const memberCount = group.members?.length || 0;
    const memberLimit = group.memberLimit || 1;
    return Math.min(100, Math.round((memberCount / memberLimit) * 100));
  };

  const getCardAvatar = (member, index) => {
    const memberId = normalizeMemberId(member) || `${index}`;
    const initials =
      (member?.fullName || member?.name || member?.email || "M")
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "M";

    return (
      <div
        key={memberId}
        className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-950/80 bg-slate-700 text-[10px] font-semibold text-white flex items-center justify-center -ml-2 first:ml-0"
        title={member?.fullName || member?.name || "Member"}
      >
          {member?.profilePicture || userPhotos[memberId] ? (
          <img
              src={member.profilePicture || userPhotos[memberId]}
            alt={member?.fullName || member?.name || "Member"}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
    );
  };

  const getCardIcon = (group) => {
    const name = `${group.title || group.groupName || ""}`.toLowerCase();
    if (name.includes("ai") || name.includes("ml") || name.includes("quantum")) {
      return <Sparkles className="w-4 h-4" />;
    }
    if (name.includes("campus") || name.includes("event") || name.includes("dashboard")) {
      return <Users className="w-4 h-4" />;
    }
    return <Layers className="w-4 h-4" />;
  };

  const getAccentClasses = (group) => {
    const seed = `${group.title || group.groupName || group._id || ""}`.length % 4;
    const variants = [
      {
        bar: "from-sky-400 via-cyan-400 to-indigo-500",
        icon: isDarkMode ? "bg-sky-500/15 text-sky-300" : "bg-sky-100 text-sky-700",
        chip: isDarkMode ? "bg-sky-500/15 text-sky-200" : "bg-sky-100 text-sky-700",
      },
      {
        bar: "from-violet-400 via-fuchsia-400 to-rose-500",
        icon: isDarkMode ? "bg-violet-500/15 text-violet-300" : "bg-violet-100 text-violet-700",
        chip: isDarkMode ? "bg-violet-500/15 text-violet-200" : "bg-violet-100 text-violet-700",
      },
      {
        bar: "from-emerald-400 via-teal-400 to-cyan-500",
        icon: isDarkMode ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-700",
        chip: isDarkMode ? "bg-emerald-500/15 text-emerald-200" : "bg-emerald-100 text-emerald-700",
      },
      {
        bar: "from-amber-400 via-orange-400 to-rose-500",
        icon: isDarkMode ? "bg-amber-500/15 text-amber-300" : "bg-amber-100 text-amber-700",
        chip: isDarkMode ? "bg-amber-500/15 text-amber-200" : "bg-amber-100 text-amber-700",
      },
    ];

    return variants[seed];
  };

  const renderGroupSection = (
    sectionTitle,
    sectionGroups,
    emptyMessage,
    isSectionLoading = false,
    headerAction = null,
  ) => (
    <div className={`rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden ${isDarkMode ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-white"}`}>
      <div
        className={`px-6 md:px-8 py-4 border-b flex items-center justify-between gap-4 ${isDarkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-100 bg-slate-50"}`}
      >
        <h3
          className={`text-base md:text-lg font-semibold capitalize ${isDarkMode ? "text-white" : "text-slate-950"}`}
        >
          {sectionTitle}
        </h3>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
          <Layers className="h-3.5 w-3.5" />
          {sectionGroups.length} groups
        </div>
        {headerAction}
      </div>

      {isSectionLoading ? (
        <div
          className={`px-8 py-12 ${isDarkMode ? "text-slate-500" : "text-slate-400"} text-center`}
        >
          <div className="inline-block animate-spin">
            <div
              className={`w-5 h-5 border-2 ${isDarkMode ? "border-slate-700 border-t-slate-400" : "border-slate-300 border-t-slate-600"} rounded-full`}
            ></div>
          </div>
          <p className="mt-3">Loading groups...</p>
        </div>
      ) : sectionGroups.length === 0 ? (
        <div
          className={`px-8 py-12 ${isDarkMode ? "text-slate-500" : "text-slate-400"} text-center`}
        >
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="p-5 md:p-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sectionGroups.map((group) => {
              const memberCount = group.members?.length || 0;
              const memberLimit = group.memberLimit || 1;
              const isFull = memberCount >= memberLimit;
              const displayId = getGroupCode(group);
              const matchPercent = getMatchPercent(group);
              const avatars = (group.members || []).slice(0, 3);
              const extraMembers = Math.max(0, memberCount - avatars.length);
              const accent = getAccentClasses(group);

              return (
                <article
                  key={group._id}
                  className={`group relative overflow-hidden rounded-[24px] border transition-all duration-300 cursor-pointer ${isDarkMode ? "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]"}`}
                  onClick={() => handleRowClick(group._id)}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.bar} opacity-80`} />
                  <div className="p-5 md:p-6 flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${accent.icon}`}>
                          {getCardIcon(group)}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-xl font-bold leading-tight truncate ${isDarkMode ? "text-white" : "text-slate-950"}`}>
                            {group.title || group.groupName || "Untitled Group"}
                          </h4>
                          <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${accent.chip}`}>
                            <Users className="h-3.5 w-3.5" />
                            {memberCount}/{memberLimit} members
                          </div>
                        </div>
                      </div>

                      <div className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${matchPercent >= 80 ? (isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700") : isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                        {matchPercent}% match
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em]">
                      <span className={isDarkMode ? "text-slate-500" : "text-slate-500"}>
                        Group ID
                      </span>
                      <span className={`font-mono normal-case tracking-normal rounded-md px-2 py-1 ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                        {displayId}
                      </span>
                    </div>

                    <p className={`mt-4 line-clamp-3 text-sm leading-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {group.description || "No description provided."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(group.requiredSkills || []).slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className={`rounded-full px-3 py-1 text-xs font-medium border ${isDarkMode ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"}`}
                        >
                          {skill}
                        </span>
                      ))}
                      {(group.requiredSkills || []).length > 3 && (
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                          +{(group.requiredSkills || []).length - 3}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                      <div className="flex items-center">
                        {avatars.map((member, index) => getCardAvatar(member, index))}
                        {extraMembers > 0 && (
                          <div className={`-ml-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-slate-950/80 ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                            +{extraMembers}
                          </div>
                        )}
                      </div>

                      {isFull ? (
                        <div className={`inline-flex items-center gap-2 text-sm font-semibold ${isDarkMode ? "text-rose-300" : "text-rose-600"}`}>
                          <Lock className="h-4 w-4" />
                          Full
                        </div>
                      ) : (
                        <Link
                          to={`/dashboard/group/${group._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${isDarkMode ? "text-sky-300 hover:text-sky-200" : "text-sky-700 hover:text-sky-900"}`}
                        >
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4 border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${group.status === "active" ? "bg-emerald-400" : group.status === "closed" ? "bg-amber-400" : "bg-slate-500"}`} />
                        <span className={`text-sm capitalize ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                          {group.status || "active"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(group);
                          }}
                          className={`rounded-full p-2 transition ${isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-sky-300" : "text-slate-500 hover:bg-slate-100 hover:text-sky-700"}`}
                          title="Edit group"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(group);
                          }}
                          className={`rounded-full p-2 transition ${isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-rose-300" : "text-slate-500 hover:bg-slate-100 hover:text-rose-600"}`}
                          title="Delete group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" : "bg-gradient-to-br from-white via-slate-50 to-slate-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="pointer-events-none absolute -top-10 left-8 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-16 right-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Header Section */}
        <div className={`relative overflow-hidden rounded-[28px] border mb-8 ${isDarkMode ? "border-slate-800 bg-slate-950/65" : "border-slate-200 bg-white/85"}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_40%)]" />
          <div className="relative p-6 md:p-8 lg:p-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Collaboration hub
              </div>
              <h1
                className={`mt-4 text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-slate-950"}`}
              >
                Groups
              </h1>
              <p className={`mt-3 max-w-xl text-base md:text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Explore your active teams and available groups in a cleaner, more visual workspace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full lg:w-auto">
              <div className={`rounded-2xl border px-4 py-3 min-w-[110px] ${isDarkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>Total</div>
                <div className={`mt-1 text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-950"}`}>{groups.length}</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 min-w-[110px] ${isDarkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>Your groups</div>
                <div className={`mt-1 text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-950"}`}>{userGroups.length}</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 min-w-[110px] ${isDarkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"}`}>
                <div className={`text-[11px] uppercase tracking-[0.18em] ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}>Available</div>
                <div className={`mt-1 text-2xl font-black ${isDarkMode ? "text-white" : "text-slate-950"}`}>{availableGroups.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {userGroups.length > 0 &&
            renderGroupSection(
              "your group(s)",
              userGroups,
              "No joined or created groups yet.",
              loading,
            )}

          {renderGroupSection(
            "Available Groups",
            availableGroups,
            "No other available groups yet.",
            loading,
            <Link
              to="/dashboard/create-group"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-slate-500/10"
            >
              <Plus className="w-4 h-4" />
              New Group
            </Link>,
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <div
              className={`flex justify-between items-center px-8 py-6 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}
            >
              <h2
                className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Edit Group
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={`p-2 rounded transition ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-100"}`}
              >
                <X
                  className={`w-5 h-5 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                />
              </button>
            </div>

            <div className="px-8 py-6">
              {editError && (
                <div
                  className={`mb-6 p-4 border rounded-lg ${isDarkMode ? "bg-red-500/20 border-red-500 text-red-300" : "bg-red-100 border-red-300 text-red-700"}`}
                >
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit}>
                <div className="mb-6">
                  <label
                    className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Group Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows="5"
                    className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    Required Skills
                  </label>
                  <input
                    type="text"
                    name="requiredSkills"
                    value={editFormData.requiredSkills}
                    onChange={handleEditChange}
                    placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                    className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      Member Limit *
                    </label>
                    <input
                      type="number"
                      name="memberLimit"
                      value={editFormData.memberLimit}
                      onChange={handleEditChange}
                      min="1"
                      max="100"
                      className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block font-semibold mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      Status
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition ${
                      editLoading
                        ? "bg-slate-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    }`}
                  >
                    {editLoading ? "Updating..." : "Update Group"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                      isDarkMode
                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-lg max-w-md w-full ${isDarkMode ? "bg-slate-800" : "bg-white"}`}
          >
            <div
              className={`px-8 py-6 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}
            >
              <h2
                className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Delete Group?
              </h2>
            </div>

            <div className="px-8 py-6">
              {deleteError && (
                <div
                  className={`mb-4 p-3 border rounded ${isDarkMode ? "bg-red-500/20 border-red-500 text-red-300" : "bg-red-100 border-red-300 text-red-700"}`}
                >
                  {deleteError}
                </div>
              )}
              <p
                className={`mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.title}</strong>?
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-500" : "text-slate-600"}`}
              >
                This action will archive the group and cannot be undone
                immediately.
              </p>
            </div>

            <div
              className={`px-8 py-6 border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"} flex gap-4`}
            >
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className={`flex-1 py-2 px-4 text-white rounded-lg font-semibold transition ${
                  deleteLoading
                    ? "bg-red-700/50 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                  deleteLoading
                    ? "bg-slate-600/50 cursor-not-allowed"
                    : isDarkMode
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsDashboard;
