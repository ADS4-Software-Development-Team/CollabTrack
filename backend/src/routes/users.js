// users.js
import express from 'express';
const router = express.Router();
import { supabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/authmiddleware.js';
import { permit } from '../middleware/roles.js';

// List users (admin & pm)
router.get('/', authMiddleware, permit('admin','project_manager'), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, user_role, created_at')
      .order('username');

    if (error) throw error;

    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, user_role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, permit('admin'), async (req, res) => {
  const { id } = req.params;

  // It's generally not a good idea to allow deleting the own user's account via this admin endpoint
  if (id === req.user.id) {
    return res.status(400).json({ error: "Admin can't delete their own account through this endpoint" });
  }

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;