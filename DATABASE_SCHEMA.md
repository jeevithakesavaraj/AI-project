# Database Schema Design - Project Management Dashboard

## 1. Database Overview

The database uses PostgreSQL with Prisma ORM for type-safe database operations. The schema is designed to support all features including user management, project tracking, task management, time logging, and collaboration features.

## 2. Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │   Projects  │    │    Tasks    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │    │ title       │    │ title       │
│ name        │    │ description │    │ description │
│ role        │    │ start_date  │    │ due_date    │
│ avatar      │    │ end_date    │    │ status      │
│ created_at  │    │ created_at  │    │ project_id  │
│ updated_at  │    │ updated_at  │    │ assigned_to │
└─────────────┘    │ created_at  │    │ created_at  │
       │           └─────────────┘    │ updated_at  │
       │                   │          │ created_at  │
       │                   │          │ updated_at  │
       │                   │          └─────────────┘
       │                   │                   │
       │                   │                   │
       │                   ▼                   ▼
       │           ┌─────────────┐    ┌─────────────┐
       │           │  Milestones │    │  TimeLogs   │
       │           ├─────────────┤    ├─────────────┤
       │           │ id (PK)     │    │ id (PK)     │
       │           │ title       │    │ user_id     │
       │           │ due_date    │    │ task_id     │
       │           │ project_id  │    │ hours       │
       │           │ created_at  │    │ description │
       │           │ updated_at  │    │ date        │
       │           └─────────────┘    │ created_at  │
       │                              │ updated_at  │
       │                              └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Comments   │    │ Attachments │    │Notifications│
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ content     │    │ filename    │    │ user_id     │
│ user_id     │    │ file_url    │    │ type        │
│ task_id     │    │ file_type   │    │ message     │
│ parent_id   │    │ task_id     │    │ read        │
│ created_at  │    │ created_at  │    │ created_at  │
│ updated_at  │    │ updated_at  │    │ updated_at  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 3. Detailed Schema Definition

### 3.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    avatar VARCHAR(500),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 3.2 Projects Table
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'on_hold', 'cancelled') DEFAULT 'active',
    progress_percentage INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
