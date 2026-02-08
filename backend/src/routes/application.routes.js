const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getApplicationById,
  deleteApplication
} = require('../controllers/application.controller');

const router = express.Router();

// Apply for a job (Job Seeker only)
router.post('/', protect, restrictTo('jobseeker'), applyForJob);

// Get my applications
router.get('/my-applications', protect, getMyApplications);

// Get job applicants (Employer only)
router.get('/job/:jobId/applicants', protect, restrictTo('employer'), getJobApplicants);

// Update application status (Employer only)
router.patch('/:id/status', protect, restrictTo('employer'), updateApplicationStatus);

// Get application by ID
router.get('/:id', protect, getApplicationById);

// Delete/withdraw application (Job Seeker only)
router.delete('/:id', protect, restrictTo('jobseeker'), deleteApplication);

module.exports = router;