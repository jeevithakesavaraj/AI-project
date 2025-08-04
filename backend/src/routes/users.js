import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (with pagination and filtering)
router.get('/', getAllUsers);

// Get user statistics (Admin only)
router.get('/stats', requireRole(['ADMIN']), getUserStats);

// Get user by ID
router.get('/:id', getUserById);

// Create new user (Admin only)
router.post('/', requireRole(['ADMIN']), createUser);

// Update user
router.put('/:id', updateUser);

// Change user password (Admin only)
router.patch('/:id/password', requireRole(['ADMIN']), changeUserPassword);

// Delete user (Admin only)
router.delete('/:id', requireRole(['ADMIN']), deleteUser);

export default router; 