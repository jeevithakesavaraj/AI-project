import React from 'react';
import { Users, FolderOpen, CheckCircle, Clock, TrendingUp, AlertTriangle, Target, Award } from 'lucide-react';

interface DashboardStatsProps {
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
  loading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ projectStats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="card p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded-full w-1/2"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Projects',
      value: projectStats.totalProjects,
      icon: FolderOpen,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      description: 'All projects'
    },
    {
      title: 'Active Projects',
      value: projectStats.activeProjects,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      description: 'In progress'
    },
    {
      title: 'Total Tasks',
      value: projectStats.totalTasks,
      icon: CheckCircle,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      description: 'All tasks'
    },
    {
      title: 'Completed Tasks',
      value: projectStats.completedTasks,
      icon: Award,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      description: 'Finished'
    },
    {
      title: 'Overdue Tasks',
      value: projectStats.overdueTasks,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      description: 'Past deadline'
    },
    {
      title: 'Total Users',
      value: projectStats.totalUsers,
      icon: Users,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
      description: 'Team members'
    },
    {
      title: 'Completion Rate',
      value: `${projectStats.completionRate}%`,
      icon: Target,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      description: 'Success rate'
    },
    {
      title: 'Completed Projects',
      value: projectStats.completedProjects,
      icon: CheckCircle,
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100',
      description: 'Finished projects'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="card p-6 hover-lift group cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gradient-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.bgGradient} border border-white/50 shadow-soft group-hover:shadow-medium transition-all duration-300`}>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            {/* Progress indicator for completion rate */}
            {stat.title === 'Completion Rate' && (
              <div className="mt-4">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${projectStats.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {projectStats.completionRate >= 80 ? 'Excellent' : 
                   projectStats.completionRate >= 60 ? 'Good' : 
                   projectStats.completionRate >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats; 