import React from 'react';
import { FolderOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  dueDate?: string;
}

interface ProjectProgressChartProps {
  projects: Project[];
  loading?: boolean;
}

const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({ projects, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ARCHIVED':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return Clock;
      case 'COMPLETED':
        return CheckCircle;
      case 'ARCHIVED':
        return FolderOpen;
      default:
        return Clock;
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        <span className="text-sm text-gray-500">{projects.length} projects</span>
      </div>
      
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : (
          projects.map((project) => {
            const StatusIcon = getStatusIcon(project.status);
            const overdue = isOverdue(project.dueDate);
            
            return (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full border ${getStatusColor(project.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                        {overdue && (
                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            <span>Overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">{project.progress}%</span>
                    <div className="text-xs text-gray-500 capitalize">{project.status.toLowerCase()}</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                
                {project.dueDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectProgressChart; 