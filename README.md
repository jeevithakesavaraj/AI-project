# Project Management System

A modern, full-stack project management application built with React, Node.js, and PostgreSQL. Features user authentication, role-based access control, task management, and a Kanban board interface.

## 🚀 Features

### **User Management**
- ✅ User registration and authentication
- ✅ Role-based access control (Admin/User)
- ✅ Profile management and password updates
- ✅ Admin user management interface

### **Project Management**
- ✅ Create and manage multiple projects
- ✅ Project member management with roles
- ✅ Project progress tracking
- ✅ Project statistics and analytics

### **Task Management**
- ✅ Create, assign, and track tasks
- ✅ Priority levels and due dates
- ✅ Task status management (TODO, IN_PROGRESS, IN_REVIEW, DONE)
- ✅ Task assignment to any user (Admin feature)
- ✅ Task filtering and search

### **Kanban Board**
- ✅ Drag-and-drop task management
- ✅ Visual project progress tracking
- ✅ Real-time status updates
- ✅ Task position management

### **Admin Features**
- ✅ Assign tasks to any user (not just project members)
- ✅ Manage all projects and users
- ✅ User role and status management
- ✅ System-wide task management

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Query** - Server state management
- **React Hook Form** - Form handling

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Joi** - Input validation
- **bcryptjs** - Password hashing

### **Deployment**
- **Render** - Backend and database hosting
- **Vercel** - Frontend hosting (planned)

## 📋 Prerequisites

- Node.js 16+ 
- PostgreSQL database
- Git

## 🚀 Quick Start

### **1. Clone the Repository**
```bash
git clone <your-repository-url>
cd project-management
```

### **2. Install Dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **3. Environment Setup**
```bash
# Backend (.env)
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secure_jwt_secret
PORT=5000

# Frontend (.env)
VITE_API_URL=http://localhost:5000
```

### **4. Database Setup**
```bash
# Run database initialization
cd backend
node src/scripts/setup-db.js
```

### **5. Start Development Servers**
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## 📁 Project Structure

```
project-management/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── scripts/        # Database scripts
│   └── package.json
├── docs/                   # Project documentation
└── README.md
```

## 🔐 Authentication & Authorization

### **User Roles**
- **ADMIN**: Full system access, can assign tasks to any user
- **USER**: Regular user with project-based access

### **Access Control**
- Users can only access projects they're members of
- Admins can access all projects and users
- Task assignment follows role-based permissions

## 🎯 Key Features in Detail

### **Admin Task Assignment**
- Admins can assign tasks to any user in the system
- Regular users can only assign to project members
- Assigned tasks appear in user's task management page

### **Project Management**
- Create projects with descriptions
- Add/remove project members
- Track project progress and statistics
- Role-based project access

### **Task Management**
- Full CRUD operations for tasks
- Priority levels (LOW, MEDIUM, HIGH, URGENT)
- Due date tracking
- Status management with Kanban board
- Task assignment and reassignment

### **Kanban Board**
- Visual task management
- Drag-and-drop functionality
- Real-time status updates
- Task position management
- Progress tracking

## 🔧 Development

### **Available Scripts**

#### Backend
```bash
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests
```

#### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

### **API Endpoints**

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- [Development Process Report](./docs/development-process-report.md)
- [AI Prompt Library](./docs/ai-prompt-library.md)
- [Learning & Reflection Report](./docs/learning-reflection-report.md)
- [Deployment Guide](./docs/deployment-guide.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- AI-assisted development with Cursor AI
- Comprehensive documentation and testing
- Responsive design for all devices

---

**Built with ❤️ using React, Node.js, and PostgreSQL**

*Last Updated: August 4, 2025* 