```

### 3.3 Milestones Table
```sql
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
```

### 3.4 Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    estimated_hours DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 3.5 TimeLogs Table
```sql
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    hours DECIMAL(4,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX idx_time_logs_date ON time_logs(date);
```

### 3.6 Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

### 3.7 Attachments Table
```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_attachments_task_id ON attachments(task_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
```

### 3.8 Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type ENUM('task_assigned', 'task_updated', 'comment_added', 'project_updated', 'milestone_due') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID, -- ID of related task/project/comment
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
```

### 3.9 Project Members Table (Many-to-Many)
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role ENUM('owner', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Indexes
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
```

## 4. Prisma Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  role        Role     @default(MEMBER)
  avatar      String?
  passwordHash String   @map("password_hash")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  createdProjects    Project[]        @relation("ProjectCreator")
  assignedTasks      Task[]           @relation("TaskAssignee")
  createdTasks       Task[]           @relation("TaskCreator")
  timeLogs           TimeLog[]
  comments           Comment[]
  attachments        Attachment[]
  notifications      Notification[]
  projectMemberships ProjectMember[]

  @@map("users")
}

model Project {
  id                  String     @id @default(cuid())
  title               String
  description         String?
  startDate           DateTime   @map("start_date")
  endDate             DateTime   @map("end_date")
  status              ProjectStatus @default(ACTIVE)
  progressPercentage  Int        @default(0) @map("progress_percentage")
  createdBy           String     @map("created_by")
  createdAt           DateTime   @default(now()) @map("created_at")
  updatedAt           DateTime   @updatedAt @map("updated_at")

  // Relations
  creator             User             @relation("ProjectCreator", fields: [createdBy], references: [id])
  milestones          Milestone[]
  tasks               Task[]
  members             ProjectMember[]

  @@map("projects")
}

model Milestone {
  id          String   @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime @map("due_date")
  status      MilestoneStatus @default(PENDING)
  projectId   String   @map("project_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("milestones")
}

model Task {
  id             String   @id @default(cuid())
  title          String
  description    String?
  dueDate        DateTime? @map("due_date")
  priority       Priority @default(MEDIUM)
  status         TaskStatus @default(TODO)
  projectId      String   @map("project_id")
  assignedTo     String?  @map("assigned_to")
  createdBy      String   @map("created_by")
  estimatedHours Float?   @map("estimated_hours")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  project        Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee       User?       @relation("TaskAssignee", fields: [assignedTo], references: [id])
  creator        User        @relation("TaskCreator", fields: [createdBy], references: [id])
  timeLogs       TimeLog[]
  comments       Comment[]
  attachments    Attachment[]

  @@map("tasks")
}

model TimeLog {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  taskId      String   @map("task_id")
  hours       Float
  description String?
  date        DateTime
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  user        User     @relation(fields: [userId], references: [id])
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@map("time_logs")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  userId    String   @map("user_id")
  taskId    String   @map("task_id")
  parentId  String?  @map("parent_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  user      User     @relation(fields: [userId], references: [id])
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  @@map("comments")
}

model Attachment {
  id          String   @id @default(cuid())
  filename    String
  fileUrl     String   @map("file_url")
  fileType    String?  @map("file_type")
  fileSize    Int?     @map("file_size")
  taskId      String   @map("task_id")
  uploadedBy  String   @map("uploaded_by")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  uploader    User     @relation(fields: [uploadedBy], references: [id])

  @@map("attachments")
}

model Notification {
  id         String           @id @default(cuid())
  userId     String           @map("user_id")
  type       NotificationType
  title      String
  message    String
  relatedId  String?          @map("related_id")
  read       Boolean          @default(false)
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @updatedAt @map("updated_at")

  // Relations
  user       User             @relation(fields: [userId], references: [id])

  @@map("notifications")
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String   @map("project_id")
  userId    String   @map("user_id")
  role      MemberRole @default(MEMBER)
  joinedAt  DateTime @default(now()) @map("joined_at")

  // Relations
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@map("project_members")
}

// Enums
enum Role {
  ADMIN
  MEMBER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
  CANCELLED
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_UPDATED
  COMMENT_ADDED
  PROJECT_UPDATED
  MILESTONE_DUE
}

enum MemberRole {
  OWNER
  MEMBER
  VIEWER
}
```

## 5. Database Migrations

### 5.1 Initial Migration
```sql
-- Migration: 001_initial_schema.sql
-- This creates all tables with proper relationships and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on_hold', 'cancelled');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_updated', 'comment_added', 'project_updated', 'milestone_due');
CREATE TYPE member_role AS ENUM ('owner', 'member', 'viewer');

-- Create tables (as defined above)
-- ... (all table creation statements from section 3)

-- Create indexes (as defined above)
-- ... (all index creation statements from section 3)
```

## 6. Data Seeding

### 6.1 Sample Data
```sql
-- Insert sample users
INSERT INTO users (email, name, role) VALUES
('admin@example.com', 'Admin User', 'admin'),
('john@example.com', 'John Doe', 'member'),
('jane@example.com', 'Jane Smith', 'member');

-- Insert sample projects
INSERT INTO projects (title, description, start_date, end_date, created_by) VALUES
('Website Redesign', 'Complete redesign of company website', '2024-01-01', '2024-03-31', 
 (SELECT id FROM users WHERE email = 'admin@example.com')),
('Mobile App Development', 'Develop new mobile application', '2024-02-01', '2024-05-31',
 (SELECT id FROM users WHERE email = 'admin@example.com'));

-- Insert sample tasks
INSERT INTO tasks (title, description, due_date, priority, project_id, assigned_to, created_by) VALUES
('Design Homepage', 'Create new homepage design', '2024-01-15', 'high',
 (SELECT id FROM projects WHERE title = 'Website Redesign'),
 (SELECT id FROM users WHERE email = 'john@example.com'),
 (SELECT id FROM users WHERE email = 'admin@example.com')),
('Implement Navigation', 'Build responsive navigation menu', '2024-01-20', 'medium',
 (SELECT id FROM projects WHERE title = 'Website Redesign'),
 (SELECT id FROM users WHERE email = 'jane@example.com'),
 (SELECT id FROM users WHERE email = 'admin@example.com'));
```

## 7. Performance Optimization

### 7.1 Query Optimization
- Use composite indexes for frequently queried combinations
- Implement database partitioning for large tables
- Use materialized views for complex aggregations
- Implement query result caching

### 7.2 Maintenance
- Regular VACUUM and ANALYZE operations
- Monitor slow queries and optimize
- Implement connection pooling
- Regular backup and recovery testing

## 8. Security Considerations

### 8.1 Data Protection
- Encrypt sensitive data at rest
- Implement row-level security (RLS)
- Use parameterized queries to prevent SQL injection
- Implement proper access controls

### 8.2 Audit Trail
- Log all database changes
- Track user access patterns
- Implement data retention policies
- Regular security audits

## 9. Backup and Recovery

### 9.1 Backup Strategy
- Daily full backups
- Hourly incremental backups
- Point-in-time recovery capability
- Off-site backup storage

### 9.2 Recovery Procedures
- Documented recovery procedures
- Regular recovery testing
- Disaster recovery plan
- Business continuity planning 