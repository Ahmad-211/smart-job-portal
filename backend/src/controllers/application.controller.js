const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { calculateMatchScore, rankApplicants } = require('../utils/matchAlgorithm');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker only)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Validate job ID
    if (!jobId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Job ID is required'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }

    // Check if job is active
    if (!job.isActive) {
      return res.status(400).json({
        status: 'fail',
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId: jobId,
      jobSeekerId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already applied for this job'
      });
    }

    // Get user's resume
    const resume = await Resume.findOne({ userId: req.user.id });

    if (!resume) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload your resume before applying'
      });
    }

    // Calculate match score
    const matchResult = calculateMatchScore(resume.skills, job.skillsRequired);

    // Create application
    const application = await Application.create({
      jobId: jobId,
      jobSeekerId: req.user.id,
      employerId: job.employerId,
      resumeId: resume._id,
      matchScore: matchResult.score,
      coverLetter: coverLetter || '',
      status: 'pending'
    });

    // Increment job applicants count
    job.applicantsCount += 1;
    await job.save();

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: {
        application: {
          id: application._id,
          jobId: application.jobId,
          matchScore: application.matchScore,
          matchDetails: {
            score: matchResult.score,
            matchedSkills: matchResult.matchedSkills,
            missingSkills: matchResult.missingSkills,
            matchPercentage: matchResult.matchPercentage
          },
          status: application.status,
          appliedAt: application.appliedAt
        }
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already applied for this job'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Server error while submitting application'
    });
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my-applications
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ jobSeekerId: req.user.id })
      .populate('jobId', 'title company location jobType experienceLevel skillsRequired')
      .populate('employerId', 'name email company')
      .sort('-appliedAt');

    const formattedApplications = applications.map(app => ({
      id: app._id,
      job: {
        id: app.jobId._id,
        title: app.jobId.title,
        company: app.jobId.company,
        location: app.jobId.location,
        jobType: app.jobId.jobType,
        experienceLevel: app.jobId.experienceLevel,
        skillsRequired: app.jobId.skillsRequired
      },
      employer: {
        id: app.employerId._id,
        name: app.employerId.name,
        company: app.employerId.company,
        email: app.employerId.email
      },
      matchScore: app.matchScore,
      status: app.status,
      coverLetter: app.coverLetter,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt
    }));

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications: formattedApplications
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching applications'
    });
  }
};

// @desc    Get job applicants (Employer only)
// @route   GET /api/applications/job/:jobId/applicants
// @access  Private (Employer only)
exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);
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
        message: 'You are not authorized to view applicants for this job'
      });
    }

    // Get all applications for this job with user and resume data
    const applications = await Application.find({ jobId: jobId })
      .populate('jobSeekerId', 'name email phone profile')
      .populate('resumeId', 'skills education experience')
      .sort('-matchScore') // Sort by match score (highest first)
      .sort('-appliedAt'); // Then by date (newest first)

    // Format the response
    const formattedApplicants = applications.map(app => ({
      id: app._id,
      applicant: {
        id: app.jobSeekerId._id,
        name: app.jobSeekerId.name,
        email: app.jobSeekerId.email,
        phone: app.jobSeekerId.phone,
        profile: app.jobSeekerId.profile
      },
      resume: {
        skills: app.resumeId?.skills || [],
        education: app.resumeId?.education || [],
        experience: app.resumeId?.experience || []
      },
      matchScore: app.matchScore,
      status: app.status,
      coverLetter: app.coverLetter,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt
    }));

    // Get statistics
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      interview: applications.filter(a => a.status === 'interview').length,
      offer: applications.filter(a => a.status === 'offer').length,
      hired: applications.filter(a => a.status === 'hired').length,
      averageMatchScore: applications.length > 0 
        ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
        : 0
    };

    res.status(200).json({
      status: 'success',
      results: applications.length,
      stats: stats,
      data: {
        applicants: formattedApplicants
      }
    });
  } catch (error) {
    console.error('Get job applicants error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching applicants'
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'shortlisted', 'rejected', 'interview', 'offer', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status value'
      });
    }

    // Find application
    const application = await Application.findById(id)
      .populate('jobId')
      .populate('jobSeekerId', 'name email');

    if (!application) {
      return res.status(404).json({
        status: 'fail',
        message: 'Application not found'
      });
    }

    // Check if user is the employer for this job
    if (application.employerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this application'
      });
    }

    // Update status
    application.status = status;
    application.updatedAt = Date.now();
    await application.save();

    res.status(200).json({
      status: 'success',
      message: `Application status updated to ${status}`,
      data: {
        application: {
          id: application._id,
          jobId: application.jobId._id,
          jobTitle: application.jobId.title,
          applicantName: application.jobSeekerId.name,
          applicantEmail: application.jobSeekerId.email,
          status: application.status,
          matchScore: application.matchScore,
          updatedAt: application.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating application status'
    });
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'title company location jobType')
      .populate('jobSeekerId', 'name email phone')
      .populate('employerId', 'name email company')
      .populate('resumeId', 'skills education');

    if (!application) {
      return res.status(404).json({
        status: 'fail',
        message: 'Application not found'
      });
    }

    // Check if user is authorized to view this application
    const isApplicant = application.jobSeekerId._id.toString() === req.user.id;
    const isEmployer = application.employerId._id.toString() === req.user.id;
    
    if (!isApplicant && !isEmployer) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this application'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        application: {
          id: application._id,
          job: application.jobId,
          applicant: application.jobSeekerId,
          employer: application.employerId,
          resume: application.resumeId,
          matchScore: application.matchScore,
          status: application.status,
          coverLetter: application.coverLetter,
          appliedAt: application.appliedAt,
          updatedAt: application.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching application'
    });
  }
};

// @desc    Delete application (withdraw)
// @route   DELETE /api/applications/:id
// @access  Private (Job Seeker only)
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        status: 'fail',
        message: 'Application not found'
      });
    }

    // Check if user is the applicant
    if (application.jobSeekerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this application'
      });
    }

    // Delete application
    await Application.findByIdAndDelete(req.params.id);

    // Decrement job applicants count
    const job = await Job.findById(application.jobId);
    if (job) {
      job.applicantsCount = Math.max(0, job.applicantsCount - 1);
      await job.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting application'
    });
  }
};