import pool from './src/config/database.js';

async function checkProjectRoles() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking available project roles...');
    
    // Get enum values
    const result = await client.query(`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'project_role')
      ORDER BY enumsortorder
    `);
    
    console.log('\n📋 Available project roles:');
    result.rows.forEach(row => {
      console.log(`- ${row.enumlabel}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking project roles:', error);
  } finally {
    client.release();
  }
}

checkProjectRoles().catch(console.error); 