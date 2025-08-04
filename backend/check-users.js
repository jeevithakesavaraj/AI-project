import pool from './src/config/database.js';

async function checkUsers() {
  try {
    console.log('🔍 Checking users in the system...\n');
    
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT id, name, email, role FROM users ORDER BY created_at');
      
      console.log('Users found:', result.rows.length);
      result.rows.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers(); 