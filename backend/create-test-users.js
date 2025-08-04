import bcrypt from 'bcryptjs';
import pool from './src/config/database.js';

async function createTestUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating test users for role-based authentication...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, avatar, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        updated_at = NOW()
    `, ['Admin User', 'admin@projectmanagement.com', adminPassword, 'ADMIN', 'https://ui-avatars.com/api/?name=Admin&background=0D9488&color=fff']);

    // Create project manager user
    const pmPassword = await bcrypt.hash('pm123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, avatar, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        updated_at = NOW()
    `, ['Project Manager', 'pm@projectmanagement.com', pmPassword, 'MANAGER', 'https://ui-avatars.com/api/?name=PM&background=7C3AED&color=fff']);

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, avatar, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        updated_at = NOW()
    `, ['Regular User', 'user@projectmanagement.com', userPassword, 'USER', 'https://ui-avatars.com/api/?name=User&background=059669&color=fff']);

    console.log('✅ Test users created successfully!');
    console.log('\n📋 Test User Credentials:');
    console.log('Admin: admin@projectmanagement.com / admin123');
    console.log('Project Manager: pm@projectmanagement.com / pm123');
    console.log('User: user@projectmanagement.com / user123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    client.release();
  }
}

createTestUsers().catch(console.error); 