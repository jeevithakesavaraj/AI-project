import axios from 'axios';

const API_BASE_URL = '/api/time-tracking';

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  taskTitle?: string;
  projectName?: string;
  userName?: string;
  userAvatar?: string;
}

export interface TimeAnalytics {
  summary: {
    totalEntries: number;
    totalDuration: number;
    totalTasks: number;
    totalProjects: number;
  };
  projectStats: Array<{
    projectId: string;
    projectName: string;
    totalDuration: number;
    taskCount: number;
  }>;
  taskStats: Array<{
    taskId: string;
    taskTitle: string;
    projectName: string;
    totalDuration: number;
    entryCount: number;
    avgDuration: number;
  }>;
  detailedEntries: any[];
}

export interface StartTimeTrackingData {
  taskId: string;
  description?: string;
}

export interface StopTimeTrackingData {
  timeEntryId: string;
  endTime?: string;
}

export interface AddTimeEntryData {
  taskId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface UpdateTimeEntryData {
  taskId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface TimeEntryFilters {
  startDate?: string;
  endDate?: string;
  taskId?: string;
  projectId?: string;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

class TimeTrackingService {
  // Get time entries for a specific task
  async getTimeEntriesForTask(taskId: string): Promise<TimeEntry[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/task/${taskId}`);
      return response.data.data.timeEntries;
    } catch (error) {
      console.error('Error fetching time entries for task:', error);
      throw error;
    }
  }

  // Get current user's time entries
  async getMyTimeEntries(filters?: TimeEntryFilters): Promise<TimeEntry[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.taskId) params.append('taskId', filters.taskId);
      if (filters?.projectId) params.append('projectId', filters.projectId);

      const response = await axios.get(`${API_BASE_URL}/my-entries?${params}`);
      return response.data.data.timeEntries;
    } catch (error) {
      console.error('Error fetching my time entries:', error);
      throw error;
    }
  }

  // Get active time entry for current user
  async getActiveTimeEntry(): Promise<TimeEntry | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/active`);
      return response.data.data.activeEntry;
    } catch (error) {
      console.error('Error fetching active time entry:', error);
      throw error;
    }
  }

  // Get time tracking analytics
  async getTimeAnalytics(filters?: AnalyticsFilters): Promise<TimeAnalytics> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.projectId) params.append('projectId', filters.projectId);

      const response = await axios.get(`${API_BASE_URL}/analytics?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching time analytics:', error);
      throw error;
    }
  }

  // Start time tracking
  async startTimeTracking(data: StartTimeTrackingData): Promise<TimeEntry> {
    try {
      const response = await axios.post(`${API_BASE_URL}/start`, data);
      return response.data.data.timeEntry;
    } catch (error) {
      console.error('Error starting time tracking:', error);
      throw error;
    }
  }

  // Stop time tracking
  async stopTimeTracking(data: StopTimeTrackingData): Promise<TimeEntry> {
    try {
      const response = await axios.post(`${API_BASE_URL}/stop`, data);
      return response.data.data.timeEntry;
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      throw error;
    }
  }

  // Add manual time entry
  async addTimeEntry(data: AddTimeEntryData): Promise<TimeEntry> {
    try {
      const response = await axios.post(`${API_BASE_URL}`, data);
      return response.data.data.timeEntry;
    } catch (error) {
      console.error('Error adding time entry:', error);
      throw error;
    }
  }

  // Update time entry
  async updateTimeEntry(timeEntryId: string, data: UpdateTimeEntryData): Promise<TimeEntry> {
    try {
      const response = await axios.put(`${API_BASE_URL}/${timeEntryId}`, data);
      return response.data.data.timeEntry;
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  }

  // Delete time entry
  async deleteTimeEntry(timeEntryId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/${timeEntryId}`);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  }

  // Utility function to format duration (converts minutes to seconds for display)
  formatDuration(minutes: number): string {
    const totalSeconds = minutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${remainingSeconds}s`;
    } else if (mins > 0) {
      return `${mins}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  // Utility function to format duration for display (converts minutes to seconds)
  formatDurationShort(minutes: number): string {
    const totalSeconds = minutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  }

  // Utility function to calculate elapsed time
  calculateElapsedTime(startTime: string): number {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / 1000);
  }
}

export default new TimeTrackingService(); 