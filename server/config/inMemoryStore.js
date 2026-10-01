const bcrypt = require('bcryptjs');

let memoryUsers = [];
let memoryTasks = [];

const initMemoryStore = async () => {
  const hashTest = await bcrypt.hash('Test@1234', 10);
  const hashAdmin = await bcrypt.hash('Admin@1234', 10);

  const testUser = {
    _id: '670c1a111111111111111111',
    name: 'Test User',
    email: 'testuser@example.com',
    password: hashTest,
    role: 'user',
    createdAt: new Date().toISOString(),
    matchPassword: async function (entered) {
      return await bcrypt.compare(entered, this.password);
    },
  };

  const adminUser = {
    _id: '670c1a222222222222222222',
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashAdmin,
    role: 'admin',
    createdAt: new Date().toISOString(),
    matchPassword: async function (entered) {
      return await bcrypt.compare(entered, this.password);
    },
  };

  memoryUsers = [testUser, adminUser];

  const today = new Date();
  const day = 24 * 60 * 60 * 1000;

  memoryTasks = [
    {
      _id: '670c2a010101010101010101',
      title: 'Design high-fidelity wireframes in Figma',
      description: 'Complete user flow, dashboard layout, and mobile responsive screens for the new v2 launch.',
      priority: 'High',
      status: 'Completed',
      dueDate: new Date(today.getTime() - 2 * day).toISOString(),
      assignedUser: { _id: testUser._id, name: testUser.name, email: testUser.email, role: testUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 10 * day).toISOString(),
    },
    {
      _id: '670c2a020202020202020202',
      title: 'Set up MongoDB Atlas cluster and security whitelist',
      description: 'Configure network peering, IAM roles, and database users for staging and production.',
      priority: 'High',
      status: 'Completed',
      dueDate: new Date(today.getTime() - 1 * day).toISOString(),
      assignedUser: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 9 * day).toISOString(),
    },
    {
      _id: '670c2a030303030303030303',
      title: 'Implement JWT authentication with refresh token logic',
      description: 'Build register, login, password validation, and bcrypt hashing endpoints with rate limiting.',
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date(today.getTime() + 1 * day).toISOString(),
      assignedUser: { _id: testUser._id, name: testUser.name, email: testUser.email, role: testUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 8 * day).toISOString(),
    },
    {
      _id: '670c2a040404040404040404',
      title: 'Build reusable UI component library in Tailwind CSS',
      description: 'Create Button, Modal, Badge, Dropdown, and Input components with dark mode support.',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: new Date(today.getTime() + 3 * day).toISOString(),
      assignedUser: { _id: testUser._id, name: testUser.name, email: testUser.email, role: testUser.role },
      createdBy: { _id: testUser._id, name: testUser.name, email: testUser.email },
      createdAt: new Date(today.getTime() - 7 * day).toISOString(),
    },
    {
      _id: '670c2a050505050505050505',
      title: 'Integrate Recharts interactive analytics dashboard',
      description: 'Construct task status distribution donut chart and priority breakdown bar chart with tooltips.',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: new Date(today.getTime() + 4 * day).toISOString(),
      assignedUser: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 6 * day).toISOString(),
    },
    {
      _id: '670c2a060606060606060606',
      title: 'Configure Redux Toolkit store and custom hooks',
      description: 'Set up authSlice, tasksSlice, useDebounce, useAuth, and useLocalStorage for global state.',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date(today.getTime() + 5 * day).toISOString(),
      assignedUser: { _id: testUser._id, name: testUser.name, email: testUser.email, role: testUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 5 * day).toISOString(),
    },
    {
      _id: '670c2a070707070707070707',
      title: 'Write automated API verification test suite',
      description: 'Cover all CRUD operations, pagination, search, status filters, and invalid token edge cases.',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(today.getTime() + 6 * day).toISOString(),
      assignedUser: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 4 * day).toISOString(),
    },
    {
      _id: '670c2a080808080808080808',
      title: 'Refactor search bar to support debounced title queries',
      description: 'Optimize GET /tasks requests with 350ms debounce and case-insensitive regex filtering.',
      priority: 'Low',
      status: 'Pending',
      dueDate: new Date(today.getTime() + 7 * day).toISOString(),
      assignedUser: { _id: testUser._id, name: testUser.name, email: testUser.email, role: testUser.role },
      createdBy: { _id: testUser._id, name: testUser.name, email: testUser.email },
      createdAt: new Date(today.getTime() - 3 * day).toISOString(),
    },
    {
      _id: '670c2a090909090909090909',
      title: 'Configure Helmet and CORS security headers',
      description: 'Harden Express server against XSS, clickjacking, and unauthorized cross-origin requests.',
      priority: 'Medium',
      status: 'Completed',
      dueDate: new Date(today.getTime() - 3 * day).toISOString(),
      assignedUser: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 11 * day).toISOString(),
    },
    {
      _id: '670c2a101010101010101010',
      title: 'Add responsive mobile navigation drawer',
      description: 'Enable smooth slide-over drawer with backdrop blur for mobile and tablet screen widths.',
      priority: 'Low',
      status: 'Pending',
      dueDate: new Date(today.getTime() + 9 * day).toISOString(),
      assignedUser: { _id: testUser._id, name: testUser.name, email: testUser.email, role: testUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 2 * day).toISOString(),
    },
    {
      _id: '670c2a111111111111111111',
      title: 'Implement dark mode theme switcher with persistence',
      description: 'Save user theme preference to localStorage and toggle HTML dark class with seamless transitions.',
      priority: 'Low',
      status: 'In Progress',
      dueDate: new Date(today.getTime() + 8 * day).toISOString(),
      assignedUser: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 1 * day).toISOString(),
    },
    {
      _id: '670c2a121212121212121212',
      title: 'Prepare production deployment scripts for Vercel & Render',
      description: 'Validate vercel.json SPA rewrites and render.yaml environment configurations.',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(today.getTime() + 10 * day).toISOString(),
      assignedUser: { _id: testUser._id, name: testUser.name, email: testUser.email, role: testUser.role },
      createdBy: { _id: adminUser._id, name: adminUser.name, email: adminUser.email },
      createdAt: new Date(today.getTime() - 1 * day).toISOString(),
    },
  ];
};

