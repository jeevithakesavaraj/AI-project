import pool from './src/config/database.js';

async function fixTimeTracking() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing time tracking database...');

    // Check if time_entries table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'time_entries'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Creating time_entries table...');
      
      await client.query(`
        CREATE TABLE time_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          description TEXT,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          end_time TIMESTAMP WITH TIME ZONE,
          duration INTEGER, -- in minutes
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
        CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
        CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
      `);

      console.log('✅ time_entries table created successfully');
    } else {
      console.log('✅ time_entries table already exists');
      
      // Check if duration column exists
      const durationExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'time_entries' 
          AND column_name = 'duration'
        );
      `);
      
      if (!durationExists.rows[0].exists) {
        console.log('Adding duration column to time_entries table...');
        await client.query('ALTER TABLE time_entries ADD COLUMN duration INTEGER;');
        console.log('✅ duration column added');
      } else {
        console.log('✅ duration column already exists');
      }
    }

    // Check if there are any time entries
    const timeEntriesCount = await client.query('SELECT COUNT(*) FROM time_entries');
    console.log(`Found ${timeEntriesCount.rows[0].count} time entries`);

    // Create some sample time entries for testing
    console.log('\n📝 Creating sample time entries...');
    
    // Get some tasks and users
    const tasks = await client.query('SELECT id FROM tasks LIMIT 3');
    const users = await client.query('SELECT id FROM users LIMIT 3');
    
    if (tasks.rows.length > 0 && users.rows.length > 0) {
      const sampleEntries = [
        {
          taskId: tasks.rows[0].id,
          userId: users.rows[0].id,
          description: 'Initial setup and configuration',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          duration: 60 // 60 minutes
        },
        {
          taskId: tasks.rows[0].id,
          userId: users.rows[0].id,
          description: 'Testing and debugging',
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          endTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          duration: 15 // 15 minutes
        }
      ];

      for (const entry of sampleEntries) {
        await client.query(`
          INSERT INTO time_entries (task_id, user_id, description, start_time, end_time, duration)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [entry.taskId, entry.userId, entry.description, entry.startTime, entry.endTime, entry.duration]);
      }

      console.log('✅ Sample time entries created');
    }

    // Test the time tracking queries
    console.log('\n🧪 Testing time tracking queries...');
    
    // Test get time entries for a task
    if (tasks.rows.length > 0) {
      const taskId = tasks.rows[0].id;
      const timeEntries = await client.query(`
        SELECT te.*, u.name as user_name, u.avatar as user_avatar
        FROM time_entries te
        JOIN users u ON te.user_id = u.id
        WHERE te.task_id = $1
        ORDER BY te.start_time DESC
      `, [taskId]);
      
      console.log(`✅ Found ${timeEntries.rows.length} time entries for task ${taskId}`);
    }

    console.log('\n✅ Time tracking database fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing time tracking:', error);
  } finally {
    client.release();
  }
}

fixTimeTracking().catch(console.error); 