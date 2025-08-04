import { jest } from '@jest/globals';
import { getComments, createComment, updateComment, deleteComment } from '../src/controllers/commentsController.js';

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

describe('Comments Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPool.connect.mockResolvedValue(mockClient);
  });

  describe('getComments', () => {
    it('should return comments for a task', async () => {
      const req = mockRequest({
        query: { taskId: 'test-task-id' },
        user: { id: 'test-user-id', role: 'ADMIN' }
      });
      const res = mockResponse();

      // Mock database responses
      mockClient.query
        .mockResolvedValueOnce({
          rows: [{ id: 'test-task-id' }] // Access check
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'comment-1',
              content: 'Test comment',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              parent_id: null,
              task_id: 'test-task-id',
              project_id: null,
              user_id: 'test-user-id',
              user_name: 'Test User',
              user_email: 'test@example.com',
              user_avatar: null
            }
          ]
        });

      await getComments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          comments: [
            {
              id: 'comment-1',
              content: 'Test comment',
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              parentId: null,
              taskId: 'test-task-id',
              projectId: null,
              user: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com',
                avatar: null
              },
              replies: []
            }
          ]
        }
      });
    });

    it('should return 400 when neither taskId nor projectId is provided', async () => {
      const req = mockRequest({ query: {} });
      const res = mockResponse();

      await getComments(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'VALIDATION_ERROR',
        message: 'Either taskId or projectId is required'
      });
    });

    it('should return 403 when user has no access to task', async () => {
      const req = mockRequest({
        query: { taskId: 'test-task-id' },
        user: { id: 'test-user-id', role: 'USER' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rows: [] // No access
      });

      await getComments(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'FORBIDDEN',
        message: 'You do not have access to this resource'
      });
    });
  });

  describe('createComment', () => {
    it('should create a new comment successfully', async () => {
      const req = mockRequest({
        body: {
          content: 'Test comment',
          taskId: 'test-task-id'
        },
        user: { id: 'test-user-id', role: 'ADMIN' }
      });
      const res = mockResponse();

      // Mock database responses
      mockClient.query
        .mockResolvedValueOnce({
          rows: [{ id: 'test-task-id' }] // Access check
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'new-comment-id',
            content: 'Test comment',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            parent_id: null,
            task_id: 'test-task-id',
            project_id: null
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            avatar: null
          }]
        });

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment created successfully',
        data: {
          comment: {
            id: 'new-comment-id',
            content: 'Test comment',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            parentId: null,
            taskId: 'test-task-id',
            projectId: null,
            user: {
              id: 'test-user-id',
              name: 'Test User',
              email: 'test@example.com',
              avatar: null
            },
            replies: []
          }
        }
      });
    });

    it('should return 400 for invalid content', async () => {
      const req = mockRequest({
        body: {
          content: '', // Empty content
          taskId: 'test-task-id'
        }
      });
      const res = mockResponse();

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'VALIDATION_ERROR',
        message: expect.stringContaining('content')
      });
    });

    it('should create a reply comment successfully', async () => {
      const req = mockRequest({
        body: {
          content: 'Test reply',
          taskId: 'test-task-id',
          parentId: 'parent-comment-id'
        },
        user: { id: 'test-user-id', role: 'ADMIN' }
      });
      const res = mockResponse();

      // Mock database responses
      mockClient.query
        .mockResolvedValueOnce({
          rows: [{ id: 'test-task-id' }] // Access check
        })
        .mockResolvedValueOnce({
          rows: [{ id: 'parent-comment-id' }] // Parent comment exists
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'reply-comment-id',
            content: 'Test reply',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            parent_id: 'parent-comment-id',
            task_id: 'test-task-id',
            project_id: null
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            avatar: null
          }]
        });

      await createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment created successfully',
        data: {
          comment: expect.objectContaining({
            parentId: 'parent-comment-id'
          })
        }
      });
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const req = mockRequest({
        params: { commentId: 'test-comment-id' },
        body: { content: 'Updated comment' },
        user: { id: 'test-user-id', role: 'ADMIN' }
      });
      const res = mockResponse();

      // Mock database responses
      mockClient.query
        .mockResolvedValueOnce({
          rows: [{ id: 'test-comment-id' }] // Comment exists and user owns it
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'test-comment-id',
            content: 'Updated comment',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            parent_id: null,
            task_id: 'test-task-id',
            project_id: null
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            avatar: null
          }]
        });

      await updateComment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment updated successfully',
        data: {
          comment: expect.objectContaining({
            content: 'Updated comment'
          })
        }
      });
    });

    it('should return 404 when comment not found', async () => {
      const req = mockRequest({
        params: { commentId: 'non-existent-id' },
        body: { content: 'Updated comment' },
        user: { id: 'test-user-id', role: 'ADMIN' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rows: [] // Comment not found
      });

      await updateComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'NOT_FOUND',
        message: 'Comment not found or you do not have permission to edit it'
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const req = mockRequest({
        params: { commentId: 'test-comment-id' },
        user: { id: 'test-user-id', role: 'ADMIN' }
      });
      const res = mockResponse();

      // Mock database responses
      mockClient.query
        .mockResolvedValueOnce({
          rows: [{ id: 'test-comment-id' }] // Comment exists and user owns it
        })
        .mockResolvedValueOnce({
          rowCount: 1
        });

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Comment deleted successfully'
      });
    });

    it('should return 404 when comment not found', async () => {
      const req = mockRequest({
        params: { commentId: 'non-existent-id' },
        user: { id: 'test-user-id', role: 'ADMIN' }
      });
      const res = mockResponse();

      mockClient.query.mockResolvedValueOnce({
        rows: [] // Comment not found
      });

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'NOT_FOUND',
        message: 'Comment not found or you do not have permission to delete it'
      });
    });
  });
}); 