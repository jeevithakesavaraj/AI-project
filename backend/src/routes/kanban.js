import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { requireProjectAccess } from '../middleware/roleAuth.js';
import {
  getKanbanBoard,
  updateTaskStatus,
  updateTaskPosition,
  getProjectProgress,
  getTaskProgress
} from '../controllers/kanbanController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get Kanban board for a project
router.get('/projects/:projectId/kanban', requireProjectAccess, getKanbanBoard);

// Update task status (move between columns)
router.put('/tasks/:taskId/status', updateTaskStatus);

// Update task position within a column
router.put('/tasks/:taskId/position', updateTaskPosition);

// Get project progress statistics
router.get('/projects/:projectId/progress', requireProjectAccess, getProjectProgress);

// Get task progress details
router.get('/tasks/:taskId/progress', getTaskProgress);

export default router; 