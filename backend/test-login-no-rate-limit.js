import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testLoginNoRateLimit() {
  try {
    console.log('🔍 Testing login without rate limiting...\n');
    
    // Test login multiple times to ensure no rate limiting
    for (let i = 1; i <= 5; i++) {
      console.log(`Attempt ${i}: Testing login...`);
      
      const loginData = {
        email: 'admin@projectmanagement.com',
        password: 'admin123'
      };
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      
      console.log(`✅ Login attempt ${i} successful!`);
      console.log(`Response status: ${response.status}`);
      console.log(`User: ${response.data.data.user.name} (${response.data.data.user.role})`);
      console.log('---');
      
      // Wait a moment between attempts
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 All login attempts successful! Rate limiting is disabled in development.');
    
  } catch (error) {
    console.error('❌ Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data);
  }
}

testLoginNoRateLimit(); 