import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testApiLogin() {
  try {
    console.log('🔍 Testing API login endpoint...\n');
    
    const loginData = {
      email: 'admin@projectmanagement.com',
      password: 'admin123'
    };
    
    console.log('Sending login request...');
    console.log('Data:', loginData);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data);
  }
}

testApiLogin(); 