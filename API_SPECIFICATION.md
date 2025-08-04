# API Specification - Project Management Dashboard

## 1. API Overview

**Base URL:** `https://api.projectmanagement.com/v1`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`  
**Version:** v1.0.0  

## 2. Authentication

### 2.1 Authentication Flow
1. User registers/logs in with email and password
2. Backend validates credentials against database
3. Backend issues JWT token
4. JWT token used for subsequent API calls

### 2.2 Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 2.3 Error Responses
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

## 3. Authentication Endpoints

### 3.1 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin",
      "avatar": "https://example.com/avatar.jpg"
    },
    "token": "jwt_token",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### 3.2 Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "member",
      "avatar": null
    },
    "token": "jwt_token",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### 3.3 Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### 3.4 Logout
**POST** `/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 4. User Management

### 4.1 Get Current User
**GET** `/users/me`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "avatar": "https://example.com/avatar.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.2 Update User Profile
**PUT** `/users/me`

**Request Body:**
```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Updated Name",
    "role": "admin",
    "avatar": "https://example.com/new-avatar.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.3 Get All Users (Admin Only)
**GET** `/users`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or email
- `role` (string): Filter by role

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "member",
        "avatar": "https://example.com/avatar.jpg",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## 5. Project Management

### 5.1 Create Project
**POST** `/projects`

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Project description",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "members": ["user_id_1", "user_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_id",
    "title": "Project Title",
    "description": "Project description",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-03-31T00:00:00Z",
    "status": "active",
    "progressPercentage": 0,
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "members": [
      {
        "id": "user_id",
        "name": "User Name",
        "email": "user@example.com",
        "role": "member"
      }
    ]
  }
}
```

### 5.2 Get All Projects
**GET** `/projects`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status
- `search` (string): Search by title
- `sortBy` (string): Sort field (title, createdAt, endDate)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project_id",
        "title": "Project Title",
        "description": "Project description",
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-03-31T00:00:00Z",
        "status": "active",
        "progressPercentage": 45,
        "createdBy": "user_id",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "taskCount": 10,
        "completedTaskCount": 4
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### 5.3 Get Project by ID
**GET** `/projects/{projectId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_id",
    "title": "Project Title",
    "description": "Project description",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-03-31T00:00:00Z",
    "status": "active",
    "progressPercentage": 45,
    "createdBy": "user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "creator": {
      "id": "user_id",
      "name": "Creator Name",
      "email": "creator@example.com"
    },
    "members": [
      {
        "id": "user_id",
        "name": "Member Name",
        "email": "member@example.com",
        "role": "member"
      }
    ],
    "milestones": [
      {
        "id": "milestone_id",
        "title": "Milestone Title",
        "description": "Milestone description",
        "dueDate": "2024-02-15T00:00:00Z",
        "status": "pending"
      }
    ],
    "tasks": [
      {
        "id": "task_id",
        "title": "Task Title",
        "status": "in_progress",
        "priority": "high",
        "assignedTo": {
          "id": "user_id",
          "name": "Assignee Name"
        }
      }
    ]
  }
}
```

### 5.4 Update Project
**PUT** `/projects/{projectId}`

