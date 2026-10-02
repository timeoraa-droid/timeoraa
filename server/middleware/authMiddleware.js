const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ success: false, message: 'Authentication is temporarily unavailable. Please try again later.' });
    }
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }
      req.user = user;
      return next();
    }
  } catch (error) {
    console.error('Token authorization failed:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed verification' });
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no bearer token supplied' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Not authorized as an administrator' });
};

module.exports = { protect, admin };
