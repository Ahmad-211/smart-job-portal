const express = require('express');
const {
  register,
  login,
  getMe
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');
const {
  registerValidator,
  loginValidator,
  validate
} = require('../validators/auth.validator');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Private routes (require authentication)
router.get('/me', protect, getMe);

module.exports = router;