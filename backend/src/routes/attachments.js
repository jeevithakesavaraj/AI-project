import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get attachments for task
router.get('/task/:taskId', (req, res) => {
  res.json({
    success: true,
    message: 'Get attachments endpoint - to be implemented',
    data: []
  });
});

// Upload attachment
router.post('/upload', (req, res) => {
  res.json({
    success: true,
    message: 'Upload attachment endpoint - to be implemented',
    data: {}
  });
});

// Delete attachment
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Delete attachment endpoint - to be implemented'
  });
});

export default router; 