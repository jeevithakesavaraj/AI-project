import pool from '../config/database.js';
import Joi from 'joi';

// Validation schemas
const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('ADMIN', 'USER').required()
});

const updateProjectRoleSchema = Joi.object({
  role: Joi.string().valid('OWNER', 'ADMIN', 'MEMBER', 'VIEWER').required()
});

const addProjectMemberSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  role: Joi.string().valid('ADMIN', 'MEMBER', 'VIEWER').default('MEMBER')
});

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { error, value } = updateUserRoleSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    // Check if current user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'PERMISSION_DENIED',
        message: 'Only administrators can update user roles'
      });
    }

    const client = await pool.connect();
    try {
      // Check if user exists
      const userResult = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      // Update user role
      await client.query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
        [value.role, userId]
      );

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: {
          userId,
          role: value.role
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating user role'
    });
  }
};

// Get project members
export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u.name, u.email, u.avatar, pm.role, pm.joined_at, pm.is_active
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = $1
         ORDER BY pm.joined_at`,
        [projectId]
      );

      const members = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        avatar: row.avatar,
        role: row.role,
        joinedAt: row.joined_at,
        isActive: row.is_active
      }));

      res.json({
        success: true,
        data: { members }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching project members'
    });
  }
};

// Add project member
export const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { error, value } = addProjectMemberSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await pool.connect();
    try {
      // Check if current user has permission to add members
      const currentUserRole = await client.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = true',
        [projectId, req.user.id]
      );

      if (currentUserRole.rows.length === 0 || 
          !['OWNER', 'ADMIN'].includes(currentUserRole.rows[0].role)) {
        return res.status(403).json({
          error: 'PERMISSION_DENIED',
          message: 'Only project owners and admins can add members'
        });
      }

      // Check if user exists
      const userResult = await client.query(
        'SELECT id, name FROM users WHERE id = $1 AND is_active = true',
        [value.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found or inactive'
        });
      }

      // Check if user is already a member
      const existingMember = await client.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, value.userId]
      );

      if (existingMember.rows.length > 0) {
        return res.status(400).json({
          error: 'MEMBER_EXISTS',
          message: 'User is already a member of this project'
        });
      }

      // Add member to project
      await client.query(
        'INSERT INTO project_members (project_id, user_id, role, is_active) VALUES ($1, $2, $3, true)',
        [projectId, value.userId, value.role]
      );

      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: {
          userId: value.userId,
          userName: userResult.rows[0].name,
          role: value.role
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error adding project member'
    });
  }
};

// Update project member role
export const updateProjectMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { error, value } = updateProjectRoleSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await pool.connect();
    try {
      // Check if current user has permission to update roles
      const currentUserRole = await client.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = true',
        [projectId, req.user.id]
      );

      if (currentUserRole.rows.length === 0 || 
          currentUserRole.rows[0].role !== 'OWNER') {
        return res.status(403).json({
          error: 'PERMISSION_DENIED',
          message: 'Only project owners can update member roles'
        });
      }

      // Check if member exists
      const memberResult = await client.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, memberId]
      );

      if (memberResult.rows.length === 0) {
        return res.status(404).json({
          error: 'MEMBER_NOT_FOUND',
          message: 'Project member not found'
        });
      }

      // Update member role
      await client.query(
        'UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3',
        [value.role, projectId, memberId]
      );

      res.json({
        success: true,
        message: 'Member role updated successfully',
        data: {
          memberId,
          role: value.role
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update project member role error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating member role'
    });
  }
};

// Remove project member
export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const client = await pool.connect();
    try {
      // Check if current user has permission to remove members
      const currentUserRole = await client.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2 AND is_active = true',
        [projectId, req.user.id]
      );

      if (currentUserRole.rows.length === 0 || 
          !['OWNER', 'ADMIN'].includes(currentUserRole.rows[0].role)) {
        return res.status(403).json({
          error: 'PERMISSION_DENIED',
          message: 'Only project owners and admins can remove members'
        });
      }

      // Check if trying to remove the owner
      const memberRole = await client.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, memberId]
      );

      if (memberRole.rows.length === 0) {
        return res.status(404).json({
          error: 'MEMBER_NOT_FOUND',
          message: 'Project member not found'
        });
      }

      if (memberRole.rows[0].role === 'OWNER') {
        return res.status(400).json({
          error: 'INVALID_OPERATION',
          message: 'Cannot remove project owner'
        });
      }

      // Remove member from project
      await client.query(
        'UPDATE project_members SET is_active = false, left_at = NOW() WHERE project_id = $1 AND user_id = $2',
        [projectId, memberId]
      );

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Remove project member error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error removing project member'
    });
  }
}; 