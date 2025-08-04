import pool from './src/config/database.js';

async function createCommentsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating comments database schema...');

    // Check if comments table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comments'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Creating comments table...');
      
      await client.query(`
        CREATE TABLE comments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX idx_comments_task_id ON comments(task_id);
        CREATE INDEX idx_comments_project_id ON comments(project_id);
        CREATE INDEX idx_comments_user_id ON comments(user_id);
        CREATE INDEX idx_comments_parent_id ON comments(parent_id);
        CREATE INDEX idx_comments_created_at ON comments(created_at);
      `);

      console.log('✅ comments table created successfully');
    } else {
      console.log('✅ comments table already exists');
    }

    // Check if notifications table exists
    const notificationsExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);

    if (!notificationsExists.rows[0].exists) {
      console.log('Creating notifications table...');
      
      await client.query(`
        CREATE TABLE notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          read_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX idx_notifications_type ON notifications(type);
        CREATE INDEX idx_notifications_read_at ON notifications(read_at);
        CREATE INDEX idx_notifications_created_at ON notifications(created_at);
      `);

      console.log('✅ notifications table created successfully');
    } else {
      console.log('✅ notifications table already exists');
    }

    console.log('\n✅ Comments and notifications database setup complete!');
    
  } catch (error) {
    console.error('❌ Error creating comments schema:', error);
  } finally {
    client.release();
  }
}

createCommentsTable().catch(console.error); 