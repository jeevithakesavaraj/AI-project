import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking Environment Variables:');
console.log('='.repeat(50));
console.log(`DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
console.log(`DB_PORT: ${process.env.DB_PORT || 'NOT SET'}`);
console.log(`DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
console.log(`DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET' : 'NOT SET'}`);
console.log('');
console.log('📋 This means the database will use:');
console.log(`Database Name: ${process.env.DB_NAME || 'project_management_db (default)'}`);
console.log(`Host: ${process.env.DB_HOST || 'localhost (default)'}`);
console.log(`Port: ${process.env.DB_PORT || '5432 (default)'}`);
console.log(`User: ${process.env.DB_USER || 'postgres (default)'}`); 