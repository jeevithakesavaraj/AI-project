# Project Setup Guide - Project Management Dashboard

This guide provides step-by-step instructions for setting up the Project Management Dashboard development environment and initializing the project structure.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **VS Code** (Recommended) ([Download](https://code.visualstudio.com/))

### Required Accounts
- **GitHub** account for version control
- **Cloudinary** account for file storage
- **SendGrid** account for email notifications
- **Vercel** account for frontend hosting
- **Render** account for backend hosting

## 🚀 Initial Setup

### Step 1: Project Structure Creation

1. **Create project directory**
   ```bash
   mkdir project-management-dashboard
   cd project-management-dashboard
   ```

2. **Initialize Git repository**
   ```bash
   git init
   git branch -M main
   ```

3. **Create project structure**
   ```bash
   mkdir frontend backend docs
   touch README.md .gitignore
   ```

4. **Create .gitignore file**
   ```bash
   # Dependencies
   node_modules/
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # Environment variables
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local

   # Build outputs
   dist/
   build/
   .next/
   out/

   # Logs
   logs/
   *.log

   # Runtime data
   pids/
   *.pid
   *.seed
   *.pid.lock

   # Coverage directory used by tools like istanbul
   coverage/
   *.lcov

   # nyc test coverage
   .nyc_output

   # Dependency directories
   jspm_packages/

   # Optional npm cache directory
   .npm

   # Optional eslint cache
   .eslintcache

   # Microbundle cache
   .rpt2_cache/
   .rts2_cache_cjs/
   .rts2_cache_es/
   .rts2_cache_umd/

   # Optional REPL history
   .node_repl_history

   # Output of 'npm pack'
   *.tgz

   # Yarn Integrity file
   .yarn-integrity

   # dotenv environment variables file
   .env.test

   # parcel-bundler cache (https://parceljs.org/)
   .cache
   .parcel-cache

   # Next.js build output
   .next

   # Nuxt.js build / generate output
   .nuxt
   dist

   # Gatsby files
   .cache/
   public

   # Storybook build outputs
   .out
   .storybook-out

   # Temporary folders
   tmp/
   temp/

   # Editor directories and files
   .vscode/
   .idea/
   *.swp
   *.swo
   *~

   # OS generated files
   .DS_Store
   .DS_Store?
   ._*
   .Spotlight-V100
   .Trashes
   ehthumbs.db
   Thumbs.db
   ```

### Step 2: Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Create React app with TypeScript**
   ```bash
   npm create vite@latest . -- --template react-ts
   ```

3. **Install dependencies**
   ```bash
   npm install
   npm install @types/node
   ```

4. **Install additional frontend dependencies**
   ```bash
   # UI and Styling
   npm install tailwindcss postcss autoprefixer
   npm install @headlessui/react @heroicons/react
   npm install react-router-dom
   npm install axios

   # State Management
   npm install zustand

   # Forms and Validation
   npm install react-hook-form @hookform/resolvers zod

   # Charts and Visualization
   npm install chart.js react-chartjs-2

   # File Upload
   npm install react-dropzone

   # Date and Time
   npm install date-fns

   # Real-time
   npm install socket.io-client

   # Development Tools
   npm install -D @types/react @types/react-dom
   npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   npm install -D prettier eslint-config-prettier eslint-plugin-prettier
   ```

5. **Configure TailwindCSS**
   ```bash
   npx tailwindcss init -p
   ```

6. **Update tailwind.config.js**
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#eff6ff',
             100: '#dbeafe',
             200: '#bfdbfe',
             300: '#93c5fd',
             400: '#60a5fa',
             500: '#3b82f6',
             600: '#2563eb',
             700: '#1d4ed8',
             800: '#1e40af',
             900: '#1e3a8a',
           },
         },
       },
     },
     plugins: [],
   }
   ```

7. **Update src/index.css**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   @layer base {
     html {
       font-family: 'Inter', system-ui, sans-serif;
     }
   }

   @layer components {
     .btn-primary {
       @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
     }
     
     .btn-secondary {
       @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors;
     }
     
     .input-field {
       @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
     }
   }
   ```

