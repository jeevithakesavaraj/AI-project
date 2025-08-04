import pool from './src/config/database.js';
import bcrypt from 'bcryptjs';

const testAdminLogin = async () => {
  console.log('🔧 Testing Admin Login...\n');
  
  const client = await pool.connect();
  
  try {
    // Check if admin user exists
    console.log('1. Checking if admin user exists...');
    const adminResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@projectmanagement.com']
    );

    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found!');
      return;
    }

    const admin = adminResult.rows[0];
    console.log('✅ Admin user found:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Is Active: ${admin.is_active}`);

    // Test password verification
    console.log('\n2. Testing password verification...');
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password_hash);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
    }

    // Test login query
    console.log('\n3. Testing login query...');
    const loginResult = await client.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      ['admin@projectmanagement.com']
    );

    if (loginResult.rows.length > 0) {
      console.log('✅ Login query successful');
      const loginUser = loginResult.rows[0];
      console.log(`   User found: ${loginUser.name} (${loginUser.role})`);
    } else {
      console.log('❌ Login query failed - user not found or inactive');
    }

    // Check all users in database
    console.log('\n4. All users in database:');
    const allUsers = await client.query('SELECT id, name, email, role, is_active FROM users');
    allUsers.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.is_active}`);
    });

  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

testAdminLogin().catch(console.error); 