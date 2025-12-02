import { CommentModel } from '../models/commentModel.js';
import { TaskModel } from '../models/TaskModel.js';

export const commentController = {
    // Add comment to task
    addComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.userId;

            if (!content || content.trim().length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Comment content is required'
                });
            }

            // Verify task access
            const { data: taskAccess, error: accessError } = await TaskModel.canAccess(id, userId);
            if (accessError || !taskAccess) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to comment on this task'
                });
            }

            // Create comment
            const { data: comment, error } = await CommentModel.create({
                content: content.trim(),
                task_id: id,
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (error) throw error;

            res.json({
                status: 'success',
                message: 'Comment added successfully',
                data: { comment }
            });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to add comment: ' + error.message
            });
        }
    },

    // Get task comments
    getComments: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Verify task access
            const { data: taskAccess, error: accessError } = await TaskModel.canAccess(id, userId);
            if (accessError || !taskAccess) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to view this task'
                });
            }

            // Get comments
            const { data: comments, error } = await CommentModel.getByTaskId(id);
            if (error) throw error;

            res.json({
                status: 'success',
                data: { comments: comments || [] }
            });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch comments: ' + error.message
            });
        }
    }
};
