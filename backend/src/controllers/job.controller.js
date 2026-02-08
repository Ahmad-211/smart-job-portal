const Job = require('../models/Job');
const {
  buildSearchAggregation,
  getSearchStats,
  getSkillSuggestions
} = require('../utils/searchUtils');

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

    // ✅ FIX: Parse pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 10, 50);

    // Build query object
    const queryObj = { isActive: true };

    if (location) queryObj.location = new RegExp(location, 'i');
    if (jobType) queryObj.jobType = jobType;
    if (experienceLevel) queryObj.experienceLevel = experienceLevel;

    // Skills filter (array)
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      queryObj.skillsRequired = { $all: skillsArray.map(s => new RegExp(s, 'i')) };
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

    // Pagination with parsed values
    const skip = (pageNum - 1) * limitNum;
    query = query.skip(skip).limit(limitNum);

    // Sort by newest first
    query = query.sort('-createdAt');

    const jobs = await query.populate('employerId', 'name email company');

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      total: totalJobs,
      page: pageNum,
      pages: Math.ceil(totalJobs / limitNum),
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

// @desc    Advanced job search with filters
// @route   GET /api/jobs/search
// @access  Public
exports.advancedSearch = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      skills,
      minSalary,
      maxSalary,
      startDate,
      endDate,
      deadlineAfter,
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = req.query;

    // ✅ CRITICAL FIX: Parse and validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build filters object
    const filters = {
      search,
      location,
      jobType,
      experienceLevel,
      skills,
      minSalary,
      maxSalary,
      startDate,
      endDate,
      deadlineAfter,
      sortBy
    };

    // Build aggregation pipeline
    const pipeline = buildSearchAggregation(filters);

    // Clone pipeline for count
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });

    // Execute queries in parallel with parsed values
    const [results, countResult] = await Promise.all([
      Job.aggregate(pipeline).skip(skip).limit(limitNum),
      Job.aggregate(countPipeline)
    ]);

    const totalJobs = countResult.length > 0 ? countResult[0].total : 0;

    res.status(200).json({
      status: 'success',
      results: results.length,
      total: totalJobs,
      page: pageNum,
      pages: Math.ceil(totalJobs / limitNum),
      data: {
        jobs: results,
        filters: {
          search: search || null,
          location: location || null,
          jobType: jobType || null,
          experienceLevel: experienceLevel || null,
          skills: skills ? (Array.isArray(skills) ? skills : [skills]) : null,
          minSalary: minSalary || null,
          maxSalary: maxSalary || null,
          sortBy: sortBy
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalJobs / limitNum),
          hasMore: skip + limitNum < totalJobs
        }
      }
    });
  } catch (error) {
    // ✅ CRITICAL FIX: Detailed error logging for debugging
    console.error('🔍 ADVANCED SEARCH ERROR DETAILS:');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Stack Trace:', error.stack);
    console.error('Query Parameters:', req.query);
    
    // Check for specific MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('MongoDB Error Code:', error.code);
      console.error('MongoDB Error Details:', error.errmsg);
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error while searching jobs',
      debug: process.env.NODE_ENV === 'development' ? {
        error: error.message,
        query: req.query
      } : undefined
    });
  }
};

// @desc    Get search statistics and facets
// @route   GET /api/jobs/search/stats
// @access  Public
exports.getSearchStats = async (req, res) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      skills,
      minSalary,
      maxSalary
    } = req.query;

    const filters = {
      search,
      location,
      jobType,
      experienceLevel,
      skills,
      minSalary,
      maxSalary
    };

    const stats = await getSearchStats(Job, filters);

    res.status(200).json({
      status: 'success',
      data: {
        ...stats,
        filtersApplied: filters
      }
    });
  } catch (error) {
    console.error('Get search stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching search statistics'
    });
  }
};

// @desc    Get skill suggestions for search
// @route   GET /api/jobs/search/skills
// @access  Public
exports.getSkillSuggestions = async (req, res) => {
  try {
    const { search, location, jobType, experienceLevel } = req.query;

    const filters = { search, location, jobType, experienceLevel };

    const skills = await getSkillSuggestions(Job, filters);

    res.status(200).json({
      status: 'success',
      data: {
        skills: skills,
        total: skills.length,
        filtersApplied: filters
      }
    });
  } catch (error) {
    console.error('Get skill suggestions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching skill suggestions'
    });
  }
};

// @desc    Search jobs by multiple locations
// @route   GET /api/jobs/search/locations
// @access  Public
exports.searchByLocations = async (req, res) => {
  try {
    const { locations, jobType, experienceLevel, limit = 20 } = req.query;

    if (!locations) {
      return res.status(400).json({
        status: 'fail',
        message: 'Locations parameter is required'
      });
    }

    const locationsArray = Array.isArray(locations) ? locations : locations.split(',');

    const jobs = await Job.find({
      isActive: true,
      location: { $in: locationsArray.map(l => new RegExp(l.trim(), 'i')) },
      ...(jobType && { jobType }),
      ...(experienceLevel && { experienceLevel })
    })
    .populate('employerId', 'name company')
    .limit(parseInt(limit) || 20)
    .sort('-createdAt');

    // Group jobs by location
    const jobsByLocation = {};
    locationsArray.forEach(location => {
      jobsByLocation[location] = jobs.filter(job => 
        new RegExp(location.trim(), 'i').test(job.location)
      );
    });

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobsByLocation,
        totalJobs: jobs.length,
        locations: locationsArray
      }
    });
  } catch (error) {
    console.error('Search by locations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching by locations'
    });
  }
};

// @desc    Get jobs within salary range
// @route   GET /api/jobs/search/salary-range
// @access  Public
exports.getJobsBySalaryRange = async (req, res) => {
  try {
    const { min, max, jobType, location, limit = 20 } = req.query;

    if (!min && !max) {
      return res.status(400).json({
        status: 'fail',
        message: 'Min or max salary parameter is required'
      });
    }

    const query = { isActive: true };

    query.salary = {};
    
    if (min) {
      query.salary.min = { $gte: parseInt(min) || 0 };
    }
    
    if (max) {
      query.salary.max = { $lte: parseInt(max) || Number.MAX_SAFE_INTEGER };
    }

    if (jobType) query.jobType = jobType;
    if (location) query.location = new RegExp(location, 'i');

    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const jobs = await Job.find(query)
      .populate('employerId', 'name company')
      .limit(limitNum)
      .sort('-salary.max');

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: {
        jobs: jobs,
        salaryRange: { min: min || 'any', max: max || 'any' },
        averageSalary: jobs.length > 0 
          ? Math.round(jobs.reduce((sum, job) => sum + (job.salary.max || 0), 0) / jobs.length)
          : 0
      }
    });
  } catch (error) {
    console.error('Get jobs by salary range error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching jobs by salary range'
    });
  }
};