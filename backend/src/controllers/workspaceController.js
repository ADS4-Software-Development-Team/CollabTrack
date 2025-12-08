// src/controllers/workspaceController.js
import * as workspaceModel from '../models/workspaceModel.js';
import * as projectModel from '../models/projectModel.js';

export const getWorkspaces = async (req, res) => {
  try {
    const formattedWorkspaces = await workspaceModel.getWorkspacesForUser(req.user.id);
    res.json(formattedWorkspaces);
  } catch (err) {
    console.error('Get workspaces error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
};
// backend/src/controllers/projectController.js - Update getProjects function
export const getProjects = async (req, res) => {
  try {
    console.log('Getting projects for user:', req.user.id, 'role:', req.user.user_role);
    
    const projects = await projectModel.getProjects(req.user.id, req.user.user_role);
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Also update getProjectById to allow project_manager access
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting project by ID:', id, 'for user:', req.user.id, 'role:', req.user.user_role);
    
    // Pass user role to model function if needed, or handle in controller
    const project = await projectModel.getProjectById(id);
    
    // Check if user is admin/project_manager OR a member of the project
    if (req.user.user_role !== 'admin' && req.user.user_role !== 'project_manager') {
      // Check if user is a member of this project
      const { data: membership, error } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('project_id', id)
        .eq('user_id', req.user.id)
        .single();
        
      if (error || !membership) {
        return res.status(403).json({ error: 'Access denied to project' });
      }
    }
    
    res.json(project);
  } catch (err) {
    console.error('Get project by id error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
};
export const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await workspaceModel.getWorkspaceById(id, req.user.id);
    res.json(result);
  } catch (err) {
    console.error('Get workspace error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    const workspace = await workspaceModel.createWorkspace(name, req.user.id);

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace
    });

  } catch (err) {
    console.error('Create workspace error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const workspace = await workspaceModel.updateWorkspace(id, name, description, req.user.id);

    res.json({
      message: 'Workspace updated successfully',
      workspace
    });

  } catch (err) {
    console.error('Update workspace error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const removeMemberFromWorkspace = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    
    await workspaceModel.removeMemberFromWorkspace(workspaceId, userId, req.user.id);

    res.json({
      message: 'Member removed successfully'
    });

  } catch (err) {
    console.error('Remove member error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    await workspaceModel.deleteWorkspace(id, req.user.id);

    res.json({
      message: 'Workspace deleted successfully'
    });

  } catch (err) {
    console.error('Delete workspace error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
};