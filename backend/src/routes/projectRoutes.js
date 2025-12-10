// src/routes/projectsRoutes.js
import express from 'express';
import middleware from '../middleware/authMiddleware.js';
import { permit } from '../middleware/roles.js';
import { supabase } from '../config/database.js';
import * as projectController from '../controllers/projectController.js';
import commentController from '../controllers/commentController.js';


const router = express.Router();

// Create project (admin and project_manager)
router.post('/', middleware, permit('admin', 'project_manager'), projectController.createProject);

// Get all projects for user
router.get('/', middleware, projectController.getProjects);

router.get('/analytics', middleware, projectController.getProjectAnalytics);

// Get all project data
router.get('/all-data', middleware, projectController.getAllProjectData);

// Get project by ID
router.get('/:id', middleware, projectController.getProjectById);

// Update project
router.put('/:id', middleware, permit('admin', 'project_manager'), projectController.updateProject);

// Delete project
router.delete('/:id', middleware, permit('admin', 'project_manager'), projectController.deleteProject);
router.get('/:projectId/comments', middleware, commentController.getProjectComments);
router.post('/:projectId/comments', middleware, commentController.createComment);
router.delete('/:projectId/comments/:commentId', middleware, commentController.deleteComment);

// Get project members
router.get('/:projectId/members', middleware, async (req, res) => {
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
router.post('/:projectId/members', middleware, permit('admin', 'project_manager'), async (req, res) => {
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