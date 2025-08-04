import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTaskCreation() {
  try {
    console.log('🧪 Testing Task Creation...\n');

    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@projectmanagement.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful');

    // Get projects to find a valid project ID
    console.log('\n📋 Getting projects...');
    const projectsResponse = await fetch(`${API_BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const projectsData = await projectsResponse.json();
    if (!projectsData.success) {
      console.log('❌ Failed to get projects:', projectsData.message);
      return;
    }

    const projects = projectsData.data.projects;
    if (projects.length === 0) {
      console.log('❌ No projects available');
      return;
    }

    const projectId = projects[0].id;
    console.log(`✅ Found project: ${projects[0].name} (ID: ${projectId})`);

    // Try to create a task
    console.log('\n📝 Creating task...');
    const taskData = {
      title: 'Test Task Creation',
      description: 'Testing task creation functionality',
      status: 'TODO',
      priority: 'MEDIUM',
      type: 'TASK',
      dueDate: '2024-12-31'
    };

    const taskResponse = await fetch(`${API_BASE_URL}/tasks/projects/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });

    const taskResult = await taskResponse.json();
    console.log('Response status:', taskResponse.status);
    console.log('Response data:', JSON.stringify(taskResult, null, 2));

    if (taskResponse.status === 201) {
      console.log('✅ Task creation successful!');
    } else {
      console.log('❌ Task creation failed:', taskResult.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTaskCreation(); 