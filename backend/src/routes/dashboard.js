import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getProjectStats } from '../controllers/projectController.js';
import { getTaskStats } from '../controllers/taskController.js';
import pool from '../config/database.js';

const router = express.Router();

// Get dashboard data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const client = await pool.connect();

    try {
      // Get project statistics
      const projectStats = await getProjectStats(req, res);
      
      // Get task statistics
      const taskStats = await getTaskStats(req, res);
      
      // Get recent activities
      const activitiesResult = await client.query(`
        SELECT 
          'task_created' as type,
          t.title as description,
          t.created_at as timestamp,
          p.name as project_name,
          u.name as user_name,
          u.avatar as user_avatar
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        JOIN users u ON t.creator_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
        WHERE (pm.user_id = $1 AND pm.is_active = true) OR p.owner_id = $1 OR p.creator_id = $1
        UNION ALL
        SELECT 
          'project_created' as type,
          p.name as description,
          p.created_at as timestamp,
          p.name as project_name,
          u.name as user_name,
          u.avatar as user_avatar
        FROM projects p
        JOIN users u ON p.creator_id = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
        WHERE (pm.user_id = $1 AND pm.is_active = true) OR p.owner_id = $1 OR p.creator_id = $1
        ORDER BY timestamp DESC
        LIMIT 10
      `, [userId]);

      const activities = activitiesResult.rows.map(activity => ({
        id: activity.type + '_' + activity.timestamp,
        type: activity.type,
        description: activity.description,
        projectName: activity.project_name,
        userName: activity.user_name,
        userAvatar: activity.user_avatar,
        timestamp: activity.timestamp
      }));

      // Get quick stats
      const quickStatsResult = await client.query(`
        SELECT 
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN 1 END) as overdue_tasks
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
        WHERE (pm.user_id = $1 AND pm.is_active = true) OR p.owner_id = $1 OR p.creator_id = $1
      `, [userId]);

      const quickStats = quickStatsResult.rows[0];

      res.json({
        success: true,
        data: {
          quickStats: {
            totalProjects: parseInt(quickStats.total_projects),
            totalTasks: parseInt(quickStats.total_tasks),
            completedTasks: parseInt(quickStats.completed_tasks),
            overdueTasks: parseInt(quickStats.overdue_tasks)
          },
          projectStats: projectStats.data?.data || {},
          taskStats: taskStats.data?.data || {},
          activities
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Error fetching dashboard data'
    });
  }
});

export default router; 