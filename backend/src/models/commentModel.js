import { supabase } from '../config/database.js';

export const CommentModel = {
    // Create comment
    create: async (commentData) => {
        const { data, error } = await supabase
            .from('task_comments')
            .insert(commentData)
            .select(`
                *,
                user:user_id (first_name, last_name, username)
            `)
            .single();
        return { data, error };
    },

    // Get task comments
    getByTaskId: async (taskId) => {
        const { data, error } = await supabase
            .from('task_comments')
            .select(`
                *,
                user:user_id (first_name, last_name, username)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });
        return { data, error };
    }
};