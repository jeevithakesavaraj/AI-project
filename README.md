# Project Management System

A full-stack project management application built with React, Node.js, and PostgreSQL.

## Features

- ✅ User authentication and authorization
- ✅ Project creation and management
- ✅ Task management with Kanban board
- ✅ User role management (Admin/User)
- ✅ Task assignment and tracking
- ✅ Real-time updates
- ✅ Responsive design

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Query

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Joi Validation

## Deployment to Render

### Step 1: Prepare Your Repository

1. **Commit all your changes to Git:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Ensure your repository structure is correct:**
   ```
   project-management/
   ├── frontend/
   │   ├── package.json
   │   ├── src/
   │   └── dist/ (will be generated)
   ├── backend/
   │   ├── package.json
   │   └── src/
   ├── render.yaml
   └── README.md
   ```

### Step 2: Set Up Database

1. **Create a PostgreSQL database on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "PostgreSQL"
   - Choose a name (e.g., "project-management-db")
   - Select your plan (Free tier available)
   - Click "Create Database"

2. **Get your database URL:**
   - Copy the "External Database URL" from your database settings
   - This will look like: `postgres://user:password@host:port/database`

### Step 3: Deploy Backend

1. **Create a new Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository with your project

2. **Configure the backend service:**
   - **Name:** `project-management-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** Leave empty (or specify if needed)

3. **Set Environment Variables:**
   - Click "Environment" tab
   - Add the following variables:
     ```
     NODE_ENV=production
     PORT=10000
     DATABASE_URL=your_postgresql_url_from_step_2
     JWT_SECRET=your_secure_jwt_secret_key
     CORS_ORIGIN=https://your-frontend-url.onrender.com
     ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for the build to complete
   - Note the URL (e.g., `https://project-management-backend.onrender.com`)

### Step 4: Deploy Frontend

1. **Create another Web Service:**
   - Go back to Render Dashboard
   - Click "New" → "Static Site"
   - Connect the same GitHub repository

2. **Configure the frontend service:**
   - **Name:** `project-management-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Root Directory:** Leave empty

3. **Set Environment Variables:**
   - Add the following variable:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for the build to complete
   - Note the URL (e.g., `https://project-management-frontend.onrender.com`)

### Step 5: Update CORS Settings

1. **Update backend CORS:**
   - Go to your backend service on Render
   - Go to "Environment" tab
   - Update `CORS_ORIGIN` to your frontend URL:
     ```
     CORS_ORIGIN=https://project-management-frontend.onrender.com
     ```
   - Redeploy the backend service

### Step 6: Initialize Database

1. **Set up database tables:**
   - You can either:
     - Run the database setup script locally and connect to the production database
     - Or manually create the tables using the SQL scripts in your codebase

2. **Create an admin user:**
   - Use your API endpoints to create the first admin user
   - Or insert directly into the database

### Step 7: Test Your Deployment

1. **Test the backend:**
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

2. **Test the frontend:**
   - Visit your frontend URL
   - Try to register/login
   - Test the main functionality

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your_secure_jwt_secret_key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check that all dependencies are in package.json
   - Ensure Node.js version is specified in package.json

2. **Database connection fails:**
   - Verify DATABASE_URL is correct
   - Check that SSL is properly configured

3. **CORS errors:**
   - Ensure CORS_ORIGIN is set correctly
   - Check that frontend URL is accessible

4. **Environment variables not working:**
   - Restart the service after adding environment variables
   - Check variable names are correct

### Useful Commands:

```bash
# Check build logs
# Go to your service on Render and check "Logs" tab

# Test API locally
curl https://your-backend-url.onrender.com/health

# Check database connection
# Use a PostgreSQL client to connect to your database URL
```

## Support

If you encounter issues:
1. Check the Render logs for error messages
2. Verify all environment variables are set correctly
3. Test the API endpoints individually
4. Check the database connection

## Security Notes

- Use strong JWT secrets
- Enable HTTPS (automatic on Render)
- Regularly update dependencies
- Monitor your application logs
- Use environment variables for sensitive data

Your application should now be live and accessible via the frontend URL! 