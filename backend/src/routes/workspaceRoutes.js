// src/routes/workspaceRoutes.js
import express from 'express';
const router = express.Router();
import auth from '../auth/authmiddleware.js';
import * as workspaceController from '../controllers/workspaceController.js';
import * as projectModel from '../models/projectModel.js';

// Get all workspaces for current user
router.get('/', auth, workspaceController.getWorkspaces);

// Get workspace by ID
router.get('/:id', auth, workspaceController.getWorkspaceById);

// Get projects for a workspace
router.get('/:workspaceId/projects', auth, async (req, res) => {
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
router.post('/', auth, workspaceController.createWorkspace);

// Update workspace
router.put('/:id', auth, workspaceController.updateWorkspace);

// Remove member from workspace
router.delete('/:workspaceId/members/:userId', auth, workspaceController.removeMemberFromWorkspace);

// Delete workspace
router.delete('/:id', auth, workspaceController.deleteWorkspace);

export default router;