import pkg from 'pg';
const { Pool } = pkg;

const testCorrectDB = async () => {
  try {
    console.log('🔍 Testing connection to project_management_db...\n');
    
    // Create a new pool with the correct database name
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'project_management_db', // Your actual database name
      password: 'password',
      port: 5432,
    });
    
    const client = await pool.connect();
    try {
      console.log('✅ Successfully connected to project_management_db!');
      
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
        
        // Show recent users
        const usersResult = await client.query(`
          SELECT id, name, email, role, created_at 
          FROM users 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        
        if (usersResult.rows.length > 0) {
          console.log('\n📋 Recent Users:');
          usersResult.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
          });
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
    console.log('\n💡 This means you need to:');
    console.log('1. Create the database: project_management_db');
    console.log('2. Run the database setup script');
    console.log('3. Or update the .env file to use the correct database name');
  }
};

testCorrectDB(); 