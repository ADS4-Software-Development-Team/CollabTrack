import Comment from '../models/commentModel.js';

const commentController = {
  // Get all comments for a project - FIXED NAME
  getProjectComments: async (req, res) => {
    try {
      const { projectId } = req.params; // Changed from taskId
      
      // Make sure your Comment model has findByProjectId method
      const comments = await Comment.findByProjectId(projectId);
      
      res.json({
        success: true,
        data: comments,
        message: 'Comments retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting project comments:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving comments',
        error: error.message
      });
    }
  },

  // Create a new comment
  createComment: async (req, res) => {
    try {
      const { content, project_id, user_name, user_role } = req.body;
      const user_id = req.user.id;
      
      // Validate input
      if (!content || !project_id) {
        return res.status(400).json({
          success: false,
          message: 'Content and project ID are required'
        });
      }
      
      const commentData = {
        content,
        project_id,
        user_id,
        user_name: user_name || `${req.user.first_name} ${req.user.last_name}`,
        user_role: user_role || req.user.role
      };
      
      const comment = await Comment.create(commentData);
      
      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment created successfully'
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating comment',
        error: error.message
      });
    }
  },

  // Update a comment
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      
      // Check if comment exists
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      // Check if user owns the comment or is admin
      const isOwner = await Comment.isOwner(commentId, req.user.id);
      const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this comment'
        });
      }
      
      // Validate input
      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }
      
      const updatedComment = await Comment.update(commentId, { content });
      
      res.json({
        success: true,
        data: updatedComment,
        message: 'Comment updated successfully'
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating comment',
        error: error.message
      });
    }
  },

  // Delete a comment
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      
      // Check if comment exists
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      // Check if user owns the comment or is admin/manager
      const isOwner = await Comment.isOwner(commentId, req.user.id);
      const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this comment'
        });
      }
      
      await Comment.delete(commentId);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting comment',
        error: error.message
      });
    }
  },

  // Get single comment (optional)
  getCommentById: async (req, res) => {
    try {
      const { commentId } = req.params;
      
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      res.json({
        success: true,
        data: comment,
        message: 'Comment retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting comment:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving comment',
        error: error.message
      });
    }
  }
};

export default commentController;