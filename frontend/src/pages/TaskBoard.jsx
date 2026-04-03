import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { Plus, ExternalLink, Trash2, CheckCircle, AlertCircle, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateTaskModal from '../components/CreateTaskModal';
import { getApiBaseUrl } from '../utils/backendUrl';

const TaskBoard = ({ projectId }) => {
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || localStorage.getItem('projectId') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const memberSource = projectDetails?.members || selectedProject?.members || [];
  const projectMembers = memberSource
    .map((member) => (typeof member === 'string' ? member : member?.name))
    .filter(Boolean);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const apiUrl = `${getApiBaseUrl()}/projects`;
      console.log('📡 [TaskBoard] Fetching projects from:', apiUrl);

      const res = await axios.get(apiUrl);
      console.log('✅ [TaskBoard] Projects response:', res.data);
      
      const list = res.data?.data || res.data?.projects || (Array.isArray(res.data) ? res.data : []);
      console.log('📦 [TaskBoard] Parsed projects:', list.length, 'projects');
      
      setProjects(list);

      if (!list.length) {
        console.warn('⚠️ [TaskBoard] No projects found');
        setSelectedProjectId('');
        setTasks([]);
        setError('No projects found. Please create a project first.');
        return;
      }

      const incomingProject = projectId && list.some((p) => p._id === projectId) ? projectId : '';
      const savedProject = localStorage.getItem('projectId');
      const savedValid = savedProject && list.some((p) => p._id === savedProject) ? savedProject : '';

      const nextProject = incomingProject || savedValid || list[0]._id;
      console.log('✅ [TaskBoard] Selected project:', nextProject);
      setSelectedProjectId(nextProject);
      localStorage.setItem('projectId', nextProject);
      setError(null);
    } catch (err) {
      console.error('❌ [TaskBoard] Failed to fetch projects:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.response?.data?.message || err.message,
        url: err.config?.url
      });
      setProjects([]);
      setSelectedProjectId('');
      setTasks([]);
      setError(err.response?.data?.message || 'Failed to load projects. Backend may be down.');
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedProjectId) {
        console.warn('⚠️ [TaskBoard] No project selected, clearing tasks');
        setError('No project selected. Please create or select a project.');
        setTasks([]);
        return;
      }

      const apiUrl = `${getApiBaseUrl()}/tasks/project/${selectedProjectId}`;
      console.log('📡 [TaskBoard] Fetching tasks from:', apiUrl);
      
      const res = await axios.get(apiUrl);
      console.log('✅ [TaskBoard] Tasks response:', res.data);
      
      const tasksList = res.data || [];
      console.log('📊 [TaskBoard] Loaded', tasksList.length, 'tasks');
      
      setTasks(tasksList);
    } catch (err) {
      // Handle deleted project (404 error)
      if (err?.response?.status === 404) {
        console.warn('⚠️ [TaskBoard] Project not found - it may have been deleted');
        localStorage.removeItem('projectId');
        
        // Try to switch to another project
        try {
          const projectsRes = await axios.get(`${getApiBaseUrl()}/projects`);
          const availableProjects = projectsRes?.data?.data || projectsRes?.data?.projects || [];
          
          if (availableProjects.length > 0) {
            const firstProjectId = availableProjects[0]._id;
            setSelectedProjectId(firstProjectId);
            localStorage.setItem('projectId', firstProjectId);
            setError(null);
            
            // Fetch tasks for the new project
            const tasksRes = await axios.get(`${getApiBaseUrl()}/tasks/project/${firstProjectId}`);
            setTasks(tasksRes.data || []);
            return;
          }
        } catch (fallbackErr) {
          console.error('Failed to load fallback project:', fallbackErr);
        }
        
        setError('Project was deleted. No other projects available.');
        setTasks([]);
        setSelectedProjectId('');
        return;
      }
      
      console.error('❌ [TaskBoard] Failed to fetch tasks:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.response?.data?.message || err.message,
        url: err.config?.url
      });
      setError(err.response?.data?.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!projects.length) return;

    if (projectId && projects.some((p) => p._id === projectId) && projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
      localStorage.setItem('projectId', projectId);
    }
  }, [projectId, projects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProjectId) {
        console.log('ℹ️ [TaskBoard] No project selected, clearing details');
        setProjectDetails(null);
        return;
      }

      try {
        const apiUrl = `${getApiBaseUrl()}/projects/${selectedProjectId}`;
        console.log('📡 [TaskBoard] Fetching project details from:', apiUrl);
        
        const res = await axios.get(apiUrl);
        console.log('✅ [TaskBoard] Project details response:', res.data);
        
        const details = res.data?.data || res.data;
        setProjectDetails(details);
      } catch (err) {
        // Handle deleted project (404 error)
        if (err?.response?.status === 404) {
          console.warn('⚠️ [TaskBoard] Project details not found - it may have been deleted');
          setProjectDetails(null);
        } else {
          console.warn('⚠️ [TaskBoard] Failed to fetch project details:', {
            status: err.response?.status,
            message: err.response?.data?.message || err.message
          });
          setProjectDetails(null);
        }
      }
    };

    fetchProjectDetails();
  }, [selectedProjectId]);

  const handleProjectChange = (event) => {
    const nextProjectId = event.target.value;
    console.log('🔄 [TaskBoard] Project changed to:', nextProjectId);
    setSelectedProjectId(nextProjectId);
    localStorage.setItem('projectId', nextProjectId);
    setError(null);
  };

  const handleModalProjectChange = (nextProjectId) => {
    console.log('🔄 [TaskBoard] Modal project changed to:', nextProjectId);
    setSelectedProjectId(nextProjectId);
    localStorage.setItem('projectId', nextProjectId);
    setError(null);
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;

    setTasks(prev =>
      prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t)
    );

    try {
      await axios.patch(`${getApiBaseUrl()}/tasks/${draggableId}/status`, {
        status: newStatus
      });
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${getApiBaseUrl()}/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <p className="font-semibold">⚠️ Error Loading Tasks</p>
          <p className="mt-1">{error}</p>
          <p className="text-xs mt-2 opacity-70">Check browser console (F12) for more details</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading tasks...</p>
          </div>
        </div>
      );
    }

    if (!selectedProjectId) {
      return (
        <div className={`border rounded-lg p-6 text-center ${isDarkMode ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            🚀 Select a project from the dropdown above to view tasks
          </p>
          {projectsLoading && <p className="text-sm mt-2 opacity-60">Loading projects...</p>}
          {projects.length === 0 && !projectsLoading && (
            <p className="text-sm mt-2 text-yellow-500">No projects found. Create one first!</p>
          )}
        </div>
      );
    }

    return tasks.length === 0 ? (
      <div className={`text-center py-12 border rounded-lg ${isDarkMode ? 'bg-slate-800/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          ✨ No tasks yet. Click "Create Task" to get started!
        </p>
      </div>
    ) : null;
  };

  const content = renderContent();

  return (
    <div className="h-full flex flex-col">

      {/* Error/Loading Display */}
      {content && <div className="mb-6">{content}</div>}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Task Board
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Manage and track tasks for {selectedProject?.title || 'your selected project'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={handleProjectChange}
            disabled={projectsLoading || projects.length === 0}
            className={`h-11 min-w-[260px] rounded-lg border px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 ${isDarkMode ? 'border-white/10 bg-slate-900/70 text-slate-200' : 'border-gray-300 bg-white text-gray-900'}`}
          >
            {projects.length === 0 && (
              <option value="" className="bg-slate-900 text-slate-200">
                No projects available
              </option>
            )}
            {projects.map((project) => (
              <option key={project._id} value={project._id} className="bg-slate-900 text-slate-200">
                {project.title}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedProjectId}
          >
            <Plus size={20} /> Create Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 mt-8 pb-4 h-[calc(100%-120px)] overflow-x-auto">

          {columns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`
                  flex-1 min-w-[320px] flex flex-col gap-4 p-4 rounded-xl
                  border ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-gray-100 border-gray-200'}
                `}
              >

                {/* Column Header */}
                <div className={`flex justify-between items-center pb-2 border-b font-semibold ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {col.title}
                  </span>

                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-col gap-3 ${
                        snapshot.isDraggingOver 
                          ? isDarkMode ? 'bg-primary/5' : 'bg-blue-50'
                          : ''
                      }`}
                    >

                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                p-5 rounded-lg border cursor-grab shadow-sm
                                ${isDarkMode ? 'bg-slate-800 text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'}
                              `}
                            >

                              {/* Title + Actions */}
                              <div className="flex justify-between">
                                <div className="font-semibold">
                                  {task.title}
                                </div>

                                <div className="flex gap-2">
                                  <Link to={`/tasks/${task._id}`}>
                                    <ExternalLink size={16} />
                                  </Link>

                                  <button onClick={() => deleteTask(task._id)}>
                                    <Trash2 size={16} className="text-red-500" />
                                  </button>
                                </div>
                              </div>

                              {/* Description */}
                              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                {task.description}
                              </p>

                              {/* Footer */}
                              <div className={`flex justify-between mt-3 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                <span>{task.priority}</span>
                                <span>{task.assignedTo || 'Unassigned'}</span>
                              </div>

                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

              </div>
            );
          })}

        </div>
      </DragDropContext>

      {/* Modal */}
      {isModalOpen && (
        <CreateTaskModal
          projectId={selectedProjectId}
          projects={projects}
          projectMembers={projectMembers}
          onProjectChange={handleModalProjectChange}
          onClose={() => setIsModalOpen(false)}
          onTaskCreated={fetchTasks}
        />
      )}
    </div>
  );
};

export default TaskBoard;