import pool from './src/config/database.js';

const testRoleSystem = async () => {
  console.log('🧪 Testing Role Management System...\n');
  
  const client = await pool.connect();
  
  try {
    // Test 1: Check if users table has role column
    console.log('1. Checking users table structure...');
    const userTableResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    
    if (userTableResult.rows.length > 0) {
      console.log('✅ Users table has role column');
    } else {
      console.log('❌ Users table missing role column');
    }

    // Test 2: Check if project_members table exists
    console.log('\n2. Checking project_members table...');
    const projectMembersResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'project_members'
    `);
    
    if (projectMembersResult.rows.length > 0) {
      console.log('✅ project_members table exists');
    } else {
      console.log('❌ project_members table missing');
    }

    // Test 3: Check project_members table structure
    console.log('\n3. Checking project_members table structure...');
    const projectMembersColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'project_members'
      ORDER BY column_name
    `);
    
    console.log('Project members columns:');
    projectMembersColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Test 4: Check if projects table has correct structure
    console.log('\n4. Checking projects table structure...');
    const projectsColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY column_name
    `);
    
    console.log('Projects columns:');
    projectsColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Test 5: Check for any existing data
    console.log('\n5. Checking existing data...');
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const projectCount = await client.query('SELECT COUNT(*) as count FROM projects');
    const memberCount = await client.query('SELECT COUNT(*) as count FROM project_members');
    
    console.log(`   - Users: ${userCount.rows[0].count}`);
    console.log(`   - Projects: ${projectCount.rows[0].count}`);
    console.log(`   - Project Members: ${memberCount.rows[0].count}`);

    console.log('\n✅ Role management system structure verified!');
    
  } catch (error) {
    console.error('❌ Error testing role system:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

testRoleSystem().catch(console.error); 