import pool from './src/config/database.js';

async function setupProjectStructure() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up proper project structure with managers and members...');

    // Get user IDs
    const adminUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@projectmanagement.com']
    );
    const managerUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['pm@projectmanagement.com']
    );
    const regularUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['user@projectmanagement.com']
    );

    if (adminUser.rows.length === 0 || managerUser.rows.length === 0 || regularUser.rows.length === 0) {
      console.log('❌ Required test users not found. Please run create-test-users.js first.');
      return;
    }

    const adminId = adminUser.rows[0].id;
    const managerId = managerUser.rows[0].id;
    const userId = regularUser.rows[0].id;

    // Create a new project managed by the project manager
    console.log('\n📋 Creating project managed by Project Manager...');
    const projectResult = await client.query(
      `INSERT INTO projects (name, description, status, owner_id, creator_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Manager Project', 'A project managed by Project Manager', 'ACTIVE', managerId, adminId]
    );
    
    const projectId = projectResult.rows[0].id;
    console.log(`✅ Created project: Manager Project (ID: ${projectId})`);

    // Add project manager as OWNER of the project
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [projectId, managerId, 'OWNER']
    );
    console.log('✅ Added Project Manager as OWNER of the project');

    // Add regular user as MEMBER of the project
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [projectId, userId, 'MEMBER']
    );
    console.log('✅ Added Regular User as MEMBER of the project');

    // Create some tasks for the project
    console.log('\n📝 Creating sample tasks...');
    const tasks = [
      {
        title: 'Setup Development Environment',
        description: 'Configure development environment for the team',
        status: 'TODO',
        priority: 'HIGH',
        type: 'TASK',
        assigneeId: userId
      },
      {
        title: 'Design Database Schema',
        description: 'Create database schema design',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        type: 'TASK',
        assigneeId: managerId
      },
      {
        title: 'Implement Authentication',
        description: 'Implement user authentication system',
        status: 'TODO',
        priority: 'HIGH',
        type: 'TASK',
        assigneeId: userId
      }
    ];

    for (const task of tasks) {
      await client.query(
        `INSERT INTO tasks (title, description, status, priority, type, project_id, assignee_id, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [task.title, task.description, task.status, task.priority, task.type, projectId, task.assigneeId, managerId]
      );
      console.log(`✅ Created task: ${task.title}`);
    }

    // Create another project with different structure
    console.log('\n📋 Creating second project with different structure...');
    const project2Result = await client.query(
      `INSERT INTO projects (name, description, status, owner_id, creator_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Team Project', 'A collaborative project with multiple members', 'ACTIVE', adminId, adminId]
    );
    
    const project2Id = project2Result.rows[0].id;
    console.log(`✅ Created project: Team Project (ID: ${project2Id})`);

    // Add admin as OWNER
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project2Id, adminId, 'OWNER']
    );

    // Add manager as MANAGER
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project2Id, managerId, 'MANAGER']
    );

    // Add user as MEMBER
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project2Id, userId, 'MEMBER']
    );

    console.log('✅ Added all users to Team Project with different roles');

    // Create tasks for second project
    const tasks2 = [
      {
        title: 'Frontend Development',
        description: 'Develop the frontend interface',
        status: 'TODO',
        priority: 'HIGH',
        type: 'TASK',
        assigneeId: userId
      },
      {
        title: 'Backend API Development',
        description: 'Develop the backend API',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        type: 'TASK',
        assigneeId: managerId
      }
    ];

    for (const task of tasks2) {
      await client.query(
        `INSERT INTO tasks (title, description, status, priority, type, project_id, assignee_id, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [task.title, task.description, task.status, task.priority, task.type, project2Id, task.assigneeId, adminId]
      );
      console.log(`✅ Created task: ${task.title}`);
    }

    console.log('\n🎉 Project structure setup completed!');
    console.log('\n📋 Summary:');
    console.log('- Manager Project: Project Manager (OWNER) + Regular User (MEMBER)');
    console.log('- Team Project: Admin (OWNER) + Project Manager (MANAGER) + Regular User (MEMBER)');
    console.log('- Both projects have sample tasks assigned to different users');

  } catch (error) {
    console.error('❌ Error setting up project structure:', error);
  } finally {
    client.release();
  }
}

setupProjectStructure().catch(console.error); 