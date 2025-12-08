import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// CHANGE TO YOUR BACKEND URL
const API_BASE = 'http://localhost:4001/api';

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative bg-white rounded-xl border border-gray-200 p-5
        hover:border-gray-300 hover:shadow-xl cursor-grab active:cursor-grabbing
        transition-all duration-200 select-none
        ${isDragging ? 'opacity-70 rotate-6 scale-110 shadow-2xl z-50' : ''}
      `}
    >
      <h3 className="font-semibold text-gray-900 mb-3">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{task.description}</p>
      )}
      {task.dueDate && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      )}

      {/* Assigned By */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500">by</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white">
            {task.created_by_name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="font-medium text-gray-800">
            {task.created_by_name || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-indigo-400/30 transition-all pointer-events-none" />
    </div>
  );
}

export default function TeamDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const currentUserId = user.id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const columns = ['Backlog', 'To-Do', 'In-progress', 'Done'];

  const columnStyle = {
    Backlog: 'bg-gray-50/80',
    'To-Do': 'bg-blue-50/80',
    'In-progress': 'bg-amber-50/80',
    Done: 'bg-green-50/80',
  };

  // Fetch tasks assigned to current user
  useEffect(() => {
    const fetchMyTasks = async () => {
      if (!token || !currentUserId) {
        setError('Please log in');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to load tasks');

        const allTasks = await res.json();

        const myTasks = allTasks.filter(task => task.assigned_to === currentUserId);

        const formattedTasks = myTasks.map(task => ({
          _id: task.id,
          title: task.title,
          description: task.description,
          status: task.status === 'pending' ? 'To-Do' :
                  task.status === 'in_progress' ? 'In-progress' :
                  task.status === 'done' ? 'Done' : 'Backlog',
          dueDate: task.due_date,
          created_by_name: task.created_by_name || 'Unknown',
        }));

        setTasks(formattedTasks);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Could not load your tasks');
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, [token, currentUserId]);

  // Handle drag & drop
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    let newStatus = null;
    if (columns.includes(overId)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find(t => t._id === overId);
      newStatus = overTask?.status;
    }

    if (!newStatus || newStatus === tasks.find(t => t._id === taskId)?.status) return;

    const statusMap = {
      'To-Do': 'pending',
      'In-progress': 'in_progress',
      'Done': 'done',
      'Backlog': 'backlog'
    };
    const dbStatus = statusMap[newStatus] || 'pending';

    // Optimistic update
    setTasks(prev => prev.map(t =>
      t._id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: dbStatus }),
      });
    } catch (err) {
      setError('Failed to update task');
      // Revert on error
      setTasks(prev => prev.map(t =>
        t._id === taskId ? { ...t, status: tasks.find(x => x._id === taskId)?.status } : t
      ));
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading your tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50 shadow-lg">
        <p className="font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* Header + My Tasks Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-3">My Dashboard</h1>
              <p className="text-xl text-gray-600">
                Hello <span className="font-bold text-indigo-600">{user.username || 'Member'}</span> — here are your assigned tasks
              </p>
            </div>

            {/* My Tasks Button */}
            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2m-6-6h6m-6 4h6" />
              </svg>
              My Tasks
            </button>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {columns.map(column => {
              const columnTasks = tasks.filter(t => t.status === column);
              const taskIds = columnTasks.map(t => t._id);

              return (
                <div
                  key={column}
                  id={column}
                  className={`${columnStyle[column]} rounded-2xl border-2 border-dashed border-transparent hover:border-gray-300 transition-all p-6 min-h-[600px] backdrop-blur-sm`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{column.replace('-', ' ')}</h2>
                    <span className="bg-white/90 px-4 py-2 rounded-full font-bold text-gray-700 shadow">
                      {columnTasks.length}
                    </span>
                  </div>

                  <SortableContext id={column} items={taskIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {columnTasks.length === 0 ? (
                        <p className="text-center text-gray-400 italic py-20">No tasks here</p>
                      ) : (
                        columnTasks.map(task => <TaskCard key={task._id} task={task} />)
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {tasks.find(t => t._id === activeId) && (
            <div className="rotate-6">
              <TaskCard task={tasks.find(t => t._id === activeId)} />
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}