import pool from '../config/database.js';
import Joi from 'joi';

// Validation schemas
const timeEntrySchema = Joi.object({
  taskId: Joi.string().uuid().required(),
  description: Joi.string().max(1000).optional(),
  startTime: Joi.date().required(),
  endTime: Joi.date().optional(),
  duration: Joi.number().integer().min(0).optional()
});

const startTimeSchema = Joi.object({
  taskId: Joi.string().uuid().required(),
  description: Joi.string().max(1000).optional()
});

const stopTimeSchema = Joi.object({
  timeEntryId: Joi.string().uuid().required(),
  endTime: Joi.date().optional()
});

/**
 * Get time entries for a specific task
 */
export const getTimeEntriesForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to the task
      const taskAccessResult = await client.query(
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

      if (taskAccessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have access to this task'
        });
      }

      // Get time entries for the task
      const result = await client.query(
        `SELECT 
          te.id,
          te.task_id,
          te.user_id,
          te.description,
          te.start_time,
          te.end_time,
          te.duration,
          te.created_at,
          te.updated_at,
          u.name as user_name,
          u.avatar as user_avatar
         FROM time_entries te
         JOIN users u ON te.user_id = u.id
         WHERE te.task_id = $1
         ORDER BY te.start_time DESC`,
        [taskId]
      );

      res.json({
        success: true,
        data: {
          timeEntries: result.rows
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error getting time entries:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching time entries'
    });
  }
};

/**
 * Get time entries for current user
 */
export const getMyTimeEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, taskId, projectId } = req.query;

    const client = await pool.connect();
    try {
      let query = `
        SELECT te.*, t.title as task_title, p.name as project_name,
               u.name as user_name, u.avatar as user_avatar
        FROM time_entries te
        JOIN tasks t ON te.task_id = t.id
        JOIN projects p ON t.project_id = p.id
        JOIN users u ON te.user_id = u.id
        WHERE te.user_id = $1
      `;

      const queryParams = [userId];
      let paramIndex = 2;

      if (startDate) {
        query += ` AND te.start_time >= $${paramIndex}`;
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND te.start_time <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }

      if (taskId) {
        query += ` AND te.task_id = $${paramIndex}`;
        queryParams.push(taskId);
        paramIndex++;
      }

      if (projectId) {
        query += ` AND t.project_id = $${paramIndex}`;
        queryParams.push(projectId);
        paramIndex++;
      }

      query += ` ORDER BY te.start_time DESC`;

      const result = await client.query(query, queryParams);

      res.json({
        success: true,
        data: {
          timeEntries: result.rows
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error getting my time entries:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching time entries'
    });
  }
};

/**
 * Start time tracking for a task
 */
export const startTimeTracking = async (req, res) => {
  try {
    const { error, value } = startTimeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { taskId, description } = value;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to the task
      const taskAccessResult = await client.query(
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

      if (taskAccessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have access to this task'
        });
      }

      // Check if user already has an active time entry
      const activeEntryResult = await client.query(
        `SELECT id FROM time_entries 
         WHERE user_id = $1 AND end_time IS NULL`,
        [userId]
      );

      if (activeEntryResult.rows.length > 0) {
        return res.status(400).json({
          error: 'ACTIVE_TIMER_EXISTS',
          message: 'You already have an active time entry. Please stop it first.'
        });
      }

      // Create new time entry
      const result = await client.query(
        `INSERT INTO time_entries (task_id, user_id, description, start_time)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, task_id, user_id, description, start_time, end_time, duration, created_at, updated_at`,
        [taskId, userId, description]
      );

      res.status(201).json({
        success: true,
        message: 'Time tracking started successfully',
        data: {
          id: result.rows[0].id,
          taskId: result.rows[0].task_id,
          userId: result.rows[0].user_id,
          description: result.rows[0].description,
          startTime: result.rows[0].start_time,
          endTime: result.rows[0].end_time,
          duration: result.rows[0].duration,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error starting time tracking:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error starting time tracking'
    });
  }
};

/**
 * Stop time tracking
 */
