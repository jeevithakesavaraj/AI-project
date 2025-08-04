import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCount
} from '../controllers/notificationsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get notifications for current user
router.get('/', getNotifications);

// Get notification count (unread)
router.get('/count', getNotificationCount);

// Mark notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

export default router; 