import pool from './src/config/database.js';

async function checkUsersSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking users table schema...');
    
    // Get table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check if there are any users
    const usersResult = await client.query('SELECT id, name, email, role FROM users LIMIT 5');
    console.log('\n👥 Sample users:');
    usersResult.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    client.release();
  }
}

checkUsersSchema().catch(console.error); 