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
    
    const userRole = req.user.role || req.user.user_role;
    console.log('Using role:', userRole);
    
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
    
    const project = await projectModel.getProjectById(id);
    
    const userRole = req.user.role || req.user.user_role;
    
    if (userRole !== 'admin' && userRole !== 'project_manager') {
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

export const getAllProjectData = async (req, res) => {
  try {
    const projects = await projectModel.getAllProjectData();
    res.json(projects);
  } catch (err) {
    console.error('Get all project data error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Analytics endpoint
export const getProjectAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role || req.user.user_role;
    
    console.log('Getting analytics for user:', { userId, userRole });
    
    // Get projects based on user role
    let projects;
    if (userRole === 'admin') {
      projects = await projectModel.getProjects(null, 'admin');
    } else if (userRole === 'project_manager') {
      projects = await projectModel.getProjects(userId, 'project_manager');
    } else {
      projects = await projectModel.getProjects(userId, 'team_member');
    }
    
    if (!Array.isArray(projects)) {
      console.error('Projects is not an array:', projects);
      return res.status(500).json({ error: 'Invalid project data format' });
    }
    
    // Fetch tasks for each project to calculate progress
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        try {
          // Get tasks for this project
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', project.id);
            
          if (tasksError) {
            console.error(`Error fetching tasks for project ${project.id}:`, tasksError);
            return { ...project, tasks: [] };
          }
          
          // Calculate progress based on tasks
          let progress = project.progress || 0;
          if (tasks && tasks.length > 0) {
            const completedTasks = tasks.filter(task => 
              task.status === 'completed' || task.status === 'done'
            ).length;
            progress = Math.round((completedTasks / tasks.length) * 100);
          }
          
          // Get member count
          const { data: members, error: membersError } = await supabase
            .from('project_members')
            .select('user_id')
            .eq('project_id', project.id);
            
          const memberCount = membersError ? 0 : (members?.length || 0);
          
          return {
            ...project,
            tasks: tasks || [],
            progress,
            task_count: tasks?.length || 0,
            member_count: memberCount
          };
        } catch (err) {
          console.error(`Error processing project ${project.id}:`, err);
          return project;
        }
      })
    );
    
    // Calculate analytics
    const activeProjects = projectsWithTasks.filter(p => 
      p.status === 'active' || p.status === 'in_progress'
    ).length;
    
    const completedProjects = projectsWithTasks.filter(p => 
      p.status === 'completed' || p.status === 'done'
    ).length;
    
    const totalProgress = projectsWithTasks.reduce((sum, p) => sum + (p.progress || 0), 0);
    const averageProgress = projectsWithTasks.length > 0 
      ? Math.round(totalProgress / projectsWithTasks.length) 
      : 0;
    
    const analytics = {
      totalProjects: projectsWithTasks.length,
      activeProjects,
      completedProjects,
      averageProgress,
      totalTasks: projectsWithTasks.reduce((sum, p) => sum + (p.task_count || 0), 0),
      totalMembers: projectsWithTasks.reduce((sum, p) => sum + (p.member_count || 0), 0),
      projects: projectsWithTasks
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
};

// Export all functions
export default {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjectData,
  getProjectAnalytics
};