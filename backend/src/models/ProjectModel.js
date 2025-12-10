// backend/src/models/projectModel.js
import { supabase } from "../config/database.js";

export const addProject = async ({ title, description, due_date, workspace_id, created_by }) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .insert([{ title, description, due_date, workspace_id, created_by }])
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

export const getProjects = async (userId, userRole) => {
  try {
    console.log('getProjects called with:', { userId, userRole });
    
    // If user is admin or project_manager, return ALL projects
    if (userRole === 'admin' || userRole === 'project_manager') {
      console.log('User is admin/project_manager, returning all projects');
      
      const { data: projects, error: projectsError } = await supabase
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
          ),
          tasks:tasks(*)
        `)
        .order("title", { ascending: true });

      if (projectsError) throw projectsError;

      // Format members data
      const formattedProjects = projects.map(project => ({
        ...project,
        members: project.members.map(pm => ({
          ...pm.users,
          member_role: pm.role
        })),
        tasks: project.tasks || []
      }));

      console.log(`Returning ${formattedProjects.length} projects for admin/project_manager`);
      return formattedProjects;
    } else {
      // For regular users, only return projects they're members of
      console.log('User is regular member, checking project memberships');
      
      const { data: projectMemberships, error: membershipError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          role
        `)
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      const projectIds = projectMemberships.map(pm => pm.project_id);

      if (projectIds.length === 0) {
        console.log('No project memberships found for user');
        return [];
      }

      const { data: projects, error: projectsError } = await supabase
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
          ),
          tasks:tasks(*)
        `)
        .in('id', projectIds)
        .order("title", { ascending: true });

      if (projectsError) throw projectsError;

      // Format members data
      const formattedProjects = projects.map(project => ({
        ...project,
        members: project.members.map(pm => ({
          ...pm.users,
          member_role: pm.role
        })),
        tasks: project.tasks || []
      }));

      console.log(`Returning ${formattedProjects.length} projects for regular user`);
      return formattedProjects;
    }
  } catch (error) {
    console.error("Error fetching projects for user:", error);
    throw error;
  }
};

export const getProjectById = async (id) => {
  try {
    console.log('Fetching project by ID:', id);
    
    const { data, error } = await supabase
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
        ),
        tasks:tasks(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      if (error.code === 'PGRST116') { // Not found
        const notFoundError = new Error('Project not found');
        notFoundError.status = 404;
        throw notFoundError;
      }
      throw error;
    }
    
    // Format members data
    const formattedProject = {
      ...data,
      members: data.members.map(pm => ({
        ...pm.users,
        member_role: pm.role
      })),
      tasks: data.tasks || []
    };
    
    console.log('Project found:', formattedProject.title);
    return formattedProject;
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    throw error;
  }
};

export const updateProject = async (id, { title, description, due_date, workspace_id }) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .update({ title, description, due_date, workspace_id })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const addProjectMember = async (project_id, user_id) => {
  try {
    const { data, error } = await supabase
      .from("project_members")
      .insert([{ project_id, user_id }])
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding project member:", error);
    throw error;
  }
};

export const getProjectMembers = async (project_id) => {
  try {
    const { data, error } = await supabase
      .from("project_members")
      .select(`
        user_id,
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
    return data.map(pm => pm.users);
  } catch (error) {
    console.error("Error fetching project members:", error);
    throw error;
  }
};

export const removeProjectMember = async (project_id, user_id) => {
  try {
    const { data, error } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", project_id)
      .eq("user_id", user_id);

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProjectsByWorkspaceId = async (workspaceId) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("title", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching projects by workspace ID:", error);
    throw error;
  }
};

export const getAllProjectData = async () => {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(
        `
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
        ),
        tasks:tasks(*),
        comments:comments(*)
      `
      )
      .order("title", { ascending: true });

    if (projectsError) throw projectsError;

    // Format members data
    const formattedProjects = projects.map((project) => ({
      ...project,
      members: project.members.map((pm) => ({
        ...pm.users,
        member_role: pm.role,
      })),
      tasks: project.tasks || [],
      comments: project.comments || [],
    }));

    return formattedProjects;
  } catch (error) {
    console.error("Error fetching all project data:", error);
    throw error;
  }
};