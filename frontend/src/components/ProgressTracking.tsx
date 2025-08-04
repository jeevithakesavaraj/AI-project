import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProjectProgress, TaskProgress, getProjectProgress, getTaskProgress } from '@/services/kanbanService';

interface ProgressTrackingProps {
  projectId: string;
  taskId?: string;
  onProgressUpdate?: () => void;
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({ 
  projectId, 
  taskId, 
  onProgressUpdate 
}) => {
  const [projectProgress, setProjectProgress] = useState<ProjectProgress | null>(null);
  const [taskProgress, setTaskProgress] = useState<TaskProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'project' | 'task'>('project');

  useEffect(() => {
    if (taskId) {
      setActiveTab('task');
      loadTaskProgress();
    } else {
      setActiveTab('project');
      loadProjectProgress();
    }
  }, [projectId, taskId]);

  const loadProjectProgress = async () => {
    try {
      setLoading(true);
      const progress = await getProjectProgress(projectId);
      setProjectProgress(progress);
    } catch (error) {
      console.error('Failed to load project progress:', error);
      toast.error('Failed to load project progress');
    } finally {
      setLoading(false);
    }
  };

  const loadTaskProgress = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      const progress = await getTaskProgress(taskId);
      setTaskProgress(progress);
    } catch (error) {
      console.error('Failed to load task progress:', error);
      toast.error('Failed to load task progress');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('project')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'project'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Project Progress
        </button>
        {taskId && (
          <button
            onClick={() => setActiveTab('task')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'task'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Task Progress
          </button>
        )}
      </div>

      {/* Project Progress */}
      {activeTab === 'project' && projectProgress && (
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <div className={`text-2xl font-bold ${getProgressColor(projectProgress.progressPercentage)}`}>
                {projectProgress.progressPercentage}%
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(projectProgress.progressPercentage)}`}
                style={{ width: `${projectProgress.progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{projectProgress.completedTasks} of {projectProgress.totalTasks} tasks completed</span>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          {/* Task Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {projectProgress.taskCounts.TODO || 0}
              </div>
              <div className="text-sm text-gray-500">To Do</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {projectProgress.taskCounts.IN_PROGRESS || 0}
              </div>
              <div className="text-sm text-blue-500">In Progress</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {projectProgress.taskCounts.IN_REVIEW || 0}
              </div>
              <div className="text-sm text-purple-500">In Review</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {projectProgress.taskCounts.DONE || 0}
              </div>
              <div className="text-sm text-green-500">Done</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {projectProgress.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Moved to {activity.status} • {new Date(activity.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {projectProgress.recentActivity.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Progress */}
      {activeTab === 'task' && taskProgress && (
        <div className="space-y-6">
          {/* Task Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {taskProgress.task.title}
            </h3>
            <p className="text-gray-600 mb-4">{taskProgress.task.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium text-gray-900">{taskProgress.task.status}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Priority</div>
                <div className="font-medium text-gray-900">{taskProgress.task.priority}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Assignee</div>
                <div className="font-medium text-gray-900">
                  {taskProgress.task.assignee?.name || 'Unassigned'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Time Spent</div>
                <div className="font-medium text-gray-900">{taskProgress.timeTracking.totalHours}h</div>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h4>
            <div className="space-y-3">
              {taskProgress.timeTracking.entries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.user_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.start_time).toLocaleString()} - 
                        {entry.end_time ? new Date(entry.end_time).toLocaleString() : 'Ongoing'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.description && (
                      <p className="text-xs text-gray-500">{entry.description}</p>
                    )}
                  </div>
                </div>
              ))}
              {taskProgress.timeTracking.entries.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No time entries recorded
                </div>
              )}
            </div>
          </div>

          {/* Due Date Warning */}
          {taskProgress.task.dueDate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Due Date</p>
                  <p className="text-sm text-yellow-700">
                    {new Date(taskProgress.task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressTracking; 