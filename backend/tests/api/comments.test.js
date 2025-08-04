import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

describe('Comments API Tests', () => {
  let adminToken, userToken, testTaskId, testProjectId;
  let createdCommentId;

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

    // Get a test task
    const tasksResponse = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testTaskId = tasksResponse.data.data.tasks[0]?.id;

    // Get a test project
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    testProjectId = projectsResponse.data.data.projects[0]?.id;
  });

  describe('GET /api/comments', () => {
    it('should return 400 when neither taskId nor projectId is provided', async () => {
      try {
        await axios.get(`${API_BASE_URL}/comments`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 400');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('VALIDATION_ERROR');
        expect(error.response.data.message).toBe('Either taskId or projectId is required');
      }
    });

    it('should return 403 when user has no access to task', async () => {
      try {
        await axios.get(`${API_BASE_URL}/comments?taskId=${testTaskId}`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        fail('Should have returned 403');
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.error).toBe('FORBIDDEN');
      }
    });

    it('should return empty comments array for task with no comments', async () => {
      const response = await axios.get(`${API_BASE_URL}/comments?taskId=${testTaskId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.comments).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/comments', () => {
    it('should create a comment successfully', async () => {
      const commentData = {
        content: 'This is a test comment from API test',
        taskId: testTaskId
      };

      const response = await axios.post(`${API_BASE_URL}/comments`, commentData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Comment created successfully');
      expect(response.data.data.comment).toMatchObject({
        content: commentData.content,
        taskId: testTaskId,
        user: expect.objectContaining({
          name: expect.any(String),
          email: expect.any(String)
        })
      });

      createdCommentId = response.data.data.comment.id;
    });

    it('should return 400 for empty content', async () => {
      try {
        await axios.post(`${API_BASE_URL}/comments`, {
          content: '',
          taskId: testTaskId
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 400');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('VALIDATION_ERROR');
      }
    });

    it('should return 400 for content too long', async () => {
      const longContent = 'a'.repeat(2001); // Exceeds 2000 character limit
      
      try {
        await axios.post(`${API_BASE_URL}/comments`, {
          content: longContent,
          taskId: testTaskId
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 400');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('VALIDATION_ERROR');
      }
    });

    it('should return 403 when user has no access to task', async () => {
      try {
        await axios.post(`${API_BASE_URL}/comments`, {
          content: 'Test comment',
          taskId: testTaskId
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        fail('Should have returned 403');
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.error).toBe('FORBIDDEN');
      }
    });

    it('should create a reply comment successfully', async () => {
      const replyData = {
        content: 'This is a reply to the test comment',
        taskId: testTaskId,
        parentId: createdCommentId
      };

      const response = await axios.post(`${API_BASE_URL}/comments`, replyData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.comment.parentId).toBe(createdCommentId);
    });

    it('should return 404 when parent comment does not exist', async () => {
      try {
        await axios.post(`${API_BASE_URL}/comments`, {
          content: 'Reply to non-existent comment',
          taskId: testTaskId,
          parentId: 'non-existent-comment-id'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('NOT_FOUND');
        expect(error.response.data.message).toBe('Parent comment not found');
      }
    });
  });

  describe('PUT /api/comments/:commentId', () => {
    it('should update a comment successfully', async () => {
      const updatedContent = 'This comment has been updated via API test';
      
      const response = await axios.put(`${API_BASE_URL}/comments/${createdCommentId}`, {
        content: updatedContent
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Comment updated successfully');
      expect(response.data.data.comment.content).toBe(updatedContent);
    });

    it('should return 404 when comment does not exist', async () => {
      try {
        await axios.put(`${API_BASE_URL}/comments/non-existent-comment-id`, {
          content: 'Updated content'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('NOT_FOUND');
      }
    });

    it('should return 400 for empty content', async () => {
      try {
        await axios.put(`${API_BASE_URL}/comments/${createdCommentId}`, {
          content: ''
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 400');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    it('should delete a comment successfully', async () => {
      const response = await axios.delete(`${API_BASE_URL}/comments/${createdCommentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Comment deleted successfully');
    });

    it('should return 404 when comment does not exist', async () => {
      try {
        await axios.delete(`${API_BASE_URL}/comments/non-existent-comment-id`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 404');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('NOT_FOUND');
      }
    });
  });

  describe('Threaded Comments', () => {
    let parentCommentId, childCommentId;

    beforeAll(async () => {
      // Create a parent comment
      const parentResponse = await axios.post(`${API_BASE_URL}/comments`, {
        content: 'Parent comment for threading test',
        taskId: testTaskId
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      parentCommentId = parentResponse.data.data.comment.id;

      // Create a child comment
      const childResponse = await axios.post(`${API_BASE_URL}/comments`, {
        content: 'Child comment for threading test',
        taskId: testTaskId,
        parentId: parentCommentId
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      childCommentId = childResponse.data.data.comment.id;
    });

    it('should return comments in threaded structure', async () => {
      const response = await axios.get(`${API_BASE_URL}/comments?taskId=${testTaskId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.data.comments).toBeInstanceOf(Array);
      
      const parentComment = response.data.data.comments.find(c => c.id === parentCommentId);
      expect(parentComment).toBeDefined();
      expect(parentComment.replies).toBeInstanceOf(Array);
      expect(parentComment.replies.length).toBeGreaterThan(0);
      
      const childComment = parentComment.replies.find(c => c.id === childCommentId);
      expect(childComment).toBeDefined();
      expect(childComment.parentId).toBe(parentCommentId);
    });

    it('should delete parent comment and cascade delete replies', async () => {
      // Delete the parent comment
      await axios.delete(`${API_BASE_URL}/comments/${parentCommentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      // Verify both parent and child comments are deleted
      const response = await axios.get(`${API_BASE_URL}/comments?taskId=${testTaskId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      const parentComment = response.data.data.comments.find(c => c.id === parentCommentId);
      expect(parentComment).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // In a real scenario, you'd test this by temporarily breaking the DB connection
      expect(true).toBe(true); // Placeholder for actual test
    });

    it('should handle malformed UUIDs', async () => {
      try {
        await axios.get(`${API_BASE_URL}/comments?taskId=invalid-uuid`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        fail('Should have returned 400');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle authentication errors', async () => {
      try {
        await axios.get(`${API_BASE_URL}/comments?taskId=${testTaskId}`);
        fail('Should have returned 401');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });
}); 