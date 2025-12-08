import { supabase } from '../config/database.js';

export const getWorkspacesForUser = async (userId) => {
  const { data: workspaces, error } = await supabase
    .from('workspace_members')
    .select(`
      workspace:workspaces (
        id,
        name,
        created_at,
        created_by,
        is_active,
        projects (
          id,
          title,
          description,
          due_date
        )
      ),
      member_role
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) throw error;

  return workspaces.map(wm => ({
    ...wm.workspace,
    user_role: wm.member_role
  }));
};


export const getWorkspaceById = async (workspaceId, userId) => {
  // Check if user is member of this workspace
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('member_role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (membershipError || !membership) {
    const err = new Error('Access denied to workspace');
    err.status = 403;
    throw err;
  }

  // Get workspace details
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select(`
      *
    `)
    .eq('id', workspaceId)
    .single();

  if (workspaceError) throw workspaceError;

  // Get workspace members
  const { data: members, error: membersError } = await supabase
    .from('workspace_members')
    .select(`
      member_role,
      joined_at,
      user:users (id, username, email, first_name, last_name, user_role)
    `)
    .eq('workspace_id', workspaceId);

  if (membersError) throw membersError;

  // Get workspace settings
  const { data: settings, error: settingsError } = await supabase
    .from('workspace_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  return {
    workspace: {
      ...workspace,
    },
    members: members.map(m => ({
      ...m.user,
      member_role: m.member_role,
      joined_at: m.joined_at
    })),
    settings: settings || {}
  };
};

export const createWorkspace = async (name, userId) => {
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert([
      {
        name,
        created_by: userId,
        admin_id: userId,
        is_active: true
      }
    ])
    .select()
    .single();

  if (workspaceError) throw workspaceError;

  // Add creator as admin member
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert([
      {
        workspace_id: workspace.id,
        user_id: userId,
        member_role: 'admin'
      }
    ]);

  if (memberError) throw memberError;

  // Create default settings
  const { error: settingsError } = await supabase
    .from('workspace_settings')
    .insert([
      {
        workspace_id: workspace.id
      }
    ]);

  if (settingsError) throw settingsError;

  return workspace;
};



export const updateWorkspace = async (workspaceId, name, description, userId) => {
  // Check if user is admin of this workspace
  const { data: adminCheck, error: adminError } = await supabase
    .from('workspace_members')
    .select('member_role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('member_role', 'admin')
    .single();

  if (adminError || !adminCheck) {
    const err = new Error('Only workspace admins can update workspace');
    err.status = 403;
    throw err;
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .update({
      name,
      description,
      updated_at: new Date().toISOString()
    })
    .eq('id', workspaceId)
    .select()
    .single();

  if (workspaceError) throw workspaceError;

  return workspace;
};

export const removeMemberFromWorkspace = async (workspaceId, memberToRemoveId, userId) => {
  // Check if user is admin of this workspace
  const { data: adminCheck, error: adminError } = await supabase
    .from('workspace_members')
    .select('member_role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('member_role', 'admin')
    .single();

  if (adminError || !adminCheck) {
    const err = new Error('Only workspace admins can remove members');
    err.status = 403;
    throw err;
  }

  // Cannot remove yourself
  if (memberToRemoveId === userId) {
    const err = new Error('Cannot remove yourself from workspace');
    err.status = 400;
    throw err;
  }

  const { error: removeError } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', memberToRemoveId);

  if (removeError) throw removeError;
};


export const deleteWorkspace = async (workspaceId, userId) => {
  // Check if user is admin of this workspace
  const { data: adminCheck, error: adminError } = await supabase
    .from('workspace_members')
    .select('member_role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('member_role', 'admin')
    .single();

  if (adminError || !adminCheck) {
    const err = new Error('Only workspace admins can delete workspace');
    err.status = 403;
    throw err;
  }

  const { error: deleteError } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', workspaceId);

  if (deleteError) throw deleteError;
};
