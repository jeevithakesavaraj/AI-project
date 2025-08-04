import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Calendar } from 'lucide-react';
import timeTrackingService, { TimeAnalytics } from '../services/timeTrackingService';

interface TimeTrackingAnalyticsProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
  };
}

const TimeTrackingAnalytics: React.FC<TimeTrackingAnalyticsProps> = ({ filters }) => {
  const [analytics, setAnalytics] = useState<TimeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await timeTrackingService.getTimeAnalytics(filters);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No analytics data available</p>
      </div>
    );
  }

  const { summary, projectStats, taskStats } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-6 w-6 text-gray-500" />
        <h3 className="text-lg font-medium text-gray-900">Time Tracking Analytics</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {timeTrackingService.formatDurationShort(summary.totalDuration)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-500">Entries</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {summary.totalEntries}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-500">Tasks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {summary.totalTasks}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-500">Projects</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {summary.totalProjects}
          </p>
        </div>
      </div>

      {/* Project Statistics */}
      {projectStats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Time by Project</h4>
          <div className="space-y-3">
            {projectStats.map((project) => (
              <div key={project.projectId} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{project.projectName}</p>
                  <p className="text-sm text-gray-500">{project.taskCount} tasks</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">
                    {timeTrackingService.formatDurationShort(project.totalDuration)}
                  </p>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (project.totalDuration / summary.totalDuration) * 100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Statistics */}
      {taskStats.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Top Tasks</h4>
          <div className="space-y-3">
            {taskStats.slice(0, 10).map((task) => (
              <div key={task.taskId} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.taskTitle}</p>
                  <p className="text-sm text-gray-500">{task.projectName}</p>
                  <p className="text-xs text-gray-400">{task.entryCount} entries</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">
                    {timeTrackingService.formatDurationShort(task.totalDuration)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {timeTrackingService.formatDurationShort(task.avgDuration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projectStats.length === 0 && taskStats.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No time tracking data available</p>
          <p className="text-sm">Start tracking time to see analytics</p>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingAnalytics; 