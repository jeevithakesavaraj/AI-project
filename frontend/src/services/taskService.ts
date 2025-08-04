import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const parsedToken = JSON.parse(token)
        if (parsedToken.state?.token) {
          config.headers.Authorization = `Bearer ${parsedToken.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
);

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'TASK' | 'BUG' | 'STORY' | 'EPIC';
  storyPoints?: number;
  dueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeAvatar?: string;
  creatorName?: string;
  parentTaskId?: string;
  parentTaskTitle?: string;
  projectId: string;
  projectName?: string;
  subtaskCount: number;
  completedSubtasks: number;
  subtasks?: SubTask[];
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type?: 'TASK' | 'BUG' | 'STORY' | 'EPIC';
  storyPoints?: number;
  dueDate?: string;
  assigneeId?: string | undefined;
  parentTaskId?: string | undefined;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type?: 'TASK' | 'BUG' | 'STORY' | 'EPIC';
  storyPoints?: number;
  dueDate?: string;
  assigneeId?: string | undefined;
  parentTaskId?: string | undefined;
}

export interface TaskFilters {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  projectId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  doneTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Functions
export const taskService = {
  // Get all tasks
  async getTasks(filters: TaskFilters = {}): Promise<TaskListResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.type) params.append('type', filters.type);
    if (filters.assigneeId) params.append('assigneeId', filters.assigneeId);
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data.data;
  },

  // Get task by ID
  async getTaskById(taskId: string): Promise<Task> {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data.data.task;
  },

  // Create new task
  async createTask(projectId: string, data: CreateTaskData): Promise<Task> {
    const response = await api.post(`/tasks/projects/${projectId}`, data);
    return response.data.data.task;
  },

  // Update task
  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data.data.task;
  },

  // Delete task
  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  // Get task statistics
  async getTaskStats(projectId?: string): Promise<{
    stats: TaskStats;
    statusBreakdown: Array<{ status: string; count: number }>;
    priorityBreakdown: Array<{ priority: string; count: number }>;
  }> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);

    const response = await api.get(`/tasks/stats?${params.toString()}`);
    return response.data.data;
  },
}; 