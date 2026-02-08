const express = require('express');
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  advancedSearch,
  getSearchStats,
  getSkillSuggestions,
  searchByLocations,
  getJobsBySalaryRange
} = require('../controllers/job.controller');
const { protect, restrictTo } = require('../middlewares/auth');
const {
  createJobValidator,
  updateJobValidator,
  searchJobValidator,
  validate
} = require('../validators/job.validator');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', searchJobValidator, validate, getAllJobs);
router.get('/search', searchJobValidator, validate, advancedSearch);
router.get('/search/stats', getSearchStats);
router.get('/search/skills', getSkillSuggestions);
router.get('/search/locations', searchByLocations);
router.get('/search/salary-range', getJobsBySalaryRange);
router.get('/:id', getJobById);

// Protected routes (require authentication)
router.post('/', protect, restrictTo('employer'), createJobValidator, validate, createJob);
router.put('/:id', protect, restrictTo('employer'), updateJobValidator, validate, updateJob);
router.delete('/:id', protect, restrictTo('employer'), deleteJob);
router.get('/employer/my-jobs', protect, restrictTo('employer'), getEmployerJobs);

module.exports = router;