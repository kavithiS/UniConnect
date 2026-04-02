import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import CreateTaskModal from '../components/CreateTaskModal';

const TaskBoard = ({ projectId }) => {
  const { isDarkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

  // ✅ FIXED: Drag logic
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;

    // Update UI instantly
    setTasks(prev =>
      prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t)
    );

    try {
      // ✅ use PATCH (your backend route)
      await axios.patch(`http://localhost:5001/api/tasks/${draggableId}/status`, {
        status: newStatus
      });
    } catch (err) {
      console.error(err);
      fetchTasks(); // rollback
    }
  };

  // ✅ FIXED: use backend values
  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  // ✅ DELETE function
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5001/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Task Board</h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Manage and track your project tasks.</p>
        </div>
        <button className={`btn btn-primary ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Create Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`flex gap-6 mt-8 pb-4 h-[calc(100%-120px)] overflow-x-auto ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          {columns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col.id);

            return (
              <div key={col.id} className={`flex-1 min-w-[320px] flex flex-col gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className={`flex justify-between items-center pb-2 border-b font-semibold ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}>
                  <span>{col.title}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{columnTasks.length}</span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-col gap-3 ${
                        snapshot.isDraggingOver ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100/30') : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-5 rounded-lg cursor-grab border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                            >
                              <div className="flex justify-between">
                                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{task.title}</div>

                                <div className="flex gap-2">
                                  <Link to={`/tasks/${task._id}`}>
                                    <ExternalLink size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-600'} />
                                  </Link>

                                  {/* ✅ DELETE BUTTON */}
                                  <button onClick={() => deleteTask(task._id)}>
                                    <Trash2 size={16} className="text-red-400" />
                                  </button>
                                </div>
                              </div>

                              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {task.description}
                              </p>

                              <div className={`flex justify-between mt-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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

      {isModalOpen && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onTaskCreated={fetchTasks}
        />
      )}
    </div>
  );
};

export default TaskBoard;