import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testPriyaTaskCreation() {
  try {
    console.log('🔍 Testing task creation for user Priya...\n');
    
    // Step 1: Login as Priya
    console.log('1. Logging in as Priya...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'priya@projectmanagement.com',
      password: 'priya123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful');
    console.log('User role:', user.role);
    console.log('User ID:', user.id);
    console.log('User name:', user.name);
    
    // Step 2: Get projects for Priya
    console.log('\n2. Getting projects for Priya...');
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Projects found:', projectsResponse.data.data.projects.length);
    projectsResponse.data.data.projects.forEach(project => {
      console.log(`- ${project.name} (ID: ${project.id})`);
    });
    
    if (projectsResponse.data.data.projects.length === 0) {
      console.log('❌ No projects found for Priya');
      return;
    }
    
    // Step 3: Test each project for task creation
    console.log('\n3. Testing task creation in each project...');
    for (const project of projectsResponse.data.data.projects) {
      try {
        console.log(`\nTesting project: ${project.name} (${project.id})`);
        
        // Get project members
        const membersResponse = await axios.get(`${API_BASE_URL}/roles/projects/${project.id}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Project members:', membersResponse.data.data.members.length);
        
        // Check if Priya is a member
        const priyaMember = membersResponse.data.data.members.find(m => m.email === 'priya@projectmanagement.com');
        if (priyaMember) {
          console.log('✅ Priya is a member of this project');
          console.log('Priya\'s role in project:', priyaMember.role);
        } else {
          console.log('❌ Priya is not a member of this project');
          continue;
        }
        
        // Try to create a task
        const taskData = {
          title: `Priya Test Task in ${project.name}`,
          description: 'This is a test task created by Priya',
          status: 'TODO',
          priority: 'MEDIUM',
          type: 'TASK',
          storyPoints: 2
        };
        
        console.log('Creating task with data:', taskData);
        
        const createTaskResponse = await axios.post(`${API_BASE_URL}/tasks/projects/${project.id}`, taskData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Task created successfully!');
        console.log('Task ID:', createTaskResponse.data.data.task.id);
        console.log('Task response:', createTaskResponse.data);
        
        // Clean up - delete the test task
        await axios.delete(`${API_BASE_URL}/tasks/${createTaskResponse.data.data.task.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Test task deleted');
        
      } catch (error) {
        console.log(`❌ Failed to create task in ${project.name}:`, error.response?.data?.message || error.message);
        if (error.response) {
          console.log('Response status:', error.response.status);
          console.log('Response data:', error.response.data);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPriyaTaskCreation(); 