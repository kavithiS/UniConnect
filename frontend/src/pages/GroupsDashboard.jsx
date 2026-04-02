import React, { useState, useEffect } from 'react';
import { groupAPI } from '../api/api';
import { Plus, Users, Layers, Activity, ChevronRight, Trash2, Edit2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GroupsDashboard = () => {
  const { isDarkMode } = useTheme();
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    averageGroupSize: 0
  });
  const [loading, setLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    memberLimit: 5,
    status: 'active'
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await groupAPI.getAll();
      const allGroups = response.data.data;
      setGroups(allGroups);
      
      // Calculate stats
      const activeCount = allGroups.filter(g => g.status === 'active').length;
      const totalMembers = allGroups.reduce((sum, g) => sum + (g.members?.length || 0), 0);
      const avgSize = allGroups.length > 0 ? String((totalMembers / allGroups.length).toFixed(1)) : '0';

      setStats({
        totalGroups: allGroups.length,
        activeGroups: activeCount,
        totalMembers,
        averageGroupSize: avgSize
      });
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setEditFormData({
      title: group.title,
      description: group.description,
      requiredSkills: group.requiredSkills.join(', '),
      memberLimit: group.memberLimit,
      status: group.status
    });
    setShowEditModal(true);
    setEditError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'memberLimit' ? parseInt(value) : value
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
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill)
      };

      await groupAPI.update(editingGroup._id, payload);
      
      // Refresh groups list
      await fetchGroups();
      setShowEditModal(false);
      setEditingGroup(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update group');
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
      console.log('Delete response:', response);
      
      // Refresh groups list
      await fetchGroups();
      setDeleteConfirm(null);
      setDeleteLoading(false);
    } catch (err) {
      console.error('Error deleting group:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete group';
      setDeleteError(errorMessage);
      setDeleteLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-b ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
        <h1 className={`text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'} mb-2`}>Groups Dashboard</h1>
        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Manage and organize your collaboration groups</p>
      </div>

      <div className="px-8 py-8">
        {/* Stats Cards - Bento Box Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {/* Total Groups */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3">Total Groups</p>
                <p className="text-4xl font-semibold text-white">{stats.totalGroups}</p>
              </div>
              <Layers className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition" />
            </div>
          </div>

          {/* Active Groups */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3">Active Groups</p>
                <p className="text-4xl font-semibold text-white">{stats.activeGroups}</p>
              </div>
              <Activity className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition" />
            </div>
          </div>

          {/* Total Members */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3">Total Members</p>
                <p className="text-4xl font-semibold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition" />
            </div>
          </div>

          {/* Avg Group Size */}
          <div className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-xs uppercase tracking-wider font-medium mb-3">Avg Group Size</p>
                <p className="text-4xl font-semibold text-white">{stats.averageGroupSize}</p>
              </div>
              <Users className="w-8 h-8 text-slate-700 group-hover:text-slate-600 transition" />
            </div>
          </div>
        </div>

        {/* Groups Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="px-8 py-6 flex justify-between items-center border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Groups</h2>
            <a href="/create-group" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-slate-500/10">
              <Plus className="w-4 h-4" />
              New Group
            </a>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="px-8 py-12 text-slate-500 text-center">
              <div className="inline-block animate-spin">
                <div className="w-5 h-5 border-2 border-slate-700 border-t-slate-400 rounded-full"></div>
              </div>
              <p className="mt-3">Loading groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="px-8 py-16 text-slate-500 text-center">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No groups yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Group ID</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Members</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {groups.map((group) => {
                    const fallbackId = group._id ? group._id.slice(-6).toUpperCase() : 'N/A';
                    const rawCode = group.groupCode || fallbackId;
                    const normalizedCode = rawCode?.toString().toUpperCase() || fallbackId;
                    const displayId = normalizedCode.startsWith('IT100-')
                      ? normalizedCode
                      : `IT100-${normalizedCode.replace(/^IT100-/, '')}`;
                    
                    return (
                      <tr key={group._id} className="hover:bg-slate-800/30 transition-colors duration-150">
                        <td className="px-8 py-6 text-white font-semibold">{group.title}</td>
                        <td className="px-8 py-6">
                          <span className="font-mono text-sm text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded">
                            {displayId}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-slate-400 text-sm">
                          {group.members.length}/{group.memberLimit}
                        </td>
                        <td className="px-8 py-6 text-slate-400 text-sm">
                          <div className="flex gap-2 flex-wrap max-w-xs">
                            {group.requiredSkills.slice(0, 2).map(skill => (
                              <span key={skill} className="border border-slate-700 text-slate-300 px-2.5 py-1 rounded text-xs font-medium hover:border-slate-600 transition">
                                {skill}
                              </span>
                            ))}
                            {group.requiredSkills.length > 2 && (
                              <span className="text-slate-500 text-xs font-medium">+{group.requiredSkills.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {group.status === 'active' && (
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            )}
                            {group.status === 'closed' && (
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            )}
                            {group.status === 'archived' && (
                              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                            )}
                            <span className="text-slate-400 text-sm">{group.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(group)}
                              className="text-slate-400 hover:text-blue-400 transition-colors p-2 -m-2 inline-flex items-center gap-1"
                              title="Edit group"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(group)}
                              className="text-slate-400 hover:text-red-400 transition-colors p-2 -m-2 inline-flex items-center gap-1"
                              title="Delete group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <a href={`/group/${group._id}`} className="text-slate-400 hover:text-white transition-colors p-2 -m-2 inline-flex items-center gap-1">
                              <ChevronRight className="w-4 h-4" />
                            </a>
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
      </div>

      {/* Edit Modal */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`flex justify-between items-center px-8 py-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Edit Group</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className={`p-2 hover:bg-slate-700/50 rounded transition}`}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="px-8 py-6">
              {editError && (
                <div className={`mb-6 p-4 border rounded-lg ${isDarkMode ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-red-100 border-red-300 text-red-700'}`}>
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit}>
                <div className="mb-6">
                  <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Group Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows="5"
                    className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Required Skills
                  </label>
                  <input
                    type="text"
                    name="requiredSkills"
                    value={editFormData.requiredSkills}
                    onChange={handleEditChange}
                    placeholder="e.g., React, Node.js, MongoDB (comma-separated)"
                    className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Member Limit *
                    </label>
                    <input
                      type="number"
                      name="memberLimit"
                      value={editFormData.memberLimit}
                      onChange={handleEditChange}
                      min="1"
                      max="100"
                      className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditChange}
                      className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition border ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'}`}
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
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    }`}
                  >
                    {editLoading ? 'Updating...' : 'Update Group'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                      isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
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
          <div className={`rounded-lg max-w-md w-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Delete Group?</h2>
            </div>

            <div className="px-8 py-6">
              {deleteError && (
                <div className={`mb-4 p-3 border rounded ${isDarkMode ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-red-100 border-red-300 text-red-700'}`}>
                  {deleteError}
                </div>
              )}
              <p className={`mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Are you sure you want to delete <strong>{deleteConfirm.title}</strong>?
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                This action will archive the group and cannot be undone immediately.
              </p>
            </div>

            <div className={`px-8 py-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} flex gap-4`}>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className={`flex-1 py-2 px-4 text-white rounded-lg font-semibold transition ${
                  deleteLoading
                    ? 'bg-red-700/50 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                  deleteLoading
                    ? 'bg-slate-600/50 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
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
