const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const inMemoryStore = require('../config/inMemoryStore');

// @desc    Register a new user
// @route   POST /register or POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, rememberMe } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      // Check duplicate email in MongoDB
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists. Please login or use another email.',
        });
      }

      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role && ['admin', 'user'].includes(role) ? role : 'user',
      });
    } else {
      // In-memory fallback
      const existingUser = inMemoryStore.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists. Please login or use another email.',
        });
      }

      user = await inMemoryStore.createUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role && ['admin', 'user'].includes(role) ? role : 'user',
      });
    }

    const isRemember = Boolean(rememberMe);
    const token = generateToken(user._id, isRemember);

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /login or POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    } else {
      user = inMemoryStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isRemember = Boolean(rememberMe);
    const token = generateToken(user._id, isRemember);

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me or GET /me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
    } else {
      user = inMemoryStore.findUserById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user profile (name, bio)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), bio: bio ? bio.trim() : '' },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change logged-in user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain uppercase, lowercase, number, and special character',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save(); // triggers pre-save hash

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, updatePassword };
