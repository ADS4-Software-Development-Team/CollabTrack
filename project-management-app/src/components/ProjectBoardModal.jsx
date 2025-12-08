import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById, updateTask, getTasksForProject } from '../supabaseApi'; // Fixed import
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const STATUSES = ['Backlog', 'To Do', 'In Progress', 'Done'];

export default function ProjectBoard() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  async function loadProjectData() {
    try {
      setLoading(true);
      const data = await getProjectById(id);
      setProject(data.project);
      
      // Get tasks separately if needed
      const projectTasks = await getTasksForProject(id);
      setTasks(projectTasks || []);
    } catch (err) {
      console.error('Failed to load project data:', err);
    } finally {
      setLoading(false);
    }
  }

  const grouped = STATUSES.reduce((acc, s) => ({
    ...acc,
    [s]: tasks.filter(t => t.status === s)
  }), {});

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    try {
      // Update task in database
      await updateTask(draggableId, { status: newStatus });
      
      // Update local state
      setTasks(prev => prev.map(t =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">{project.title}</h2>
        <p className="text-gray-600 mt-2">{project.description}</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {STATUSES.map(status => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-gray-100 rounded-lg p-4 min-h-[400px]">
                <div className="font-semibold text-lg mb-4 flex justify-between items-center">
                  <span>{status}</span>
                  <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded-full">
                    {grouped[status]?.length || 0}
                  </span>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3"
                    >
                      {grouped[status]?.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                              className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                              style={provided.draggableProps.style}
                            >
                              <div className="font-medium text-gray-900 mb-2">
                                {task.title}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {task.description?.substring(0, 100)}
                                {task.description?.length > 100 ? '...' : ''}
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                  {task.assigned_username || task.assigned_user?.username || 'Unassigned'}
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  task.priority === 'high' || task.priority === 'urgent'
                                    ? 'bg-red-100 text-red-800'
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                              {task.due_date && (
                                <div className="text-xs text-gray-400 mt-2">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSaved={(updatedTask) => {
            setTasks(prev => prev.map(t =>
              t.id === updatedTask.id ? updatedTask : t
            ));
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}