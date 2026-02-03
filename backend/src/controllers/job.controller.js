const Job = require('../models/Job');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      salary,
      skillsRequired,
      responsibilities,
      qualifications,
      benefits,
      applicationDeadline
    } = req.body;

    // Create job
    const job = await Job.create({
      title,
      description,
      company,
      location,
      jobType: jobType || 'full-time',
      experienceLevel: experienceLevel || 'mid',
      salary,
      skillsRequired,
      responsibilities,
      qualifications,
      benefits,
      applicationDeadline,
      employerId: req.user.id // From auth middleware
    });

    res.status(201).json({
      status: 'success',
      message: 'Job posted successfully',
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Create job error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error while creating job'
    });
  }
};

// @desc    Get all jobs (with filters and search)
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      skills,
      page = 1,
      limit = 10
    } = req.query;

    // Build query object
    const queryObj = { isActive: true };

    if (location) queryObj.location = new RegExp(location, 'i');
    if (jobType) queryObj.jobType = jobType;
    if (experienceLevel) queryObj.experienceLevel = experienceLevel;

    // Skills filter (array)
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      queryObj.skillsRequired = { $all: skillsArray };
    }

    // Text search
    let query = Job.find(queryObj);

    if (search) {
      query = query.find({
        $or: [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { company: new RegExp(search, 'i') }
        ]
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));

    // Sort by newest first
    query = query.sort('-createdAt');

    const jobs = await query.populate('employerId', 'name email company');

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      total: totalJobs,
      page: parseInt(page),
      pages: Math.ceil(totalJobs / limit),
      data: {
        jobs
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching jobs'
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name email company profile');

    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }

    // Increment views count
    job.viewsCount += 1;
    await job.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching job'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }

    // Check if user is the employer who posted this job
    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this job'
      });
    }

    // Update job fields
    Object.assign(job, req.body);
    await job.save();

    res.status(200).json({
      status: 'success',
      message: 'Job updated successfully',
      data: {
        job
      }
    });
  } catch (error) {
    console.error('Update job error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error while updating job'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }

    // Check if user is the employer who posted this job
    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting job'
    });
  }
};

// @desc    Get jobs posted by employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs
      }
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching jobs'
    });
  }
};