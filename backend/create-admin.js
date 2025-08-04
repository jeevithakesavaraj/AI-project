import pool from './src/config/database.js';
import bcrypt from 'bcryptjs';

const createAdminUser = async () => {
  console.log('🔧 Creating Admin User...\n');
  
  const client = await pool.connect();
  
  try {
    // Check if admin user already exists
    const existingAdmin = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@projectmanagement.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, role`,
      ['Admin User', 'admin@projectmanagement.com', passwordHash, 'ADMIN', true]
    );

    const admin = result.rows[0];
    console.log('✅ Admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@projectmanagement.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
};

createAdminUser().catch(console.error); 