import pool from './src/config/database.js';

async function createSampleProjects() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating sample projects and assigning users...');

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

    // Create sample projects
    console.log('\n📋 Creating sample projects...');
    
    // Project 1: Admin's project
    const project1Result = await client.query(
      `INSERT INTO projects (name, description, status, owner_id, creator_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Admin Project', 'A project created by admin', 'ACTIVE', adminId, adminId]
    );
    
    const project1Id = project1Result.rows[0].id;
    console.log(`✅ Created project: Admin Project (ID: ${project1Id})`);

    // Add admin as OWNER of project 1
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project1Id, adminId, 'OWNER']
    );
    console.log('✅ Added Admin as OWNER of project 1');

    // Add manager as MEMBER of project 1
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project1Id, managerId, 'MEMBER']
    );
    console.log('✅ Added Project Manager as MEMBER of project 1');

    // Add regular user as MEMBER of project 1
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project1Id, userId, 'MEMBER']
    );
    console.log('✅ Added Regular User as MEMBER of project 1');

    // Project 2: Manager's project
    const project2Result = await client.query(
      `INSERT INTO projects (name, description, status, owner_id, creator_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Manager Project', 'A project managed by Project Manager', 'ACTIVE', managerId, adminId]
    );
    
    const project2Id = project2Result.rows[0].id;
    console.log(`✅ Created project: Manager Project (ID: ${project2Id})`);

    // Add manager as OWNER of project 2
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project2Id, managerId, 'OWNER']
    );
    console.log('✅ Added Project Manager as OWNER of project 2');

    // Add regular user as MEMBER of project 2
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project2Id, userId, 'MEMBER']
    );
    console.log('✅ Added Regular User as MEMBER of project 2');

    // Project 3: User's project
    const project3Result = await client.query(
      `INSERT INTO projects (name, description, status, owner_id, creator_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['User Project', 'A project for regular user', 'ACTIVE', userId, adminId]
    );
    
    const project3Id = project3Result.rows[0].id;
    console.log(`✅ Created project: User Project (ID: ${project3Id})`);

    // Add regular user as OWNER of project 3
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)`,
      [project3Id, userId, 'OWNER']
    );
    console.log('✅ Added Regular User as OWNER of project 3');

    // Create some sample tasks
    console.log('\n📝 Creating sample tasks...');
    
    const sampleTasks = [
      {
        title: 'Setup Development Environment',
        description: 'Configure development environment for the team',
        status: 'TODO',
        priority: 'HIGH',
        type: 'TASK',
        projectId: project1Id,
        assigneeId: userId,
        creatorId: adminId
      },
      {
        title: 'Design Database Schema',
        description: 'Create database schema design',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        type: 'TASK',
        projectId: project1Id,
        assigneeId: managerId,
        creatorId: adminId
      },
      {
        title: 'Implement Authentication',
        description: 'Implement user authentication system',
        status: 'TODO',
        priority: 'HIGH',
        type: 'TASK',
        projectId: project2Id,
        assigneeId: userId,
        creatorId: managerId
      }
    ];

    for (const task of sampleTasks) {
      await client.query(
        `INSERT INTO tasks (title, description, status, priority, type, project_id, assignee_id, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [task.title, task.description, task.status, task.priority, task.type, task.projectId, task.assigneeId, task.creatorId]
      );
      console.log(`✅ Created task: ${task.title}`);
    }

    console.log('\n✅ Sample projects and tasks created successfully!');
    console.log('\n📋 Project Access Summary:');
    console.log('- Admin: Can access all 3 projects');
    console.log('- Project Manager: Can access 2 projects (owns 1, member of 1)');
    console.log('- Regular User: Can access 2 projects (owns 1, member of 1)');

  } catch (error) {
    console.error('❌ Error creating sample projects:', error);
  } finally {
    client.release();
  }
}

createSampleProjects().catch(console.error); 