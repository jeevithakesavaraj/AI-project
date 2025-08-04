import pool from './src/config/database.js';

const updateDatabaseSchema = async () => {
  console.log('🔧 Updating Database Schema...\n');
  
  const client = await pool.connect();
  
  try {
    // First, let's check what we have
    console.log('1. Current enum values:');
    const projectStatusEnum = await client.query(
      "SELECT unnest(enum_range(NULL::project_status)) as status"
    );
    console.log('Project status enum:', projectStatusEnum.rows.map(r => r.status));

    const taskStatusEnum = await client.query(
      "SELECT unnest(enum_range(NULL::task_status)) as status"
    );
    console.log('Task status enum:', taskStatusEnum.rows.map(r => r.status));

    // Update project status enum to match our schema
    console.log('\n2. Updating project status enum...');
    await client.query(`
      ALTER TABLE projects ALTER COLUMN status DROP DEFAULT;
      ALTER TYPE project_status RENAME TO project_status_old;
      CREATE TYPE project_status AS ENUM ('ACTIVE', 'ARCHIVED', 'COMPLETED');
      ALTER TABLE projects ALTER COLUMN status TYPE project_status USING 
        CASE 
          WHEN status::text = 'ACTIVE' THEN 'ACTIVE'::project_status
          WHEN status::text = 'INACTIVE' THEN 'ARCHIVED'::project_status
          WHEN status::text = 'COMPLETED' THEN 'COMPLETED'::project_status
          WHEN status::text = 'ON_HOLD' THEN 'ARCHIVED'::project_status
          ELSE 'ACTIVE'::project_status
        END;
      ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'ACTIVE'::project_status;
      DROP TYPE project_status_old;
    `);
    console.log('✅ Project status enum updated');

    // Update task status enum to match our schema
    console.log('\n3. Updating task status enum...');
    await client.query(`
      ALTER TABLE tasks ALTER COLUMN status DROP DEFAULT;
      ALTER TYPE task_status RENAME TO task_status_old;
      CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
      ALTER TABLE tasks ALTER COLUMN status TYPE task_status USING 
        CASE 
          WHEN status::text = 'TODO' THEN 'TODO'::task_status
          WHEN status::text = 'IN_PROGRESS' THEN 'IN_PROGRESS'::task_status
          WHEN status::text = 'IN_REVIEW' THEN 'REVIEW'::task_status
          WHEN status::text = 'DONE' THEN 'DONE'::task_status
          WHEN status::text = 'CANCELLED' THEN 'TODO'::task_status
          ELSE 'TODO'::task_status
        END;
      ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'TODO'::task_status;
      DROP TYPE task_status_old;
    `);
    console.log('✅ Task status enum updated');

    // Verify the changes
    console.log('\n4. Verifying updated enum values:');
    const newProjectStatusEnum = await client.query(
      "SELECT unnest(enum_range(NULL::project_status)) as status"
    );
    console.log('New project status enum:', newProjectStatusEnum.rows.map(r => r.status));

    const newTaskStatusEnum = await client.query(
      "SELECT unnest(enum_range(NULL::task_status)) as status"
    );
    console.log('New task status enum:', newTaskStatusEnum.rows.map(r => r.status));

    console.log('\n✅ Database schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

updateDatabaseSchema().catch(console.error); 