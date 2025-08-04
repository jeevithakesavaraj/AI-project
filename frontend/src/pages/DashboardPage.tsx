import React, { useState, useEffect } from 'react';

import { toast } from 'react-hot-toast';
import DashboardStats from '@/components/DashboardStats';
import ProjectProgressChart from '@/components/ProjectProgressChart';
import RecentActivity from '@/components/RecentActivity';

import LoadingSpinner from '@/components/LoadingSpinner';

interface DashboardData {
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    totalUsers: number;
    completionRate: number;
  };
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    totalTasks: number;
    completedTasks: number;
    dueDate?: string;
  }>;
  activities: Array<{
    id: string;
    type: 'project_created' | 'project_updated' | 'project_deleted' | 'task_created' | 'task_updated' | 'task_completed' | 'user_joined' | 'comment_added';
    title: string;
    description: string;
    timestamp: string;
    user: {
      name: string;
      email: string;
    };
    project?: {
      name: string;
      id: string;
    };
    task?: {
      name: string;
      id: string;
    };
  }>;
}

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project statistics
      const projectStatsResponse = await fetch('/api/projects/stats', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });

      // Fetch task statistics
      const taskStatsResponse = await fetch('/api/tasks/stats', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });

      // Fetch projects for progress chart
      const projectsResponse = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });

      if (!projectStatsResponse.ok || !taskStatsResponse.ok || !projectsResponse.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const projectStats = await projectStatsResponse.json();
      const taskStats = await taskStatsResponse.json();
      const projects = await projectsResponse.json();

      // Combine the data
      const combinedStats = {
        totalProjects: projectStats.data.stats.totalProjects || 0,
        activeProjects: projectStats.data.stats.activeProjects || 0,
        completedProjects: projectStats.data.stats.completedProjects || 0,
        totalTasks: taskStats.data.stats.totalTasks || 0,
        completedTasks: taskStats.data.stats.doneTasks || 0,
        overdueTasks: taskStats.data.stats.overdueTasks || 0,
        totalUsers: projectStats.data.stats.totalUsers || 0,
        completionRate: taskStats.data.stats.completionRate || 0
      };

      // Transform projects for progress chart
      const transformedProjects = projects.data.projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress || 0,
        totalTasks: project.totalTasks || 0,
        completedTasks: project.completedTasks || 0,
        dueDate: project.endDate
      }));

      // Mock activities for now (in a real app, this would come from an API)
      const mockActivities = [
        {
          id: '1',
          type: 'project_created' as const,
          title: 'New project created',
          description: 'Project "Website Redesign" was created',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          user: { name: 'Admin User', email: 'admin@projectmanagement.com' },
          project: { name: 'Website Redesign', id: '1' }
        },
        {
          id: '2',
          type: 'task_completed' as const,
          title: 'Task completed',
          description: 'Task "Design Homepage" was marked as completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          user: { name: 'Admin User', email: 'admin@projectmanagement.com' },
          task: { name: 'Design Homepage', id: '1' }
        }
      ];

      setDashboardData({
        projectStats: combinedStats,
        projects: transformedProjects,
        activities: mockActivities
      });

    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error loading dashboard</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your project management dashboard</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats 
        projectStats={dashboardData.projectStats} 
        loading={loading} 
      />

      {/* Project Progress Chart */}
      <div>
        <ProjectProgressChart 
          projects={dashboardData.projects} 
          loading={loading} 
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity 
          activities={dashboardData.activities} 
          loading={loading} 
        />
        
        {/* Additional Widget - Task Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Tasks</span>
              <span className="font-semibold">{dashboardData.projectStats.totalTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{dashboardData.projectStats.completedTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">{dashboardData.projectStats.overdueTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-semibold text-blue-600">{dashboardData.projectStats.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 