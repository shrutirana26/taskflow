const mongoose = require('mongoose');
const Task = require('../models/Task');
const inMemoryStore = require('../config/inMemoryStore');

// @desc    Get all tasks with filtering, search, sorting & pagination
// @route   GET /tasks or GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (search && search.trim() !== '') {
        query.title = { $regex: search.trim(), $options: 'i' };
      }
      if (status && status !== 'All') {
        query.status = status;
      }
      if (priority && priority !== 'All') {
        query.priority = priority;
      }

      const sortField = ['dueDate', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
      const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
      const sortOptions = { [sortField]: sortOrder };
      const skip = (pageNum - 1) * limitNum;

      const [tasks, totalMatching, totalAll, pendingCount, inProgressCount, completedCount] =
        await Promise.all([
          Task.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .populate('assignedUser', 'name email role')
            .populate('createdBy', 'name email role'),
          Task.countDocuments(query),
          Task.countDocuments(),
          Task.countDocuments({ status: 'Pending' }),
          Task.countDocuments({ status: 'In Progress' }),
          Task.countDocuments({ status: 'Completed' }),
        ]);

      const totalPages = Math.ceil(totalMatching / limitNum) || 1;

      return res.status(200).json({
        success: true,
        tasks,
        pagination: {
          total: totalMatching,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
        stats: {
          total: totalAll,
          pending: pendingCount,
          inProgress: inProgressCount,
          completed: completedCount,
        },
      });
    }

    // In-memory fallback
    let allTasks = [...inMemoryStore.getTasks()];

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      allTasks = allTasks.filter((t) => t.title.toLowerCase().includes(term));
    }
    if (status && status !== 'All') {
      allTasks = allTasks.filter((t) => t.status === status);
    }
    if (priority && priority !== 'All') {
      allTasks = allTasks.filter((t) => t.priority === priority);
    }

    allTasks.sort((a, b) => {
      const field = sortBy === 'dueDate' ? 'dueDate' : 'createdAt';
      const valA = a[field] ? new Date(a[field]).getTime() : 0;
      const valB = b[field] ? new Date(b[field]).getTime() : 0;
      return order.toLowerCase() === 'asc' ? valA - valB : valB - valA;
    });

    const totalMatching = allTasks.length;
    const totalPages = Math.ceil(totalMatching / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedTasks = allTasks.slice(startIndex, startIndex + limitNum);

    const fullStore = inMemoryStore.getTasks();
    const stats = {
      total: fullStore.length,
      pending: fullStore.filter((t) => t.status === 'Pending').length,
      inProgress: fullStore.filter((t) => t.status === 'In Progress').length,
      completed: fullStore.filter((t) => t.status === 'Completed').length,
    };

    return res.status(200).json({
      success: true,
      tasks: paginatedTasks,
      pagination: {
        total: totalMatching,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /tasks/:id or GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid task ID format',
        });
      }

      const task = await Task.findById(id)
        .populate('assignedUser', 'name email role')
        .populate('createdBy', 'name email role');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        success: true,
        task,
      });
    }

    // In-memory fallback
    const task = inMemoryStore.findTaskById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /tasks or POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, status, assignedUser } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    if (mongoose.connection.readyState === 1) {
      let assignedUserId = null;
      if (assignedUser && assignedUser !== '') {
        if (!mongoose.Types.ObjectId.isValid(assignedUser)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid assignedUser ID format',
          });
        }
        assignedUserId = assignedUser;
      }

      const newTask = await Task.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'Pending',
        assignedUser: assignedUserId,
        createdBy: req.user._id,
      });

      const populatedTask = await Task.findById(newTask._id)
        .populate('assignedUser', 'name email role')
        .populate('createdBy', 'name email role');

      return res.status(201).json({
        success: true,
        task: populatedTask,
        message: 'Task created successfully',
      });
    }

    // In-memory fallback
    const newTask = inMemoryStore.createTask({
      title,
      description,
      priority,
      dueDate,
      status,
      assignedUser,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      task: newTask,
      message: 'Task created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /tasks/:id or PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, status, assignedUser } = req.body;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid task ID format',
        });
      }

      const existingTask = await Task.findById(id);
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      const updates = {};
      if (title !== undefined) updates.title = title.trim();
      if (description !== undefined) updates.description = description.trim();
      if (priority !== undefined) updates.priority = priority;
      if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
      if (status !== undefined) updates.status = status;
      if (assignedUser !== undefined) {
        if (assignedUser && assignedUser !== '') {
          if (!mongoose.Types.ObjectId.isValid(assignedUser)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid assignedUser ID format',
            });
          }
          updates.assignedUser = assignedUser;
        } else {
          updates.assignedUser = null;
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      })
        .populate('assignedUser', 'name email role')
        .populate('createdBy', 'name email role');

      return res.status(200).json({
        success: true,
        task: updatedTask,
        message: 'Task updated successfully',
      });
    }

    // In-memory fallback
    const updated = inMemoryStore.updateTask(id, {
      title,
      description,
      priority,
      dueDate,
      status,
      assignedUser,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      task: updated,
      message: 'Task updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /tasks/:id or DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid task ID format',
        });
      }

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      await Task.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    }

    // In-memory fallback
    const deleted = inMemoryStore.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics summary for dashboard
