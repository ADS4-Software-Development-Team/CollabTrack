// src/routes/projectsRoutes.js
import express from 'express';
import auth from '../auth/authmiddleware.js';
import { permit } from '../auth/roles.js';
import * as projectController from '../controllers/projectController.js';

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
router.get('/:projectId/members', auth, projectController.getProjectMembers);

// Add members to project
router.post('/:projectId/members', auth, permit('admin', 'project_manager'), projectController.addProjectMembers);

export default router;