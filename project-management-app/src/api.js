// frontend/src/api.js
import * as supabaseApi from './supabaseApi';
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function api(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_ROOT}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

// Auth API functions
export const authAPI = {
  register: (userData) => api('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
};

// Project API functions
export const projectAPI = {
  // Project operations
  getProjects: () => api('/projects'),
  getProjectById: (id) => api(`/projects/${id}`),
  createProject: (projectData) => api('/projects', { 
    method: 'POST', 
    body: JSON.stringify(projectData) 
  }),
  updateProject: (id, projectData) => api(`/projects/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(projectData) 
  }),
  deleteProject: (id) => api(`/projects/${id}`, { 
    method: 'DELETE' 
  }),
  getAllProjectData: () => api('/projects/all-data'),
  
  // Task operations
  createTask: (taskData) => api('/tasks', { 
    method: 'POST', 
    body: JSON.stringify(taskData) 
  }),
  getTasksForProject: (projectId) => api(`/tasks/project/${projectId}`),
  updateTask: (id, taskData) => api(`/tasks/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(taskData) 
  }),
  deleteTask: (id) => api(`/tasks/${id}`, { 
    method: 'DELETE' 
  }),
  
  // Comment operations
  getProjectComments: (projectId) => api(`/projects/${projectId}/comments`),
  addComment: (commentData) => api(`/projects/${commentData.project_id}/comments`, { 
    method: 'POST', 
    body: JSON.stringify(commentData) 
  }),
  updateComment: (commentId, commentData) => api(`/comments/${commentId}`, { 
    method: 'PUT', 
    body: JSON.stringify(commentData) 
  }),
  deleteComment: (commentId) => api(`/comments/${commentId}`, { 
    method: 'DELETE' 
  }),
};

// In api.js, update the userAPI section:
export const userAPI = {
  listUsers: () => api('/users'),
  deleteUser: async (id) => {
    try {
      const result = await api(`/users/${id}`, { method: 'DELETE' });
      return result;
    } catch (error) {
      console.error('Delete user error:', error);
      
      // Check if it's a 400 error (admin trying to delete themselves)
      if (error.status === 400) {
        throw new Error("Admin cannot delete their own account through this endpoint");
      }
      
      throw new Error(error.error || 'Failed to delete user');
    }
  },
};
export const workspaceAPI = {
  getWorkspaces: () => api('/workspaces'),
  createWorkspace: (workspaceData) => api('/workspaces', { 
    method: 'POST', 
    body: JSON.stringify(workspaceData) 
  }),
  getWorkspaceById: (id) => api(`/workspaces/${id}`),
  getProjectsForWorkspace: (workspaceId) => api(`/workspaces/${workspaceId}/projects`),
  deleteWorkspace: (id) => api(`/workspaces/${id}`, { 
    method: 'DELETE' 
  }),
};
export const adminAPI = {
  getStats: () => api('/admin/stats'),
};

// Tasks API for user-specific tasks
export const tasksAPI = {
  getTasksForUser: () => api('/tasks/user-assigned'),
  getCommentsForTask: (taskId) => api(`/tasks/${taskId}/comments`),
  createComment: (taskId, commentData) => api(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData)
  }),
};

// Analytics API
export const analyticsAPI = {
  getProjectAnalytics: async () => {
    try {
      const token = localStorage.getItem('token');
      const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${API_ROOT}/projects/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // If analytics endpoint fails, fall back to regular projects
        console.warn('Analytics endpoint not available, falling back to projects');
        const projects = await projectAPI.getProjects();
        return calculateAnalyticsManually(projects);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get project analytics error:', error);
      // Fall back to manual calculation
      const projects = await projectAPI.getProjects();
      return calculateAnalyticsManually(projects);
    }
  }
};

// Helper function for manual analytics calculation
function calculateAnalyticsManually(projects) {
  if (!Array.isArray(projects)) {
    console.error('Projects is not an array:', projects);
    return { 
      totalProjects: 0, 
      activeProjects: 0,
      completedProjects: 0,
      averageProgress: 0,
      totalTasks: 0,
      totalMembers: 0,
      projects: [] 
    };
  }
  
  const projectsWithStats = projects.map(project => {
    let progress = project.progress || 0;
    if (project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0) {
      const completedTasks = project.tasks.filter(task => 
        task.status === 'completed' || task.status === 'done'
      ).length;
      progress = Math.round((completedTasks / project.tasks.length) * 100);
    }
    
    return {
      ...project,
      progress,
      task_count: project.tasks ? project.tasks.length : 0,
      member_count: project.members ? project.members.length : 0
    };
  });
  
  const activeProjects = projectsWithStats.filter(p => 
    p.status === 'active' || p.status === 'in_progress'
  ).length;
  
  const completedProjects = projectsWithStats.filter(p => 
    p.status === 'completed' || p.status === 'done'
  ).length;
  
  const averageProgress = projectsWithStats.length > 0 
    ? Math.round(projectsWithStats.reduce((sum, p) => sum + p.progress, 0) / projectsWithStats.length)
    : 0;
  
  return {
    totalProjects: projectsWithStats.length,
    activeProjects,
    completedProjects,
    averageProgress,
    totalTasks: projectsWithStats.reduce((sum, p) => sum + (p.task_count || 0), 0),
    totalMembers: projectsWithStats.reduce((sum, p) => sum + (p.member_count || 0), 0),
    projects: projectsWithStats
  };
}