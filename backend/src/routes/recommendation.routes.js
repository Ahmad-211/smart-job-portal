const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const {
  getRecommendedJobs,
  getSimilarJobs,
  getSkillGapAnalysis,
  getTrendingJobs,
  getPersonalizedFeed
} = require('../controllers/recommendation.controller');

const router = express.Router();

// Get recommended jobs for current user (Job Seeker)
router.get('/jobs', protect, restrictTo('jobseeker'), getRecommendedJobs);

// Get jobs similar to a specific job (Public)
router.get('/jobs/similar/:jobId', getSimilarJobs);

// Get skill gap analysis for a job (Job Seeker)
router.get('/skill-gap/:jobId', protect, restrictTo('jobseeker'), getSkillGapAnalysis);

// Get trending jobs (Public)
router.get('/trending', getTrendingJobs);

// Get personalized job feed (Job Seeker)
router.get('/feed', protect, restrictTo('jobseeker'), getPersonalizedFeed);

module.exports = router;