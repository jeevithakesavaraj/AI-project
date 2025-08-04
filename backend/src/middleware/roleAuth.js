import pool from '../config/database.js';

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3
};

// Project role hierarchy
const PROJECT_ROLE_HIERARCHY = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4
};

/**
 * Check if user has minimum required role
 */
export const requireRole = (minRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const minRoleLevel = ROLE_HIERARCHY[minRole];
      const userRoleLevel = ROLE_HIERARCHY[userRole];

      if (userRoleLevel < minRoleLevel) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: `Access denied. Required role: ${minRole}`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error checking user role'
      });
    }
  };
};

/**
 * Check if user has access to a specific project
 */
export const requireProjectAccess = (minProjectRole = 'MEMBER') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Project ID is required'
        });
      }

      const client = await pool.connect();
      try {
        // Check if user is a member of the project
        const memberResult = await client.query(
          `SELECT pm.role as project_role, u.role as user_role
           FROM project_members pm
           JOIN users u ON pm.user_id = u.id
           WHERE pm.project_id = $1 AND pm.user_id = $2 AND pm.is_active = true`,
          [projectId, req.user.id]
        );

        // If user is a member, check their project role
        if (memberResult.rows.length > 0) {
          const member = memberResult.rows[0];
          const userProjectRole = member.project_role;
          const userSystemRole = member.user_role;

          // Check if user has minimum required project role
          const minProjectRoleLevel = PROJECT_ROLE_HIERARCHY[minProjectRole];
          const userProjectRoleLevel = PROJECT_ROLE_HIERARCHY[userProjectRole];

          if (userProjectRoleLevel < minProjectRoleLevel) {
            return res.status(403).json({
              error: 'FORBIDDEN',
              message: `Access denied. Required project role: ${minProjectRole}`
            });
          }

          // Add project role to request for use in controllers
          req.userProjectRole = userProjectRole;
          req.userSystemRole = userSystemRole;
          req.projectId = projectId;

          next();
          return;
        }

        // If not a member, check system role permissions
        if (req.user.role === 'ADMIN') {
          // Admin can access all projects
          req.userProjectRole = 'ADMIN';
          req.userSystemRole = 'ADMIN';
          req.projectId = projectId;
          next();
          return;
        }

        if (req.user.role === 'MANAGER') {
          // Check if user owns or manages this project
          const projectResult = await client.query(
            `SELECT id FROM projects 
             WHERE id = $1 AND (owner_id = $2 OR creator_id = $2)`,
            [projectId, req.user.id]
          );

          if (projectResult.rows.length > 0) {
            req.userProjectRole = 'ADMIN';
            req.userSystemRole = 'MANAGER';
            req.projectId = projectId;
            next();
            return;
          }
        }

        // If we get here, user doesn't have access
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have access to this project'
        });

      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Project access check error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error checking project access'
      });
    }
  };
};

/**
 * Check if user can create projects (only ADMIN)
 */
export const requireProjectCreation = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'Only administrators can create projects'
        });
      }

      next();
    } catch (error) {
      console.error('Project creation check error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error checking project creation permissions'
      });
    }
  };
};

/**
 * Check if user can create tasks (USER, MANAGER, ADMIN)
 */
export const requireTaskCreation = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      const allowedRoles = ['USER', 'MANAGER', 'ADMIN'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'FORBIDDEN',
          message: 'You do not have permission to create tasks'
        });
      }

      next();
    } catch (error) {
      console.error('Task creation check error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error checking task creation permissions'
      });
    }
  };
};

/**
 * Check if user can manage project members (MANAGER, ADMIN, or project OWNER/ADMIN)
 */
export const requireMemberManagement = () => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required'
        });
      }

      // System-level permissions
      if (['MANAGER', 'ADMIN'].includes(req.user.role)) {
        return next();
      }

      // Project-level permissions (check if user is project OWNER or ADMIN)
      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Project ID is required'
        });
      }

      const client = await pool.connect();
      try {
        const memberResult = await client.query(
          `SELECT role FROM project_members 
           WHERE project_id = $1 AND user_id = $2 AND is_active = true`,
          [projectId, req.user.id]
        );

        if (memberResult.rows.length === 0) {
          return res.status(403).json({
            error: 'FORBIDDEN',
            message: 'You do not have access to this project'
          });
        }

        const projectRole = memberResult.rows[0].role;
        if (!['OWNER', 'ADMIN'].includes(projectRole)) {
          return res.status(403).json({
            error: 'FORBIDDEN',
            message: 'Only project owners and admins can manage members'
          });
        }

        next();
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Member management check error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error checking member management permissions'
      });
    }
  };
};

