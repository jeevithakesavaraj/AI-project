const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/project_management'
});

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    const client = await pool.connect();
    
    try {
      // Check users table structure
      console.log('📋 Users table structure:');
      const usersResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);
      usersResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
      });

      console.log('\n📋 Projects table structure:');
      const projectsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'projects'
        ORDER BY ordinal_position;
      `);
      projectsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
      });

      console.log('\n📋 Project_members table structure:');
      const membersResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'project_members'
        ORDER BY ordinal_position;
      `);
      membersResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
      });

      console.log('\n📋 Tasks table structure:');
      const tasksResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tasks'
        ORDER BY ordinal_position;
      `);
      tasksResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
      });

      // Check enum types
      console.log('\n📋 Enum types:');
      const enumsResult = await client.query(`
        SELECT t.typname, e.enumlabel
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        ORDER BY t.typname, e.enumsortorder;
      `);
      enumsResult.rows.forEach(row => {
        console.log(`  - ${row.typname}: ${row.enumlabel}`);
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkDatabaseSchema(); 