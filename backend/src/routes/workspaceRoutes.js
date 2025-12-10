// src/routes/workspaceRoutes.js
import express from 'express';
const router = express.Router();
import middleware from '../middleware/authMiddleware.js';
import * as workspaceController from '../controllers/workspaceController.js';
import * as projectModel from '../models/projectModel.js';

// Get all workspaces for current user
router.get('/', middleware, workspaceController.getWorkspaces);

// Get workspace by ID
router.get('/:id', middleware, workspaceController.getWorkspaceById);

// Get projects for a workspace
router.get('/:workspaceId/projects', middleware, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const projects = await projectModel.getProjectsByWorkspaceId(workspaceId);
    res.json(projects);
  } catch (err) {
    console.error('Get projects for workspace error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Create new workspace
router.post('/', middleware, workspaceController.createWorkspace);

// Update workspace
router.put('/:id', middleware, workspaceController.updateWorkspace);

// Remove member from workspace
router.delete('/:workspaceId/members/:userId', middleware, workspaceController.removeMemberFromWorkspace);

// Delete workspace
router.delete('/:id', middleware, workspaceController.deleteWorkspace);

export default router;