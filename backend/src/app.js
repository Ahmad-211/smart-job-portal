const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const resumeRoutes = require('./routes/resume.routes');
const applicationRoutes = require('./routes/application.routes');
const adminRoutes = require('./routes/admin.routes');
const recommendationRoutes = require('./routes/recommendation.routes');

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes); // Recommendation routes

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Job Portal API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (protected)',
      jobs: 'GET /api/jobs',
      'create job': 'POST /api/jobs (employer only)',
      'get job': 'GET /api/jobs/:id',
      'upload resume': 'POST /api/resume/upload (jobseeker only)',
      'get resume': 'GET /api/resume/my-resume (protected)',
      'analyze resume': 'POST /api/resume/analyze (protected)',
      'apply job': 'POST /api/applications (jobseeker only)',
      'my applications': 'GET /api/applications/my-applications (protected)',
      'job applicants': 'GET /api/applications/job/:jobId/applicants (employer only)',
      'recommended jobs': 'GET /api/recommendations/jobs (jobseeker only)',
      'similar jobs': 'GET /api/recommendations/jobs/similar/:jobId',
      'skill gap analysis': 'GET /api/recommendations/skill-gap/:jobId (jobseeker only)',
      'trending jobs': 'GET /api/recommendations/trending',
      'personalized feed': 'GET /api/recommendations/feed (jobseeker only)',
      'admin users': 'GET /api/admin/users (admin only)',
      'admin stats': 'GET /api/admin/stats (admin only)'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found'
  });
});

module.exports = app;