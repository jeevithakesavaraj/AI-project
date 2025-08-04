import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testProjectLoading() {
  try {
    console.log('🔍 Testing project loading for different users...\n');
    
    // Test with admin user
    console.log('1. Testing with Admin user...');
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@projectmanagement.com',
      password: 'admin123'
    });
    
    const adminToken = adminLogin.data.data.token;
    console.log('✅ Admin login successful');
    
    // Get projects as admin
    const adminProjectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`Admin can see ${adminProjectsResponse.data.data.projects.length} projects:`);
    adminProjectsResponse.data.data.projects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.status})`);
    });
    
    // Test with project manager
    console.log('\n2. Testing with Project Manager user...');
    const pmLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'pm@projectmanagement.com',
      password: 'pm123'
    });
    
    const pmToken = pmLogin.data.data.token;
    console.log('✅ Project Manager login successful');
    
    // Get projects as PM
    const pmProjectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${pmToken}` }
    });
    
    console.log(`Project Manager can see ${pmProjectsResponse.data.data.projects.length} projects:`);
    pmProjectsResponse.data.data.projects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.status})`);
    });
    
    // Test with regular user
    console.log('\n3. Testing with Regular user...');
    const userLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'user@projectmanagement.com',
      password: 'user123'
    });
    
    const userToken = userLogin.data.data.token;
    console.log('✅ Regular user login successful');
    
    // Get projects as regular user
    const userProjectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log(`Regular user can see ${userProjectsResponse.data.data.projects.length} projects:`);
    userProjectsResponse.data.data.projects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.status})`);
    });
    
    console.log('\n📋 Summary:');
    console.log(`- Admin: ${adminProjectsResponse.data.data.projects.length} projects`);
    console.log(`- Project Manager: ${pmProjectsResponse.data.data.projects.length} projects`);
    console.log(`- Regular User: ${userProjectsResponse.data.data.projects.length} projects`);
    
  } catch (error) {
    console.error('❌ Error testing project loading:', error.response?.data || error.message);
  }
}

testProjectLoading(); 