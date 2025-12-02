import { TaskModel } from '../models/TaskModel.js';

export const taskController = {
    // Get user's tasks
    getMyTasks: async (req, res) => {
        try {
            const userId = req.user.userId;

            const { data: tasks, error } = await TaskModel.getUserTasks(userId);
            if (error) throw error;

            res.json({
                status: 'success',
                message: 'Tasks retrieved successfully',
                data: { tasks: tasks || [] }
            });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch tasks: ' + error.message
            });
        }
    },

    // Update task status
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status_id } = req.body;
            const userId = req.user.userId;

            // Verify task access
            const { data: taskAccess, error: accessError } = await TaskModel.canAccess(id, userId);
            if (accessError || !taskAccess) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to update this task'
                });
            }

            // Update status
            const { data: task, error } = await TaskModel.updateStatus(id, status_id);
            if (error) throw error;

            res.json({
                status: 'success',
                message: 'Task status updated successfully',
                data: { task: task[0] }
            });

        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to update task: ' + error.message
            });
        }
    }
};