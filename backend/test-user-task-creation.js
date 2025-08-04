import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testUserTaskCreation() {
  try {
    console.log('🔍 Testing user task creation...\n');
    
    // Step 1: Login as user
    console.log('1. Logging in as user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'user@projectmanagement.com',
      password: 'user123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log('User role:', user.role);
    console.log('User ID:', user.id);
    
    // Step 2: Get projects
    console.log('\n2. Getting projects...');
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Projects found:', projectsResponse.data.data.projects.length);
    projectsResponse.data.data.projects.forEach(project => {
      console.log(`- ${project.name} (ID: ${project.id})`);
    });
    
    if (projectsResponse.data.data.projects.length === 0) {
      console.log('❌ No projects found for user');
      return;
    }
    
    const projectId = projectsResponse.data.data.projects[0].id;
    console.log(`Using project: ${projectsResponse.data.data.projects[0].name} (${projectId})`);
    
    // Step 3: Create a task
    console.log('\n3. Creating a test task...');
    const taskData = {
      title: 'User Test Task',
      description: 'This is a test task created by user',
      status: 'TODO',
      priority: 'MEDIUM',
      type: 'TASK'
    };
    
    console.log('Task data:', taskData);
    
    const createTaskResponse = await axios.post(`${API_BASE_URL}/tasks/projects/${projectId}`, taskData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Task created successfully!');
    console.log('Task response:', createTaskResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUserTaskCreation(); 