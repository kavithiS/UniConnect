import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { groupAPI } from "../api/api";
import { Plus, Layers, ChevronRight, Trash2, Edit2, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { fetchCurrentUser, getAuthToken } from "../services/authService";

const GroupsDashboard = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("userId") ||
      localStorage.getItem("currentUserId") ||
      "",
  );
  const [groups, setGroups] = useState([]);
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

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await groupAPI.getAll();
      const allGroups = response.data.data || response.data || [];
      setGroups(allGroups);
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
      requiredSkills: group.requiredSkills.join(", "),
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

  const renderGroupSection = (
    sectionTitle,
    sectionGroups,
    emptyMessage,
    isSectionLoading = false,
    headerAction = null,
  ) => (
    <div className="border rounded-xl overflow-hidden">
      <div
        className={`px-8 py-4 border-b flex items-center justify-between gap-4 ${isDarkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}
      >
        <h3
          className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-slate-950"}`}
        >
          {sectionTitle}
        </h3>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? "bg-slate-800/50" : "bg-slate-100"}>
              <tr>
                <th
                  className={`px-8 py-4 text-left text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"} uppercase tracking-wider`}
                >
                  Title
                </th>
                <th
                  className={`px-8 py-4 text-left text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"} uppercase tracking-wider`}
                >
                  Group ID
                </th>
                <th
                  className={`px-8 py-4 text-left text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"} uppercase tracking-wider`}
                >
                  Members
                </th>
                <th
                  className={`px-8 py-4 text-left text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"} uppercase tracking-wider`}
                >
                  Skills
                </th>
                <th
                  className={`px-8 py-4 text-left text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"} uppercase tracking-wider`}
                >
                  Status
                </th>
                <th
                  className={`px-8 py-4 text-left text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-600"} uppercase tracking-wider`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isDarkMode ? "divide-slate-800" : "divide-slate-200"}`}
            >
              {sectionGroups.map((group) => {
                const fallbackId = group._id
                  ? group._id.slice(-6).toUpperCase()
                  : "N/A";
                const rawCode = group.groupCode || fallbackId;
                const normalizedCode =
                  rawCode?.toString().toUpperCase() || fallbackId;
                const displayId = normalizedCode.startsWith("IT100-")
                  ? normalizedCode
                  : `IT100-${normalizedCode.replace(/^IT100-/, "")}`;

                return (
                  <tr
                    key={group._id}
                    onClick={() => handleRowClick(group._id)}
                    className={`${isDarkMode ? "hover:bg-slate-800/30" : "hover:bg-slate-50"} transition-colors duration-150 cursor-pointer`}
                  >
                    <td
                      className={`px-8 py-6 font-semibold ${isDarkMode ? "text-white" : "text-slate-950"}`}
                    >
                      {group.title}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`font-mono text-sm ${isDarkMode ? "text-slate-400 bg-slate-800/40" : "text-slate-600 bg-slate-200/50"} px-3 py-1.5 rounded`}
                      >
                        {displayId}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"} text-sm`}
                    >
                      {group.members.length}/{group.memberLimit}
                    </td>
                    <td
                      className={`px-8 py-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"} text-sm`}
                    >
                      <div className="flex gap-2 flex-wrap max-w-xs">
                        {group.requiredSkills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className={`border px-2.5 py-1 rounded text-xs font-medium transition ${
                              isDarkMode
                                ? "border-slate-700 text-slate-300 hover:border-slate-600"
                                : "border-slate-400 text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                        {group.requiredSkills.length > 2 && (
                          <span
                            className={`text-xs font-medium ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                          >
                            +{group.requiredSkills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {group.status === "active" && (
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        )}
                        {group.status === "closed" && (
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        )}
                        {group.status === "archived" && (
                          <div
                            className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-slate-600" : "bg-slate-400"}`}
                          ></div>
                        )}
                        <span
                          className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {group.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(group);
                          }}
                          className={`transition-colors p-2 -m-2 inline-flex items-center gap-1 ${isDarkMode ? "text-slate-400 hover:text-blue-400" : "text-slate-500 hover:text-blue-600"}`}
                          title="Edit group"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(group);
                          }}
                          className={`transition-colors p-2 -m-2 inline-flex items-center gap-1 ${isDarkMode ? "text-slate-400 hover:text-red-400" : "text-slate-500 hover:text-red-600"}`}
                          title="Delete group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/dashboard/group/${group._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`transition-colors p-2 -m-2 inline-flex items-center gap-1 ${isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" : "bg-gradient-to-br from-white via-slate-50 to-slate-100"} p-8`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-slate-950"} mb-2`}
            >
              Groups
            </h1>
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Manage your student groups
            </p>
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
