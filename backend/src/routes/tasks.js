// tasks.js
import express from 'express';
const router = express.Router();
import { supabase } from '../config/database.js';
import auth from '../auth/authmiddleware.js';
import { permit } from '../auth/roles.js';
import { v4 as uuidv4 } from 'uuid';

// Get all tasks (for team dashboard)
router.get('/', auth, async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        created_by_name:created_by(username)
      `);

    if (error) throw error;

    // The frontend will filter by assigned_to, but we can send the creator's name
    const formattedTasks = tasks.map(task => ({
      ...task,
      created_by_name: task.created_by_name?.username || 'Unknown'
    }));

    res.json(formattedTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        users:assigned_to(username)
      `)
      .eq('project_id', projectId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(tasks.map(task => ({
      ...task,
      assigned_username: task.users?.username || null
    })));
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  const { title, description, project_id, assigned_to, priority, due_date } = req.body;

  if (!title || !project_id) {
    return res.status(400).json({ error: 'Title and project ID are required' });
  }

  try {
    const id = uuidv4();
    const now = new Date().toISOString();

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([
        {
          id,
          title,
          description: description || '',
          status: 'pending',
          priority: priority || 'medium',
          project_id,
          assigned_to: assigned_to || null,
          created_by: req.user.id,
          created_at: now,
          updated_at: now,
          due_date: due_date || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      id, 
      title, 
      message: 'Task created successfully',
      task 
    });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assigned_to, due_date } = req.body;

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        status,
        priority,
        assigned_to,
        due_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ 
      message: 'Task updated successfully',
      task 
    });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;