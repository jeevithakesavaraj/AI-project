import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  requireProjectCreation, 
  requireProjectAccess, 
  requireMemberManagement 
} from '../middleware/roleAuth.js';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all projects (with pagination and filtering) - filtered by role
router.get('/', getAllProjects);

// Get project statistics - filtered by role
router.get('/stats', getProjectStats);

// Get project by ID (requires project access)
router.get('/:projectId', requireProjectAccess('MEMBER'), getProjectById);

// Create new project (only ADMIN can create)
router.post('/', requireProjectCreation(), createProject);

// Update project (requires project ADMIN or OWNER access)
router.put('/:projectId', requireProjectAccess('ADMIN'), updateProject);

// Delete project (requires project OWNER access)
router.delete('/:projectId', requireProjectAccess('OWNER'), deleteProject);

export default router; 