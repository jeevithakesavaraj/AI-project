import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTaskCreation() {
  try {
    console.log('🔍 Testing task creation process...\n');
    
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
    
    if (projectsResponse.data.data.projects.length === 0) {
      console.log('❌ No projects found. Cannot create tasks.');
      return;
    }
    
    const projectId = projectsResponse.data.data.projects[0].id;
    console.log(`Using project: ${projectsResponse.data.data.projects[0].name} (${projectId})`);
    
    // Step 3: Get project members
    console.log('\n3. Getting project members...');
    const membersResponse = await axios.get(`${API_BASE_URL}/roles/projects/${projectId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Project members:', membersResponse.data.data.members);
    
    // Step 4: Create a task
    console.log('\n4. Creating a test task...');
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
    
    const createTaskResponse = await axios.post(`${API_BASE_URL}/tasks/projects/${projectId}`, taskData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Task created successfully!');
    console.log('Task response:', createTaskResponse.data);
    
    // Step 5: Verify the task was created
    console.log('\n5. Verifying task creation...');
    const tasksResponse = await axios.get(`${API_BASE_URL}/tasks?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Tasks in project:', tasksResponse.data.data.tasks.length);
    tasksResponse.data.data.tasks.forEach(task => {
      console.log(`- ${task.title} (${task.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testTaskCreation(); 