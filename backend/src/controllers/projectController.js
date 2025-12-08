// backend/src/controllers/projectController.js
import * as projectModel from '../models/projectModel.js';
import { supabase } from '../config/database.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, due_date, team_members, workspace_id } = req.body;
    const created_by = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Missing title' });
    }
    if (!workspace_id) {
      return res.status(400).json({ error: 'Missing workspace ID' });
    }

    const projectData = {
      title,
      description,
      due_date,
      workspace_id,
      created_by
    };

    const newProject = await projectModel.addProject(projectData);

    // Add team members to the project
    if (team_members && team_members.length > 0) {
      for (const member of team_members) {
        await projectModel.addProjectMember(newProject.id, member.user_id);
      }
    }

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject
    });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    console.log('Getting projects for user:', {
      id: req.user.id,
      role: req.user.role,
      user_role: req.user.user_role
    });
    
    // Use the role from req.user (should be set by auth middleware)
    const userRole = req.user.role || req.user.user_role;
    console.log('Using role:', userRole);
    
    // Pass both userId and userRole to the model
    const projects = await projectModel.getProjects(req.user.id, userRole);
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting project by ID for user:', {
      id: req.user.id,
      role: req.user.role,
      projectId: id
    });
    
    // Get project details
    const project = await projectModel.getProjectById(id);
    
    // Check if user is admin/project_manager OR a member of the project
    const userRole = req.user.role || req.user.user_role;
    
    if (userRole !== 'admin' && userRole !== 'project_manager') {
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

// Add update and delete functions
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, workspace_id } = req.body;
    
    const updatedProject = await projectModel.updateProject(id, {
      title,
      description,
      due_date,
      workspace_id
    });
    
    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await projectModel.deleteProject(id);
    
    res.json({
      message: 'Project deleted successfully'
    });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: err.message });
  }
};