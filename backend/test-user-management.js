import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testUserManagement() {
  try {
    console.log('🔍 Testing user management functionality...\n');
    
    // Test with project manager
    console.log('1. Testing with Project Manager...');
    const pmLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'pm@projectmanagement.com',
      password: 'pm123'
    });
    
    const pmToken = pmLogin.data.data.token;
    console.log('✅ Project Manager login successful');
    
    // Get all users
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${pmToken}` }
    });
    
    console.log(`Found ${usersResponse.data.data.users.length} users:`);
    usersResponse.data.data.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Get projects for PM
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${pmToken}` }
    });
    
    console.log(`\nProject Manager has access to ${projectsResponse.data.data.projects.length} projects:`);
    projectsResponse.data.data.projects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.name} (${project.status})`);
    });
    
    if (projectsResponse.data.data.projects.length > 0) {
      const firstProject = projectsResponse.data.data.projects[0];
      console.log(`\n2. Testing adding member to project: ${firstProject.name}`);
      
      // Get project members
      const membersResponse = await axios.get(`${API_BASE_URL}/roles/projects/${firstProject.id}/members`, {
        headers: { Authorization: `Bearer ${pmToken}` }
      });
      
      console.log(`Project has ${membersResponse.data.data.members.length} members:`);
      membersResponse.data.data.members.forEach((member, index) => {
        console.log(`  ${index + 1}. ${member.name} (${member.email}) - ${member.role}`);
      });
      
      // Try to add a user to the project
      const userToAdd = usersResponse.data.data.users.find(u => u.role === 'USER');
      if (userToAdd) {
        console.log(`\n3. Testing add user ${userToAdd.name} to project...`);
        
        try {
          const addMemberResponse = await axios.post(`${API_BASE_URL}/roles/projects/${firstProject.id}/members`, {
            userId: userToAdd.id,
            role: 'MEMBER'
          }, {
            headers: { Authorization: `Bearer ${pmToken}` }
          });
          
          console.log('✅ User added successfully:', addMemberResponse.data);
        } catch (error) {
          if (error.response?.data?.error === 'MEMBER_EXISTS') {
            console.log('ℹ️ User is already a member of this project');
          } else {
            console.error('❌ Failed to add user:', error.response?.data);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing user management:', error.response?.data || error.message);
  }
}

testUserManagement(); 