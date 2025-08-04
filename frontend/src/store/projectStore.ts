import { create } from 'zustand';
import { projectService, Project, CreateProjectData, UpdateProjectData, ProjectFilters, ProjectStats } from '@/services/projectService';

interface ProjectState {
  // State
  projects: Project[];
  selectedProject: Project | null;
  stats: ProjectStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ProjectFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  fetchProjectById: (projectId: string) => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<void>;
  updateProject: (projectId: string, data: UpdateProjectData) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  fetchProjectStats: () => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  updateFilters: (filters: Partial<ProjectFilters>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  error: null,

  // Actions
  fetchProjects: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectService.getProjects({
        ...get().filters,
        ...filters,
      });
      set({
        projects: response.projects,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  fetchProjectById: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      const project = await projectService.getProjectById(projectId);
      set({ selectedProject: project, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project',
        isLoading: false,
      });
    }
  },

  createProject: async (data: CreateProjectData) => {
    try {
      set({ isLoading: true, error: null });
      const newProject = await projectService.createProject(data);
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (projectId: string, data: UpdateProjectData) => {
    try {
      set({ isLoading: true, error: null });
      const updatedProject = await projectService.updateProject(projectId, data);
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p
        ),
        selectedProject: state.selectedProject?.id === projectId ? updatedProject : state.selectedProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update project',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      set({ isLoading: true, error: null });
      await projectService.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        selectedProject: state.selectedProject?.id === projectId ? null : state.selectedProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete project',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProjectStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await projectService.getProjectStats();
      set({ stats: response.stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch project statistics',
        isLoading: false,
      });
    }
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  updateFilters: (filters: Partial<ProjectFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
})); 