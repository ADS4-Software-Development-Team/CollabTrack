import express from 'express';
import commentController from '../controllers/commentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All comment routes require authentication
router.use(authMiddleware);

// Update a comment
router.put('/:commentId', commentController.updateComment);

// Delete a comment
router.delete('/:commentId', commentController.deleteComment);

// Get single comment (optional)
router.get('/:commentId', commentController.getCommentById);

export default router;