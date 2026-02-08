const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { uploadResume, getMyResume, deleteResume, analyzeResume } = require('../controllers/resume.controller');
const upload = require('../config/multer');

const router = express.Router();

// Upload resume (Job seekers only)
router.post('/upload', protect, restrictTo('jobseeker'), upload.single('resume'), uploadResume);

// Get my resume
router.get('/my-resume', protect, getMyResume);

// Analyze resume
router.post('/analyze', protect, analyzeResume);

// Delete my resume
router.delete('/my-resume', protect, deleteResume);

module.exports = router;