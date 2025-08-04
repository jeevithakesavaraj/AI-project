import dotenv from 'dotenv';
import { spawn } from 'child_process';

// Set default environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'project_management_db';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'root';
process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
process.env.JWT_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:5173';

console.log('🚀 Starting server with environment variables...');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

// Start the server
const server = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
}); 