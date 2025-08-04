import { jest } from '@jest/globals';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  getNotificationCount 
} from '../src/controllers/notificationsController.js';

// Mock the database pool
const mockPool = {
  connect: jest.fn()
};

// Mock the request and response objects
const mockRequest = (data = {}) => ({
  params: data.params || {},
  query: data.query || {},
  body: data.body || {},
  user: data.user || { id: 'test-user-id', role: 'ADMIN' }
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock the database client
const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

describe('Notifications Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPool.connect.mockResolvedValue(mockClient);
  });

  describe('getNotifications', () => {
    it('should return notifications for user', async () => {
      const req = mockRequest({
        query: { limit: '10' },
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      // Mock database response
      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'notification-1',
            type: 'TASK_ASSIGNED',
            title: 'New Task Assignment',
            message: 'You have been assigned to a task',
            data: { taskId: 'task-1' },
            read_at: null,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 'notification-2',
            type: 'COMMENT',
            title: 'New Comment',
            message: 'Someone commented on your task',
            data: { commentId: 'comment-1' },
            read_at: '2024-01-01T01:00:00Z',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
      });

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          notifications: [
            {
              id: 'notification-1',
              type: 'TASK_ASSIGNED',
              title: 'New Task Assignment',
              message: 'You have been assigned to a task',
              data: { taskId: 'task-1' },
              readAt: null,
              createdAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 'notification-2',
              type: 'COMMENT',
              title: 'New Comment',
              message: 'Someone commented on your task',
              data: { commentId: 'comment-1' },
              readAt: '2024-01-01T01:00:00Z',
              createdAt: '2024-01-01T00:00:00Z'
            }
          ]
        }
      });
    });

    it('should filter unread notifications when unreadOnly is true', async () => {
      const req = mockRequest({
        query: { unreadOnly: 'true' },
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'notification-1',
            type: 'TASK_ASSIGNED',
            title: 'New Task Assignment',
            message: 'You have been assigned to a task',
            data: { taskId: 'task-1' },
            read_at: null,
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
      });

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          notifications: [
            {
              id: 'notification-1',
              type: 'TASK_ASSIGNED',
              title: 'New Task Assignment',
              message: 'You have been assigned to a task',
              data: { taskId: 'task-1' },
              readAt: null,
              createdAt: '2024-01-01T00:00:00Z'
            }
          ]
        }
      });
    });
  });

  describe('getNotificationCount', () => {
    it('should return unread notification count', async () => {
      const req = mockRequest({
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rows: [{ count: '5' }]
      });

      await getNotificationCount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          count: 5
        }
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const req = mockRequest({
        params: { notificationId: 'notification-1' },
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      // Mock database responses
      mockClient.query
        .mockResolvedValueOnce({
          rows: [{ id: 'notification-1' }] // Notification exists and belongs to user
        })
        .mockResolvedValueOnce({
          rowCount: 1
        });

      await markNotificationAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification marked as read'
      });
    });

    it('should return 404 when notification not found', async () => {
      const req = mockRequest({
        params: { notificationId: 'non-existent-id' },
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rows: [] // Notification not found
      });

      await markNotificationAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'NOT_FOUND',
        message: 'Notification not found'
      });
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const req = mockRequest({
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rowCount: 3
      });

      await markAllNotificationsAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read'
      });
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const req = mockRequest({
        params: { notificationId: 'notification-1' },
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      // Mock database responses
      mockClient.query
        .mockResolvedValueOnce({
          rows: [{ id: 'notification-1' }] // Notification exists and belongs to user
        })
        .mockResolvedValueOnce({
          rowCount: 1
        });

      await deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification deleted successfully'
      });
    });

    it('should return 404 when notification not found', async () => {
      const req = mockRequest({
        params: { notificationId: 'non-existent-id' },
        user: { id: 'test-user-id' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rows: [] // Notification not found
      });

      await deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'NOT_FOUND',
        message: 'Notification not found'
      });
    });
  });
}); 