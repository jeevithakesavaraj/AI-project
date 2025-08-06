import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import readline from 'readline';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

const setupDatabase = async () => {
  try {
    console.log('🔧 Database Setup Tool');
    console.log('=====================\n');

    // Get DATABASE_URL from user
    const databaseUrl = await askQuestion('Enter your DATABASE_URL from Render: ');
    
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL is required!');
      rl.close();
      return;
    }

    // Create pool with the provided DATABASE_URL
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    
    try {
      console.log('\n📋 Setting up database tables with correct schema...');

      // Drop existing tables if they exist (for clean setup)
      await client.query(`
        DROP TABLE IF EXISTS notifications CASCADE;
        DROP TABLE IF EXISTS comments CASCADE;
        DROP TABLE IF EXISTS time_entries CASCADE;
        DROP TABLE IF EXISTS attachments CASCADE;
        DROP TABLE IF EXISTS tasks CASCADE;
        DROP TABLE IF EXISTS project_members CASCADE;
        DROP TABLE IF EXISTS projects CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);

      // Create users table with correct schema
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'USER',
          avatar VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login_at TIMESTAMP
        )
      `);

      // Create projects table
      await client.query(`
        CREATE TABLE projects (
          id SERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'ACTIVE',
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create project_members table
      await client.query(`
        CREATE TABLE project_members (
          id SERIAL PRIMARY KEY,
          project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(50) DEFAULT 'MEMBER',
          is_active BOOLEAN DEFAULT true,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          left_at TIMESTAMP,
          UNIQUE(project_id, user_id)
        )
      `);

      // Create tasks table
      await client.query(`
        CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'TODO',
          priority VARCHAR(50) DEFAULT 'MEDIUM',
          type VARCHAR(50) DEFAULT 'TASK',
          story_points INTEGER,
          due_date TIMESTAMP,
          project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
          assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create time_entries table
      await client.query(`
        CREATE TABLE time_entries (
          id SERIAL PRIMARY KEY,
          task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          description TEXT,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP,
          duration INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create comments table
      await client.query(`
        CREATE TABLE comments (
          id SERIAL PRIMARY KEY,
          task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create attachments table
      await client.query(`
        CREATE TABLE attachments (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          size INTEGER NOT NULL,
          url VARCHAR(500) NOT NULL,
          project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
          task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create notifications table
      await client.query(`
        CREATE TABLE notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(200) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_tasks_project_id ON tasks(project_id);
        CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
        CREATE INDEX idx_tasks_status ON tasks(status);
        CREATE INDEX idx_project_members_project_id ON project_members(project_id);
        CREATE INDEX idx_project_members_user_id ON project_members(user_id);
        CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
        CREATE INDEX idx_comments_task_id ON comments(task_id);
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
      `);

      console.log('✅ Database setup completed successfully!');

      // Create default admin user
      console.log('\n👤 Creating default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.query(`
        INSERT INTO users (name, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['Admin User', 'admin@example.com', hashedPassword, 'ADMIN', true]);
      
      console.log('✅ Default admin user created:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');

      console.log('\n🎉 Database setup is complete!');
      console.log('You can now test your backend endpoints.');

    } catch (error) {
      console.error('❌ Error setting up database:', error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    rl.close();
  }
};

// Run the setup
setupDatabase(); 