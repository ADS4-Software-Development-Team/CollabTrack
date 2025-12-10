import { supabase } from '../config/database.js';

class Comment {
  // Create a new comment
  static async create(commentData) {
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select();
    if (error) throw new Error(error.message);
    return data[0];
  }

  // Get all comments for a task
  static async findByTaskId(taskId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  // Get all comments for a project
  static async findByProjectId(projectId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  // Get comment by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Update comment
  static async update(id, commentData) {
    const { data, error } = await supabase
      .from('comments')
      .update(commentData)
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    return data[0];
  }

  // Delete comment
  static async delete(id) {
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw new Error(error.message);
    return data[0];
  }

  // Check if user owns the comment
  static async isOwner(commentId, userId) {
    const { data, error } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();
    if (error) return false;
    return data.user_id === userId;
  }



  // Get comment count for a task
  static async countByTaskId(taskId) {
    const { count, error } = await supabase
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('task_id', taskId);
    if (error) throw new Error(error.message);
    return count;
  }
}

export default Comment;