**Request Body:**
```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "startDate": "2024-01-01",
  "endDate": "2024-04-30",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_id",
    "title": "Updated Project Title",
    "description": "Updated description",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-04-30T00:00:00Z",
    "status": "active",
    "progressPercentage": 45,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 5.5 Delete Project
**DELETE** `/projects/{projectId}`

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## 6. Task Management

### 6.1 Create Task
**POST** `/projects/{projectId}/tasks`

**Request Body:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "dueDate": "2024-01-15",
  "priority": "high",
  "assignedTo": "user_id",
  "estimatedHours": 8.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "dueDate": "2024-01-15T00:00:00Z",
    "priority": "high",
    "status": "todo",
    "projectId": "project_id",
    "assignedTo": {
      "id": "user_id",
      "name": "Assignee Name",
      "email": "assignee@example.com"
    },
    "createdBy": "user_id",
    "estimatedHours": 8.5,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 6.2 Get Project Tasks
**GET** `/projects/{projectId}/tasks`

**Query Parameters:**
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `assignedTo` (string): Filter by assignee
- `search` (string): Search by title
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_id",
        "title": "Task Title",
        "description": "Task description",
        "dueDate": "2024-01-15T00:00:00Z",
        "priority": "high",
        "status": "todo",
        "assignedTo": {
          "id": "user_id",
          "name": "Assignee Name"
        },
        "createdBy": {
          "id": "user_id",
          "name": "Creator Name"
        },
        "estimatedHours": 8.5,
        "actualHours": 6.0,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 6.3 Get Task by ID
**GET** `/tasks/{taskId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "dueDate": "2024-01-15T00:00:00Z",
    "priority": "high",
    "status": "todo",
    "projectId": "project_id",
    "assignedTo": {
      "id": "user_id",
      "name": "Assignee Name",
      "email": "assignee@example.com"
    },
    "createdBy": {
      "id": "user_id",
      "name": "Creator Name",
      "email": "creator@example.com"
    },
    "estimatedHours": 8.5,
    "actualHours": 6.0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "comments": [
      {
        "id": "comment_id",
        "content": "Comment content",
        "user": {
          "id": "user_id",
          "name": "User Name"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "attachments": [
      {
        "id": "attachment_id",
        "filename": "document.pdf",
        "fileUrl": "https://example.com/file.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000
      }
    ],
    "timeLogs": [
      {
        "id": "timelog_id",
        "hours": 2.5,
        "description": "Work description",
        "date": "2024-01-01",
        "user": {
          "id": "user_id",
          "name": "User Name"
        }
      }
    ]
  }
}
```

### 6.4 Update Task
**PUT** `/tasks/{taskId}`

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "dueDate": "2024-01-20",
  "priority": "medium",
  "status": "in_progress",
  "assignedTo": "user_id",
  "estimatedHours": 10.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task_id",
    "title": "Updated Task Title",
    "description": "Updated description",
    "dueDate": "2024-01-20T00:00:00Z",
    "priority": "medium",
    "status": "in_progress",
    "assignedTo": {
      "id": "user_id",
      "name": "Assignee Name"
    },
    "estimatedHours": 10.0,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 6.5 Delete Task
**DELETE** `/tasks/{taskId}`

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## 7. Time Tracking

### 7.1 Log Time
**POST** `/tasks/{taskId}/time-logs`

**Request Body:**
```json
{
  "hours": 2.5,
  "description": "Work completed on feature X",
  "date": "2024-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "timelog_id",
    "taskId": "task_id",
    "userId": "user_id",
    "hours": 2.5,
    "description": "Work completed on feature X",
    "date": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "user": {
      "id": "user_id",
      "name": "User Name"
    }
  }
}
```

### 7.2 Get Task Time Logs
**GET** `/tasks/{taskId}/time-logs`

**Query Parameters:**
- `startDate` (string): Start date filter
- `endDate` (string): End date filter
- `userId` (string): Filter by user

**Response:**
```json
{
  "success": true,
  "data": {
    "timeLogs": [
      {
        "id": "timelog_id",
        "hours": 2.5,
        "description": "Work description",
        "date": "2024-01-01T00:00:00Z",
        "user": {
          "id": "user_id",
          "name": "User Name"
        }
      }
    ],
    "summary": {
      "totalHours": 15.5,
      "totalEntries": 6,
      "averageHoursPerDay": 2.6
    }
  }
}
```

### 7.3 Update Time Log
**PUT** `/time-logs/{timeLogId}`

**Request Body:**
```json
{
  "hours": 3.0,
  "description": "Updated work description",
  "date": "2024-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "timelog_id",
    "hours": 3.0,
    "description": "Updated work description",
    "date": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 7.4 Delete Time Log
**DELETE** `/time-logs/{timeLogId}`

**Response:**
```json
{
  "success": true,
  "message": "Time log deleted successfully"
}
```

## 8. Comments

### 8.1 Add Comment
**POST** `/tasks/{taskId}/comments`

**Request Body:**
```json
{
  "content": "Comment content",
  "parentId": "parent_comment_id" // Optional for replies
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comment_id",
    "content": "Comment content",
    "taskId": "task_id",
    "userId": "user_id",
    "parentId": "parent_comment_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "avatar": "https://example.com/avatar.jpg"
    },
    "replies": []
  }
}
```

### 8.2 Get Task Comments
**GET** `/tasks/{taskId}/comments`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_id",
        "content": "Comment content",
        "createdAt": "2024-01-01T00:00:00Z",
        "user": {
          "id": "user_id",
          "name": "User Name",
          "avatar": "https://example.com/avatar.jpg"
        },
        "replies": [
          {
            "id": "reply_id",
            "content": "Reply content",
            "createdAt": "2024-01-01T00:00:00Z",
            "user": {
              "id": "user_id",
              "name": "User Name",
              "avatar": "https://example.com/avatar.jpg"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### 8.3 Update Comment
**PUT** `/comments/{commentId}`

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comment_id",
    "content": "Updated comment content",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 8.4 Delete Comment
**DELETE** `/comments/{commentId}`

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

## 9. File Attachments

### 9.1 Upload File
**POST** `/tasks/{taskId}/attachments`

**Request Body:** (multipart/form-data)
```
file: [binary file data]
description: "File description" // Optional
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attachment_id",
    "filename": "document.pdf",
    "fileUrl": "https://res.cloudinary.com/example/image/upload/v123/document.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "taskId": "task_id",
    "uploadedBy": "user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "uploader": {
      "id": "user_id",
      "name": "User Name"
    }
  }
}
```

### 9.2 Get Task Attachments
**GET** `/tasks/{taskId}/attachments`

**Response:**
```json
{
  "success": true,
  "data": {
    "attachments": [
      {
        "id": "attachment_id",
        "filename": "document.pdf",
        "fileUrl": "https://res.cloudinary.com/example/image/upload/v123/document.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000,
        "uploadedBy": {
          "id": "user_id",
          "name": "User Name"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 9.3 Delete Attachment
**DELETE** `/attachments/{attachmentId}`

**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

## 10. Notifications

### 10.1 Get User Notifications
**GET** `/notifications`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `read` (boolean): Filter by read status
- `type` (string): Filter by notification type

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "type": "task_assigned",
        "title": "Task Assigned",
        "message": "You have been assigned to 'Task Title'",
        "relatedId": "task_id",
        "read": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    },
    "unreadCount": 5
  }
}
```

### 10.2 Mark Notification as Read
**PUT** `/notifications/{notificationId}/read`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notification_id",
    "read": true,
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 10.3 Mark All Notifications as Read
**PUT** `/notifications/read-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

## 11. Dashboard & Analytics

### 11.1 Get Dashboard Overview
**GET** `/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": {
      "total": 10,
      "active": 8,
      "completed": 2,
      "overdue": 1
    },
    "tasks": {
      "total": 50,
      "todo": 20,
      "inProgress": 15,
      "done": 15
    },
    "timeTracking": {
      "totalHoursThisWeek": 40.5,
      "totalHoursThisMonth": 160.0,
      "averageHoursPerDay": 8.1
    },
    "recentActivity": [
      {
        "id": "activity_id",
        "type": "task_created",
        "title": "Task 'Design Homepage' created",
        "timestamp": "2024-01-01T00:00:00Z",
        "user": {
          "id": "user_id",
          "name": "User Name"
        }
      }
    ],
    "upcomingDeadlines": [
      {
        "id": "task_id",
        "title": "Task Title",
        "dueDate": "2024-01-15T00:00:00Z",
        "project": {
          "id": "project_id",
          "title": "Project Title"
        }
      }
    ]
  }
}
```

### 11.2 Get Project Analytics
**GET** `/projects/{projectId}/analytics`

**Query Parameters:**
- `startDate` (string): Start date for analytics
- `endDate` (string): End date for analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": {
      "completedTasks": 15,
      "totalTasks": 25,
      "percentage": 60
    },
    "timeTracking": {
      "estimatedHours": 200,
      "actualHours": 180,
      "remainingHours": 20
    },
    "taskStatus": {
      "todo": 5,
      "inProgress": 3,
      "done": 15
    },
    "timeByUser": [
      {
        "userId": "user_id",
        "userName": "User Name",
        "hours": 45.5
      }
    ],
    "weeklyProgress": [
      {
        "week": "2024-01-01",
        "completedTasks": 3,
        "hoursLogged": 20.5
      }
    ]
  }
}
```

## 12. Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_REQUIRED` | Authentication required | User must be logged in |
| `INVALID_TOKEN` | Invalid or expired token | JWT token is invalid |
| `PERMISSION_DENIED` | Permission denied | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Resource not found | Requested resource doesn't exist |
| `VALIDATION_ERROR` | Validation failed | Request data is invalid |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | Too many requests |
| `INTERNAL_ERROR` | Internal server error | Unexpected server error |
| `FILE_TOO_LARGE` | File too large | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | Invalid file type | File type not allowed |

## 13. Rate Limiting

- **Authentication endpoints:** 10 requests per minute
- **General API endpoints:** 100 requests per minute
- **File uploads:** 20 requests per minute
- **Dashboard analytics:** 30 requests per minute

## 14. WebSocket Events

### 14.1 Real-time Updates
**Connection:** `wss://api.projectmanagement.com/ws`

**Events:**
```javascript
// Task updated
{
  "type": "task_updated",
  "data": {
    "taskId": "task_id",
    "projectId": "project_id",
    "changes": {
      "status": "in_progress"
    }
  }
}

// New comment
{
  "type": "comment_added",
  "data": {
    "commentId": "comment_id",
    "taskId": "task_id",
    "content": "Comment content",
    "user": {
      "id": "user_id",
      "name": "User Name"
    }
  }
}

// Time logged
{
  "type": "time_logged",
  "data": {
    "timeLogId": "timelog_id",
    "taskId": "task_id",
    "hours": 2.5,
    "user": {
      "id": "user_id",
      "name": "User Name"
    }
  }
}

// Notification
{
  "type": "notification",
  "data": {
    "notificationId": "notification_id",
    "type": "task_assigned",
    "title": "Task Assigned",
    "message": "You have been assigned to 'Task Title'"
  }
}
```

## 15. API Versioning

- Current version: v1
- Version specified in URL: `/v1/`
- Backward compatibility maintained for 12 months
- Deprecation notices sent 6 months in advance

## 16. SDKs & Libraries

### 16.1 JavaScript SDK
```javascript
import { ProjectManagementAPI } from '@project-management/sdk';

const api = new ProjectManagementAPI({
  baseURL: 'https://api.projectmanagement.com/v1',
  token: 'your_jwt_token'
});

// Get projects
const projects = await api.projects.getAll();

// Create task
const task = await api.tasks.create(projectId, {
  title: 'Task Title',
  description: 'Task description'
});
```

### 16.2 React Hooks
```javascript
import { useProjects, useTasks, useTimeTracking } from '@project-management/react';

function ProjectList() {
  const { projects, loading, error } = useProjects();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

This API specification provides a comprehensive guide for integrating with the Project Management Dashboard API, including all endpoints, data formats, authentication, and real-time features. 