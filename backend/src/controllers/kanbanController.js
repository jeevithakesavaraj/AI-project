import pool from '../config/database.js';
import Joi from 'joi';

// Validation schemas
const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE').required(),
  position: Joi.number().integer().min(0).optional()
});

const updateTaskPositionSchema = Joi.object({
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE').required(),
  position: Joi.number().integer().min(0).required(),
  targetPosition: Joi.number().integer().min(0).optional()
});

// Get Kanban board for a project
export const getKanbanBoard = async (req, res) => {
  try {
    const { projectId } = req.params;

    const client = await pool.connect();
    try {
      // Get all tasks for the project with assignee and creator info
      const result = await client.query(
        `SELECT 
          t.id,
          t.title,
          t.description,
          t.status,
          t.priority,
          t.type,
          t.due_date,
          t.created_at,
          t.updated_at,
          t.position,
          t.project_id,
          t.assignee_id,
          t.creator_id,
          assignee.name as assignee_name,
          assignee.email as assignee_email,
          creator.name as creator_name,
          creator.email as creator_email
         FROM tasks t
         LEFT JOIN users assignee ON t.assignee_id = assignee.id
         LEFT JOIN users creator ON t.creator_id = creator.id
         WHERE t.project_id = $1
         ORDER BY t.status, t.position, t.created_at`,
        [projectId]
      );

      // Organize tasks by status
      const kanbanData = {
        TODO: [],
        IN_PROGRESS: [],
        IN_REVIEW: [],
        DONE: []
      };

      result.rows.forEach(task => {
        const taskData = {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          type: task.type,
          dueDate: task.due_date,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          position: task.position,
          projectId: task.project_id,
          assignee: task.assignee_id ? {
            id: task.assignee_id,
            name: task.assignee_name,
            email: task.assignee_email
          } : null,
          creator: {
            id: task.creator_id,
            name: task.creator_name,
            email: task.creator_email
          }
        };

        kanbanData[task.status].push(taskData);
      });

      res.json({
        success: true,
        data: {
          projectId,
          columns: kanbanData
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get Kanban board error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching Kanban board'
    });
  }
};

// Update task status (move between columns)
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { error, value } = updateTaskStatusSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await pool.connect();
    try {
      // Check if task exists and user has access
      const taskResult = await client.query(
        `SELECT t.*, pm.role as user_role 
         FROM tasks t
         LEFT JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = $1
         WHERE t.id = $2`,
        [req.user.id, taskId]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Task not found'
        });
      }

      const task = taskResult.rows[0];
      
      // Check if user has permission to update this task
      if (req.user.role === 'ADMIN' || 
          task.assignee_id === req.user.id || 
          task.creator_id === req.user.id || 
          ['OWNER', 'ADMIN'].includes(task.user_role)) {
        // User has permission
      } else {
        return res.status(403).json({
          error: 'PERMISSION_DENIED',
          message: 'You do not have permission to update this task'
        });
      }

      // Get the highest position in the target status
      const maxPositionResult = await client.query(
        'SELECT COALESCE(MAX(position), -1) as max_position FROM tasks WHERE project_id = $1 AND status = $2',
        [task.project_id, value.status]
      );
      
      const newPosition = maxPositionResult.rows[0].max_position + 1;

      // Update task status and position
      await client.query(
        'UPDATE tasks SET status = $1, position = $2, updated_at = NOW() WHERE id = $3',
        [value.status, newPosition, taskId]
      );

      res.json({
        success: true,
        message: 'Task status updated successfully',
        data: {
          taskId,
          status: value.status,
          position: newPosition
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating task status'
    });
  }
};

// Update task position within a column
export const updateTaskPosition = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { error, value } = updateTaskPositionSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await pool.connect();
    try {
      // Check if task exists and user has access
      const taskResult = await client.query(
        `SELECT t.*, pm.role as user_role 
         FROM tasks t
         LEFT JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = $1
         WHERE t.id = $2`,
        [req.user.id, taskId]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Task not found'
        });
      }

      const task = taskResult.rows[0];
      
      // Check if user has permission to update this task
      if (req.user.role === 'ADMIN' || 
          task.assignee_id === req.user.id || 
          task.creator_id === req.user.id || 
          ['OWNER', 'ADMIN'].includes(task.user_role)) {
        // User has permission
      } else {
        return res.status(403).json({
          error: 'PERMISSION_DENIED',
          message: 'You do not have permission to update this task'
        });
      }

      // Update task position
      await client.query(
        'UPDATE tasks SET position = $1, updated_at = NOW() WHERE id = $2',
        [value.position, taskId]
      );

      res.json({
        success: true,
        message: 'Task position updated successfully',
        data: {
          taskId,
          position: value.position
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update task position error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating task position'
    });
  }
};

// Get project progress statistics
export const getProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.params;

    const client = await pool.connect();
    try {
      // Get task counts by status
      const taskCountsResult = await client.query(
        `SELECT 
          status,
          COUNT(*) as count
         FROM tasks 
         WHERE project_id = $1 
         GROUP BY status`,
        [projectId]
      );

      // Get total tasks
      const totalTasksResult = await client.query(
        'SELECT COUNT(*) as total FROM tasks WHERE project_id = $1',
        [projectId]
      );

      const totalTasks = parseInt(totalTasksResult.rows[0].total);
      const taskCounts = {};
      let completedTasks = 0;

      taskCountsResult.rows.forEach(row => {
        taskCounts[row.status] = parseInt(row.count);
        if (row.status === 'DONE') {
          completedTasks = parseInt(row.count);
        }
      });

      // Calculate progress percentage
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Get recent activity (last 10 task updates)
      const recentActivityResult = await client.query(
        `SELECT 
          t.title,
          t.status,
          t.updated_at,
          u.name as updated_by
         FROM tasks t
         LEFT JOIN users u ON t.assignee_id = u.id
         WHERE t.project_id = $1
         ORDER BY t.updated_at DESC
         LIMIT 10`,
        [projectId]
      );

      res.json({
        success: true,
        data: {
          projectId,
          totalTasks,
          completedTasks,
          progressPercentage,
          taskCounts,
          recentActivity: recentActivityResult.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get project progress error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching project progress'
    });
  }
};

// Get task progress details
export const getTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;

    const client = await pool.connect();
    try {
      // Get task details with time tracking
      const taskResult = await client.query(
        `SELECT 
          t.*,
          u.name as assignee_name,
          u.email as assignee_email
         FROM tasks t
         LEFT JOIN users u ON t.assignee_id = u.id
         WHERE t.id = $1`,
        [taskId]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Task not found'
        });
      }

      const task = taskResult.rows[0];

      // Get time entries for this task
      const timeEntriesResult = await client.query(
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
          u.name as user_name
         FROM time_entries te
         LEFT JOIN users u ON te.user_id = u.id
         WHERE te.task_id = $1
         ORDER BY te.start_time DESC`,
        [taskId]
      );

      // Calculate total time spent
      const totalTimeSpent = timeEntriesResult.rows.reduce((total, entry) => {
        if (entry.end_time) {
          const duration = new Date(entry.end_time) - new Date(entry.start_time);
          return total + duration;
        }
        return total;
      }, 0);

      // Convert to hours
      const totalHours = Math.round((totalTimeSpent / (1000 * 60 * 60)) * 100) / 100;

      res.json({
        success: true,
        data: {
          task: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date,
            assignee: task.assignee_id ? {
              id: task.assignee_id,
              name: task.assignee_name,
              email: task.assignee_email
            } : null
          },
          timeTracking: {
            totalHours,
            entries: timeEntriesResult.rows
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get task progress error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching task progress'
    });
  }
}; 