export const stopTimeTracking = async (req, res) => {
  try {
    const { error, value } = stopTimeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { timeEntryId, endTime } = value;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Get the time entry and check ownership
      const timeEntryResult = await client.query(
        `SELECT * FROM time_entries WHERE id = $1 AND user_id = $2`,
        [timeEntryId, userId]
      );

      if (timeEntryResult.rows.length === 0) {
        return res.status(404).json({
          error: 'NOT_FOUND',
          message: 'Time entry not found or you do not have permission to modify it'
        });
      }

      const timeEntry = timeEntryResult.rows[0];
      const stopTime = endTime || new Date();
      const duration = Math.floor((stopTime - new Date(timeEntry.start_time)) / 1000);

      // Update the time entry
      const result = await client.query(
        `UPDATE time_entries 
         SET end_time = $1, duration = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [stopTime, Math.floor(duration / 60), timeEntryId]
      );

      res.json({
        success: true,
        message: 'Time tracking stopped successfully',
        data: {
          timeEntry: result.rows[0]
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error stopping time tracking:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error stopping time tracking'
    });
  }
};

/**
 * Add manual time entry
 */
export const addTimeEntry = async (req, res) => {
  try {
    const { error, value } = timeEntrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { taskId, description, startTime, endTime, duration } = value;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to the task
      const taskAccessResult = await client.query(
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

      if (taskAccessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have access to this task'
        });
      }

      // Calculate duration if not provided
      let calculatedDuration = duration;
      if (!calculatedDuration && endTime) {
        calculatedDuration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);
      }

      // Create time entry
      const result = await client.query(
        `INSERT INTO time_entries (task_id, user_id, description, start_time, end_time, duration_minutes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [taskId, userId, description, startTime, endTime, calculatedDuration ? Math.floor(calculatedDuration / 60) : null]
      );

      res.status(201).json({
        success: true,
        message: 'Time entry added successfully',
        data: {
          timeEntry: result.rows[0]
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error adding time entry:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error adding time entry'
    });
  }
};

/**
 * Update time entry
 */
export const updateTimeEntry = async (req, res) => {
  try {
    const { timeEntryId } = req.params;
    const { error, value } = timeEntrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { taskId, description, startTime, endTime, duration } = value;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user owns the time entry
      const ownershipResult = await client.query(
        `SELECT id FROM time_entries WHERE id = $1 AND user_id = $2`,
        [timeEntryId, userId]
      );

      if (ownershipResult.rows.length === 0) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have permission to modify this time entry'
        });
      }

      // Calculate duration if not provided
      let calculatedDuration = duration;
      if (!calculatedDuration && endTime) {
        calculatedDuration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);
      }

      // Update time entry
      const result = await client.query(
        `UPDATE time_entries 
         SET task_id = $1, description = $2, start_time = $3, end_time = $4, duration_minutes = $5, updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [taskId, description, startTime, endTime, calculatedDuration ? Math.floor(calculatedDuration / 60) : null, timeEntryId]
      );

      res.json({
        success: true,
        message: 'Time entry updated successfully',
        data: {
          timeEntry: result.rows[0]
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating time entry'
    });
  }
};

/**
 * Delete time entry
 */
export const deleteTimeEntry = async (req, res) => {
  try {
    const { timeEntryId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user owns the time entry
      const ownershipResult = await client.query(
        `SELECT id FROM time_entries WHERE id = $1 AND user_id = $2`,
        [timeEntryId, userId]
      );

      if (ownershipResult.rows.length === 0) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have permission to delete this time entry'
        });
      }

      // Delete time entry
      await client.query(
        `DELETE FROM time_entries WHERE id = $1`,
        [timeEntryId]
      );

      res.json({
        success: true,
        message: 'Time entry deleted successfully'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error deleting time entry:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error deleting time entry'
    });
  }
};

/**
 * Get time tracking analytics
 */
export const getTimeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, projectId } = req.query;

    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          p.id as project_id,
          p.name as project_name,
          t.id as task_id,
          t.title as task_title,
          COUNT(te.id) as entry_count,
          SUM(COALESCE(te.duration_minutes, 0)) as total_duration,
          AVG(COALESCE(te.duration_minutes, 0)) as avg_duration
        FROM projects p
        JOIN tasks t ON p.id = t.project_id
        LEFT JOIN time_entries te ON t.id = te.task_id AND te.user_id = $1
        WHERE 1=1
      `;

      const queryParams = [userId];
      let paramIndex = 2;

      if (startDate) {
        query += ` AND (te.start_time >= $${paramIndex} OR te.start_time IS NULL)`;
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND (te.start_time <= $${paramIndex} OR te.start_time IS NULL)`;
        queryParams.push(endDate);
        paramIndex++;
      }

      if (projectId) {
        query += ` AND p.id = $${paramIndex}`;
        queryParams.push(projectId);
        paramIndex++;
      }

      query += `
        GROUP BY p.id, p.name, t.id, t.title
        ORDER BY total_duration DESC
      `;

      const result = await client.query(query, queryParams);

      // Calculate summary statistics
      const summary = {
        totalEntries: 0,
        totalDuration: 0,
        totalTasks: 0,
        totalProjects: 0
      };

      const projectStats = {};
      const taskStats = {};

      result.rows.forEach(row => {
        summary.totalEntries += parseInt(row.entry_count);
        summary.totalDuration += parseInt(row.total_duration || 0);
        
        if (!projectStats[row.project_id]) {
          projectStats[row.project_id] = {
            projectId: row.project_id,
            projectName: row.project_name,
            totalDuration: 0,
            taskCount: 0
          };
          summary.totalProjects++;
        }
        
        projectStats[row.project_id].totalDuration += parseInt(row.total_duration || 0);
        projectStats[row.project_id].taskCount++;

        if (parseInt(row.total_duration || 0) > 0) {
          taskStats[row.task_id] = {
            taskId: row.task_id,
            taskTitle: row.task_title,
            projectName: row.project_name,
            totalDuration: parseInt(row.total_duration || 0),
            entryCount: parseInt(row.entry_count),
            avgDuration: parseFloat(row.avg_duration || 0)
          };
          summary.totalTasks++;
        }
      });

      res.json({
        success: true,
        data: {
          summary,
          projectStats: Object.values(projectStats),
          taskStats: Object.values(taskStats),
          detailedEntries: result.rows
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error getting time analytics:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching time analytics'
    });
  }
};

/**
 * Get active time entry for current user
 */
export const getActiveTimeEntry = async (req, res) => {
  try {
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT te.*, t.title as task_title, p.name as project_name
         FROM time_entries te
         JOIN tasks t ON te.task_id = t.id
         JOIN projects p ON t.project_id = p.id
         WHERE te.user_id = $1 AND te.end_time IS NULL
         ORDER BY te.start_time DESC
         LIMIT 1`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          activeEntry: result.rows[0] || null
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error getting active time entry:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching active time entry'
    });
  }
}; 