import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlertCircle, Clock, Play, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { taskService, CreateTaskData, UpdateTaskData, Task } from '@/services/taskService';
import { userService, User as UserType } from '@/services/userService';
import timeTrackingService, { TimeEntry } from '@/services/timeTrackingService';
import CommentsSection from './CommentsSection';
import LoadingSpinner from './LoadingSpinner';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task | null;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  task,
  onTaskCreated,
  onTaskUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState<UserType[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    type: 'TASK',
    storyPoints: undefined,
    dueDate: '',
    assigneeId: undefined,
    parentTaskId: undefined
  });

  useEffect(() => {
    if (isOpen) {
      console.log('Loading project members for projectId:', projectId);
      loadProjectMembers();
      if (task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          type: task.type,
          storyPoints: task.storyPoints,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          assigneeId: task.assigneeId || undefined,
          parentTaskId: task.parentTaskId || undefined
        });
        loadTimeEntries();
        checkActiveTimeEntry();
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
          type: 'TASK',
          storyPoints: undefined,
          dueDate: '',
          assigneeId: undefined,
          parentTaskId: undefined
        });
      }
    }
  }, [isOpen, task, projectId]);

  const loadTimeEntries = async () => {
    if (!task?.id) return;
    
    try {
      const entries = await timeTrackingService.getTimeEntriesForTask(task.id);
      setTimeEntries(entries);
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  };

  const checkActiveTimeEntry = async () => {
    try {
      const activeEntry = await timeTrackingService.getActiveTimeEntry();
      setActiveTimeEntry(activeEntry);
      setIsTracking(activeEntry?.taskId === task?.id);
    } catch (error) {
      console.error('Failed to check active time entry:', error);
    }
  };

  const handleStartTimeTracking = async () => {
    if (!task?.id) return;
    
    try {
      const timeEntry = await timeTrackingService.startTimeTracking({
        taskId: task.id,
        description: `Working on: ${task.title}`
      });
      setActiveTimeEntry(timeEntry);
      setIsTracking(true);
      toast.success('Time tracking started');
    } catch (error: any) {
      if (error.response?.data?.error === 'ACTIVE_TIMER_EXISTS') {
        toast.error('You already have an active timer. Please stop it first.');
      } else {
        toast.error('Failed to start time tracking');
      }
    }
  };

  const handleStopTimeTracking = async () => {
    if (!activeTimeEntry) return;
    
    try {
      await timeTrackingService.stopTimeTracking({
        timeEntryId: activeTimeEntry.id
      });
      setActiveTimeEntry(null);
      setIsTracking(false);
      loadTimeEntries(); // Refresh time entries
      toast.success('Time tracking stopped');
    } catch (error) {
      toast.error('Failed to stop time tracking');
    }
  };

  const loadProjectMembers = async () => {
    try {
      console.log('Fetching project members for projectId:', projectId);
      
      if (!projectId) {
        console.log('No projectId provided, skipping member loading');
        setProjectMembers([]);
        return;
      }
      
      // Get project members using the role service
      const response = await fetch(`/api/roles/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Project members data:', data);
        setProjectMembers(data.data.members || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load project members:', errorData);
        setProjectMembers([]);
      }
    } catch (error) {
      console.error('Failed to load project members:', error);
      setProjectMembers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Project ID:', projectId);
    console.log('Form data:', formData);
    console.log('Task exists:', !!task);
    
    if (!projectId) {
      console.error('No project ID provided');
      toast.error('No project selected. Please select a project first.');
      return;
    }
    
    setLoading(true);

    try {
      if (task) {
        // Update existing task
        const updatedTask = await taskService.updateTask(task.id, formData);
        onTaskUpdated?.(updatedTask);
        toast.success('Task updated successfully');
      } else {
        // Create new task
        console.log('Creating new task...');
        console.log('Calling taskService.createTask with:', { projectId, formData });
        const newTask = await taskService.createTask(projectId, formData);
        console.log('Task created successfully:', newTask);
        onTaskCreated?.(newTask);
        toast.success('Task created successfully');
      }
      onClose();
    } catch (error: any) {
      console.error('Task operation failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!projectId && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">No Project Selected</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Please select a project first before creating a task.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter task description"
            />
          </div>

          {/* Status, Priority, and Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="STORY">Story</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>
          </div>

          {/* Story Points and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Story Points */}
            <div>
              <label htmlFor="storyPoints" className="block text-sm font-medium text-gray-700 mb-2">
                Story Points
              </label>
              <input
                type="number"
                id="storyPoints"
                name="storyPoints"
                value={formData.storyPoints || ''}
                onChange={handleInputChange}
                min="1"
                max="21"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1-21"
              />
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>
            <div className="relative">
              <select
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {projectMembers.length > 0 ? (
                  projectMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading members...</option>
                )}
              </select>
              <User className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {projectMembers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {!projectId ? 'Please select a project first' : 'No project members found'}
              </p>
            )}
          </div>

          {/* Parent Task */}
          <div>
            <label htmlFor="parentTaskId" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Task (Optional)
            </label>
            <select
              id="parentTaskId"
              name="parentTaskId"
              value={formData.parentTaskId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">No Parent Task</option>
              {/* This would be populated with available parent tasks */}
            </select>
          </div>

          {/* Time Tracking Section - Only show for existing tasks */}
          {task && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Time Tracking</h3>
                <div className="flex items-center space-x-2">
                  {!isTracking ? (
                    <button
                      type="button"
                      onClick={handleStartTimeTracking}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Timer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopTimeTracking}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-1"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop Timer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Time Entries Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Time Entries</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {timeEntries.length} entries
                  </span>
                </div>

                {timeEntries.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {timeEntries.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-600">
                            {new Date(entry.startTime).toLocaleDateString()}
                          </span>
                          {entry.description && (
                            <span className="text-gray-500 ml-2">- {entry.description}</span>
                          )}
                        </div>
                        <span className="text-gray-700 font-medium">
                          {timeTrackingService.formatDuration(entry.duration || 0)}
                        </span>
                      </div>
                    ))}
                    {timeEntries.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{timeEntries.length - 3} more entries
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    No time entries recorded
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          {task && (
            <div className="border-t border-gray-200 pt-6">
              <CommentsSection 
                taskId={task.id} 
                onCommentAdded={() => {
                  // Optionally refresh task data or update UI
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !projectId}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              onClick={() => {
                console.log('Submit button clicked');
                console.log('Loading:', loading);
                console.log('Title:', formData.title);
                console.log('Title trimmed:', formData.title.trim());
                console.log('Project ID:', projectId);
                console.log('Form data:', formData);
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{task ? 'Update Task' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 