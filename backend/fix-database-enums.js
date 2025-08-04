import pool from './src/config/database.js';

const fixDatabaseEnums = async () => {
  console.log('🔧 Fixing Database Enums...\n');
  
  const client = await pool.connect();
  
  try {
    // First, let's see what values currently exist in the database
    console.log('1. Checking current project status values...');
    const currentProjectStatuses = await client.query(
      'SELECT DISTINCT status FROM projects'
    );
    console.log('Current project statuses:', currentProjectStatuses.rows.map(r => r.status));

    console.log('\n2. Checking current task status values...');
    const currentTaskStatuses = await client.query(
      'SELECT DISTINCT status FROM tasks'
    );
    console.log('Current task statuses:', currentTaskStatuses.rows.map(r => r.status));

    // Check what enum values are defined
    console.log('\n3. Checking enum definitions...');
    try {
      const projectStatusEnum = await client.query(
        "SELECT unnest(enum_range(NULL::project_status)) as status"
      );
      console.log('Project status enum values:', projectStatusEnum.rows.map(r => r.status));
    } catch (error) {
      console.log('Project status enum not found, checking table structure...');
    }

    try {
      const taskStatusEnum = await client.query(
        "SELECT unnest(enum_range(NULL::task_status)) as status"
      );
      console.log('Task status enum values:', taskStatusEnum.rows.map(r => r.status));
    } catch (error) {
      console.log('Task status enum not found, checking table structure...');
    }

    // Update projects with valid status values
    console.log('\n4. Updating project status values...');
    const updateResult = await client.query(
      `UPDATE projects 
       SET status = 'ACTIVE' 
       WHERE status IS NULL OR status = '' OR status NOT IN ('ACTIVE', 'ARCHIVED', 'COMPLETED')`
    );
    
    console.log(`✅ Updated ${updateResult.rowCount} projects`);

    // Update tasks with valid status values
    console.log('\n5. Updating task status values...');
    const updateTasksResult = await client.query(
      `UPDATE tasks 
       SET status = 'TODO' 
       WHERE status IS NULL OR status = '' OR status NOT IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')`
    );
    
    console.log(`✅ Updated ${updateTasksResult.rowCount} tasks`);

    console.log('\n✅ Database enums fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database enums:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

fixDatabaseEnums().catch(console.error); 