import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FolderKanban,
  Layers3,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Users,
} from 'lucide-react';
import { getApiBaseUrl } from '../utils/backendUrl';
import { useTheme } from '../context/ThemeContext';

const mockProject = {
  _id: 'mock-web-app-final-assessment',
  title: 'Web App Final Assessment',
  groupId: 'G105',
  members: [
    { id: 'm1', name: 'John Smith', role: 'Developer' },
    { id: 'm2', name: 'Nila Perera', role: 'QA Engineer' },
  ],
  isMock: true,
};

const createEmptyMember = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: '',
  role: '',
});

const getInputClasses = (isDarkMode) =>
  `w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
    isDarkMode
      ? 'border-slate-700/60 bg-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400/90 focus:ring-2 focus:ring-indigo-500/30'
      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/40'
  }`;

const AddProject = ({ setProjectId }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [projectName, setProjectName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [teamMembers, setTeamMembers] = useState([createEmptyMember()]);
  const [projectsList, setProjectsList] = useState([mockProject]);
  const [loading, setLoading] = useState(false);
  const [submittingError, setSubmittingError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const validMembersCount = useMemo(
    () =>
      teamMembers.filter(
        (member) => member.name.trim() !== '' && member.role.trim() !== '',
      ).length,
    [teamMembers],
  );

  const canSubmit = projectName.trim() !== '' && validMembersCount >= 2 && !loading;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${getApiBaseUrl()}/projects`);
        const fetchedProjects = res?.data?.data || res?.data?.projects || [];
        if (Array.isArray(fetchedProjects) && fetchedProjects.length > 0) {
          setProjectsList((prev) => {
            const merged = [...fetchedProjects, ...prev];
            const map = new Map();
            merged.forEach((item) => {
              if (item && item._id && !map.has(item._id)) map.set(item._id, item);
            });
            return Array.from(map.values());
          });
        }
      } catch (error) {
        console.warn('Could not fetch projects list, keeping local list.', error);
      }
    };

    fetchProjects();
  }, []);

  const addMember = () => {
    setTeamMembers((prev) => [...prev, createEmptyMember()]);
  };

  const removeMember = (id) => {
    setTeamMembers((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((member) => member.id !== id);
    });
  };

  const updateMember = (id, field, value) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, [field]: value } : member,
      ),
    );
  };

  const resetForm = () => {
    setProjectName('');
    setGroupId('');
    setTeamMembers([createEmptyMember()]);
  };

  const handleDeleteProject = async (projectId) => {
    setDeleting(true);
    try {
      console.log(`🗑️ Attempting to delete project: ${projectId}`);
      const res = await axios.delete(`${getApiBaseUrl()}/projects/${projectId}`);
      
      if (res.data.success) {
        // Remove project from list
        setProjectsList((prev) => prev.filter((p) => p._id !== projectId));
        
        // If the deleted project was in localStorage, clear it
        if (localStorage.getItem('projectId') === projectId) {
          localStorage.removeItem('projectId');
        }
        
        setDeleteConfirm(null);
        console.log(`✅ Project ${projectId} deleted successfully`);
      } else {
        // Backend returned a non-success response
        const errorMsg = res.data.message || 'Failed to delete project';
        console.error(`❌ Delete failed:`, errorMsg);
        setDeleteConfirm({
          projectId,
          error: errorMsg,
          availableProjects: res.data.availableProjects
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete project. Please try again.';
      console.error('❌ Error deleting project:', errorMsg);
      setDeleteConfirm({
        projectId,
        error: errorMsg,
        availableProjects: err.response?.data?.availableProjects,
        statusCode: err.response?.status
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmittingError('');

    if (!canSubmit) return;

    const validMembers = teamMembers
      .filter((m) => m.name.trim() && m.role.trim())
      .map((m) => ({ name: m.name.trim(), role: m.role.trim() }));

    const payload = {
      title: projectName.trim(),
      groupId: groupId.trim(),
      description: groupId.trim(),
      members: validMembers,
    };

    setLoading(true);
    try {
      const response = await axios.post(`${getApiBaseUrl()}/projects`, payload);
      const createdProject = response?.data;

      if (!createdProject?._id) {
        throw new Error('Project was created but no project id was returned.');
      }

      setProjectsList((prev) => [createdProject, ...prev.filter((p) => p._id !== createdProject._id)]);
      localStorage.setItem('projectId', createdProject._id);
      if (typeof setProjectId === 'function') {
        setProjectId(createdProject._id);
      }

      resetForm();
      // User stays on the Add Project page to create more projects
    } catch (error) {
      console.error('Failed to create project:', error);
      setSubmittingError(
        error?.response?.data?.message || error?.message || 'Failed to create project.',
      );

      const localProject = {
        _id: `local-${Date.now()}`,
        title: payload.title,
        groupId: payload.groupId || 'Unassigned',
        members: payload.members,
        isMock: true,
      };
      setProjectsList((prev) => [localProject, ...prev]);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const pageBg = isDarkMode
    ? 'bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900'
    : 'bg-gradient-to-br from-slate-50 to-slate-100';
  const panelClass = isDarkMode
    ? 'border-slate-700/50 bg-slate-800/30'
    : 'border-slate-200/60 bg-white/60';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg} p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className={`px-8 pt-8 pb-6 relative overflow-hidden rounded-[28px] border mb-8 ${isDarkMode ? 'border-slate-800 bg-slate-950/65' : 'border-slate-200 bg-white/85'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%)]" />
          <div className="relative">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] mb-4 ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              <FolderKanban className="h-3.5 w-3.5" />
              Project Creation
            </div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Create New Project</h1>
            <p className={`max-w-xl text-base md:text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Start a new project and build with your team. Add members and define roles.</p>
          </div>
        </div>

        <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Projects</p>
            <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{projectsList.length}</p>
          </div>
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-500 mb-2">Valid Members</p>
            <p className="text-2xl font-semibold text-indigo-400">{validMembersCount}</p>
          </div>
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-violet-500 mb-2">Rows</p>
            <p className="text-2xl font-semibold text-violet-400">{teamMembers.length}</p>
          </div>
          <div className={`border rounded-lg p-4 ${panelClass}`}>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Status</p>
            <p className={`text-sm font-semibold ${canSubmit ? 'text-emerald-400' : 'text-amber-400'}`}>
              {canSubmit ? 'Ready to Create' : 'Need More Data'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`border rounded-xl p-6 md:p-8 ${panelClass}`}>
          <section className="space-y-5">
            <div className={`flex items-center gap-2 pb-3 border-b ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
              <Sparkles size={18} className="text-indigo-400" />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Project Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`mb-2 block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Web App Final Assessment"
                  className={getInputClasses(isDarkMode)}
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Group Name / ID <span className="text-xs font-normal text-slate-500">optional</span>
                </label>
                <input
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="e.g. G105"
                  className={getInputClasses(isDarkMode)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 mt-8">
            <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-semibold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Users size={19} className="text-indigo-400" />
                Team Members
                <span className="text-xs font-normal text-slate-500">at least 2 required</span>
              </h2>

              <button
                type="button"
                onClick={addMember}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isDarkMode
                    ? 'bg-slate-700/70 text-slate-100 hover:bg-slate-700'
                    : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                <Plus size={15} />
                Add Member
              </button>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 border rounded-lg p-3 ${panelClass}`}>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-slate-500">Full Name *</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                      placeholder="e.g. John Smith"
                      className={getInputClasses(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-slate-500">Role *</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                      placeholder="e.g. Developer"
                      className={getInputClasses(isDarkMode)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className={`h-11 w-11 inline-flex items-center justify-center rounded-md border transition ${
                        isDarkMode
                          ? 'border-slate-700 text-slate-400 hover:border-rose-500/60 hover:text-rose-300 hover:bg-rose-500/10'
                          : 'border-slate-300 text-slate-500 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      aria-label="Remove member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {submittingError && (
            <div className={`mt-6 rounded-lg border px-4 py-3 text-sm ${isDarkMode ? 'border-red-800/50 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {submittingError}
            </div>
          )}

          <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
              {validMembersCount}/2 valid members added
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
                canSubmit
                  ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_0_1px_rgba(99,102,241,0.35)]'
                  : 'cursor-not-allowed bg-slate-700 text-slate-400 opacity-50'
              }`}
            >
              {loading ? 'Creating...' : 'Create Project'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <section className={`border rounded-xl p-6 md:p-8 ${panelClass}`}>
          <div className={`flex items-center gap-2 pb-3 border-b mb-4 ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>
            <Layers3 size={18} className="text-indigo-400" />
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Created Projects</h2>
          </div>

          {projectsList.length === 0 ? (
            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>No projects yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {projectsList.map((project) => (
                <article key={project._id} className={`border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${panelClass}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{project.title}</p>
                      {project.isMock && (
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${isDarkMode ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
                          Mock
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                      Group: {project.groupId || 'Unassigned'} | Members: {project.members?.length || 0}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('projectId', project._id);
                        if (typeof setProjectId === 'function') setProjectId(project._id);
                        navigate('/dashboard/project-dashboard');
                      }}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                        isDarkMode
                          ? 'bg-slate-700/70 text-slate-100 hover:bg-slate-700'
                          : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      }`}
                    >
                      <FolderKanban size={16} />
                      Open Dashboard
                    </button>

                    {!project.isMock && (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ projectId: project._id, error: null })}
                        className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                          isDarkMode
                            ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-800/30'
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                        disabled={deleting}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-lg border p-6 shadow-xl max-h-[80vh] overflow-y-auto ${
              isDarkMode
                ? 'border-slate-700 bg-slate-800'
                : 'border-slate-200 bg-white'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Delete Project
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              This will permanently delete the project and all associated tasks. This action cannot be undone.
            </p>

            {deleteConfirm.error && (
              <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${isDarkMode ? 'border-red-800/50 bg-red-900/20 text-red-300' : 'border-red-200 bg-red-50 text-red-700'}`}>
                <div className="font-medium mb-2">❌ {deleteConfirm.error}</div>
                {deleteConfirm.statusCode === 404 && (
                  <div className={`text-xs mt-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    This project may have already been deleted. Please refresh the page.
                  </div>
                )}
              </div>
            )}

            {/* Show available projects if delete failed */}
            {deleteConfirm.error && deleteConfirm.availableProjects && deleteConfirm.availableProjects.length > 0 && (
              <div className={`mb-4 rounded-lg border p-3 text-sm ${isDarkMode ? 'border-blue-800/50 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                <div className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>📋 Available Projects:</div>
                <ul className={`space-y-1 text-xs ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>
                  {deleteConfirm.availableProjects.map((p) => (
                    <li key={p._id} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{p.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  isDarkMode
                    ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                    : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                {deleteConfirm.error ? 'Close' : 'Cancel'}
              </button>
              {!deleteConfirm.error && (
                <button
                  type="button"
                  onClick={() => handleDeleteProject(deleteConfirm.projectId)}
                  disabled={deleting}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                    deleting
                      ? 'cursor-not-allowed opacity-50'
                      : isDarkMode
                        ? 'bg-red-900/50 text-red-200 hover:bg-red-900/70'
                        : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {deleting ? 'Deleting...' : 'Delete Project'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AddProject;