initMemoryStore();

module.exports = {
  getUsers: () => memoryUsers,
  getTasks: () => memoryTasks,
  findUserByEmail: (email) =>
    memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => memoryUsers.find((u) => String(u._id) === String(id)),
  createUser: async ({ name, email, password, role }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: '670c' + Math.random().toString(16).substring(2, 22),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'user',
      createdAt: new Date().toISOString(),
      matchPassword: async function (entered) {
        return await bcrypt.compare(entered, this.password);
      },
    };
    memoryUsers.push(newUser);
    return newUser;
  },
  createTask: ({ title, description, priority, dueDate, status, assignedUser, createdBy }) => {
    const assignedUserObj = assignedUser ? memoryUsers.find((u) => String(u._id) === String(assignedUser)) : null;
    const createdByObj = createdBy ? memoryUsers.find((u) => String(u._id) === String(createdBy)) : null;

    const newTask = {
      _id: '670c' + Math.random().toString(16).substring(2, 22),
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      status: status || 'Pending',
      assignedUser: assignedUserObj
        ? { _id: assignedUserObj._id, name: assignedUserObj.name, email: assignedUserObj.email, role: assignedUserObj.role }
        : null,
      createdBy: createdByObj
        ? { _id: createdByObj._id, name: createdByObj.name, email: createdByObj.email }
        : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryTasks.unshift(newTask);
    return newTask;
  },
  updateTask: (id, updates) => {
    const task = memoryTasks.find((t) => String(t._id) === String(id));
    if (!task) return null;
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.dueDate !== undefined) task.dueDate = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
    if (updates.assignedUser !== undefined) {
      const u = updates.assignedUser ? memoryUsers.find((user) => String(user._id) === String(updates.assignedUser)) : null;
      task.assignedUser = u ? { _id: u._id, name: u.name, email: u.email, role: u.role } : null;
    }
    task.updatedAt = new Date().toISOString();
    return task;
  },
  deleteTask: (id) => {
    const initialLen = memoryTasks.length;
    memoryTasks = memoryTasks.filter((t) => String(t._id) !== String(id));
    return memoryTasks.length < initialLen;
  },
  findTaskById: (id) => memoryTasks.find((t) => String(t._id) === String(id)),
};
