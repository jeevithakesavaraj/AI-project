import pool from './src/config/database.js';

async function checkProjectOwnership() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking project ownership and membership...');
    
    // Check all projects
    const projectsResult = await client.query(`
      SELECT p.id, p.name, p.owner_id, p.creator_id, 
             u1.name as owner_name, u2.name as creator_name
      FROM projects p
      LEFT JOIN users u1 ON p.owner_id = u1.id
      LEFT JOIN users u2 ON p.creator_id = u2.id
    `);
    
    console.log('\n📋 All projects:');
    projectsResult.rows.forEach(project => {
      console.log(`- ${project.name} (owner: ${project.owner_name}, creator: ${project.creator_name})`);
    });
    
    // Check project members
    const membersResult = await client.query(`
      SELECT pm.project_id, pm.user_id, pm.role, pm.is_active,
             p.name as project_name, u.name as user_name
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      JOIN users u ON pm.user_id = u.id
      WHERE pm.is_active = true
      ORDER BY p.name, u.name
    `);
    
    console.log('\n📋 Project members:');
    membersResult.rows.forEach(member => {
      console.log(`- ${member.project_name}: ${member.user_name} (${member.role})`);
    });
    
    // Check specific users
    const usersResult = await client.query(`
      SELECT id, name, email, role
      FROM users
      WHERE email IN ('admin@projectmanagement.com', 'pm@projectmanagement.com', 'user@projectmanagement.com')
    `);
    
    console.log('\n📋 Test users:');
    usersResult.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking project ownership:', error);
  } finally {
    client.release();
  }
}

checkProjectOwnership().catch(console.error); 