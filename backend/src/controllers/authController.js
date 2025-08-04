import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import Joi from 'joi';

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  avatar: Joi.string().uri()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register user
export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { name, email, password } = value;

    // Check if user already exists
    const client = await pool.connect();
    try {
      const existingUserResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({
          error: 'USER_EXISTS',
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, avatar, created_at`,
        [name, email, passwordHash, 'USER']
      );

      const user = {
        id: userResult.rows[0].id,
        name: userResult.rows[0].name,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role,
        avatar: userResult.rows[0].avatar,
        createdAt: userResult.rows[0].created_at
      };

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error registering user'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user
    const client = await pool.connect();
    try {
      const userResult = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
      }

      const user = userResult.rows[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Update last login
      await client.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        token
      }
    });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error during login'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const userResult = await client.query(
        `SELECT id, name, email, role, avatar, created_at, last_login_at 
         FROM users WHERE id = $1`,
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const user = {
        id: userResult.rows[0].id,
        name: userResult.rows[0].name,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role,
        avatar: userResult.rows[0].avatar,
        createdAt: userResult.rows[0].created_at,
        lastLoginAt: userResult.rows[0].last_login_at
      };

      res.json({
        success: true,
        data: { user }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching user data'
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const client = await pool.connect();
    try {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (value.name) {
        updateFields.push(`name = $${paramCount}`);
        updateValues.push(value.name);
        paramCount++;
      }

      if (value.avatar) {
        updateFields.push(`avatar = $${paramCount}`);
        updateValues.push(value.avatar);
        paramCount++;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'No fields to update'
        });
      }

      updateValues.push(req.user.id);
      const userResult = await client.query(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${paramCount} 
         RETURNING id, name, email, role, avatar, updated_at`,
        updateValues
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const updatedUser = {
        id: userResult.rows[0].id,
        name: userResult.rows[0].name,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role,
        avatar: userResult.rows[0].avatar,
        updatedAt: userResult.rows[0].updated_at
      };

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error updating profile'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.details[0].message
      });
    }

    const { currentPassword, newPassword } = value;

    const client = await pool.connect();
    try {
      // Get user with password hash
      const userResult = await client.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, req.user.id]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error changing password'
    });
  }
};

// Logout (client-side token removal)
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement a blacklist here if needed
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error during logout'
    });
  }
}; 