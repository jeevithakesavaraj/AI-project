import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function debugTaskCreation() {
  try {
    console.log('🔍 Debugging task creation...\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@projectmanagement.com',
      password: 'admin123'
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
    
    // Find a project where admin has access
    const adminProject = projectsResponse.data.data.projects.find(p => 
      p.name.includes('Admin') || p.name.includes('Test')
    );
    
    if (!adminProject) {
      console.log('❌ No suitable project found');
      return;
    }
    
    console.log(`Using project: ${adminProject.name} (${adminProject.id})`);
    
    // Step 3: Create a task
    console.log('\n3. Creating a test task...');
    const taskData = {
      title: 'Debug Test Task',
      description: 'This is a test task created for debugging',
      status: 'TODO',
      priority: 'MEDIUM',
      type: 'TASK',
      storyPoints: 3,
      dueDate: '2024-12-31'
    };
    
    console.log('Task data:', taskData);
    console.log('User role:', user.role);
    console.log('Project ID:', adminProject.id);
    
    const createTaskResponse = await axios.post(`${API_BASE_URL}/tasks/projects/${adminProject.id}`, taskData, {
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

debugTaskCreation(); 