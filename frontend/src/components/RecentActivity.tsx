import React from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  FolderOpen, 
  MessageSquare,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface Activity {
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
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'project_updated':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'project_deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'task_created':
        return <Plus className="w-4 h-4 text-purple-600" />;
      case 'task_updated':
        return <Edit className="w-4 h-4 text-orange-600" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'user_joined':
        return <User className="w-4 h-4 text-indigo-600" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project_created':
      case 'task_completed':
        return 'bg-green-50 border-green-200';
      case 'project_updated':
      case 'task_updated':
        return 'bg-blue-50 border-blue-200';
      case 'project_deleted':
        return 'bg-red-50 border-red-200';
      case 'task_created':
        return 'bg-purple-50 border-purple-200';
      case 'user_joined':
        return 'bg-indigo-50 border-indigo-200';
      case 'comment_added':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-sm text-gray-500">{activities.length} activities</span>
      </div>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3" />
                    <span>{activity.user.name}</span>
                    {activity.project && (
                      <>
                        <span>•</span>
                        <FolderOpen className="w-3 h-3" />
                        <span>{activity.project.name}</span>
                      </>
                    )}
                    {activity.task && (
                      <>
                        <span>•</span>
                        <CheckCircle className="w-3 h-3" />
                        <span>{activity.task.name}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity; 