import axios from 'axios'
import { User } from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
)

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role?: 'ADMIN' | 'MANAGER' | 'USER'
  avatar?: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: 'ADMIN' | 'MANAGER' | 'USER'
  avatar?: string
  isActive?: boolean
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: Record<string, number>
  recentRegistrations: number
}

export interface UsersResponse {
  success: boolean
  data: {
    users: User[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface UserResponse {
  success: boolean
  data: {
    user: User
  }
}

export interface UserStatsResponse {
  success: boolean
  data: {
    stats: UserStats
  }
}

export const userService = {
  // Get all users with pagination and filtering
  getUsers: async (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    isActive?: boolean
  }): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/users', { params })
    return response.data
  },

  // Get user by ID
  getUserById: async (id: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${id}`)
    return response.data
  },

  // Create new user
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/users', data)
    return response.data
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${id}`, data)
    return response.data
  },

  // Change user password
  changeUserPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch<{ success: boolean; message: string }>(`/users/${id}/password`, {
      newPassword,
    })
    return response.data
  },

  // Delete user (soft delete)
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`)
    return response.data
  },

  // Get user statistics
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await api.get<UserStatsResponse>('/users/stats')
    return response.data
  },
} 