import pool from '../config/database.js';
import Joi from 'joi';
import { filterProjectsByRole } from '../middleware/roleAuth.js';

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('ACTIVE', 'ARCHIVED', 'COMPLETED').default('ACTIVE'),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  members: Joi.array().items(Joi.string().uuid()).optional()
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('ACTIVE', 'ARCHIVED', 'COMPLETED').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
});

// Get all projects (with pagination and filtering)
export const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Use role-based filtering
    const allProjects = await filterProjectsByRole(req.user.id, req.user.role);
    
    // Apply additional filters
    let filteredProjects = allProjects;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter(project => 
        project.name.toLowerCase().includes(searchLower) || 
        (project.description && project.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (status) {
      filteredProjects = filteredProjects.filter(project => project.status === status);
    }

    // Apply pagination
    const total = filteredProjects.length;
    const paginatedProjects = filteredProjects.slice(offset, offset + parseInt(limit));

    const projects = paginatedProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      progress: parseFloat(project.progress) || 0,
      totalTasks: parseInt(project.task_count) || 0,
      completedTasks: parseInt(project.completed_tasks) || 0,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }));

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching projects'
    });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Check if user has access to this project
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

      // Get project details
      const projectResult = await client.query(
        `SELECT p.*, 
                COUNT(t.id) as task_count,
                COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) as in_progress_tasks,
                COUNT(CASE WHEN t.status = 'TODO' THEN 1 END) as todo_tasks
         FROM projects p
         LEFT JOIN tasks t ON p.id = t.project_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [projectId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          error: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        });
      }

      const project = projectResult.rows[0];

      // Get project members
      const membersResult = await client.query(
        `SELECT u.id, u.name, u.email, u.avatar, pm.role as member_role, pm.joined_at
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = $1 AND pm.is_active = true
         ORDER BY pm.joined_at`,
        [projectId]
      );

      // Get recent activities (tasks, comments, etc.)
      const activitiesResult = await client.query(
        `SELECT 'task' as type, t.id, t.title, t.status, t.created_at, u.name as user_name
         FROM tasks t
         LEFT JOIN users u ON t.assignee_id = u.id
         WHERE t.project_id = $1
         ORDER BY t.created_at DESC
         LIMIT 10`,
        [projectId]
      );

      const projectData = {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        progress: project.task_count > 0 ? Math.round((project.completed_tasks / project.task_count) * 100) : 0,
        taskCount: parseInt(project.task_count),
        completedTasks: parseInt(project.completed_tasks),
        inProgressTasks: parseInt(project.in_progress_tasks),
        todoTasks: parseInt(project.todo_tasks),
        members: membersResult.rows.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.member_role,
          joinedAt: member.joined_at
        })),
        activities: activitiesResult.rows,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      };

      res.json({
        success: true,
        data: {
          project: projectData
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching project'
    });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const {
      name,
      description,
      status,
      startDate,
      endDate,
      members
    } = value;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create project
      const projectResult = await client.query(
        `INSERT INTO projects (name, description, status, start_date, end_date, owner_id, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, description, status || 'ACTIVE', startDate, endDate, req.user.id, req.user.id]
      );

      const project = projectResult.rows[0];

      // Add creator as project member with OWNER role
      await client.query(
        `INSERT INTO project_members (project_id, user_id, role, is_active)
         VALUES ($1, $2, $3, true)`,
        [project.id, req.user.id, 'OWNER']
      );

      // Add other members if provided
      if (members && members.length > 0) {
        for (const memberId of members) {
          await client.query(
            `INSERT INTO project_members (project_id, user_id, role, is_active)
             VALUES ($1, $2, $3, true)`,
            [project.id, memberId, 'MEMBER']
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.start_date,
            endDate: project.end_date,
            createdAt: project.created_at
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
    console.error('Create project error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error creating project'
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { error, value } = updateProjectSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await pool.connect();
    try {
      // Build update query dynamically
      const updateFields = [];
      const queryParams = [];
      let paramCount = 1;

      Object.keys(value).forEach(key => {
        if (value[key] !== undefined) {
          const dbField = key === 'startDate' ? 'start_date' : 
                         key === 'endDate' ? 'end_date' : key;
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
      queryParams.push(projectId);

      const updateQuery = `
        UPDATE projects 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(updateQuery, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        });
      }

      const project = result.rows[0];

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.start_date,
            endDate: project.end_date,
            updatedAt: project.updated_at
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating project'
    });
  }
};

// Delete project (soft delete)
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const client = await pool.connect();
    try {
      // Check if user is project owner
      const accessResult = await client.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = true',
        [projectId, req.user.id]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'You do not have access to this project'
        });
      }

      if (accessResult.rows[0].role !== 'OWNER') {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'Only project owners can delete projects'
        });
      }

      // Soft delete the project
      const result = await client.query(
        'UPDATE projects SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
        [projectId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        });
      }

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error deleting project'
    });
  }
};

// Get project statistics
export const getProjectStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const client = await pool.connect();
    try {
             // Get project statistics
       const statsResult = await client.query(
         `SELECT 
           COUNT(DISTINCT p.id) as total_projects,
           COUNT(CASE WHEN p.status = 'ACTIVE' THEN 1 END) as active_projects,
           COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as completed_projects,
           COUNT(CASE WHEN p.status = 'ARCHIVED' THEN 1 END) as archived_projects,
           AVG(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END) * 100 as avg_completion_rate
         FROM projects p
         LEFT JOIN project_members pm ON p.id = pm.project_id
         LEFT JOIN tasks t ON p.id = t.project_id
         WHERE pm.user_id = $1 AND pm.is_active = true`,
         [userId]
       );

             // Get projects by status
       const statusResult = await client.query(
         `SELECT p.status, COUNT(*) as count
          FROM projects p
          JOIN project_members pm ON p.id = pm.project_id
          WHERE pm.user_id = $1 AND pm.is_active = true
          GROUP BY p.status`,
         [userId]
       );

             // Get recent projects
       const recentResult = await client.query(
         `SELECT p.id, p.name, p.status, p.created_at
          FROM projects p
          JOIN project_members pm ON p.id = pm.project_id
          WHERE pm.user_id = $1 AND pm.is_active = true
          ORDER BY p.created_at DESC
          LIMIT 5`,
         [userId]
       );

      const stats = statsResult.rows[0];
      const statusBreakdown = statusResult.rows;
      const recentProjects = recentResult.rows;

      res.json({
        success: true,
        data: {
          stats: {
            totalProjects: parseInt(stats.total_projects),
            activeProjects: parseInt(stats.active_projects),
            completedProjects: parseInt(stats.completed_projects),
            archivedProjects: parseInt(stats.archived_projects),
            avgCompletionRate: Math.round(stats.avg_completion_rate || 0)
          },
          statusBreakdown,
          recentProjects
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching project statistics'
    });
  }
}; 