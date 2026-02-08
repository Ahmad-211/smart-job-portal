const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    // Build query
    const queryObj = {};
    if (role) queryObj.role = role;
    if (isActive !== undefined) queryObj.isActive = isActive === 'true';

    // Pagination
    const skip = (page - 1) * limit;

    const users = await User.find(queryObj)
      .select('-password') // Don't include passwords
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const totalUsers = await User.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total: totalUsers,
      page: parseInt(page),
      pages: Math.ceil(totalUsers / limit),
      data: {
        users: users.map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profile: user.profile,
          isVerified: user.isVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('resume', 'skills education experience');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profile: user.profile,
          isVerified: user.isVerified,
          isActive: user.isActive,
          resume: user.resume,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user'
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    const validRoles = ['jobseeker', 'employer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Prevent demoting yourself if you're the only admin
    if (user.role === 'admin' && req.user.id === user._id && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(400).json({
          status: 'fail',
          message: 'Cannot demote the only admin'
        });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating user role'
    });
  }
};

// @desc    Deactivate/activate user (Admin only)
// @route   PATCH /api/admin/users/:id/activate
// @access  Private (Admin only)
exports.toggleUserActiveStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Prevent deactivating yourself
    if (req.user.id === user._id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? 'activated' : 'deactivated';

    res.status(200).json({
      status: 'success',
      message: `User ${action} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while toggling user status'
    });
  }
};

// @desc    Get all jobs (Admin only)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
exports.getAllJobs = async (req, res) => {
  try {
    const { isActive, employerId, page = 1, limit = 20 } = req.query;

    const queryObj = {};
    if (isActive !== undefined) queryObj.isActive = isActive === 'true';
    if (employerId) queryObj.employerId = employerId;

    const skip = (page - 1) * limit;

    const jobs = await Job.find(queryObj)
      .populate('employerId', 'name email company')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const totalJobs = await Job.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      total: totalJobs,
      page: parseInt(page),
      pages: Math.ceil(totalJobs / limit),
      data: {
        jobs: jobs.map(job => ({
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          skillsRequired: job.skillsRequired,
          employer: job.employerId,
          applicantsCount: job.applicantsCount,
          viewsCount: job.viewsCount,
          isActive: job.isActive,
          applicationDeadline: job.applicationDeadline,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        }))
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

// @desc    Delete job (Admin only)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }

    // Delete related applications
    await Application.deleteMany({ jobId: req.params.id });

    res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting job'
    });
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/admin/applications
// @access  Private (Admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const { status, jobId, jobSeekerId, page = 1, limit = 20 } = req.query;

    const queryObj = {};
    if (status) queryObj.status = status;
    if (jobId) queryObj.jobId = jobId;
    if (jobSeekerId) queryObj.jobSeekerId = jobSeekerId;

    const skip = (page - 1) * limit;

    const applications = await Application.find(queryObj)
      .populate('jobId', 'title company location')
      .populate('jobSeekerId', 'name email')
      .populate('employerId', 'name email company')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-appliedAt');

    const totalApplications = await Application.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      total: totalApplications,
      page: parseInt(page),
      pages: Math.ceil(totalApplications / limit),
      data: {
        applications: applications.map(app => ({
          id: app._id,
          job: {
            id: app.jobId._id,
            title: app.jobId.title,
            company: app.jobId.company,
            location: app.jobId.location
          },
          applicant: {
            id: app.jobSeekerId._id,
            name: app.jobSeekerId.name,
            email: app.jobSeekerId.email
          },
          employer: {
            id: app.employerId._id,
            name: app.employerId.name,
            company: app.employerId.company,
            email: app.employerId.email
          },
          matchScore: app.matchScore,
          status: app.status,
          appliedAt: app.appliedAt,
          updatedAt: app.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching applications'
    });
  }
};

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });

    // Get user breakdown by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentApplications = await Application.countDocuments({
      appliedAt: { $gte: sevenDaysAgo }
    });

    // Get top employers by job count
    const topEmployers = await Job.aggregate([
      { $group: { _id: '$employerId', jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' },
      {
        $project: {
          _id: 0,
          employerId: '$_id',
          employerName: '$employer.name',
          employerEmail: '$employer.email',
          jobCount: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalJobs,
          activeJobs,
          totalApplications,
          pendingApplications,
          shortlistedApplications,
          recentApplications
        },
        usersByRole: usersByRole.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        topEmployers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching statistics'
    });
  }
};