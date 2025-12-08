// src/routes/projectsRoutes.js
import express from 'express';
import auth from '../auth/authmiddleware.js';
import { permit } from '../auth/roles.js';
import { supabase } from '../config/database.js';
import * as projectController from '../controllers/projectController.js';
import * as projectModel from '../models/projectModel.js';

const router = express.Router();

// Create project (admin and project_manager)
router.post('/', auth, permit('admin', 'project_manager'), projectController.createProject);

// Get all projects for user
router.get('/', auth, projectController.getProjects);

// Get project by ID
router.get('/:id', auth, projectController.getProjectById);

// Update project
router.put('/:id', auth, permit('admin', 'project_manager'), projectController.updateProject);

// Delete project
router.delete('/:id', auth, permit('admin', 'project_manager'), projectController.deleteProject);

// Get project members
router.get('/:projectId/members', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        role,
        users (
          id,
          username,
          email
        )
      `)
      .eq('project_id', projectId);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get project members error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add members to project
router.post('/:projectId/members', auth, permit('admin', 'project_manager'), async (req, res) => {
  const { projectId } = req.params;
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'Missing userIds' });
  }

  try {
    const members = userIds.map(userId => ({
      project_id: projectId,
      user_id: userId,
      role: 'member'
    }));

    const { error } = await supabase
      .from('project_members')
      .insert(members);

    if (error) throw error;

    res.json({ ok: true, message: 'Members added successfully' });
  } catch (err) {
    console.error('Add members error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;