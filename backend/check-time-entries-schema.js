import pool from './src/config/database.js';

async function checkTimeEntriesSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking time_entries table schema...');
    
    // Get table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'time_entries'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Time entries table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check if there are any time entries
    const entriesResult = await client.query('SELECT id, task_id, user_id, start_time, end_time, duration FROM time_entries LIMIT 3');
    console.log('\n📋 Sample time entries:');
    entriesResult.rows.forEach(entry => {
      console.log(`- ID: ${entry.id}, Task: ${entry.task_id}, User: ${entry.user_id}, Start: ${entry.start_time}, End: ${entry.end_time}, Duration: ${entry.duration}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    client.release();
  }
}

checkTimeEntriesSchema().catch(console.error); 