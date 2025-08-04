const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function createSampleData() {
  try {
    console.log('🎨 Creating Sample Data for Dashboard...\n');

    // First, login to get a token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@projectmanagement.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Get existing projects
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const projects = projectsResponse.data.data.projects;
    console.log(`📋 Found ${projects.length} existing projects`);

    if (projects.length === 0) {
      console.log('❌ No projects found. Please create projects first.');
      return;
    }

    // Create sample tasks for each project
    for (const project of projects) {
      console.log(`\n📝 Creating sample tasks for project: ${project.name}`);
      
      const sampleTasks = [
        {
          title: 'Project Planning',
          description: 'Define project scope, timeline, and deliverables',
          status: 'DONE',
          priority: 'HIGH',
          type: 'TASK',
          storyPoints: 8,
          dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0] // 7 days ago
        },
        {
          title: 'Design System Setup',
          description: 'Create design system and component library',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          type: 'STORY',
          storyPoints: 13,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0] // 3 days from now
        },
        {
          title: 'Database Schema Design',
          description: 'Design and implement database schema',
          status: 'TODO',
          priority: 'MEDIUM',
          type: 'TASK',
          storyPoints: 5,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0] // 5 days from now
        },
        {
          title: 'API Development',
          description: 'Develop RESTful APIs for the application',
          status: 'TODO',
          priority: 'HIGH',
          type: 'EPIC',
          storyPoints: 21,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0] // 10 days from now
        },
        {
          title: 'Frontend Development',
          description: 'Build user interface components',
          status: 'TODO',
          priority: 'MEDIUM',
          type: 'STORY',
          storyPoints: 8,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0] // 7 days from now
        },
        {
          title: 'Testing Implementation',
          description: 'Write unit and integration tests',
          status: 'TODO',
          priority: 'LOW',
          type: 'TASK',
          storyPoints: 5,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString().split('T')[0] // 12 days from now
        },
        {
          title: 'Documentation',
          description: 'Create user and technical documentation',
          status: 'TODO',
          priority: 'LOW',
          type: 'TASK',
          storyPoints: 3,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0] // 15 days from now
        }
      ];

      for (const task of sampleTasks) {
        try {
          await axios.post(`${API_BASE_URL}/tasks/projects/${project.id}`, task, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`  ✅ Created task: ${task.title} (${task.status})`);
        } catch (error) {
          console.log(`  ❌ Failed to create task: ${task.title} - ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // Update some tasks to create variety
    console.log('\n🔄 Updating some tasks to create variety...');
    
    // Get all tasks
    const tasksResponse = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tasks = tasksResponse.data.data.tasks;
    console.log(`📋 Found ${tasks.length} tasks`);

    // Update some tasks to different statuses
    const updates = [
      { status: 'DONE', count: 2 },
      { status: 'IN_PROGRESS', count: 3 },
      { status: 'REVIEW', count: 1 }
    ];

    let updatedCount = 0;
    for (const update of updates) {
      for (let i = 0; i < update.count && updatedCount < tasks.length; i++) {
        const task = tasks[updatedCount];
        if (task.status === 'TODO') {
          try {
            await axios.put(`${API_BASE_URL}/tasks/${task.id}`, {
              status: update.status
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`  ✅ Updated task: ${task.title} to ${update.status}`);
          } catch (error) {
            console.log(`  ❌ Failed to update task: ${task.title}`);
          }
        }
        updatedCount++;
      }
    }

    // Test the dashboard again
    console.log('\n📊 Testing dashboard with sample data...');
    
    const projectStatsResponse = await axios.get(`${API_BASE_URL}/projects/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const taskStatsResponse = await axios.get(`${API_BASE_URL}/tasks/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const projectStats = projectStatsResponse.data.data.stats;
    const taskStats = taskStatsResponse.data.data.stats;

    console.log('✅ Updated Dashboard Stats:');
    console.log(`  - Total Projects: ${projectStats.totalProjects}`);
    console.log(`  - Active Projects: ${projectStats.activeProjects}`);
    console.log(`  - Total Tasks: ${taskStats.totalTasks}`);
    console.log(`  - Todo Tasks: ${taskStats.todoTasks}`);
    console.log(`  - In Progress Tasks: ${taskStats.inProgressTasks}`);
    console.log(`  - Done Tasks: ${taskStats.doneTasks}`);
    console.log(`  - Completion Rate: ${taskStats.completionRate}%`);

    console.log('\n🎉 Sample Data Creation Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Sample tasks created for all projects');
    console.log('✅ Task statuses updated for variety');
    console.log('✅ Dashboard now has meaningful data');
    console.log('✅ Ready for visual testing');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createSampleData(); 