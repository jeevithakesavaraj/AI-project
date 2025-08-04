import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getTimeEntriesForTask,
  getMyTimeEntries,
  startTimeTracking,
  stopTimeTracking,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeAnalytics,
  getActiveTimeEntry
} from '../controllers/timeTrackingController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get time entries for a specific task
router.get('/task/:taskId', getTimeEntriesForTask);

// Get current user's time entries
router.get('/my-entries', getMyTimeEntries);

// Get active time entry for current user
router.get('/active', getActiveTimeEntry);

// Get time tracking analytics
router.get('/analytics', getTimeAnalytics);

// Start time tracking
router.post('/start', startTimeTracking);

// Stop time tracking
router.post('/stop', stopTimeTracking);

// Add manual time entry
router.post('/', addTimeEntry);

// Update time entry
router.put('/:timeEntryId', updateTimeEntry);

// Delete time entry
router.delete('/:timeEntryId', deleteTimeEntry);

export default router; 