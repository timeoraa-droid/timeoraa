const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const { logError } = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'timeora_super_secret_jwt_horology_key_2024', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const name = typeof body.name === 'string' ? body.name.trim()
      : typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const cleanEmail = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const { password, confirmPassword } = body;

    if (!name || !cleanEmail || typeof password !== 'string' || typeof confirmPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide your full name, email, password, and password confirmation.' });
    }
    if (name.length > 120 || !/^\S+@\S+\.\S+$/.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ success: false, message: 'Please provide a valid name and email address.' });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email: cleanEmail, password, role: 'user' });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, membershipTier: user.membershipTier },
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((validationError) => validationError.message).join(', '),
      });
    }
    if (mongoose.connection.readyState !== 1
      || ['MongooseError', 'MongoNetworkError', 'MongoServerSelectionError', 'MongoNotConnectedError'].includes(error.name)) {
      logError('Registration database operation failed', { errorName: error.name, errorCode: error.code });
      return res.status(503).json({ success: false, message: 'Registration is temporarily unavailable. Please try again later.' });
    }
    logError('Registration failed', { errorName: error.name, errorCode: error.code });
    return res.status(500).json({ success: false, message: 'Unable to complete registration right now. Please try again later.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (user && await user.matchPassword(password)) {
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated' });
      }
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user._id);
      res.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, membershipTier: user.membershipTier, isVerified: user.isVerified },
        token,
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', details: error.message, stack: error.stack });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, loginId, password } = req.body;
    const cleanLoginId = (loginId || email || '').toLowerCase().trim();

    if (!cleanLoginId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide admin ID and password' });
    }

    const user = await User.findOne({
      role: 'admin',
      $or: [{ email: cleanLoginId }, { adminLoginId: cleanLoginId }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    if (!await user.matchPassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Admin account deactivated' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, membershipTier: user.membershipTier, isVerified: user.isVerified },
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

router.get('/me', protect, (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, membershipTier: user.membershipTier, isVerified: user.isVerified, addresses: user.addresses, isAdmin: user.role === 'admin' },
  });
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase().trim();
    if (password) {
      if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      updates.password = password;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, membershipTier: user.membershipTier } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!await user.matchPassword(currentPassword)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const token = user.generatePasswordResetToken();
      await user.save();
      console.log(`[Password Reset] Token for ${cleanEmail}: ${token}`);
    }
    res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/verify-email', protect, async (req, res) => {
  try {
    const user = req.user;
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Already verified' });
    }
    const token = user.generateVerificationToken();
    await user.save();
    console.log(`[Email Verification] Token for ${user.email}: ${token}`);
    res.json({ success: true, message: 'Verification sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/users/:id', protect, admin, async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
