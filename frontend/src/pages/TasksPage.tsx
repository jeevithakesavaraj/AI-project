import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc, Calendar, User, AlertCircle, CheckCircle, Clock, Eye, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { taskService, Task, TaskFilters, TaskStats } from '@/services/taskService';
import TaskModal from '@/components/TaskModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import AddProjectMemberModal from '@/components/AddProjectMemberModal';
import { useAuthStore } from '@/store/authStore';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedProjectForMember, setSelectedProjectForMember] = useState<{id: string, name: string} | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([]);
  
  // Get current user
  const { user } = useAuthStore();

  useEffect(() => {
    console.log('TasksPage useEffect triggered');
    loadTasks();
    loadStats();
    loadProjects();
  }, [filters]);

  // Load projects on component mount
  useEffect(() => {
    console.log('TasksPage component mounted, loading projects...');
    loadProjects();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getTasks(filters);
      setTasks(response.tasks);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await taskService.getTaskStats();
      setStats(response.stats);
    } catch (err: any) {
      console.error('Failed to fetch task stats:', err);
    }
  };

  const loadProjects = async () => {
    try {
      console.log('Loading projects...');
      
      // Get auth token
      const authStorage = localStorage.getItem('auth-storage');
      const parsedAuth = JSON.parse(authStorage || '{}');
      const token = parsedAuth.state?.token;
      
      console.log('Auth token exists:', !!token);
      
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Projects response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Projects data:', data);
        console.log('Number of projects:', data.data.projects?.length || 0);
        setProjects(data.data.projects || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load projects:', errorData);
        toast.error('Failed to load projects. Please try again.');
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects. Please check your connection.');
      setProjects([]);
    }
  };

  const handleCreateTask = async (task: Task) => {
    setTasks(prev => [task, ...prev]);
    await loadStats();
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    await loadStats();
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await taskService.deleteTask(taskToDelete.id);
      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
      await loadStats();
      toast.success('Task deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      toast.error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TASK':
        return 'bg-blue-100 text-blue-800';
      case 'BUG':
        return 'bg-red-100 text-red-800';
      case 'STORY':
        return 'bg-green-100 text-green-800';
      case 'EPIC':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === 'DONE') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading && tasks.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tasks</h1>
          <p className="text-gray-600">Manage and track your project tasks</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Select Project"
          >
            <option value="">Select a project to create tasks</option>
            {projects.length > 0 ? (
              projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading projects... ({projects.length} found)</option>
            )}
          </select>
          {projects.length === 0 && (
            <div className="text-sm text-gray-500 mt-1">
              <p>No projects found. Please create a project first.</p>
              {user?.role === 'MANAGER' && (
                <button
                  onClick={() => {
                    // For now, we'll show a message to create projects first
                    toast.info('Please create a project first, then you can add members to it.');
                  }}
                  className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Users className="w-3 h-3" />
                  <span>Add Members to Project</span>
                </button>
              )}
              {user?.role === 'USER' && (
                <p className="text-xs text-orange-600 mt-1">
                  You don't have access to any projects. Please ask a Project Manager to add you to a project.
                </p>
              )}
            </div>
          )}
          {projects.length > 0 && !selectedProjectId && (
            <div className="text-sm text-blue-600 mt-1">
              <p>Please select a project above to create tasks</p>
              {user?.role === 'MANAGER' && (
                <div className="mt-2 space-y-2">
                  <select
                    onChange={(e) => {
                      const project = projects.find(p => p.id === e.target.value);
                      if (project) {
                        setSelectedProjectForMember(project);
                        setIsAddMemberModalOpen(true);
                      }
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select project to add members...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          {/* Debug info */}
          <div className="text-xs text-gray-400 mt-1">
            Debug: {projects.length} projects loaded
          </div>
          <button
            onClick={() => {
              if (!selectedProjectId) {
                toast.error('Please select a project first to create a task');
                return;
              }
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            disabled={!selectedProjectId}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.doneTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-900">{stats.inProgressTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-600 font-medium">High Priority</p>
                <p className="text-2xl font-bold text-orange-900">{stats.highPriorityTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange({ search: e.target.value });
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange({ status: e.target.value || undefined });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                handleFilterChange({ priority: e.target.value || undefined });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                handleFilterChange({ type: e.target.value || undefined });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="TASK">Task</option>
              <option value="BUG">Bug</option>
              <option value="STORY">Story</option>
              <option value="EPIC">Epic</option>
            </select>

            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange({ sortBy, sortOrder: sortOrder as 'ASC' | 'DESC' });
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="title-ASC">Title A-Z</option>
              <option value="title-DESC">Title Z-A</option>
              <option value="due_date-ASC">Due Date</option>
              <option value="priority-DESC">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tasks ({pagination.total})
          </h3>
        </div>

        {error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadTasks}
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tasks found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                      {isOverdue(task.dueDate!, task.status) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(task.type)}`}>
                        {task.type}
                      </span>
                      {task.storyPoints && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {task.storyPoints} SP
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {task.projectName && (
                        <span className="flex items-center">
                          <span className="mr-1">Project:</span>
                          {task.projectName}
                        </span>
                      )}
                      {task.assigneeName && (
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {task.assigneeName}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.subtaskCount > 0 && (
                        <span className="flex items-center">
                          <span className="mr-1">Subtasks:</span>
                          {task.completedSubtasks}/{task.subtaskCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        projectId={selectedTask?.projectId || selectedProjectId} // Use projectId from selected task or selected project
        task={selectedTask}
        onTaskCreated={handleCreateTask}
        onTaskUpdated={handleUpdateTask}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Add Project Member Modal */}
      {selectedProjectForMember && (
        <AddProjectMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => {
            setIsAddMemberModalOpen(false);
            setSelectedProjectForMember(null);
          }}
          projectId={selectedProjectForMember.id}
          projectName={selectedProjectForMember.name}
          onMemberAdded={() => {
            // Reload projects after adding a member
            loadProjects();
          }}
        />
      )}
    </div>
  );
};

export default TasksPage; 