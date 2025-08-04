import axios from 'axios';

// Types
export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'TASK' | 'BUG' | 'FEATURE' | 'STORY';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  position: number;
  projectId: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface KanbanBoard {
  projectId: string;
  columns: {
    TODO: KanbanTask[];
    IN_PROGRESS: KanbanTask[];
    IN_REVIEW: KanbanTask[];
    DONE: KanbanTask[];
  };
}

export interface ProjectProgress {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  taskCounts: {
    TODO?: number;
    IN_PROGRESS?: number;
    IN_REVIEW?: number;
    DONE?: number;
  };
  recentActivity: Array<{
    title: string;
    status: string;
    updated_at: string;
    updated_by?: string;
  }>;
}

export interface TaskProgress {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate?: string;
    assignee?: {
      id: string;
      name: string;
      email: string;
    };
  };
  timeTracking: {
    totalHours: number;
    entries: Array<{
      id: string;
      start_time: string;
      end_time?: string;
      description?: string;
      user_name: string;
    }>;
  };
}

// API functions
export const getKanbanBoard = async (projectId: string): Promise<KanbanBoard> => {
  try {
    const response = await axios.get(`/api/kanban/projects/${projectId}/kanban`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch Kanban board:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: string, position?: number): Promise<void> => {
  try {
    const payload: any = { status };
    if (position !== undefined) {
      payload.position = position;
    }
    
    await axios.put(`/api/kanban/tasks/${taskId}/status`, payload);
  } catch (error) {
    console.error('Failed to update task status:', error);
    throw error;
  }
};

export const updateTaskPosition = async (taskId: string, status: string, position: number): Promise<void> => {
  try {
    await axios.put(`/api/kanban/tasks/${taskId}/position`, {
      status,
      position
    });
  } catch (error) {
    console.error('Failed to update task position:', error);
    throw error;
  }
};

export const getProjectProgress = async (projectId: string): Promise<ProjectProgress> => {
  try {
    const response = await axios.get(`/api/kanban/projects/${projectId}/progress`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch project progress:', error);
    throw error;
  }
};

export const getTaskProgress = async (taskId: string): Promise<TaskProgress> => {
  try {
    const response = await axios.get(`/api/kanban/tasks/${taskId}/progress`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch task progress:', error);
    throw error;
  }
};

// Utility functions
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'TODO':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_REVIEW':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DONE':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatDueDate = (dueDate?: string): string => {
  if (!dueDate) return '';
  
  const date = new Date(dueDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} days`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else {
    return `Due in ${diffDays} days`;
  }
};

export const getColumnTitle = (status: string): string => {
  switch (status) {
    case 'TODO':
      return 'To Do';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'IN_REVIEW':
      return 'In Review';
    case 'DONE':
      return 'Done';
    default:
      return status;
  }
};

export default {
  getKanbanBoard,
  updateTaskStatus,
  updateTaskPosition,
  getProjectProgress,
  getTaskProgress,
  getPriorityColor,
  getStatusColor,
  formatDueDate,
  getColumnTitle
}; 