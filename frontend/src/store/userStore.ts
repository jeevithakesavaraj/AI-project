import { create } from 'zustand'
import { userService, UserStats } from '@/services/userService'
import { User } from '@/store/authStore'

interface UserState {
  users: User[]
  selectedUser: User | null
  stats: UserStats | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    search: string
    role: string
    isActive: boolean | null
  }
  isLoading: boolean
  error: string | null
}

interface UserActions {
  // Fetch users
  fetchUsers: (params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    isActive?: boolean
  }) => Promise<void>

  // Fetch user by ID
  fetchUserById: (id: string) => Promise<void>

  // Create user
  createUser: (data: {
    name: string
    email: string
    password: string
    role?: 'ADMIN' | 'MANAGER' | 'USER'
    avatar?: string
  }) => Promise<void>

  // Update user
  updateUser: (id: string, data: {
    name?: string
    email?: string
    role?: 'ADMIN' | 'MANAGER' | 'USER'
    avatar?: string
    isActive?: boolean
  }) => Promise<void>

  // Change user password
  changeUserPassword: (id: string, newPassword: string) => Promise<void>

  // Delete user
  deleteUser: (id: string) => Promise<void>

  // Fetch user stats
  fetchUserStats: () => Promise<void>

  // Set selected user
  setSelectedUser: (user: User | null) => void

  // Update filters
  updateFilters: (filters: Partial<{
    search: string
    role: string
    isActive: boolean | null
  }>) => void

  // Clear error
  clearError: () => void

  // Set loading
  setLoading: (loading: boolean) => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>((set, get) => ({
  // State
  users: [],
  selectedUser: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    role: '',
    isActive: null,
  },
  isLoading: false,
  error: null,

  // Actions
  fetchUsers: async (params = {}) => {
    try {
      set({ isLoading: true, error: null })
      const response = await userService.getUsers({
        page: get().pagination.page,
        limit: get().pagination.limit,
        search: get().filters.search,
        role: get().filters.role,
        isActive: get().filters.isActive,
        ...params,
      })
      set({
        users: response.data.users,
        pagination: response.data.pagination,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch users',
      })
      throw error
    }
  },

  fetchUserById: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      const response = await userService.getUserById(id)
      set({
        selectedUser: response.data.user,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch user',
      })
      throw error
    }
  },

  createUser: async (data) => {
    try {
      set({ isLoading: true, error: null })
      await userService.createUser(data)
      // Refresh users list
      await get().fetchUsers()
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create user',
      })
      throw error
    }
  },

  updateUser: async (id: string, data) => {
    try {
      set({ isLoading: true, error: null })
      await userService.updateUser(id, data)
      // Refresh users list
      await get().fetchUsers()
      // Update selected user if it's the same user
      if (get().selectedUser?.id === id) {
        await get().fetchUserById(id)
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update user',
      })
      throw error
    }
  },

  changeUserPassword: async (id: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null })
      await userService.changeUserPassword(id, newPassword)
      set({ isLoading: false, error: null })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to change password',
      })
      throw error
    }
  },

  deleteUser: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      await userService.deleteUser(id)
      // Refresh users list
      await get().fetchUsers()
      // Clear selected user if it's the same user
      if (get().selectedUser?.id === id) {
        set({ selectedUser: null })
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete user',
      })
      throw error
    }
  },

  fetchUserStats: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await userService.getUserStats()
      set({
        stats: response.data.stats,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch user stats',
      })
      throw error
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user })
  },

  updateFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page when filters change
    }))
  },

  clearError: () => {
    set({ error: null })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },
})) 