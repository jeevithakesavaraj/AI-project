# Role Management System

This document explains the role management system implemented in the Project Management application.

## User Roles

### System-Level Roles
- **USER**: Regular user with basic permissions
- **ADMIN**: Administrator with full system access

### Project-Level Roles
- **OWNER**: Project owner with full control over the project
- **ADMIN**: Project administrator with management permissions
- **MEMBER**: Regular project member with task management permissions
- **VIEWER**: Read-only access to project

## Role Permissions

### System Roles

#### USER
- Create and manage their own projects
- Join projects as members
- Manage tasks assigned to them
- View project information they have access to

#### ADMIN
- All USER permissions
- Manage all users in the system
- Update user roles
- Access system-wide statistics
- Manage all projects

### Project Roles

#### OWNER
- All project permissions
- Delete the project
- Add/remove project members
- Update member roles
- Transfer project ownership

#### ADMIN
- Update project details
- Add/remove project members
- Manage tasks
- View all project data

#### MEMBER
- Create and manage tasks
- Add comments
- Track time
- View project data

#### VIEWER
- View project information
- View tasks and comments
- No modification permissions

## API Endpoints

### User Role Management

#### Update User Role (Admin only)
```
PUT /api/roles/users/:userId
Content-Type: application/json
Authorization: Bearer <token>

{
  "role": "ADMIN" | "USER"
}
```

### Project Member Management

#### Get Project Members
```
GET /api/roles/projects/:projectId/members
Authorization: Bearer <token>
```

#### Add Project Member
```
POST /api/roles/projects/:projectId/members
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-uuid",
  "role": "ADMIN" | "MEMBER" | "VIEWER"
}
```

#### Update Project Member Role
```
PUT /api/roles/projects/:projectId/members/:memberId
Content-Type: application/json
Authorization: Bearer <token>

{
  "role": "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
}
```

#### Remove Project Member
```
DELETE /api/roles/projects/:projectId/members/:memberId
Authorization: Bearer <token>
```

## Project CRUD Operations

### Create Project
- **Endpoint**: `POST /api/projects`
- **Required Role**: Any authenticated user
- **Description**: Creates a new project and assigns the creator as OWNER

### Read Project
- **Endpoint**: `GET /api/projects/:projectId`
- **Required Role**: OWNER, ADMIN, MEMBER, or VIEWER
- **Description**: Retrieves project details

### Update Project
- **Endpoint**: `PUT /api/projects/:projectId`
- **Required Role**: OWNER or ADMIN
- **Description**: Updates project information

### Delete Project
- **Endpoint**: `DELETE /api/projects/:projectId`
- **Required Role**: OWNER only
- **Description**: Soft deletes the project

## Error Handling

### Common Error Responses

#### Permission Denied (403)
```json
{
  "error": "PERMISSION_DENIED",
  "message": "Only project owners can update member roles"
}
```

#### Access Denied (403)
```json
{
  "error": "PROJECT_ACCESS_DENIED",
  "message": "You do not have access to this project"
}
```

#### Insufficient Permissions (403)
```json
{
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "Required roles: OWNER, ADMIN. Your role: MEMBER"
}
```

## Usage Examples

### 1. Creating a Project
```javascript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'My New Project',
    description: 'A sample project',
    status: 'ACTIVE'
  })
});
```

### 2. Adding a Member to Project
```javascript
const response = await fetch(`/api/roles/projects/${projectId}/members`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userId: 'user-uuid',
    role: 'MEMBER'
  })
});
```

### 3. Updating Project Member Role
```javascript
const response = await fetch(`/api/roles/projects/${projectId}/members/${memberId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    role: 'ADMIN'
  })
});
```

## Security Considerations

1. **Role Validation**: All role changes are validated against the schema
2. **Permission Checks**: Every operation checks user permissions before execution
3. **Owner Protection**: Project owners cannot be removed from their projects
4. **Audit Trail**: All role changes are logged in the database
5. **Token Validation**: All requests require valid JWT tokens

## Database Schema

The role system uses the following database tables:

- `users`: Stores user information and system roles
- `projects`: Stores project information
- `project_members`: Links users to projects with specific roles

## Best Practices

1. **Always check permissions** before performing operations
2. **Use role-based middleware** for route protection
3. **Validate role changes** against business rules
4. **Log role changes** for audit purposes
5. **Provide clear error messages** when permissions are denied 