// @route   GET /tasks/stats/summary or GET /api/tasks/stats/summary
// @access  Private
const getTaskStatsSummary = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [total, pending, inProgress, completed, lowPriority, mediumPriority, highPriority, recentTasks] =
        await Promise.all([
          Task.countDocuments(),
          Task.countDocuments({ status: 'Pending' }),
          Task.countDocuments({ status: 'In Progress' }),
          Task.countDocuments({ status: 'Completed' }),
          Task.countDocuments({ priority: 'Low' }),
          Task.countDocuments({ priority: 'Medium' }),
          Task.countDocuments({ priority: 'High' }),
          Task.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('assignedUser', 'name email role')
            .populate('createdBy', 'name email role'),
        ]);

      const byStatus = [
        { name: 'Pending', count: pending, color: '#f59e0b' },
        { name: 'In Progress', count: inProgress, color: '#3b82f6' },
        { name: 'Completed', count: completed, color: '#10b981' },
      ];

      const byPriority = [
        { name: 'Low', count: lowPriority, color: '#6ee7b7' },
        { name: 'Medium', count: mediumPriority, color: '#38bdf8' },
        { name: 'High', count: highPriority, color: '#f87171' },
      ];

      return res.status(200).json({
        success: true,
        stats: {
          total,
          pending,
          inProgress,
          completed,
          byStatus,
          byPriority,
          recentTasks,
        },
      });
    }

    // In-memory fallback
    const all = inMemoryStore.getTasks();
    const pending = all.filter((t) => t.status === 'Pending').length;
    const inProgress = all.filter((t) => t.status === 'In Progress').length;
    const completed = all.filter((t) => t.status === 'Completed').length;
    const lowPriority = all.filter((t) => t.priority === 'Low').length;
    const mediumPriority = all.filter((t) => t.priority === 'Medium').length;
    const highPriority = all.filter((t) => t.priority === 'High').length;

    const recent = [...all]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      stats: {
        total: all.length,
        pending,
        inProgress,
        completed,
        byStatus: [
          { name: 'Pending', count: pending, color: '#f59e0b' },
          { name: 'In Progress', count: inProgress, color: '#3b82f6' },
          { name: 'Completed', count: completed, color: '#10b981' },
        ],
        byPriority: [
          { name: 'Low', count: lowPriority, color: '#6ee7b7' },
          { name: 'Medium', count: mediumPriority, color: '#38bdf8' },
          { name: 'High', count: highPriority, color: '#f87171' },
        ],
        recentTasks: recent,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStatsSummary,
};