/**
 * Filter projects based on user role and access
 */
export const filterProjectsByRole = async (userId, userRole) => {
  const client = await pool.connect();
  try {
    if (userRole === 'ADMIN') {
      // Admin can see all projects
      const result = await client.query(
        `SELECT p.*, 
                COUNT(t.id) as task_count,
                COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
                ROUND(
                  CASE 
                    WHEN COUNT(t.id) > 0 
                    THEN (COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::float / COUNT(t.id)::float) * 100
                    ELSE 0 
                  END::numeric, 1
                ) as progress
         FROM projects p
         LEFT JOIN tasks t ON p.id = t.project_id
         GROUP BY p.id
         ORDER BY p.created_at DESC`
      );
      return result.rows;
    } else if (userRole === 'MANAGER') {
      // Project managers can see projects they own or manage
      const result = await client.query(
        `SELECT p.*, 
                COUNT(t.id) as task_count,
                COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
                ROUND(
                  CASE 
                    WHEN COUNT(t.id) > 0 
                    THEN (COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::float / COUNT(t.id)::float) * 100
                    ELSE 0 
                  END::numeric, 1
                ) as progress
         FROM projects p
         LEFT JOIN tasks t ON p.id = t.project_id
         LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1 AND pm.is_active = true
         WHERE p.owner_id = $1 OR p.creator_id = $1 OR (pm.user_id = $1 AND pm.role IN ('OWNER', 'MANAGER'))
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [userId]
      );
      return result.rows;
    } else {
      // Regular users can only see projects they are members of
      const result = await client.query(
        `SELECT p.*, 
                COUNT(t.id) as task_count,
                COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
                ROUND(
                  CASE 
                    WHEN COUNT(t.id) > 0 
                    THEN (COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::float / COUNT(t.id)::float) * 100
                    ELSE 0 
                  END::numeric, 1
                ) as progress
         FROM projects p
         LEFT JOIN tasks t ON p.id = t.project_id
         INNER JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1 AND pm.is_active = true
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [userId]
      );
      return result.rows;
    }
  } finally {
    client.release();
  }
};

/**
 * Filter tasks based on user role and project access
 */
export const filterTasksByRole = async (userId, userRole, filters = {}) => {
  const client = await pool.connect();
  try {
    let query = `
      SELECT t.*, 
             p.name as project_name,
             u.name as assignee_name,
             c.name as creator_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users c ON t.creator_id = c.id
    `;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (userRole === 'ADMIN') {
      // Admin can see all tasks
    } else if (userRole === 'MANAGER') {
      // Project managers can see tasks from projects they own/manage
      query += ` LEFT JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = $${paramIndex}`;
      whereConditions.push(`(p.owner_id = $${paramIndex} OR p.creator_id = $${paramIndex} OR (pm.user_id = $${paramIndex} AND pm.role IN ('OWNER', 'MANAGER')))`);
      queryParams.push(userId);
      paramIndex++;
    } else {
      // Regular users can only see tasks from projects they are members of
      query += ` INNER JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    // Add filter conditions
    if (filters.projectId) {
      whereConditions.push(`t.project_id = $${paramIndex}`);
      queryParams.push(filters.projectId);
      paramIndex++;
    }

    if (filters.status) {
      whereConditions.push(`t.status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    if (filters.assigneeId) {
      whereConditions.push(`t.assignee_id = $${paramIndex}`);
      queryParams.push(filters.assigneeId);
      paramIndex++;
    }

    if (filters.search) {
      whereConditions.push(`(t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
      queryParams.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY t.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      queryParams.push(filters.offset);
    }

    const result = await client.query(query, queryParams);
    return result.rows;
  } finally {
    client.release();
  }
};

export default {
  requireRole,
  requireProjectAccess,
  requireProjectCreation,
  requireTaskCreation,
  requireMemberManagement,
  filterProjectsByRole,
  filterTasksByRole
}; 