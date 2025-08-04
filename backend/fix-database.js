import pkg from 'pg';
const { Pool } = pkg;

const checkBothDatabases = async () => {
  console.log('🔍 Checking both databases...\n');
  
  // Check project_management_db
  try {
    const pool1 = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'project_management_db',
      password: 'password',
      port: 5432,
    });
    
    const client1 = await pool1.connect();
    try {
      const count1 = await client1.query('SELECT COUNT(*) as count FROM users');
      console.log(`📊 project_management_db: ${count1.rows[0].count} users`);
    } finally {
      client1.release();
      await pool1.end();
    }
  } catch (error) {
    console.log('❌ project_management_db: Connection failed');
  }
  
  // Check project_management
  try {
    const pool2 = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'project_management',
      password: 'password',
      port: 5432,
    });
    
    const client2 = await pool2.connect();
    try {
      const count2 = await client2.query('SELECT COUNT(*) as count FROM users');
      console.log(`📊 project_management: ${count2.rows[0].count} users`);
    } finally {
      client2.release();
      await pool2.end();
    }
  } catch (error) {
    console.log('❌ project_management: Connection failed');
  }
  
  console.log('\n💡 Recommendation:');
  console.log('1. If you want to use project_management_db (your local database):');
  console.log('   - Update .env file: DB_NAME=project_management_db');
  console.log('   - Run: npm run db:setup');
  console.log('');
  console.log('2. If you want to use project_management (has your data):');
  console.log('   - Keep current .env file as is');
  console.log('   - Your data is already there!');
};

checkBothDatabases(); 