### Step 3: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd ../backend
   ```

2. **Initialize Node.js project**
   ```bash
   npm init -y
   ```

3. **Install dependencies**
   ```bash
   # Core dependencies
   npm install express cors helmet morgan
   npm install dotenv

   # Database
   npm install prisma @prisma/client
   npm install pg

       # Authentication
    npm install jsonwebtoken bcryptjs

   # Validation
   npm install joi

   # File upload
   npm install multer cloudinary

   # Real-time
   npm install socket.io

   # Email
   npm install @sendgrid/mail

   # Development
   npm install -D nodemon @types/node @types/express
   npm install -D @types/cors @types/morgan @types/bcryptjs
   npm install -D @types/jsonwebtoken @types/multer
   npm install -D jest supertest @types/jest
   ```

4. **Create basic server structure**
   ```bash
   mkdir src
   mkdir src/controllers src/routes src/models src/middleware src/services src/utils src/config
   mkdir tests
   ```

5. **Create package.json scripts**
   ```json
   {
     "scripts": {
       "dev": "nodemon src/server.js",
       "start": "node src/server.js",
       "build": "npm install",
       "test": "jest",
       "test:watch": "jest --watch",
       "db:generate": "prisma generate",
       "db:push": "prisma db push",
       "db:migrate": "prisma migrate dev",
       "db:seed": "node src/scripts/seed.js"
     }
   }
   ```

### Step 4: Database Setup

1. **Initialize Prisma**
   ```bash
   cd backend
   npx prisma init
   ```

2. **Create Prisma schema** (see DATABASE_SCHEMA.md for complete schema)
   ```prisma
   // prisma/schema.prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   // Add your models here (see DATABASE_SCHEMA.md)
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb project_management

   # Or using psql
   psql -U postgres
   CREATE DATABASE project_management;
   \q
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Push schema to database**
   ```bash
   npx prisma db push
   ```

### Step 5: Environment Configuration

1. **Create environment files**

   **Frontend (.env)**
   ```bash
   VITE_API_URL=http://localhost:3001
       VITE_API_URL=http://localhost:3001
   ```

   **Backend (.env)**
   ```bash
   # Server
   PORT=3001
   NODE_ENV=development

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/project_management"

       # JWT
    JWT_SECRET=your_super_secret_jwt_key_here
    JWT_EXPIRES_IN=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # SendGrid
   SENDGRID_API_KEY=your_sendgrid_api_key

   # CORS
   CORS_ORIGIN=http://localhost:5173

   # File Upload
   MAX_FILE_SIZE=10485760
   ```

### Step 6: JWT Authentication Setup

1. **Create authentication middleware**
   ```javascript
   // src/middleware/auth.js
   import jwt from 'jsonwebtoken';
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();

   export const authenticateToken = async (req, res, next) => {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];

     if (!token) {
       return res.status(401).json({ error: 'Access token required' });
     }

     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await prisma.user.findUnique({
         where: { id: decoded.userId },
         select: { id: true, email: true, name: true, role: true }
       });

       if (!user) {
         return res.status(401).json({ error: 'Invalid token' });
       }

       req.user = user;
       next();
     } catch (error) {
       return res.status(403).json({ error: 'Invalid token' });
     }
   };
   ```

2. **Create authentication controller**
   ```javascript
   // src/controllers/authController.js
   import bcrypt from 'bcryptjs';
   import jwt from 'jsonwebtoken';
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();

   export const register = async (req, res) => {
     try {
       const { name, email, password } = req.body;

       // Check if user already exists
       const existingUser = await prisma.user.findUnique({
         where: { email }
       });

       if (existingUser) {
         return res.status(400).json({ error: 'User already exists' });
       }

       // Hash password
       const saltRounds = 12;
       const passwordHash = await bcrypt.hash(password, saltRounds);

       // Create user
       const user = await prisma.user.create({
         data: {
           name,
           email,
           passwordHash,
           role: 'MEMBER'
         },
         select: {
           id: true,
           name: true,
           email: true,
           role: true,
           createdAt: true
         }
       });

       // Generate JWT token
       const token = jwt.sign(
         { userId: user.id },
         process.env.JWT_SECRET,
         { expiresIn: process.env.JWT_EXPIRES_IN }
       );

       res.status(201).json({
         success: true,
         data: {
           user,
           token,
           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
         }
       });
     } catch (error) {
       res.status(500).json({ error: 'Registration failed' });
     }
   };

   export const login = async (req, res) => {
     try {
       const { email, password } = req.body;

       // Find user
       const user = await prisma.user.findUnique({
         where: { email }
       });

       if (!user) {
         return res.status(401).json({ error: 'Invalid credentials' });
       }

       // Verify password
       const isValidPassword = await bcrypt.compare(password, user.passwordHash);

       if (!isValidPassword) {
         return res.status(401).json({ error: 'Invalid credentials' });
       }

       // Generate JWT token
       const token = jwt.sign(
         { userId: user.id },
         process.env.JWT_SECRET,
         { expiresIn: process.env.JWT_EXPIRES_IN }
       );

       res.json({
         success: true,
         data: {
           user: {
             id: user.id,
             name: user.name,
             email: user.email,
             role: user.role,
             avatar: user.avatar
           },
           token,
           expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
         }
       });
     } catch (error) {
       res.status(500).json({ error: 'Login failed' });
     }
   };
   ```

