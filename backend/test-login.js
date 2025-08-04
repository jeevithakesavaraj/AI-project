import bcrypt from 'bcryptjs';
import pool from './src/config/database.js';

async function testLogin() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing login functionality...\n');
    
    // Test with admin user
    const email = 'admin@projectmanagement.com';
    const password = 'admin123';
    
    console.log(`Testing login with: ${email}`);
    
    // Check if user exists
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database');
      return;
    }
    
    const user = userResult.rows[0];
    console.log(`✅ User found: ${user.name} (${user.role})`);
    console.log(`Active: ${user.is_active}`);
    
    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(`Password valid: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password is incorrect');
    }
    
    // Test with wrong password
    const wrongPassword = 'wrongpassword';
    const isWrongPasswordValid = await bcrypt.compare(wrongPassword, user.password_hash);
    console.log(`Wrong password valid: ${isWrongPasswordValid}`);
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    client.release();
  }
}

testLogin().catch(console.error); 