const mongoose = require('mongoose');
const User = require('../models/User');
const inMemoryStore = require('../config/inMemoryStore');

// @desc    Get all users (for assigning tasks)
// @route   GET /users or GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || '';

    if (mongoose.connection.readyState === 1) {
      const query = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const users = await User.find(query).select('name email role createdAt').sort({ name: 1 });
      return res.status(200).json({
        success: true,
        users,
        data: users,
      });
    }

    // In-memory fallback
    let users = inMemoryStore.getUsers().map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));

    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      );
    }

    return res.status(200).json({
      success: true,
      users,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /users/:id or GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id).select('name email role createdAt');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      return res.status(200).json({
        success: true,
        user,
        data: user,
      });
    }

    const u = inMemoryStore.findUserById(id);
    if (!u) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = {
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    };

    return res.status(200).json({
      success: true,
      user,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById };
