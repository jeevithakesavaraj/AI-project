import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

// Validation schemas
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('ADMIN', 'PROJECT_MANAGER', 'USER').default('USER'),
  avatar: Joi.string().uri().optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  role: Joi.string().valid('ADMIN', 'PROJECT_MANAGER', 'USER'),
  avatar: Joi.string().uri(),
  isActive: Joi.boolean()
});

const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required()
});

// Get all users (with pagination and filtering)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    const offset = (page - 1) * limit;
    
    const client = await pool.connect();
    try {
      let query = 'SELECT id, name, email, role, avatar, is_active, created_at, last_login_at FROM users';
      const queryParams = [];
      const conditions = [];
      let paramCount = 1;

      // Add search filter
      if (search) {
        conditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
        paramCount++;
      }

      // Add role filter
      if (role) {
        conditions.push(`role = $${paramCount}`);
        queryParams.push(role);
        paramCount++;
      }

      // Add active status filter
      if (isActive !== undefined) {
        conditions.push(`is_active = $${paramCount}`);
        queryParams.push(isActive === 'true');
        paramCount++;
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Add pagination
      query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await client.query(query, queryParams);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM users';
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      const countResult = await client.query(countQuery, queryParams.slice(0, -2));

      const users = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        avatar: row.avatar,
        isActive: row.is_active,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at
      }));

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].total),
            totalPages: Math.ceil(countResult.rows[0].total / limit)
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching users'
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, name, email, role, avatar, is_active, created_at, last_login_at 
         FROM users WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const user = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        role: result.rows[0].role,
        avatar: result.rows[0].avatar,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at,
        lastLoginAt: result.rows[0].last_login_at
      };

      res.json({
        success: true,
        data: { user }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching user'
    });
  }
};

// Create new user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { name, email, password, role, avatar } = value;
    
    const client = await pool.connect();
    try {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          error: 'USER_EXISTS',
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, role, avatar) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, email, role, avatar, is_active, created_at`,
        [name, email, passwordHash, role, avatar]
      );

      const user = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        role: result.rows[0].role,
        avatar: result.rows[0].avatar,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at
      };

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error creating user'
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await pool.connect();
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      // Check if email is being updated and if it's already taken
      if (value.email) {
        const emailCheck = await client.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [value.email, id]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            error: 'EMAIL_EXISTS',
            message: 'Email is already taken by another user'
          });
        }
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (value.name) {
        updateFields.push(`name = $${paramCount}`);
        updateValues.push(value.name);
        paramCount++;
      }

      if (value.email) {
        updateFields.push(`email = $${paramCount}`);
        updateValues.push(value.email);
        paramCount++;
      }

      if (value.role) {
        updateFields.push(`role = $${paramCount}`);
        updateValues.push(value.role);
        paramCount++;
      }

      if (value.avatar !== undefined) {
        updateFields.push(`avatar = $${paramCount}`);
        updateValues.push(value.avatar);
        paramCount++;
      }

      if (value.isActive !== undefined) {
        updateFields.push(`is_active = $${paramCount}`);
        updateValues.push(value.isActive);
        paramCount++;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'No fields to update'
        });
      }

      updateValues.push(id);
      const result = await client.query(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${paramCount} 
         RETURNING id, name, email, role, avatar, is_active, created_at, updated_at`,
        updateValues
      );

      const user = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        role: result.rows[0].role,
        avatar: result.rows[0].avatar,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating user'
    });
  }
};

// Change user password (Admin only)
export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = changePasswordSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { newPassword } = value;
    
    const client = await pool.connect();
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, id]
      );

      res.json({
        success: true,
        message: 'User password changed successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error changing user password'
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await pool.connect();
    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      // Check if user is trying to delete themselves
      if (req.user.id === id) {
        return res.status(400).json({
          error: 'INVALID_OPERATION',
          message: 'Cannot delete your own account'
        });
      }

      // Soft delete by setting is_active to false
      await client.query(
        'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error deleting user'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Get total users count
      const totalUsers = await client.query('SELECT COUNT(*) as count FROM users');
      
      // Get active users count
      const activeUsers = await client.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
      
      // Get users by role
      const usersByRole = await client.query(
        'SELECT role, COUNT(*) as count FROM users GROUP BY role'
      );
      
      // Get recent registrations (last 7 days)
      const recentUsers = await client.query(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL \'7 days\''
      );

      const stats = {
        totalUsers: parseInt(totalUsers.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        inactiveUsers: parseInt(totalUsers.rows[0].count) - parseInt(activeUsers.rows[0].count),
        usersByRole: usersByRole.rows.reduce((acc, row) => {
          acc[row.role] = parseInt(row.count);
          return acc;
        }, {}),
        recentRegistrations: parseInt(recentUsers.rows[0].count)
      };

      res.json({
        success: true,
        data: { stats }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching user statistics'
    });
  }
}; 