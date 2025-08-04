import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'AUTH_REQUIRED',
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await pool.connect();
    try {
      const userResult = await client.query(
        `SELECT id, email, name, role, avatar, is_active 
         FROM users WHERE id = $1`,
        [decoded.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return res.status(401).json({
          error: 'INVALID_TOKEN',
          message: 'Invalid or inactive user token'
        });
      }

      req.user = {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        name: userResult.rows[0].name,
        role: userResult.rows[0].role,
        avatar: userResult.rows[0].avatar,
        isActive: userResult.rows[0].is_active
      };
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      });
    }

    return res.status(403).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid token'
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'AUTH_REQUIRED',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'PERMISSION_DENIED',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      const projectMemberResult = await client.query(
        `SELECT * FROM project_members 
         WHERE project_id = $1 AND user_id = $2 AND is_active = true`,
        [projectId, userId]
      );

      if (projectMemberResult.rows.length === 0) {
        return res.status(403).json({
          error: 'PROJECT_ACCESS_DENIED',
          message: 'You do not have access to this project'
        });
      }

      req.projectMember = projectMemberResult.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error checking project access'
    });
  }
};

export const requireTaskAccess = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      const taskResult = await client.query(
        `SELECT t.* FROM tasks t
         JOIN projects p ON t.project_id = p.id
         JOIN project_members pm ON p.id = pm.project_id
         WHERE t.id = $1 AND pm.user_id = $2 AND pm.is_active = true`,
        [taskId, userId]
      );

      if (taskResult.rows.length === 0) {
        return res.status(403).json({
          error: 'TASK_ACCESS_DENIED',
          message: 'You do not have access to this task'
        });
      }

      req.task = taskResult.rows[0];
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error checking task access'
    });
  }
};

export const requireProjectRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      const client = await pool.connect();
      try {
        const projectMemberResult = await client.query(
          `SELECT role FROM project_members 
           WHERE project_id = $1 AND user_id = $2 AND is_active = true`,
          [projectId, userId]
        );

        if (projectMemberResult.rows.length === 0) {
          return res.status(403).json({
            error: 'PROJECT_ACCESS_DENIED',
            message: 'You do not have access to this project'
          });
        }

        const userRole = projectMemberResult.rows[0].role;
        
        if (!requiredRoles.includes(userRole)) {
          return res.status(403).json({
            error: 'INSUFFICIENT_PERMISSIONS',
            message: `Required roles: ${requiredRoles.join(', ')}. Your role: ${userRole}`
          });
        }

        req.projectRole = userRole;
        next();
      } finally {
        client.release();
      }
    } catch (error) {
      return res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'Error checking project permissions'
      });
    }
  };
}; 