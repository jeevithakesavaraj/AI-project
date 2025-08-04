import pool from '../config/database.js';
import Joi from 'joi';

// Validation schemas
const createNotificationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  type: Joi.string().valid('COMMENT', 'TASK_ASSIGNED', 'TASK_UPDATED', 'PROJECT_INVITE', 'MENTION').required(),
  title: Joi.string().max(255).required(),
  message: Joi.string().required(),
  data: Joi.object().optional()
});

/**
 * Get notifications for current user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false, limit = 50 } = req.query;

    const client = await pool.connect();
    try {
      let query = `
        SELECT id, type, title, message, data, read_at, created_at
        FROM notifications 
        WHERE user_id = $1
      `;

      const queryParams = [userId];

      if (unreadOnly === 'true') {
        query += ' AND read_at IS NULL';
      }

      query += ' ORDER BY created_at DESC';

      if (limit) {
        query += ` LIMIT $${queryParams.length + 1}`;
        queryParams.push(parseInt(limit));
      }

      const result = await client.query(query, queryParams);

      res.json({
        success: true,
        data: {
          notifications: result.rows.map(row => ({
            id: row.id,
            type: row.type,
            title: row.title,
            message: row.message,
            data: row.data,
            readAt: row.read_at,
            createdAt: row.created_at
          }))
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching notifications'
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if notification exists and belongs to user
      const notificationResult = await client.query(
        'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );

      if (notificationResult.rows.length === 0) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Notification not found'
        });
      }

      // Mark as read
      await client.query(
        'UPDATE notifications SET read_at = NOW() WHERE id = $1',
        [notificationId]
      );

      res.json({
        success: true,
        message: 'Notification marked as read'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error marking notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL',
        [userId]
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error marking notifications as read'
    });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if notification exists and belongs to user
      const notificationResult = await client.query(
        'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );

      if (notificationResult.rows.length === 0) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Notification not found'
        });
      }

      // Delete the notification
      await client.query(
        'DELETE FROM notifications WHERE id = $1',
        [notificationId]
      );

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error deleting notification'
    });
  }
};

/**
 * Get notification count (unread)
 */
export const getNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read_at IS NULL',
        [userId]
      );

      res.json({
        success: true,
        data: {
          count: parseInt(result.rows[0].count)
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error getting notification count'
    });
  }
};

/**
 * Create a notification (internal use)
 */
export const createNotification = async (userId, type, title, message, data = null) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );

    return result.rows[0].id;
  } finally {
    client.release();
  }
};

/**
 * Create notification for task assignment
 */
export const createTaskAssignmentNotification = async (taskId, assigneeId, taskTitle, assignedBy) => {
  try {
    const client = await pool.connect();
    try {
      // Get assignee name
      const assigneeResult = await client.query(
        'SELECT name FROM users WHERE id = $1',
        [assigneeId]
      );

      const assigneeName = assigneeResult.rows[0]?.name || 'Unknown User';

      await createNotification(
        assigneeId,
        'TASK_ASSIGNED',
        'New Task Assignment',
        `You have been assigned to task: "${taskTitle}"`,
        {
          taskId,
          taskTitle,
          assignedBy: assignedBy.name,
          assignedById: assignedBy.id
        }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating task assignment notification:', error);
  }
};

/**
 * Create notification for comment mentions
 */
export const createCommentMentionNotification = async (commentId, mentionedUserIds, commentContent, commenter) => {
  try {
    const client = await pool.connect();
    try {
      for (const userId of mentionedUserIds) {
        await createNotification(
          userId,
          'MENTION',
          'You were mentioned in a comment',
          `${commenter.name} mentioned you in a comment: "${commentContent.substring(0, 100)}${commentContent.length > 100 ? '...' : ''}"`,
          {
            commentId,
            commentContent,
            commenter: {
              id: commenter.id,
              name: commenter.name
            }
          }
        );
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating mention notification:', error);
  }
}; 