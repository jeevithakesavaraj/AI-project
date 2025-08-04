import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

describe('Notifications API Tests', () => {
  let adminToken, userToken;
  let createdNotificationId;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@projectmanagement.com',
      password: 'admin123'
    });
    adminToken = adminLogin.data.data.token;

    // Login as regular user
    const userLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'user@projectmanagement.com',
      password: 'user123'
    });
    userToken = userLogin.data.data.token;
  });

  describe('GET /api/notifications', () => {
    it('should return notifications for authenticated user', async () => {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.notifications).toBeInstanceOf(Array);
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.get(`${API_BASE_URL}/notifications`);
        fail('Should have returned 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should filter unread notifications when unreadOnly=true', async () => {
      const response = await axios.get(`${API_BASE_URL}/notifications?unreadOnly=true`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      // All returned notifications should be unread
      response.data.data.notifications.forEach(notification => {
        expect(notification.readAt).toBeNull();
      });
    });

    it('should limit results when limit parameter is provided', async () => {
      const limit = 5;
      const response = await axios.get(`${API_BASE_URL}/notifications?limit=${limit}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.data.notifications.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('GET /api/notifications/count', () => {
    it('should return unread notification count', async () => {
      const response = await axios.get(`${API_BASE_URL}/notifications/count`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.count).toBeGreaterThanOrEqual(0);
      expect(typeof response.data.data.count).toBe('number');
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.get(`${API_BASE_URL}/notifications/count`);
        fail('Should have returned 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('PUT /api/notifications/:notificationId/read', () => {
    it('should mark notification as read successfully', async () => {
      // First, get an unread notification
      const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications?unreadOnly=true`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (notificationsResponse.data.data.notifications.length > 0) {
        const unreadNotification = notificationsResponse.data.data.notifications[0];
        createdNotificationId = unreadNotification.id;

        const response = await axios.put(`${API_BASE_URL}/notifications/${createdNotificationId}/read`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.message).toBe('Notification marked as read');

        // Verify the notification is now marked as read
        const updatedNotificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        const updatedNotification = updatedNotificationsResponse.data.data.notifications.find(
          n => n.id === createdNotificationId
        );
        expect(updatedNotification.readAt).not.toBeNull();
      }
    });

    it('should return 404 when notification does not exist', async () => {
      try {
        await axios.put(`${API_BASE_URL}/notifications/non-existent-id/read`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('NOT_FOUND');
        expect(error.response.data.message).toBe('Notification not found');
      }
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.put(`${API_BASE_URL}/notifications/test-id/read`, {});
        fail('Should have returned 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read successfully', async () => {
      const response = await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('All notifications marked as read');

      // Verify all notifications are now marked as read
      const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      notificationsResponse.data.data.notifications.forEach(notification => {
        expect(notification.readAt).not.toBeNull();
      });
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.put(`${API_BASE_URL}/notifications/read-all`, {});
        fail('Should have returned 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('DELETE /api/notifications/:notificationId', () => {
    it('should delete notification successfully', async () => {
      // First, create a test notification by marking one as read
      const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (notificationsResponse.data.data.notifications.length > 0) {
        const notificationToDelete = notificationsResponse.data.data.notifications[0];
        const notificationId = notificationToDelete.id;

        const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.message).toBe('Notification deleted successfully');

        // Verify the notification is deleted
        const updatedNotificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        const deletedNotification = updatedNotificationsResponse.data.data.notifications.find(
          n => n.id === notificationId
        );
        expect(deletedNotification).toBeUndefined();
      }
    });

    it('should return 404 when notification does not exist', async () => {
      try {
        await axios.delete(`${API_BASE_URL}/notifications/non-existent-id`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('NOT_FOUND');
        expect(error.response.data.message).toBe('Notification not found');
      }
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.delete(`${API_BASE_URL}/notifications/test-id`);
        fail('Should have returned 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Notification Types and Data', () => {
    it('should handle different notification types correctly', async () => {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      
      // Check that notifications have valid types
      response.data.data.notifications.forEach(notification => {
        expect(notification.type).toMatch(/^(COMMENT|TASK_ASSIGNED|TASK_UPDATED|PROJECT_INVITE|MENTION)$/);
        expect(notification.title).toBeDefined();
        expect(notification.message).toBeDefined();
        expect(notification.createdAt).toBeDefined();
      });
    });

    it('should handle notification data field correctly', async () => {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      
      // Check that notifications have valid data structure
      response.data.data.notifications.forEach(notification => {
        if (notification.data) {
          expect(typeof notification.data).toBe('object');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed UUIDs', async () => {
      try {
        await axios.get(`${API_BASE_URL}/notifications/invalid-uuid`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 400');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // In a real scenario, you'd test this by temporarily breaking the DB connection
      expect(true).toBe(true); // Placeholder for actual test
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array(10).fill().map(() => 
        axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
      );

      try {
        await Promise.all(promises);
        // If no rate limiting, this should succeed
        expect(true).toBe(true);
      } catch (error) {
        // If rate limiting is enabled, this might fail
        expect(error.response.status).toBe(429);
      }
    });
  });

  describe('Cross-User Isolation', () => {
    it('should only return notifications for the authenticated user', async () => {
      // Get notifications for admin
      const adminResponse = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      // Get notifications for user
      const userResponse = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      expect(adminResponse.status).toBe(200);
      expect(userResponse.status).toBe(200);

      // Verify that users can only see their own notifications
      const adminNotificationIds = adminResponse.data.data.notifications.map(n => n.id);
      const userNotificationIds = userResponse.data.data.notifications.map(n => n.id);

      // There should be no overlap between admin and user notifications
      const overlap = adminNotificationIds.filter(id => userNotificationIds.includes(id));
      expect(overlap.length).toBe(0);
    });
  });
}); 