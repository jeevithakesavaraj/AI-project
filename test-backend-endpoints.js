const https = require('https');

const BASE_URL = 'https://project-management-backend-uy3q.onrender.com';

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'project-management-backend-uy3q.onrender.com',
      port: 443,
      path: url.replace('https://project-management-backend-uy3q.onrender.com', ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test endpoints
async function testEndpoints() {
  console.log('Testing Backend Endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing Health Check...');
    const healthResponse = await makeRequest(`${BASE_URL}/health`);
    console.log(`✅ Health Check: ${healthResponse.statusCode} - ${JSON.stringify(healthResponse.body)}`);
  } catch (error) {
    console.log(`❌ Health Check failed: ${error.message}`);
  }

  // Test 2: Register endpoint
  try {
    console.log('\n2. Testing Register Endpoint...');
    const registerData = {
      email: 'test@example.com',
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User'
    };
    const registerResponse = await makeRequest(`${BASE_URL}/api/auth/register`, 'POST', registerData);
    console.log(`✅ Register: ${registerResponse.statusCode} - ${JSON.stringify(registerResponse.body)}`);
  } catch (error) {
    console.log(`❌ Register failed: ${error.message}`);
  }

  // Test 3: Login endpoint
  try {
    console.log('\n3. Testing Login Endpoint...');
    const loginData = {
      email: 'test@example.com',
      password: 'testpass123'
    };
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, 'POST', loginData);
    console.log(`✅ Login: ${loginResponse.statusCode} - ${JSON.stringify(loginResponse.body)}`);
  } catch (error) {
    console.log(`❌ Login failed: ${error.message}`);
  }

  // Test 4: Projects endpoint (should require auth)
  try {
    console.log('\n4. Testing Projects Endpoint (without auth)...');
    const projectsResponse = await makeRequest(`${BASE_URL}/api/projects`);
    console.log(`✅ Projects: ${projectsResponse.statusCode} - ${JSON.stringify(projectsResponse.body)}`);
  } catch (error) {
    console.log(`❌ Projects failed: ${error.message}`);
  }

  // Test 5: Tasks endpoint (should require auth)
  try {
    console.log('\n5. Testing Tasks Endpoint (without auth)...');
    const tasksResponse = await makeRequest(`${BASE_URL}/api/tasks`);
    console.log(`✅ Tasks: ${tasksResponse.statusCode} - ${JSON.stringify(tasksResponse.body)}`);
  } catch (error) {
    console.log(`❌ Tasks failed: ${error.message}`);
  }

  // Test 6: Users endpoint (should require auth)
  try {
    console.log('\n6. Testing Users Endpoint (without auth)...');
    const usersResponse = await makeRequest(`${BASE_URL}/api/users`);
    console.log(`✅ Users: ${usersResponse.statusCode} - ${JSON.stringify(usersResponse.body)}`);
  } catch (error) {
    console.log(`❌ Users failed: ${error.message}`);
  }

  // Test 7: Kanban endpoint (should require auth)
  try {
    console.log('\n7. Testing Kanban Endpoint (without auth)...');
    const kanbanResponse = await makeRequest(`${BASE_URL}/api/kanban`);
    console.log(`✅ Kanban: ${kanbanResponse.statusCode} - ${JSON.stringify(kanbanResponse.body)}`);
  } catch (error) {
    console.log(`❌ Kanban failed: ${error.message}`);
  }

  console.log('\n✅ Backend endpoint testing completed!');
}

testEndpoints().catch(console.error); 