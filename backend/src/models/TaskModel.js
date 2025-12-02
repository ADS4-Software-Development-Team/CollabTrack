import { supabase } from '../config/database.js';

export const TaskModel = {
    // Get user's tasks
    getUserTasks: async (userId) => {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                projects:project_id (title, description),
                task_statuses:status_id (name, color),
                task_priorities:priority_id (name, color),
                assigned_user:assigned_to (first_name, last_name, username)
            `)
            .eq('assigned_to', userId)
            .order('due_date', { ascending: true, nullsFirst: true });
        return { data, error };
    },

    // Update task status
    updateStatus: async (taskId, statusId) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({ 
                status_id: statusId,
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)
            .select(`
                *,
                task_statuses:status_id (name, color)
            `);
        return { data, error };
    },

    // Find task by ID
    findById: async (taskId) => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single();
        return { data, error };
    },

    // Check task access
     canAccess: async (taskId, userId) => {
        try {
            console.log(`[DEBUG] Checking access for task ${taskId}, user ${userId}`);
            
            // OPTION 1: Simple direct query (recommended)
            // First check if user is assigned to the task
            const { data: assignedTask, error: assignedError } = await supabase
                .from('tasks')
                .select('id')
                .eq('id', taskId)
                .eq('assigned_to', userId)
                .single();
            
            if (assignedTask && !assignedError) {
                console.log(`[DEBUG] User ${userId} is assigned to task ${taskId}`);
                return { data: { hasAccess: true, reason: 'assigned' }, error: null };
            }
            
            // OPTION 2: Check if user is a project member
            // Get the task's project_id first
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select('project_id')
                .eq('id', taskId)
                .single();
            
            if (taskError || !task) {
                console.log(`[DEBUG] Task ${taskId} not found`);
                return { data: null, error: new Error('Task not found') };
            }
            
            // Check project membership
            const { data: membership, error: memberError } = await supabase
                .from('project_members')
                .select('user_id')
                .eq('project_id', task.project_id)
                .eq('user_id', userId)
                .single();
            
            console.log(`[DEBUG] Project membership check:`, { membership, memberError });
            
            if (membership && !memberError) {
                console.log(`[DEBUG] User ${userId} is project member for project ${task.project_id}`);
                return { data: { hasAccess: true, reason: 'project_member' }, error: null };
            }
            
            console.log(`[DEBUG] User ${userId} has NO access to task ${taskId}`);
            return { data: null, error: new Error('No access') };
            
        } catch (error) {
            console.error('[DEBUG] canAccess error:', error);
            return { data: null, error };
        }
    }
};