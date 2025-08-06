const https = require('https');

const BASE_URL = 'https://project-management-backend-uy3q.onrender.com';

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
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
            success: true,
            data: response
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            success: true,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Backend Endpoints...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  const health = await testEndpoint('/health');
  if (health.success) {
    console.log(`✅ Health Check: ${health.statusCode} - Server is running`);
    console.log(`   Response: ${JSON.stringify(health.data)}`);
  } else {
    console.log(`❌ Health Check failed: ${health.error}`);
  }

  // Test 2: Register endpoint with correct format
  console.log('\n2. Testing Register Endpoint...');
  const register = await testEndpoint('/api/auth/register', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpass123'
  });
  if (register.success) {
    console.log(`✅ Register: ${register.statusCode}`);
    console.log(`   Response: ${JSON.stringify(register.data)}`);
  } else {
    console.log(`❌ Register failed: ${register.error}`);
  }

  // Test 3: Login endpoint
  console.log('\n3. Testing Login Endpoint...');
  const login = await testEndpoint('/api/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'testpass123'
  });
  if (login.success) {
    console.log(`✅ Login: ${login.statusCode}`);
    console.log(`   Response: ${JSON.stringify(login.data)}`);
  } else {
    console.log(`❌ Login failed: ${login.error}`);
  }

  // Test 4: Projects endpoint (should require auth)
  console.log('\n4. Testing Projects Endpoint (without auth)...');
  const projects = await testEndpoint('/api/projects');
  if (projects.success) {
    console.log(`✅ Projects: ${projects.statusCode}`);
    console.log(`   Response: ${JSON.stringify(projects.data)}`);
  } else {
    console.log(`❌ Projects failed: ${projects.error}`);
  }

  // Test 5: Tasks endpoint (should require auth)
  console.log('\n5. Testing Tasks Endpoint (without auth)...');
  const tasks = await testEndpoint('/api/tasks');
  if (tasks.success) {
    console.log(`✅ Tasks: ${tasks.statusCode}`);
    console.log(`   Response: ${JSON.stringify(tasks.data)}`);
  } else {
    console.log(`❌ Tasks failed: ${tasks.error}`);
  }

  // Test 6: Users endpoint (should require auth)
  console.log('\n6. Testing Users Endpoint (without auth)...');
  const users = await testEndpoint('/api/users');
  if (users.success) {
    console.log(`✅ Users: ${users.statusCode}`);
    console.log(`   Response: ${JSON.stringify(users.data)}`);
  } else {
    console.log(`❌ Users failed: ${users.error}`);
  }

  console.log('\n🎯 Backend Testing Summary:');
  console.log('- Health endpoint should return 200');
  console.log('- Auth endpoints should return 200/201 for valid requests');
  console.log('- Protected endpoints should return 401 (Unauthorized) without auth token');
}

runTests(); 