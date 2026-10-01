const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Task = require('./models/Task');

// Load environment variables
dotenv.config();

const usersData = [
  {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Test@1234',
    role: 'user',
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@1234',
    role: 'admin',
  },
];

const seedData = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('Add your MongoDB Atlas connection string to server/.env as MONGO_URI.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing users and tasks...');
    await Task.deleteMany({});
    await User.deleteMany({});

    // Create users (using User.create so pre('save') hashes passwords)
    console.log('Creating seed users...');
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    const testUser = createdUsers[0];
    const adminUser = createdUsers[1];

    const today = new Date();
    const day = 24 * 60 * 60 * 1000;

    const sampleTasks = [
      {
        title: 'Design high-fidelity wireframes in Figma',
        description: 'Complete user flow, dashboard layout, and mobile responsive screens for the new v2 launch.',
        priority: 'High',
        status: 'Completed',
        dueDate: new Date(today.getTime() - 2 * day),
        assignedUser: testUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Set up MongoDB Atlas cluster and security whitelist',
        description: 'Configure network peering, IAM roles, and database users for staging and production.',
        priority: 'High',
        status: 'Completed',
        dueDate: new Date(today.getTime() - 1 * day),
        assignedUser: adminUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Implement JWT authentication with refresh token logic',
        description: 'Build register, login, password validation, and bcrypt hashing endpoints with rate limiting.',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(today.getTime() + 1 * day),
        assignedUser: testUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Build reusable UI component library in Tailwind CSS',
        description: 'Create Button, Modal, Badge, Dropdown, and Input components with dark mode support.',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: new Date(today.getTime() + 3 * day),
        assignedUser: testUser._id,
        createdBy: testUser._id,
      },
      {
        title: 'Integrate Recharts interactive analytics dashboard',
        description: 'Construct task status distribution donut chart and priority breakdown bar chart with tooltips.',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: new Date(today.getTime() + 4 * day),
        assignedUser: adminUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Configure Redux Toolkit store and custom hooks',
        description: 'Set up authSlice, tasksSlice, useDebounce, useAuth, and useLocalStorage for global state.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(today.getTime() + 5 * day),
        assignedUser: testUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Write automated API verification test suite',
        description: 'Cover all CRUD operations, pagination, search, status filters, and invalid token edge cases.',
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(today.getTime() + 6 * day),
        assignedUser: adminUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Refactor search bar to support debounced title queries',
        description: 'Optimize GET /tasks requests with 350ms debounce and case-insensitive regex filtering.',
        priority: 'Low',
        status: 'Pending',
        dueDate: new Date(today.getTime() + 7 * day),
        assignedUser: testUser._id,
        createdBy: testUser._id,
      },
      {
        title: 'Configure Helmet and CORS security headers',
        description: 'Harden Express server against XSS, clickjacking, and unauthorized cross-origin requests.',
        priority: 'Medium',
        status: 'Completed',
        dueDate: new Date(today.getTime() - 3 * day),
        assignedUser: adminUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Add responsive mobile navigation drawer',
        description: 'Enable smooth slide-over drawer with backdrop blur for mobile and tablet screen widths.',
        priority: 'Low',
        status: 'Pending',
        dueDate: new Date(today.getTime() + 9 * day),
        assignedUser: testUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Implement dark mode theme switcher with persistence',
        description: 'Save user theme preference to localStorage and toggle HTML dark class with seamless transitions.',
        priority: 'Low',
        status: 'In Progress',
        dueDate: new Date(today.getTime() + 8 * day),
        assignedUser: adminUser._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Prepare production deployment scripts for Vercel & Render',
        description: 'Validate vercel.json SPA rewrites and render.yaml environment configurations.',
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(today.getTime() + 10 * day),
        assignedUser: testUser._id,
        createdBy: adminUser._id,
      },
    ];

    console.log('Seeding sample tasks...');
    await Task.insertMany(sampleTasks);
    console.log(`Successfully created ${sampleTasks.length} sample tasks!`);

    console.log('------------------------------------------------------------');
    console.log('Database seeded successfully!');
    console.log('Test Users:');
    console.log('1. User: testuser@example.com / Password: Test@1234 (role: user)');
    console.log('2. Admin: admin@example.com / Password: Admin@1234 (role: admin)');
    console.log('------------------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
