import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectAPI } from '../api';
import AssignTaskModal from '../components/AssignTaskModal';

export default function Workspace() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await projectAPI.getProjectById(id);
      setProject(res.project);
      setTasks(res.tasks || []);

      // load project members via backend
      try {
        const pUsers = await projectAPI.getProjectMembers(id);
        // The API returns members with a nested 'users' object. We need to flatten it.
        const formattedMembers = (pUsers || []).map(member => ({
          id: member.users?.id,
          username: member.users?.username,
          email: member.users?.email,
          role: member.role
        }));
        setMembers(formattedMembers);
      } catch (e) {
        console.warn('Failed to load project users via backend, falling back to empty members', e);
        setMembers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }



  const handleAssignTask = async (taskData) => {
    try {
      const created = await projectAPI.createTask(id, taskData);
      await load();
      return created;
    } catch (err) { console.error(err); throw err; }
  };

  return (
    <div>
      {loading ? <p>Loading workspace...</p> : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">Workspace: {project?.title}</h1>
              <div className="text-sm text-gray-600">{project?.description}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => setShowAssign(true)} className="bg-green-600 text-white px-3 py-1 rounded">Assign Task</button>
            </div>
          </div>

          <section className="mb-6">
            <h3 className="font-semibold mb-2">Team Members</h3>
            <div className="flex gap-3 flex-wrap">
              {members.map(m => (
                <div key={m.id} className="p-2 bg-white rounded shadow text-sm">
                  <div className="font-medium">{m.username || m.email}</div>
                  <div className="text-xs text-gray-500">{m.role}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="font-semibold mb-2">Tasks</h3>
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="bg-white p-3 rounded shadow">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-sm text-gray-600">{t.description}</div>
                      <div className="text-xs text-gray-500">Assigned: {t.assigned_username || 'Unassigned'}</div>
                    </div>
                    <div className="text-sm text-gray-500">Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Gantt (assignments)</h3>
            <GanttChart tasks={tasks} members={members} />
          </section>

          {showAssign && <AssignTaskModal onClose={() => setShowAssign(false)} members={members} onAssign={handleAssignTask} />}
        </>
      )}
    </div>
  );
}
