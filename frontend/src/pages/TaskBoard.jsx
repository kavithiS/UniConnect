import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { Plus, MoreVertical, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreateTaskModal from '../components/CreateTaskModal';

const TaskBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const draggedTask = tasks.find(t => t._id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;
    
    // Update local state immediately for UI responsiveness
    setTasks(prev => 
      prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t)
    );

    try {
      await axios.put(`http://localhost:5000/api/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      console.error(err);
      // Revert on error
      fetchTasks();
    }
  };

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Task Board</h1>
          <p className="text-slate-400">Manage and track your project tasks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Create Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 mt-8 pb-4 h-[calc(100%-120px)] overflow-x-auto">
          {columns.map(col => {
            const columnTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} className="flex-1 min-w-[320px] max-h-full flex flex-col gap-4 p-4 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="flex justify-between items-center pb-2 border-b border-white/10 font-semibold">
                  <span>{col}</span>
                  <span className="text-sm text-slate-400">{columnTasks.length}</span>
                </div>

                <Droppable droppableId={col}>
                  {(provided, snapshot) => (
                    <div
                      className={`flex-1 overflow-y-auto min-h-[50px] flex flex-col gap-3 pr-1 rounded-md transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-transparent'}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`p-5 rounded-lg bg-slate-800/80 border border-white/10 cursor-grab backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 active:cursor-grabbing ${snapshot.isDragging ? 'opacity-80' : 'opacity-100'}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-semibold text-lg">{task.title}</div>
                                <div className="flex gap-1">
                                  <Link to={`/tasks/${task._id}`} className="text-slate-400 hover:text-slate-200">
                                    <ExternalLink size={16} />
                                  </Link>
                                </div>
                              </div>
                              <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                                {task.description}
                              </p>
                              <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
                                <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
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
