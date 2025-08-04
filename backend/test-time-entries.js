import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTimeEntries() {
  try {
    console.log('🔍 Testing time entries endpoint...\n');
    
    // Login as admin
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@projectmanagement.com',
      password: 'admin123'
    });
    
    const adminToken = adminLogin.data.data.token;
    console.log('✅ Admin login successful');
    
    // Get tasks
    const tasksResponse = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (tasksResponse.data.data.tasks.length > 0) {
      const taskId = tasksResponse.data.data.tasks[0].id;
      console.log(`Testing time entries for task: ${tasksResponse.data.data.tasks[0].title}`);
      
      // Test get time entries for task
      const timeEntriesResponse = await axios.get(`${API_BASE_URL}/time-tracking/task/${taskId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Time entries response:', timeEntriesResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTimeEntries(); 