import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const testNewDB = async () => {
  try {
    console.log('🔍 Testing connection to project_management_db...\n');
    
    // Show current environment variables
    console.log('📋 Current Database Settings:');
    console.log('='.repeat(50));
    console.log(`DB_HOST: ${process.env.DB_HOST || 'localhost (default)'}`);
    console.log(`DB_PORT: ${process.env.DB_PORT || '5432 (default)'}`);
    console.log(`DB_NAME: ${process.env.DB_NAME || 'project_management_db (default)'}`);
    console.log(`DB_USER: ${process.env.DB_USER || 'postgres (default)'}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***SET***' : 'password (default)'}`);
    console.log('');
    
    // Create new pool with current env settings
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'project_management_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });
    
    const client = await pool.connect();
    try {
      console.log('✅ Database connection successful!');
      
      // Test query to get database name
      const dbResult = await client.query('SELECT current_database() as db_name');
      console.log(`📊 Connected to database: ${dbResult.rows[0].db_name}`);
      
      // Check if users table exists
      const tableResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      `);
      
      if (tableResult.rows.length > 0) {
        console.log('✅ Users table exists');
        
        // Count users
        const countResult = await client.query('SELECT COUNT(*) as user_count FROM users');
        console.log(`👥 Total users in database: ${countResult.rows[0].user_count}`);
        
        if (countResult.rows[0].user_count > 0) {
          // Show recent users
          const usersResult = await client.query(`
            SELECT id, name, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
          `);
          
          console.log('\n📋 Recent Users:');
          usersResult.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
          });
        } else {
          console.log('📝 No users found - database is ready for new data!');
        }
      } else {
        console.log('❌ Users table does not exist');
      }
      
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

testNewDB(); 