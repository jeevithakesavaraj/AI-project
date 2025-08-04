import pool from '../config/database.js';
import Joi from 'joi';

// Validation schemas
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  taskId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().optional(),
  parentId: Joi.string().uuid().optional()
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required()
});

/**
 * Get comments for a task or project
 */
export const getComments = async (req, res) => {
  try {
    const { taskId, projectId } = req.query;
    const userId = req.user.id;

    if (!taskId && !projectId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Either taskId or projectId is required'
      });
    }

    const client = await pool.connect();
    try {
      // Check if user has access to the task/project
      let accessCheck;
      if (taskId) {
        accessCheck = await client.query(
          `SELECT t.id FROM tasks t
           JOIN projects p ON t.project_id = p.id
           LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
           WHERE t.id = $2 AND (
             pm.user_id = $1 OR 
             p.owner_id = $1 OR 
             p.creator_id = $1 OR
             $3 = 'ADMIN'
           )`,
          [userId, taskId, req.user.role]
        );
      } else {
        accessCheck = await client.query(
          `SELECT p.id FROM projects p
           LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
           WHERE p.id = $2 AND (
             pm.user_id = $1 OR 
             p.owner_id = $1 OR 
             p.creator_id = $1 OR
             $3 = 'ADMIN'
           )`,
          [userId, projectId, req.user.role]
        );
      }

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have access to this resource'
        });
      }

      // Get comments with user info and replies
      const result = await client.query(
        `SELECT 
          c.id,
          c.content,
          c.created_at,
          c.updated_at,
          c.parent_id,
          c.task_id,
          c.project_id,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email,
          u.avatar as user_avatar
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE ${taskId ? 'c.task_id = $1' : 'c.project_id = $1'}
         ORDER BY c.created_at ASC`,
        [taskId || projectId]
      );

      // Organize comments into threaded structure
      const commentsMap = new Map();
      const rootComments = [];

      result.rows.forEach(comment => {
        const commentData = {
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          parentId: comment.parent_id,
          taskId: comment.task_id,
          projectId: comment.project_id,
          user: {
            id: comment.user_id,
            name: comment.user_name,
            email: comment.user_email,
            avatar: comment.user_avatar
          },
          replies: []
        };

        commentsMap.set(comment.id, commentData);

        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies.push(commentData);
          }
        } else {
          rootComments.push(commentData);
        }
      });

      res.json({
        success: true,
        data: {
          comments: rootComments
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching comments'
    });
  }
};

/**
 * Create a new comment
 */
export const createComment = async (req, res) => {
  try {
    const { error, value } = createCommentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { content, taskId, projectId, parentId } = value;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to the task/project
      let accessCheck;
      if (taskId) {
        accessCheck = await client.query(
          `SELECT t.id FROM tasks t
           JOIN projects p ON t.project_id = p.id
           LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
           WHERE t.id = $2 AND (
             pm.user_id = $1 OR 
             p.owner_id = $1 OR 
             p.creator_id = $1 OR
             $3 = 'ADMIN'
           )`,
          [userId, taskId, req.user.role]
        );
      } else {
        accessCheck = await client.query(
          `SELECT p.id FROM projects p
           LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
           WHERE p.id = $2 AND (
             pm.user_id = $1 OR 
             p.owner_id = $1 OR 
             p.creator_id = $1 OR
             $3 = 'ADMIN'
           )`,
          [userId, projectId, req.user.role]
        );
      }

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have access to this resource'
        });
      }

      // If this is a reply, check if parent comment exists
      if (parentId) {
        const parentCheck = await client.query(
          'SELECT id FROM comments WHERE id = $1',
          [parentId]
        );

        if (parentCheck.rows.length === 0) {
          return res.status(404).json({
            error: 'NOT_FOUND',
            message: 'Parent comment not found'
          });
        }
      }

      // Create the comment
      const result = await client.query(
        `INSERT INTO comments (content, user_id, task_id, project_id, parent_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, content, created_at, updated_at, parent_id, task_id, project_id`,
        [content, userId, taskId, projectId, parentId]
      );

      const newComment = result.rows[0];

      // Get user info for the response
      const userResult = await client.query(
        'SELECT id, name, email, avatar FROM users WHERE id = $1',
        [userId]
      );

      const commentData = {
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.created_at,
        updatedAt: newComment.updated_at,
        parentId: newComment.parent_id,
        taskId: newComment.task_id,
        projectId: newComment.project_id,
        user: {
          id: userResult.rows[0].id,
          name: userResult.rows[0].name,
          email: userResult.rows[0].email,
          avatar: userResult.rows[0].avatar
        },
        replies: []
      };

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: {
          comment: commentData
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error creating comment'
    });
  }
};

/**
 * Update a comment
 */
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { error, value } = updateCommentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { content } = value;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if comment exists and user owns it
      const commentResult = await client.query(
        'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
        [commentId, userId]
      );

      if (commentResult.rows.length === 0) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Comment not found or you do not have permission to edit it'
        });
      }

      // Update the comment
      const result = await client.query(
        `UPDATE comments 
         SET content = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, content, created_at, updated_at, parent_id, task_id, project_id`,
        [content, commentId]
      );

      const updatedComment = result.rows[0];

      // Get user info for the response
      const userResult = await client.query(
        'SELECT id, name, email, avatar FROM users WHERE id = $1',
        [userId]
      );

      const commentData = {
        id: updatedComment.id,
        content: updatedComment.content,
        createdAt: updatedComment.created_at,
        updatedAt: updatedComment.updated_at,
        parentId: updatedComment.parent_id,
        taskId: updatedComment.task_id,
        projectId: updatedComment.project_id,
        user: {
          id: userResult.rows[0].id,
          name: userResult.rows[0].name,
          email: userResult.rows[0].email,
          avatar: userResult.rows[0].avatar
        }
      };

      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: {
          comment: commentData
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating comment'
    });
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if comment exists and user owns it
      const commentResult = await client.query(
        'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
        [commentId, userId]
      );

      if (commentResult.rows.length === 0) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Comment not found or you do not have permission to delete it'
        });
      }

      // Delete the comment (cascading will handle replies)
      await client.query(
        'DELETE FROM comments WHERE id = $1',
        [commentId]
      );

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error deleting comment'
    });
  }
}; 