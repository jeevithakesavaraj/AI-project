import pool from './src/config/database.js';

async function checkUserRoles() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking available user roles...');
    
    // Get enum values
    const result = await client.query(`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
      ORDER BY enumsortorder
    `);
    
    console.log('\n📋 Available user roles:');
    result.rows.forEach(row => {
      console.log(`- ${row.enumlabel}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    client.release();
  }
}

checkUserRoles().catch(console.error); 