### Step 7: Cloudinary Setup

1. **Create Cloudinary account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for free account
   - Get cloud name, API key, and API secret

2. **Configure Cloudinary in backend**
   ```javascript
   // src/config/cloudinary.js
   import { v2 as cloudinary } from 'cloudinary';

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export default cloudinary;
   ```

### Step 8: SendGrid Setup

1. **Create SendGrid account**
   - Go to [SendGrid](https://sendgrid.com/)
   - Sign up for free account
   - Create API key

2. **Configure SendGrid in backend**
   ```javascript
   // src/config/sendgrid.js
   import sgMail from '@sendgrid/mail';

   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   export default sgMail;
   ```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend server** (in new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build backend**
   ```bash
   cd backend
   npm run build
   ```

## 🧪 Testing Setup

### Frontend Testing

1. **Install testing dependencies**
   ```bash
   cd frontend
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   npm install -D jsdom @testing-library/user-event
   ```

2. **Configure Vitest**
   ```javascript
   // vite.config.ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './src/test/setup.ts',
     },
   });
   ```

3. **Create test setup**
   ```typescript
   // src/test/setup.ts
   import '@testing-library/jest-dom';
   ```

### Backend Testing

1. **Configure Jest**
   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'node',
     testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
     collectCoverageFrom: [
       'src/**/*.js',
       '!src/server.js',
       '!src/scripts/**',
     ],
   };
   ```

2. **Create test database**
   ```bash
   createdb project_management_test
   ```

## 📦 Deployment Preparation

### Frontend (Vercel)

1. **Create vercel.json**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

2. **Configure environment variables in Vercel dashboard**

### Backend (Render)

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: project-management-api
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

2. **Configure environment variables in Render dashboard**

## 🔧 Development Tools

### VS Code Extensions

Install these recommended extensions:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-js-debug"
  ]
}
```

### Git Hooks

1. **Install Husky**
   ```bash
   npm install -D husky lint-staged
   npx husky install
   ```

2. **Configure pre-commit hook**
   ```bash
   npx husky add .husky/pre-commit "npx lint-staged"
   ```

3. **Configure lint-staged**
   ```json
   // package.json
   {
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": [
         "eslint --fix",
         "prettier --write"
       ],
       "*.{json,md}": [
         "prettier --write"
       ]
     }
   }
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **JWT authentication errors**
   - Verify JWT_SECRET in environment variables
   - Check token expiration settings
   - Ensure proper password hashing

3. **File upload issues**
   - Check Cloudinary credentials
   - Verify file size limits
   - Ensure proper CORS configuration

4. **Build errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma db push --force-reset

# Generate Prisma client
npx prisma generate

# Check environment variables
node -e "console.log(process.env)"

# Test API endpoints
curl http://localhost:3001/api/health
```

## 📚 Next Steps

After completing this setup:

1. **Implement core features** following the development plan
2. **Set up CI/CD pipeline** with GitHub Actions
3. **Configure monitoring** with Sentry
4. **Add comprehensive testing**
5. **Deploy to production**

For detailed implementation guidance, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)
- [API_SPECIFICATION.md](./API_SPECIFICATION.md)

---

This setup guide provides everything needed to get started with the Project Management Dashboard. Follow each step carefully and refer to the documentation for detailed implementation guidance. 