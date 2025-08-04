import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAdminProjects() {
  try {
    console.log('🔍 Testing admin project access...\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@projectmanagement.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Get projects
    console.log('\n2. Getting projects...');
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Projects found:', projectsResponse.data.data.projects.length);
    projectsResponse.data.data.projects.forEach(project => {
      console.log(`- ${project.name} (ID: ${project.id})`);
    });
    
    // Step 3: Test access to each project
    console.log('\n3. Testing access to each project...');
    for (const project of projectsResponse.data.data.projects) {
      try {
        console.log(`\nTesting access to: ${project.name}`);
        
        // Try to get project members
        const membersResponse = await axios.get(`${API_BASE_URL}/roles/projects/${project.id}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Access granted to ${project.name}`);
        console.log('Members:', membersResponse.data.data.members.length);
        
        // Try to create a task
        const taskData = {
          title: `Test Task in ${project.name}`,
          description: 'Test task creation',
          status: 'TODO',
          priority: 'MEDIUM',
          type: 'TASK'
        };
        
        const createTaskResponse = await axios.post(`${API_BASE_URL}/tasks/projects/${project.id}`, taskData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Task created successfully in ${project.name}`);
        console.log('Task ID:', createTaskResponse.data.data.task.id);
        
        // Clean up - delete the test task
        await axios.delete(`${API_BASE_URL}/tasks/${createTaskResponse.data.data.task.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Test task deleted');
        
      } catch (error) {
        console.log(`❌ No access to ${project.name}:`, error.response?.data?.message || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminProjects(); 