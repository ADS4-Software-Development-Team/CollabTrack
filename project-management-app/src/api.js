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

// Project API functions - UPDATED TO USE BACKEND ROUTES
// frontend/src/api.js - Update projectAPI
export const projectAPI = {
  getProjects: () => api('/projects'), // This calls backend route /api/projects
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
  // Keep these Supabase calls for now
  createTask: supabaseApi.createTask,
  getTasksForProject: supabaseApi.getTasksForProject,
  getProjectMembers: supabaseApi.getProjectMembers,
  updateTask: supabaseApi.updateTask,
  deleteTask: supabaseApi.deleteTask
};

export const userAPI = {
  listUsers: () => api('/users'),
  deleteUser: (id) => api(`/users/${id}`, { method: 'DELETE' }),
};

export const workspaceAPI = {
  getWorkspaces: () => api('/workspaces'),
  createWorkspace: (name) => api('/workspaces', { 
    method: 'POST', 
    body: JSON.stringify({ name }) 
  }),
  getWorkspaceById: (id) => api(`/workspaces/${id}`),
  getProjectsForWorkspace: (workspaceId) => api(`/workspaces/${workspaceId}/projects`),
};

export const adminAPI = {
  getStats: () => api('/admin/stats'),
};