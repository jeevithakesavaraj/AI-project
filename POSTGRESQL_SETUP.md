# PostgreSQL Setup Guide

## Prerequisites

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/
   - Or use a package manager:
     - Windows: `choco install postgresql`
     - macOS: `brew install postgresql`
     - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Install pgAdmin** (Optional but recommended)
   - Download from: https://www.pgadmin.org/download/
   - Or use a package manager:
     - Windows: `choco install pgadmin4`
     - macOS: `brew install --cask pgadmin4`

## Database Setup

### 1. Start PostgreSQL Service

**Windows:**
```bash
# Start PostgreSQL service
net start postgresql-x64-15

# Or if using Chocolatey
Start-Service postgresql
```

**macOS:**
```bash
brew services start postgresql
```

**Ubuntu:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE project_management_db;

# Create user (optional)
CREATE USER project_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE project_management_db TO project_user;

# Exit psql
\q
```

### 3. Update Environment Variables

Edit `backend/.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_management_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 4. Setup Database Tables

```bash
cd backend
npm run db:setup
```

## Using pgAdmin

1. **Open pgAdmin**
2. **Add Server:**
   - Right-click "Servers" → "Register" → "Server"
   - General tab:
     - Name: `Project Management Local`
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Database: `postgres`
     - Username: `postgres`
     - Password: `your_password`

3. **Browse Database:**
   - Expand your server
   - Expand "Databases"
   - Expand "project_management_db"
   - View tables, run queries, etc.

## Common Commands

### Connect to Database
```bash
psql -U postgres -d project_management_db
```

### List Tables
```sql
\dt
```

### View Table Structure
```sql
\d table_name
```

### Run SQL File
```bash
psql -U postgres -d project_management_db -f script.sql
```

## Troubleshooting

### Connection Issues
- Check if PostgreSQL service is running
- Verify port 5432 is not blocked by firewall
- Ensure credentials in `.env` are correct

### Permission Issues
- Make sure the database user has proper privileges
- Check if the database exists

### Port Already in Use
- Check if another PostgreSQL instance is running
- Use `netstat -an | findstr 5432` (Windows) or `lsof -i :5432` (macOS/Linux)

## Development Workflow

1. **Start PostgreSQL service**
2. **Update `.env` with correct credentials**
3. **Run database setup:** `npm run db:setup`
4. **Start backend:** `npm run dev`
5. **Use pgAdmin for database management**

## Production Considerations

- Use environment variables for all database credentials
- Set up proper database backups
- Configure connection pooling
- Use SSL connections in production
- Set up proper database user permissions 