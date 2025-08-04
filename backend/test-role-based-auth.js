import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test users with different roles
const testUsers = {
  admin: {
    email: 'admin@projectmanagement.com',
    password: 'admin123'
  },
  projectManager: {
    email: 'pm@projectmanagement.com', 
    password: 'pm123'
  },
  user: {
    email: 'user@projectmanagement.com',
    password: 'user123'
  }
};

let authTokens = {};

// Helper function to login and get token
async function loginUser(userType) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUsers[userType])
    });

    const data = await response.json();
    
    if (data.success) {
      authTokens[userType] = data.data.token;
      console.log(`✅ ${userType.toUpperCase()} login successful - Token: ${data.data.token.substring(0, 20)}...`);
      return data.data.token;
    } else {
      console.log(`❌ ${userType.toUpperCase()} login failed:`, data.message);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${userType.toUpperCase()} login error:`, error.message);
    return null;
  }
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(endpoint, userType, method = 'GET', body = null) {
  const token = authTokens[userType];
  if (!token) {
    console.log(`❌ No token for ${userType} - Available tokens:`, Object.keys(authTokens));
    return null;
  }

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.log(`❌ Request error for ${userType}:`, error.message);
    return null;
  }
}

// Test functions
async function testProjectAccess() {
  console.log('\n🔍 Testing Project Access...');
  
  // Test getting projects for each role
  for (const userType of Object.keys(testUsers)) {
    const result = await makeAuthenticatedRequest('/projects', userType);
    if (result) {
      if (result.status === 200) {
        console.log(`✅ ${userType.toUpperCase()} can access projects (${result.data.data?.projects?.length || 0} projects)`);
      } else {
        console.log(`❌ ${userType.toUpperCase()} cannot access projects:`, result.data.message);
      }
    }
  }
}

async function testTaskAccess() {
  console.log('\n🔍 Testing Task Access...');
  
  // Test getting tasks for each role
  for (const userType of Object.keys(testUsers)) {
    const result = await makeAuthenticatedRequest('/tasks', userType);
    if (result) {
      if (result.status === 200) {
        console.log(`✅ ${userType.toUpperCase()} can access tasks (${result.data.data?.tasks?.length || 0} tasks)`);
      } else {
        console.log(`❌ ${userType.toUpperCase()} cannot access tasks:`, result.data.message);
      }
    }
  }
}

async function testProjectCreation() {
  console.log('\n🔍 Testing Project Creation...');
  
  const newProject = {
    name: 'Test Project',
    description: 'Test project for role-based auth',
    status: 'ACTIVE',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  };

  // Only ADMIN should be able to create projects
  for (const userType of Object.keys(testUsers)) {
    const result = await makeAuthenticatedRequest('/projects', userType, 'POST', newProject);
    if (result) {
      if (result.status === 201) {
        console.log(`✅ ${userType.toUpperCase()} can create projects`);
      } else {
        console.log(`❌ ${userType.toUpperCase()} cannot create projects:`, result.data.message);
      }
    }
  }
}

async function testTaskCreation() {
  console.log('\n🔍 Testing Task Creation...');
  
  const newTask = {
    title: 'Test Task',
    description: 'Test task for role-based auth',
    status: 'TODO',
    priority: 'MEDIUM',
    type: 'TASK',
    dueDate: '2024-12-31'
  };

  // Get a valid project ID for each user
  for (const userType of Object.keys(testUsers)) {
    // First get projects for this user
    const projectsResult = await makeAuthenticatedRequest('/projects', userType);
    if (projectsResult && projectsResult.status === 200) {
      const projects = projectsResult.data.data?.projects || [];
      if (projects.length > 0) {
        const projectId = projects[0].id;
        const result = await makeAuthenticatedRequest(`/tasks/projects/${projectId}`, userType, 'POST', newTask);
        if (result) {
          if (result.status === 201) {
            console.log(`✅ ${userType.toUpperCase()} can create tasks`);
          } else {
            console.log(`❌ ${userType.toUpperCase()} cannot create tasks:`, result.data.message);
          }
        }
      } else {
        console.log(`⚠️ ${userType.toUpperCase()} has no projects to create tasks in`);
      }
    } else {
      console.log(`❌ ${userType.toUpperCase()} cannot access projects to create tasks`);
    }
  }
}

async function testDashboardAccess() {
  console.log('\n🔍 Testing Dashboard Access...');
  
  for (const userType of Object.keys(testUsers)) {
    const result = await makeAuthenticatedRequest('/dashboard', userType);
    if (result) {
      if (result.status === 200) {
        console.log(`✅ ${userType.toUpperCase()} can access dashboard`);
      } else {
        console.log(`❌ ${userType.toUpperCase()} cannot access dashboard:`, result.data.message);
      }
    }
  }
}

async function testUserManagement() {
  console.log('\n🔍 Testing User Management...');
  
  // Only ADMIN should be able to access user management
  for (const userType of Object.keys(testUsers)) {
    const result = await makeAuthenticatedRequest('/users', userType);
    if (result) {
      if (result.status === 200) {
        console.log(`✅ ${userType.toUpperCase()} can access user management`);
      } else {
        console.log(`❌ ${userType.toUpperCase()} cannot access user management:`, result.data.message);
      }
    }
  }
}

// Main test function
async function runRoleBasedAuthTests() {
  console.log('🚀 Starting Role-Based Authentication Tests...\n');

  // Login all users
  console.log('🔐 Logging in users...');
  for (const userType of Object.keys(testUsers)) {
    await loginUser(userType);
  }

  // Run all tests
  await testProjectAccess();
  await testTaskAccess();
  await testProjectCreation();
  await testTaskCreation();
  await testDashboardAccess();
  await testUserManagement();

  console.log('\n✅ Role-based authentication tests completed!');
}

// Run the tests
runRoleBasedAuthTests().catch(console.error); 