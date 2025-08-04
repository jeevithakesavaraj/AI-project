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
export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  isActive: boolean;
}

export interface AddProjectMemberData {
  userId: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface UpdateProjectMemberRoleData {
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export interface UpdateUserRoleData {
  role: 'ADMIN' | 'USER';
}

// API Functions
export const roleService = {
  // Update user role (Admin only)
  async updateUserRole(userId: string, data: UpdateUserRoleData): Promise<{ userId: string; role: string }> {
    const response = await api.put(`/roles/users/${userId}`, data);
    return response.data.data;
  },

  // Get project members
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await api.get(`/roles/projects/${projectId}/members`);
    return response.data.data.members;
  },

  // Add project member
  async addProjectMember(projectId: string, data: AddProjectMemberData): Promise<{
    userId: string;
    userName: string;
    role: string;
  }> {
    const response = await api.post(`/roles/projects/${projectId}/members`, data);
    return response.data.data;
  },

  // Update project member role
  async updateProjectMemberRole(projectId: string, memberId: string, data: UpdateProjectMemberRoleData): Promise<{
    memberId: string;
    role: string;
  }> {
    const response = await api.put(`/roles/projects/${projectId}/members/${memberId}`, data);
    return response.data.data;
  },

  // Remove project member
  async removeProjectMember(projectId: string, memberId: string): Promise<void> {
    await api.delete(`/roles/projects/${projectId}/members/${memberId}`);
  },
}; 