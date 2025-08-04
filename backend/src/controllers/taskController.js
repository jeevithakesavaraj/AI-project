import pool from '../config/database.js';
import Joi from 'joi';
import { filterTasksByRole } from '../middleware/roleAuth.js';

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE').default('TODO'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
  type: Joi.string().valid('TASK', 'BUG', 'STORY', 'EPIC').default('TASK'),
  storyPoints: Joi.number().integer().min(1).max(21).optional(),
  dueDate: Joi.date().optional(),
  assigneeId: Joi.string().uuid().allow(null).optional(),
  parentTaskId: Joi.string().uuid().allow(null).optional()
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
  type: Joi.string().valid('TASK', 'BUG', 'STORY', 'EPIC').optional(),
  storyPoints: Joi.number().integer().min(1).max(21).optional(),
  dueDate: Joi.date().optional(),
  assigneeId: Joi.string().uuid().allow(null).optional(),
  parentTaskId: Joi.string().uuid().allow(null).optional()
});

// Get all tasks (with filtering and sorting)
export const getAllTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      priority, 
      type, 
      assigneeId, 
      projectId,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Use role-based filtering
    const filters = {
      search,
      status,
      priority,
      type,
      assigneeId,
      projectId,
      limit: parseInt(limit),
      offset
    };
    
    const allTasks = await filterTasksByRole(req.user.id, req.user.role, filters);
    
    // Apply additional sorting
    allTasks.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = allTasks.length;
    const paginatedTasks = allTasks.slice(offset, offset + parseInt(limit));

    const tasks = paginatedTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      storyPoints: task.story_points,
      dueDate: task.due_date,
      projectId: task.project_id,
      projectName: task.project_name,
      assigneeId: task.assignee_id,
      assigneeName: task.assignee_name,
      creatorId: task.creator_id,
      creatorName: task.creator_name,
      parentTaskId: task.parent_task_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching tasks'
    });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if user has access to this task
      let accessResult;
      if (req.user.role === 'ADMIN') {
        // Admin can access any task
        accessResult = await client.query(
          `SELECT t.project_id FROM tasks t WHERE t.id = $1`,
          [taskId]
        );
      } else {
        // Regular users can access tasks from projects they're members of OR tasks assigned to them
        accessResult = await client.query(
          `SELECT t.project_id FROM tasks t
           LEFT JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = $1
           WHERE t.id = $2 AND (pm.user_id = $1 OR t.assignee_id = $1)`,
          [userId, taskId]
        );
      }

      if (accessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'You do not have access to this task'
        });
      }

      // Get task details
      const taskResult = await client.query(
        `SELECT t.*, 
                p.name as project_name,
                u.name as assignee_name,
                u.email as assignee_email,
                u.avatar as assignee_avatar,
                c.name as creator_name,
                parent.title as parent_task_title,
                COUNT(sub.id) as subtask_count,
                COUNT(CASE WHEN sub.status = 'DONE' THEN 1 END) as completed_subtasks
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assignee_id = u.id
         LEFT JOIN users c ON t.creator_id = c.id
         LEFT JOIN tasks parent ON t.parent_task_id = parent.id
         LEFT JOIN tasks sub ON t.id = sub.parent_task_id
         WHERE t.id = $1
         GROUP BY t.id, p.name, u.name, u.email, u.avatar, c.name, parent.title`,
        [taskId]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Task not found'
        });
      }

      const task = taskResult.rows[0];

      // Get subtasks
      const subtasksResult = await client.query(
        `SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
         FROM tasks t
         LEFT JOIN users u ON t.assignee_id = u.id
         WHERE t.parent_task_id = $1
         ORDER BY t.created_at`,
        [taskId]
      );

      // Get comments
      const commentsResult = await client.query(
        `SELECT c.*, u.name as user_name, u.avatar as user_avatar
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.task_id = $1
         ORDER BY c.created_at DESC`,
        [taskId]
      );

      const taskData = {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        storyPoints: task.story_points,
        dueDate: task.due_date,
        assigneeId: task.assignee_id,
        assigneeName: task.assignee_name,
        assigneeEmail: task.assignee_email,
        assigneeAvatar: task.assignee_avatar,
        creatorName: task.creator_name,
        parentTaskId: task.parent_task_id,
        parentTaskTitle: task.parent_task_title,
        projectId: task.project_id,
        projectName: task.project_name,
        subtaskCount: parseInt(task.subtask_count),
        completedSubtasks: parseInt(task.completed_subtasks),
        subtasks: subtasksResult.rows.map(subtask => ({
          id: subtask.id,
          title: subtask.title,
          status: subtask.status,
          priority: subtask.priority,
          assigneeName: subtask.assignee_name,
          assigneeAvatar: subtask.assignee_avatar,
          createdAt: subtask.created_at
        })),
        comments: commentsResult.rows.map(comment => ({
          id: comment.id,
          content: comment.content,
          userName: comment.user_name,
          userAvatar: comment.user_avatar,
          createdAt: comment.created_at
        })),
        createdAt: task.created_at,
        updatedAt: task.updated_at
      };

      res.json({
        success: true,
        data: {
          task: taskData
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching task'
    });
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const {
      title,
      description,
      status,
      priority,
      type,
      storyPoints,
      dueDate,
      assigneeId,
      parentTaskId
    } = value;

    const { projectId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to this project
      // ADMIN users can create tasks in any project
      if (req.user.role !== 'ADMIN') {
        const accessResult = await client.query(
          'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = true',
          [projectId, userId]
        );

        if (accessResult.rows.length === 0) {
          return res.status(403).json({
            error: 'ACCESS_DENIED',
            message: 'You do not have access to this project'
          });
        }
      }

      // Validate parent task if provided
      if (parentTaskId) {
        const parentTaskResult = await client.query(
          'SELECT id FROM tasks WHERE id = $1 AND project_id = $2',
          [parentTaskId, projectId]
        );

        if (parentTaskResult.rows.length === 0) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Parent task not found in this project'
          });
        }
      }

      // Validate assignee if provided
      if (assigneeId) {
        const assigneeResult = await client.query(
          'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = true',
          [projectId, assigneeId]
        );

        if (assigneeResult.rows.length === 0) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Assignee is not a member of this project'
          });
        }
      }

      await client.query('BEGIN');

      // Create task
      const taskResult = await client.query(
        `INSERT INTO tasks (title, description, status, priority, type, story_points, due_date, project_id, assignee_id, creator_id, parent_task_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [title, description, status || 'TODO', priority || 'MEDIUM', type || 'TASK', storyPoints, dueDate, projectId, assigneeId, userId, parentTaskId]
      );

      const task = taskResult.rows[0];

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: {
          task: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            type: task.type,
            storyPoints: task.story_points,
            dueDate: task.due_date,
            assigneeId: task.assignee_id,
            projectId: task.project_id,
            createdAt: task.created_at
          }
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error creating task'
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { error, value } = updateTaskSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to this task
      let accessResult;
      if (req.user.role === 'ADMIN') {
        // Admin can access any task
        accessResult = await client.query(
          `SELECT t.project_id FROM tasks t WHERE t.id = $1`,
          [taskId]
        );
      } else {
        // Regular users can access tasks from projects they're members of OR tasks assigned to them
        accessResult = await client.query(
          `SELECT t.project_id FROM tasks t
           LEFT JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = $1
           WHERE t.id = $2 AND (pm.user_id = $1 OR t.assignee_id = $1)`,
          [userId, taskId]
        );
      }

      if (accessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'You do not have access to this task'
        });
      }

      const projectId = accessResult.rows[0].project_id;

      // Validate assignee if provided
      if (value.assigneeId) {
        const assigneeResult = await client.query(
          'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = true',
          [projectId, value.assigneeId]
        );

        if (assigneeResult.rows.length === 0) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Assignee is not a member of this project'
          });
        }
      }

      // Validate parent task if provided
      if (value.parentTaskId) {
        const parentTaskResult = await client.query(
          'SELECT id FROM tasks WHERE id = $1 AND project_id = $2',
          [value.parentTaskId, projectId]
        );

        if (parentTaskResult.rows.length === 0) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            message: 'Parent task not found in this project'
          });
        }
      }

      // Build update query dynamically
      const updateFields = [];
      const queryParams = [];
      let paramCount = 1;

      Object.keys(value).forEach(key => {
        if (value[key] !== undefined) {
          const dbField = key === 'storyPoints' ? 'story_points' : 
                         key === 'dueDate' ? 'due_date' : 
                         key === 'assigneeId' ? 'assignee_id' : 
                         key === 'parentTaskId' ? 'parent_task_id' : key;
          updateFields.push(`${dbField} = $${paramCount}`);
          queryParams.push(value[key]);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'No fields to update'
        });
      }

      updateFields.push('updated_at = NOW()');
      queryParams.push(taskId);

      const updateQuery = `
        UPDATE tasks 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(updateQuery, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Task not found'
        });
      }

      const task = result.rows[0];

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: {
          task: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            type: task.type,
            storyPoints: task.story_points,
            dueDate: task.due_date,
            assigneeId: task.assignee_id,
            projectId: task.project_id,
            updatedAt: task.updated_at
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating task'
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to this task
      let accessResult;
      if (req.user.role === 'ADMIN') {
        // Admin can access any task
        accessResult = await client.query(
          `SELECT t.project_id FROM tasks t WHERE t.id = $1`,
          [taskId]
        );
      } else {
        // Regular users can access tasks from projects they're members of
        accessResult = await client.query(
          `SELECT pm.role, t.project_id FROM project_members pm
           JOIN tasks t ON t.project_id = pm.project_id
           WHERE t.id = $1 AND pm.user_id = $2 AND pm.is_active = true`,
          [taskId, userId]
        );
      }

      if (accessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'You do not have access to this task'
        });
      }

      // Only project owners and admins can delete tasks
      const userRole = req.user.role === 'ADMIN' ? 'ADMIN' : accessResult.rows[0].role;
      if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'Only project owners and admins can delete tasks'
        });
      }

      // Check if task has subtasks
      const subtasksResult = await client.query(
        'SELECT COUNT(*) as count FROM tasks WHERE parent_task_id = $1',
        [taskId]
      );

      if (parseInt(subtasksResult.rows[0].count) > 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Cannot delete task with subtasks. Please delete subtasks first.'
        });
      }

      const result = await client.query(
        'DELETE FROM tasks WHERE id = $1 RETURNING *',
        [taskId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'TASK_NOT_FOUND',
          message: 'Task not found'
        });
      }

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error deleting task'
    });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.query;

    const client = await pool.connect();
    try {
      let whereClause = 'pm.user_id = $1 AND pm.is_active = true';
      const queryParams = [userId];
      let paramCount = 2;

      if (projectId) {
        whereClause += ` AND t.project_id = $${paramCount}`;
        queryParams.push(projectId);
        paramCount++;
      }

      // Get task statistics
      const statsResult = await client.query(
        `SELECT 
           COUNT(t.id) as total_tasks,
           COUNT(CASE WHEN t.status = 'TODO' THEN 1 END) as todo_tasks,
           COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) as in_progress_tasks,
           COUNT(CASE WHEN t.status = 'REVIEW' THEN 1 END) as review_tasks,
           COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as done_tasks,
           COUNT(CASE WHEN t.priority = 'HIGH' OR t.priority = 'URGENT' THEN 1 END) as high_priority_tasks,
           COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN 1 END) as overdue_tasks,
           AVG(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END) * 100 as completion_rate
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN project_members pm ON p.id = pm.project_id
         WHERE ${whereClause}`,
        queryParams
      );

      // Get tasks by status
      const statusResult = await client.query(
        `SELECT t.status, COUNT(*) as count
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN project_members pm ON p.id = pm.project_id
         WHERE ${whereClause}
         GROUP BY t.status`,
        queryParams
      );

      // Get tasks by priority
      const priorityResult = await client.query(
        `SELECT t.priority, COUNT(*) as count
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN project_members pm ON p.id = pm.project_id
         WHERE ${whereClause}
         GROUP BY t.priority`,
        queryParams
      );

      const stats = statsResult.rows[0];
      const statusBreakdown = statusResult.rows;
      const priorityBreakdown = priorityResult.rows;

      res.json({
        success: true,
        data: {
          stats: {
            totalTasks: parseInt(stats.total_tasks),
            todoTasks: parseInt(stats.todo_tasks),
            inProgressTasks: parseInt(stats.in_progress_tasks),
            reviewTasks: parseInt(stats.review_tasks),
            doneTasks: parseInt(stats.done_tasks),
            highPriorityTasks: parseInt(stats.high_priority_tasks),
            overdueTasks: parseInt(stats.overdue_tasks),
            completionRate: Math.round(stats.completion_rate || 0)
          },
          statusBreakdown,
          priorityBreakdown
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching task statistics'
    });
  }
}; 