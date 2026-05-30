const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid Indian mobile number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { name, email, password, phone } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      const user = await User.create({ name, email, password, phone });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to SpendCoach.',
        token,
        user,
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account deactivated. Contact support.',
        });
      }

      const token = generateToken(user._id);
      const userObj = user.toJSON();

      res.status(200).json({
        success: true,
        message: 'Login successful. Welcome back!',
        token,
        user: userObj,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name too short'),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
    body('monthlyIncome').optional().isNumeric().withMessage('Income must be a number'),
    body('savingsGoal').optional().isNumeric().withMessage('Savings goal must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { name, phone, monthlyIncome, savingsGoal } = req.body;
      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (monthlyIncome !== undefined) updateData.monthlyIncome = monthlyIncome;
      if (savingsGoal !== undefined) updateData.savingsGoal = savingsGoal;

      const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({ success: true, message: 'Profile updated.', user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

module.exports = router;
