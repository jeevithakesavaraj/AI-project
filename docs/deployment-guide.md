# Deployment Guide

## Overview

This guide covers the complete deployment process for the Project Management System on Render.

## Prerequisites

- GitHub repository with your project code
- Render account (free tier available)
- PostgreSQL database (Render provides this)

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure all code is committed:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify repository structure:**
   ```
   project-management/
   ├── frontend/
   │   ├── package.json
   │   └── src/
   ├── backend/
   │   ├── package.json
   │   └── src/
   ├── render.yaml
   └── README.md
   ```

### Step 2: Create PostgreSQL Database

1. **Go to Render Dashboard:**
   - Visit [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "PostgreSQL"

2. **Configure Database:**
   - **Name**: `project-management-db`
   - **Database**: `project_management_db_6rxy`
   - **User**: `project_management_db_6rxy_user`
   - **Plan**: Free (or your preferred plan)

3. **Get Database URL:**
   - Copy the "External Database URL"
   - Format: `postgresql://user:password@host:port/database`

### Step 3: Deploy Backend Service

1. **Create Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   - **Name**: `project-management-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your_postgresql_database_url
   JWT_SECRET=your_secure_jwt_secret_key
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build completion
   - Note the backend URL

### Step 4: Deploy Frontend Service

1. **Create Static Site:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Static Site"
   - Connect the same GitHub repository

2. **Configure Service:**
   - **Name**: `project-management-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Root Directory**: Leave empty

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for build completion
   - Note the frontend URL

### Step 5: Initialize Database

1. **Run Database Setup:**
   ```bash
   # Set environment variable
   $env:DATABASE_URL="your_database_url"
   
   # Run setup script
   node backend/src/scripts/setup-db.js
   ```

2. **Verify Tables Created:**
   - Users table
   - Projects table
   - Project_members table
   - Tasks table
   - Time_entries table

### Step 6: Update CORS Settings

1. **Update Backend CORS:**
   - Go to your backend service on Render
   - Go to "Environment" tab
   - Update `CORS_ORIGIN` to your frontend URL
   - Redeploy the backend service

### Step 7: Test Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Try to register/login
   - Test core functionality

## Environment Variables Reference

### Backend Environment Variables

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secure_jwt_secret_key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
- **Check**: All dependencies in package.json
- **Verify**: Node.js version compatibility
- **Review**: Build logs for specific errors

#### 2. Database Connection Issues
- **Verify**: DATABASE_URL is correct
- **Check**: SSL configuration
- **Test**: Connection locally

#### 3. CORS Errors
- **Ensure**: CORS_ORIGIN is set correctly
- **Check**: Frontend URL is accessible
- **Verify**: Backend is accepting requests

#### 4. Environment Variables Not Working
- **Restart**: Service after adding variables
- **Check**: Variable names are correct
- **Verify**: No typos in values

### Useful Commands

#### Check Application Status
```bash
# Test backend health
curl https://your-backend-url.onrender.com/health

# Check build logs
# Go to Render dashboard → Your service → Logs
```

#### Database Management
```bash
# Connect to production database
psql "your_database_url"

# Run setup script
DATABASE_URL=your_database_url node backend/src/scripts/setup-db.js
```

## Security Considerations

### Environment Variables
- Use strong JWT secrets
- Never commit sensitive data to Git
- Use Render's environment variable system

### Database Security
- Enable SSL connections
- Use strong passwords
- Regular backups

### Application Security
- Input validation
- JWT token security
- CORS configuration
- Rate limiting (if needed)

## Monitoring & Maintenance

### Health Checks
- Monitor backend health endpoint
- Check database connectivity
- Review application logs

### Performance Monitoring
- Monitor response times
- Check database query performance
- Review error rates

### Regular Maintenance
- Update dependencies
- Monitor security advisories
- Backup database regularly

## Support Resources

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [Static Site Deployment](https://render.com/docs/deploy-create-react-app)

## Success Criteria

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Backend API responds correctly
- ✅ Users can register and login
- ✅ All core features work
- ✅ Admin functionality works
- ✅ No console errors in browser
- ✅ API endpoints return correct responses

---

*Deployment Guide Generated: August 4, 2025*
*Last Updated: August 4, 2025* 