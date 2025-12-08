// comments.js
import express from 'express';
const router = express.Router();
import { supabase } from '../config/database.js';
import auth from '../auth/authmiddleware.js';
import { v4 as uuidv4 } from 'uuid';

// Get comments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:user_id(username)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(comments.map(comment => ({
      ...comment,
      username: comment.users?.username || null
    })));
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new comment
router.post('/', auth, async (req, res) => {
  const { content, task_id } = req.body;

  if (!content || !task_id) {
    return res.status(400).json({ error: 'Content and task ID are required' });
  }

  try {
    const id = uuidv4();

    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          id,
          content,
          task_id,
          user_id: req.user.id,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        users:user_id(username)
      `)
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Comment created successfully',
      comment: {
        ...comment,
        username: comment.users?.username || null
      }
    });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // First check if the comment belongs to the user
    const { data: comment, error: checkError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Allow deletion only if user owns the comment or is admin
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;