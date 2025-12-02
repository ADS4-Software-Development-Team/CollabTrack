import express from 'express';
import { taskController } from '../controllers/taskController.js';
import { commentController } from '../controllers/commentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Task routes
router.get('/my-tasks', taskController.getMyTasks);
router.patch('/:id/status', taskController.updateStatus);

// Comment routes
router.post('/:id/comments',authorize("Manager", "Member"), commentController.addComment);
router.get('/:id/comments', commentController.getComments);

export default router;