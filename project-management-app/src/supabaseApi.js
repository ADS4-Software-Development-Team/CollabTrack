// src/supabaseApi.js
// High-level frontend functions to interact directly with Supabase.
// These are intended to replace backend API calls where appropriate.
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Authentication
export async function register({ username, email, password, role }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, role } }
  });

  if (error) throw error;

  // Try to create profile row in users table
  try {
    await supabase.from('users').insert([
      { id: data.user.id, username, email, role, created_at: new Date().toISOString() }
    ]);
  } catch (e) {
    // Non-fatal on client; server-side cleanup would be needed in robust flows
    console.warn('Failed to create profile row after signup', e.message || e);
  }

  return data;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Fetch user profile
  const userId = data.user?.id;
  if (!userId) return data;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, username, email, role')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  return { session: data, user: profile };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function getProfile() {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (error) throw error;
  return profile;
}


export const createProject = async (projectData) => {
  try {
    // 1. Get the current user and session from Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw new Error('Authentication error: ' + (userError.message || userError));
    if (!user) throw new Error('Not authenticated. Please log in.');

    // 2. Verify the user is an admin by checking their profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, id, username, first_name, last_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) throw new Error('Failed to verify user role: ' + (profileError.message || profileError));
    if (!userProfile) throw new Error('User profile not found.');
    if (userProfile.role !== 'admin') {
      throw new Error('Only admins can create projects.');
    }

    // 3. Create the project with team members
    const projectPayload = {
      title: projectData.title,
      description: projectData.description,
      due_date: projectData.due_date,
      created_by: userProfile.id, // Use the user's UUID from users table
    };

    console.log('Creating project with payload:', projectPayload);

    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert([projectPayload])
      .select()
      .single();

    if (insertError) {
      console.error('Project insert error:', insertError);
      throw insertError;
    }

    console.log('Project created:', project);

    // 4. Add team members to team_members table
    if (projectData.team_members && projectData.team_members.length > 0) {
      const teamMembersData = projectData.team_members.map(member => ({
        project_id: project.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        role: member.role || 'team_member'
      }));

      console.log('Adding team members:', teamMembersData);

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembersData);

      if (membersError) {
        console.error('Error adding team members:', membersError);
        // Don't throw here, just log. The project was created successfully.
      }
    }

    // 5. Also add the creator to project_members (for your existing join table)
    const { error: linkErr } = await supabase.from('project_members').insert([
      { project_id: project.id, user_id: user.id, role: 'admin' }
    ]);

    if (linkErr) {
      console.warn('Failed to auto-add admin to project_members:', linkErr.message);
    }

    return project;
  } catch (error) {
    console.error('Create project error details:', error);
    throw error;
  }
};
// In supabaseApi.js
export const getProjectMembers = async (project_id) => {
  try {
    const { data, error } = await supabase
      .from("project_members")
      .select(`
        user_id,
        role,
        users (
          id,
          username,
          email,
          first_name,
          last_name,
          user_role
        )
      `)
      .eq("project_id", project_id);

    if (error) throw error;
    
    // Return formatted members
    return data.map(pm => ({
      ...pm.users,
      member_role: pm.role
    }));
  } catch (error) {
    console.error("Error fetching project members:", error);
    throw error;
  }
};
export const getProjects = async () => {
  try {
    // Remove the userId parameter since project managers need to see all projects
    const { data: projects, error } = await supabase
      .from("projects")
      .select(`
        *,
        members:project_members(
          user_id,
          role,
          users(
            id,
            username,
            email,
            first_name,
            last_name,
            user_role
          )
        )
      `)
      .order("title", { ascending: true });

    if (error) throw error;

    console.log("Projects fetched:", projects);

    // Format members data
    const formattedProjects = projects.map(project => ({
      ...project,
      members: (project.members || []).map(pm => ({
        ...pm.users,
        member_role: pm.role
      }))
    }));

    console.log("Formatted projects:", formattedProjects);
    return formattedProjects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};



// Tasks
export async function getTasksForProject(projectId) {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`*, users:assigned_to(username)`)
    .eq('project_id', projectId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return tasks.map(task => ({ ...task, assigned_username: task.users?.username || null }));
}

// Add this function to your supabaseApi.js file

export async function createTask(taskData) {
  try {
    const now = new Date().toISOString();
    
    // Prepare task data - NO ID FIELD, let Supabase auto-generate it
    const newTask = {
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      project_id: taskData.project_id,
      assigned_to: taskData.assigned_to || null,
      created_by: taskData.created_by,
      created_at: now,
      updated_at: now,
      due_date: taskData.due_date || null
    };

    console.log('Creating task with data:', newTask);

    // Insert into database
    const { data: task, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select(`
        *,
        users:assigned_to(username, first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Task created successfully:', task);
    
    // Format response
    return {
      ...task,
      assigned_username: task.users?.username || null,
      assigned_user: task.users
    };
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
}

export async function updateTask(id, updates = {}) {
  const { data: task, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return task;
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Comments
export async function getCommentsForTask(taskId) {
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`*, users:user_id(username)`)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return comments.map(c => ({ ...c, username: c.users?.username || null }));
}

export async function createComment({ content, task_id }) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const id = cryptoRandomUUID();
  const { data: comment, error } = await supabase
    .from('comments')
    .insert([{ id, content, task_id, user_id: userId, created_at: new Date().toISOString() }])
    .select(`*, users:user_id(username)`)
    .single();

  if (error) throw error;
  return { ...comment, username: comment.users?.username || null };
}

export async function deleteComment(id) {
  // Client-side check for ownership is best-effort; server-side RLS/policies required for security
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const { data: comment, error: getErr } = await supabase.from('comments').select('user_id').eq('id', id).single();
  if (getErr) throw getErr;
  if (!comment) throw new Error('Comment not found');
  if (comment.user_id !== userId) throw new Error('Not authorized to delete this comment');

  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Users
export async function listUsers() {
  const { data, error } = await supabase.from('users').select('id, username, email, role, created_at').order('username');
  if (error) throw error;
  return data;
}

export async function getAvailableUsersForProject(projectId) {
  try {
    // 1. Get IDs of users already in the project
    const { data: members, error: membersErr } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('project_id', projectId);

    if (membersErr) throw membersErr;

    const memberIds = members.map(m => m.user_id);

    // 2. Get all users who are not already members
    let query = supabase.from('users')
      .select('id, username, email, first_name, last_name, role')
      .eq('role', 'team_member'); // Filter for team members only

    if (memberIds.length > 0) {
      query = query.not('id', 'in', `(${memberIds.join(',')})`);
    }

    const { data: availableUsers, error: availableErr } = await query;
    if (availableErr) throw availableErr;
    return availableUsers || [];
  } catch (error) {
    console.error('Error getting available users:', error);
    throw error;
  }
}
// In supabaseApi.js
export async function getProjectById(id) {
  try {
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (projErr) throw projErr;
    
    return { project };
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    throw error;
  }
}

// Helpers
function cryptoRandomUUID() {
  // Use browser crypto if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Fallback simple UUID v4 generator (not cryptographically secure)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default {
  register,
  login,
  logout,
  getProfile,
  getProjects,
  createProject,
  getProjectById,
  getAvailableUsersForProject,
  getTasksForProject,
  createTask,
  updateTask,
  deleteTask,
  getCommentsForTask,
  createComment,
  deleteComment,
  listUsers
};
// src/api/workspace.js
export const workspaceAPI = {
  getAvailableMembers: async (workspaceId) => {
    const response = await fetch(`/api/workspaces/${workspaceId}/available-members`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw data;
    }
    
    return data;
  },

};