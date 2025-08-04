import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  updateUserRole,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember
} from '../controllers/roleController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User role management (Admin only)
router.put('/users/:userId', requireRole(['ADMIN']), updateUserRole);

// Project member management
router.get('/projects/:projectId/members', getProjectMembers);
router.post('/projects/:projectId/members', addProjectMember);
router.put('/projects/:projectId/members/:memberId', updateProjectMemberRole);
router.delete('/projects/:projectId/members/:memberId', removeProjectMember);

export default router; 