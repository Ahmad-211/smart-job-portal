const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Protect routes - Verify JWT token
// @access  Private
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized to access this route. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'fail',
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    // Attach user to request object (available in next middleware/controller)
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please login again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token expired. Please login again.'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error during authentication'
    });
  }
};

// @desc    Restrict routes to specific roles
// @access  Private
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is attached by protect middleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `You don't have permission to perform this action. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};