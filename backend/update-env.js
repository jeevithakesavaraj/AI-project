import fs from 'fs';
import path from 'path';

const updateEnvFile = () => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    
    // Read current .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add DB_NAME
    if (envContent.includes('DB_NAME=')) {
      envContent = envContent.replace(/DB_NAME=.*/g, 'DB_NAME=project_management_db');
    } else {
      envContent += '\nDB_NAME=project_management_db';
    }
    
    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Updated .env file to use project_management_db');
    console.log('📋 New database configuration:');
    console.log('   DB_NAME=project_management_db');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
};

updateEnvFile(); 