const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserActiveStatus,
  getAllJobs,
  deleteJob,
  getAllApplications,
  getDashboardStats
} = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require admin role
router.use(protect, restrictTo('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/activate', toggleUserActiveStatus);

// Job management
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);

// Application management
router.get('/applications', getAllApplications);

// Dashboard statistics
router.get('/stats', getDashboardStats);

module.exports = router;