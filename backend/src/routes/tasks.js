// tasks.js
import express from 'express';
const router = express.Router();
import { supabase } from '../config/database.js';
import middleware from '../middleware/authMiddleware.js';
import { permit } from '../middleware/roles.js';
import { v4 as uuidv4 } from 'uuid';

// Get tasks for a project
router.get('/project/:projectId', middleware, async (req, res) => {
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

// Get tasks assigned to the logged-in user
router.get('/user-assigned', middleware, async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects(title),
        users:assigned_to(username)
      `)
      .eq('assigned_to', req.user.id)
      .order('due_date', { ascending: true }); // Order by due date

    if (error) throw error;

    res.json(tasks.map(task => ({
      ...task,
      project_title: task.projects?.title || 'N/A', // Include project title
      assigned_username: task.users?.username || null
    })));
  } catch (err) {
    console.error('Get user-assigned tasks error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a task
router.get('/:taskId/comments', middleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`*, user:user_id(username, first_name, last_name)`)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(comments.map(c => ({
      ...c,
      user_name: c.user ? `${c.user.first_name} ${c.user.last_name}`.trim() || c.user.username : 'Unknown User'
    })));
  } catch (err) {
    console.error('Get task comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a comment for a task
router.post('/:taskId/comments', middleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    const user_name = `${req.user.first_name} ${req.user.last_name}`;
    const user_role = req.user.role;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          content,
          task_id: taskId,
          user_id,
          user_name,
          user_role,
        }
      ])
      .select(`*, user:user_id(username, first_name, last_name)`)
      .single();

    if (error) throw error;

    res.status(201).json({
      ...comment,
      user_name: comment.user ? `${comment.user.first_name} ${comment.user.last_name}`.trim() || comment.user.username : 'Unknown User'
    });
  } catch (err) {
    console.error('Create task comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
router.post('/', middleware, async (req, res) => {
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
router.put('/:id', middleware, async (req, res) => {
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
router.delete('/:id', middleware, async (req, res) => {
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