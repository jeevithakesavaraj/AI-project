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
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  progress: number;
  taskCount: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  members?: ProjectMember[];
  activities?: ProjectActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

export interface ProjectActivity {
  type: string;
  id: string;
  title: string;
  status: string;
  createdAt: string;
  userName: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
  members?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
  avgCompletionRate: number;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Functions
export const projectService = {
  // Get all projects
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectListResponse> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/projects?${params.toString()}`);
    return response.data.data;
  },

  // Get project by ID
  async getProjectById(projectId: string): Promise<Project> {
    const response = await api.get(`/projects/${projectId}`);
    return response.data.data.project;
  },

  // Create new project
  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data.data.project;
  },

  // Update project
  async updateProject(projectId: string, data: UpdateProjectData): Promise<Project> {
    const response = await api.put(`/projects/${projectId}`, data);
    return response.data.data.project;
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  // Get project statistics
  async getProjectStats(): Promise<{
    stats: ProjectStats;
    statusBreakdown: Array<{ status: string; count: number }>;
    recentProjects: Array<{ id: string; name: string; status: string; createdAt: string }>;
  }> {
    const response = await api.get('/projects/stats');
    return response.data.data;
  },
}; 