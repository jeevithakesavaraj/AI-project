import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff'
    }
  });

  // Create regular user
  const userPasswordHash = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user@example.com',
      passwordHash: userPasswordHash,
      role: 'USER',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff'
    }
  });

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      name: 'Sample Project',
      description: 'This is a sample project for demonstration purposes.',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      ownerId: admin.id,
      creatorId: admin.id
    }
  });

  // Add users to project
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: admin.id
      }
    },
    update: {},
    create: {
      projectId: project.id,
      userId: admin.id,
      role: 'OWNER'
    }
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: user.id
      }
    },
    update: {},
    create: {
      projectId: project.id,
      userId: user.id,
      role: 'MEMBER'
    }
  });

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Setup Development Environment',
        description: 'Set up the development environment with all necessary tools and dependencies.',
        status: 'DONE',
        priority: 'HIGH',
        type: 'TASK',
        storyPoints: 3,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: admin.id,
        creatorId: admin.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Design Database Schema',
        description: 'Design and implement the database schema for the project management system.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        type: 'TASK',
        storyPoints: 5,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: user.id,
        creatorId: admin.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Implement Authentication',
        description: 'Implement JWT-based authentication system with user registration and login.',
        status: 'TODO',
        priority: 'MEDIUM',
        type: 'TASK',
        storyPoints: 8,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: user.id,
        creatorId: admin.id
      }
    }),
    prisma.task.create({
      data: {
        title: 'Fix Login Bug',
        description: 'Users are experiencing issues with the login functionality.',
        status: 'TODO',
        priority: 'URGENT',
        type: 'BUG',
        storyPoints: 2,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        projectId: project.id,
        assigneeId: admin.id,
        creatorId: user.id
      }
    })
  ]);

  // Create sample comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great work on setting up the environment! Everything is working perfectly.',
        taskId: tasks[0].id,
        userId: admin.id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'I\'ve started working on the database schema. Will share the design soon.',
        taskId: tasks[1].id,
        userId: user.id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'This task is critical for the project. Let me know if you need any help.',
        taskId: tasks[2].id,
        userId: admin.id
      }
    })
  ]);

  // Create sample notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned',
        message: 'You have been assigned to "Design Database Schema"',
        userId: user.id
      }
    }),
    prisma.notification.create({
      data: {
        type: 'TASK_UPDATED',
        title: 'Task Updated',
        message: 'Task "Setup Development Environment" has been marked as completed',
        userId: admin.id
      }
    }),
    prisma.notification.create({
      data: {
        type: 'DEADLINE_APPROACHING',
        title: 'Deadline Approaching',
        message: 'Task "Fix Login Bug" is due in 3 days',
        userId: admin.id
      }
    })
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - ${admin.name} (admin@example.com)`);
  console.log(`   - ${user.name} (user@example.com)`);
  console.log(`   - Sample project: ${project.name}`);
  console.log(`   - ${tasks.length} sample tasks`);
  console.log('🔑 Login credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 