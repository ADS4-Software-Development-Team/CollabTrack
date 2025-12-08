import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById, updateTask } from '../supabaseApi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskModal from '../components/ProjectBoardModal';

const STATUSES = ['Backlog','To Do','In Progress','Done'];

export default function ProjectBoard(){
  const { id } = useParams();
  const [project,setProject] = useState(null);
  const [tasks,setTasks] = useState([]);
  const [selectedTask,setSelectedTask] = useState(null);

  useEffect(()=> {
    (async()=>{
      try {
        const data = await getProjectById(id);
        setProject(data.project);
        setTasks(data.tasks);
      } catch (err) { console.error(err); }
    })();
  }, [id]);

  const grouped = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s) }), {});

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    try {
      await updateTask(draggableId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
    } catch (err) { alert('Failed to update'); }
  };

  return (
    <div>
      <h2 className="text-2xl mb-3">{project?.title}</h2>
      <div className="flex gap-4">
        <DragDropContext onDragEnd={onDragEnd}>
          {STATUSES.map(status => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 p-3 rounded w-64 min-h-[300px]">
                  <div className="font-semibold mb-2">{status} ({grouped[status]?.length || 0})</div>
                  {grouped[status]?.map((task, idx) => (
                    <Draggable key={task.id} draggableId={task.id} index={idx}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                          onClick={()=>setSelectedTask(task)}
                          className="bg-white p-2 mb-2 rounded shadow cursor-pointer">
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-600">{task.assigned_username || 'Unassigned'}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>

      {selectedTask && <TaskModal task={selectedTask} onClose={()=>setSelectedTask(null)} onSaved={(updated)=> {
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      }} />}
    </div>
  );
}
