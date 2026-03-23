import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
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
      await axios.patch(`http://localhost:5000/api/tasks/${draggableId}/status`, {
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
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

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
            const columnTasks = tasks.filter(t => t.status === col.id);

            return (
              <div key={col.id} className="flex-1 min-w-[320px] flex flex-col gap-4 p-4 bg-slate-900/60 rounded-xl border border-white/10">
                <div className="flex justify-between items-center pb-2 border-b border-white/10 font-semibold">
                  <span>{col.title}</span>
                  <span className="text-sm text-slate-400">{columnTasks.length}</span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-col gap-3 ${
                        snapshot.isDraggingOver ? 'bg-primary/5' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-5 rounded-lg bg-slate-800 border cursor-grab"
                            >
                              <div className="flex justify-between">
                                <div className="font-semibold">{task.title}</div>

                                <div className="flex gap-2">
                                  <Link to={`/tasks/${task._id}`}>
                                    <ExternalLink size={16} />
                                  </Link>

                                  {/* ✅ DELETE BUTTON */}
                                  <button onClick={() => deleteTask(task._id)}>
                                    <Trash2 size={16} className="text-red-400" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-sm text-slate-400 mt-2">
                                {task.description}
                              </p>

                              <div className="flex justify-between mt-3 text-sm">
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