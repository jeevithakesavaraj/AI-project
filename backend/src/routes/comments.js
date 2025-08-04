import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get comments for a task or project
router.get('/', getComments);

// Create a new comment
router.post('/', createComment);

// Update a comment
router.put('/:commentId', updateComment);

// Delete a comment
router.delete('/:commentId', deleteComment);

export default router; 