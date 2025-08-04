# Deployment Checklist for Render

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All code is committed to Git repository
- [ ] No sensitive data in code (passwords, API keys, etc.)
- [ ] Environment variables are properly configured
- [ ] Database schema is ready
- [ ] All dependencies are in package.json files

### ✅ Repository Structure
- [ ] Repository has correct structure:
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

### ✅ Configuration Files
- [ ] `render.yaml` is created and configured
- [ ] `backend/package.json` has correct scripts
- [ ] `frontend/package.json` has correct scripts
- [ ] Database configuration supports production

## Step-by-Step Deployment

### Step 1: Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Copy the External Database URL
- [ ] Test database connection locally

### Step 2: Backend Deployment
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Configure service settings:
  - [ ] Name: `project-management-backend`
  - [ ] Environment: `Node`
  - [ ] Build Command: `cd backend && npm install`
  - [ ] Start Command: `cd backend && npm start`
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `DATABASE_URL=your_postgresql_url`
  - [ ] `JWT_SECRET=your_secure_jwt_secret`
  - [ ] `CORS_ORIGIN=https://your-frontend-url.onrender.com`
- [ ] Deploy and wait for build completion
- [ ] Note the backend URL

### Step 3: Frontend Deployment
- [ ] Create new Static Site on Render
- [ ] Connect the same GitHub repository
- [ ] Configure service settings:
  - [ ] Name: `project-management-frontend`
  - [ ] Build Command: `cd frontend && npm install && npm run build`
  - [ ] Publish Directory: `frontend/dist`
- [ ] Set environment variables:
  - [ ] `VITE_API_URL=https://your-backend-url.onrender.com`
- [ ] Deploy and wait for build completion
- [ ] Note the frontend URL

### Step 4: Database Initialization
- [ ] Run database setup script:
  ```bash
  # Option 1: Run locally with production database
  DATABASE_URL=your_production_db_url node backend/src/scripts/setup-db.js
  
  # Option 2: Connect to database and run SQL manually
  ```
- [ ] Verify tables are created
- [ ] Check that admin user is created

### Step 5: CORS Configuration
- [ ] Update backend CORS_ORIGIN to frontend URL
- [ ] Redeploy backend service
- [ ] Test CORS is working

### Step 6: Testing
- [ ] Test backend health endpoint
- [ ] Test frontend loads correctly
- [ ] Test user registration/login
- [ ] Test core functionality
- [ ] Test admin features

## Environment Variables Reference

### Backend Environment Variables
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your_secure_jwt_secret_key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend Environment Variables
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## Troubleshooting Common Issues

### Build Failures
- [ ] Check all dependencies are in package.json
- [ ] Verify Node.js version compatibility
- [ ] Check build logs for specific errors

### Database Connection Issues
- [ ] Verify DATABASE_URL is correct
- [ ] Check SSL configuration
- [ ] Test connection locally

### CORS Errors
- [ ] Ensure CORS_ORIGIN is set correctly
- [ ] Check frontend URL is accessible
- [ ] Verify backend is accepting requests

### Environment Variables Not Working
- [ ] Restart service after adding variables
- [ ] Check variable names are correct
- [ ] Verify no typos in values

## Post-Deployment Checklist

### ✅ Functionality Testing
- [ ] User registration works
- [ ] User login works
- [ ] Project creation works
- [ ] Task creation works
- [ ] Admin features work
- [ ] Task assignment works
- [ ] Kanban board works

### ✅ Security Testing
- [ ] HTTPS is enabled
- [ ] JWT tokens work correctly
- [ ] Admin access is restricted
- [ ] User permissions work correctly

### ✅ Performance Testing
- [ ] Page load times are acceptable
- [ ] API response times are good
- [ ] Database queries are optimized

### ✅ Monitoring Setup
- [ ] Check Render logs for errors
- [ ] Monitor application performance
- [ ] Set up alerts if needed

## Useful Commands

### Check Application Status
```bash
# Test backend health
curl https://your-backend-url.onrender.com/health

# Check build logs
# Go to Render dashboard → Your service → Logs
```

### Database Management
```bash
# Connect to production database
psql "your_database_url"

# Run setup script
DATABASE_URL=your_database_url node backend/src/scripts/setup-db.js
```

### Environment Variables
```bash
# Check current environment variables
# Go to Render dashboard → Your service → Environment
```

## Support Resources

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Node.js Deployment](https://render.com/docs/deploy-node-express-app)
- [Static Site Deployment](https://render.com/docs/deploy-create-react-app)

## Emergency Procedures

### If Backend is Down
1. Check Render logs for errors
2. Verify environment variables
3. Check database connection
4. Restart the service if needed

### If Frontend is Down
1. Check build logs
2. Verify environment variables
3. Check API URL configuration
4. Rebuild if necessary

### If Database is Down
1. Check database service status
2. Verify connection string
3. Check SSL configuration
4. Contact Render support if needed

## Success Criteria

Your deployment is successful when:
- [ ] Frontend loads without errors
- [ ] Backend API responds correctly
- [ ] Users can register and login
- [ ] All core features work
- [ ] Admin functionality works
- [ ] No console errors in browser
- [ ] API endpoints return correct responses

## Final Notes

- Keep your JWT secret secure and unique
- Regularly monitor your application logs
- Set up automated backups for your database
- Consider setting up monitoring and alerts
- Keep dependencies updated for security

Your application should now be live and accessible! 🚀 