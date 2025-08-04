import React from 'react';
import { X, Calendar, DollarSign, Users, Tag, BarChart3 } from 'lucide-react';
import { Project } from '@/services/projectService';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen || !project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Header */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>

            </div>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Progress</p>
                  <p className="text-2xl font-bold text-blue-900">{project.progress}%</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Tasks</p>
                  <p className="text-2xl font-bold text-green-900">{project.taskCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-yellow-900">{project.completedTasks}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-2">
                  {project.startDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Start Date:</span>
                      <span className="ml-2 font-medium">{formatDate(project.startDate)}</span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">End Date:</span>
                      <span className="ml-2 font-medium">{formatDate(project.endDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Task Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">{project.completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-medium text-yellow-600">{project.inProgressTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">To Do</span>
                    <span className="font-medium text-gray-600">{project.todoTasks}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{project.progress}% complete</p>
              </div>
            </div>
          </div>

          {/* Project Members */}
          {project.members && project.members.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium mr-3">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activities */}
          {project.activities && project.activities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activities</h3>
              <div className="space-y-2">
                {project.activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.userName}</span> {activity.type === 'task' ? 'created' : 'updated'} task "{activity.title}"
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal; 