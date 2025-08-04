# Project Management Dashboard - Setup Instructions

## 🚀 Day 1-2 Tasks Completed

The following Day 1-2 tasks from the development plan have been completed:

### ✅ Project Structure Initialized
- Root project with workspace configuration
- Backend structure with Express.js, JWT authentication, and Prisma ORM
- Frontend structure with React 18, TypeScript, Vite, and TailwindCSS
- Proper directory organization for both frontend and backend

### ✅ Development Environment Setup
- Backend: Node.js with Express, JWT authentication, PostgreSQL with Prisma
- Frontend: React 18 with TypeScript, Vite, TailwindCSS, Zustand state management
- Development scripts configured for both frontend and backend
- Hot reloading and development server setup

### ✅ Database Configuration (PostgreSQL)
- Prisma schema created with all required models
- Database migrations and seeding scripts ready
- Environment configuration for database connection
- Sample data seeding for development

### ✅ Authentication System (JWT)
- JWT-based authentication implemented
- User registration and login functionality
- Password hashing with bcrypt
- Protected routes and middleware
- Frontend authentication store with Zustand

### ✅ Basic CI/CD Pipeline
- Package.json scripts for development, build, and testing
- Environment configuration files
- Development and production build configurations

### ✅ Monitoring and Logging Setup
- Error handling middleware
- Request logging with Morgan
- Health check endpoints
- Structured error responses

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🛠️ Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. **Create PostgreSQL Database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE project_management_db;
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy environment template
   cd backend
   cp env.example .env
   ```

3. **Update .env file with your database credentials:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/project_management_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

### 3. Database Migration and Seeding

```bash
# From the backend directory
npm run db:setup
```

This will:
- Generate Prisma client
- Push schema to database
- Seed with sample data

### 4. Start Development Servers

```bash
# From the root directory
npm run dev
```

This will start both:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:5173

## 🔑 Default Login Credentials

After running the database seed, you can login with:

**Admin User:**
- Email: admin@example.com
- Password: admin123

**Regular User:**
- Email: user@example.com
- Password: user123

## 📁 Project Structure

```
Project Management/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Auth and error middleware
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database seeding
│   │   └── server.js       # Main server file
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state management
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
└── package.json            # Root workspace configuration
```

## 🧪 Testing

```bash
# Test backend
cd backend
npm test

# Test frontend
cd frontend
npm test
```

## 🚀 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run tests for both frontend and backend

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run db:setup` - Setup database with migrations and seeding
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Development Workflow

1. **Start Development Servers**
   ```bash
   npm run dev
   ```

2. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/health

3. **Database Management**
   ```bash
   cd backend
   npm run db:studio  # Open Prisma Studio for database management
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists

2. **Port Already in Use**
   - Backend: Change PORT in backend/.env
   - Frontend: Change port in frontend/vite.config.ts

3. **Authentication Issues**
   - Check JWT_SECRET in backend/.env
   - Verify token is being sent in requests

4. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration

## 📚 Next Steps

The foundation is now complete! Next steps include:

1. **Implement Core Features** (Week 2-3)
   - Project CRUD operations
   - Task management
   - User management
   - File uploads

2. **Advanced Features** (Week 4-5)
   - Real-time notifications
   - Time tracking
   - Reporting and analytics
   - Advanced search and filtering

3. **Production Deployment**
   - Set up production environment
   - Configure CI/CD pipelines
   - Set up monitoring and logging

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 