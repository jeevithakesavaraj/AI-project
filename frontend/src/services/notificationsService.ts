import axios from 'axios';

// Types
export interface Notification {
  id: string;
  type: 'COMMENT' | 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'PROJECT_INVITE' | 'MENTION';
  title: string;
  message: string;
  data?: any;
  readAt?: string;
  createdAt: string;
}

export interface NotificationCount {
  count: number;
}

// API functions
export const getNotifications = async (unreadOnly = false, limit = 50): Promise<Notification[]> => {
  try {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unreadOnly', 'true');
    if (limit) params.append('limit', limit.toString());

    const response = await axios.get(`/api/notifications?${params.toString()}`);
    return response.data.data.notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

export const getNotificationCount = async (): Promise<number> => {
  try {
    const response = await axios.get('/api/notifications/count');
    return response.data.data.count;
  } catch (error) {
    console.error('Failed to fetch notification count:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await axios.put(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await axios.put('/api/notifications/read-all');
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await axios.delete(`/api/notifications/${notificationId}`);
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};

// Utility functions
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'COMMENT':
      return '💬';
    case 'TASK_ASSIGNED':
      return '📋';
    case 'TASK_UPDATED':
      return '✏️';
    case 'PROJECT_INVITE':
      return '📁';
    case 'MENTION':
      return '👤';
    default:
      return '🔔';
  }
};

export const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'COMMENT':
      return 'text-blue-600';
    case 'TASK_ASSIGNED':
      return 'text-green-600';
    case 'TASK_UPDATED':
      return 'text-yellow-600';
    case 'PROJECT_INVITE':
      return 'text-purple-600';
    case 'MENTION':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
};

export default {
  getNotifications,
  getNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  formatNotificationDate,
  getNotificationIcon,
  getNotificationColor
}; 