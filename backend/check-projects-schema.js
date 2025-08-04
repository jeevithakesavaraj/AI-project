import pool from './src/config/database.js';

async function checkProjectsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking projects table schema...');
    
    // Get table structure
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Projects table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check sample projects
    const projectsResult = await client.query('SELECT id, name, created_by FROM projects LIMIT 3');
    console.log('\n📋 Sample projects:');
    projectsResult.rows.forEach(project => {
      console.log(`- ${project.name} (created_by: ${project.created_by})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    client.release();
  }
}

checkProjectsSchema().catch(console.error); 