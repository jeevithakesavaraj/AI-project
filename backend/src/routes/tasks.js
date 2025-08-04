import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  requireTaskCreation, 
  requireProjectAccess 
} from '../middleware/roleAuth.js';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all tasks (with filtering and sorting) - filtered by role
router.get('/', getAllTasks);

// Get task statistics - filtered by role
router.get('/stats', getTaskStats);

// Get task by ID - filtered by role
router.get('/:taskId', getTaskById);

// Create new task (requires project access and task creation permission)
router.post('/projects/:projectId', requireTaskCreation(), createTask);

// Update task - filtered by role
router.put('/:taskId', updateTask);

// Delete task (requires project ADMIN or OWNER access)
router.delete('/:taskId', deleteTask);

export default router; 