const Job = require('../models/Job');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { calculateMatchScore } = require('../utils/matchAlgorithm');

// @desc    Get recommended jobs for current user
// @route   GET /api/recommendations/jobs
// @access  Private (Job Seeker)
exports.getRecommendedJobs = async (req, res) => {
  try {
    // Get user's resume
    const resume = await Resume.findOne({ userId: req.user.id });

    if (!resume || !resume.skills || resume.skills.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload and analyze your resume first to get job recommendations'
      });
    }

    // Get query parameters
    const { limit = 10, minMatchScore = 30, location, jobType, experienceLevel } = req.query;

    // Build query for active jobs
    const queryObj = { isActive: true };

    // Apply filters
    if (location) queryObj.location = new RegExp(location, 'i');
    if (jobType) queryObj.jobType = jobType;
    if (experienceLevel) queryObj.experienceLevel = experienceLevel;

    // Get all matching jobs
    const jobs = await Job.find(queryObj)
      .populate('employerId', 'name company')
      .sort('-createdAt')
      .limit(100); // Limit to 100 jobs for performance

    if (jobs.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No jobs found matching your criteria'
      });
    }

    // Calculate match scores for each job
    const jobsWithScores = jobs.map(job => {
      const matchResult = calculateMatchScore(resume.skills, job.skillsRequired);
      
      return {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          salary: job.salary,
          skillsRequired: job.skillsRequired,
          responsibilities: job.responsibilities,
          qualifications: job.qualifications,
          benefits: job.benefits,
          applicationDeadline: job.applicationDeadline,
          employer: job.employerId,
          applicantsCount: job.applicantsCount,
          viewsCount: job.viewsCount,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt
        },
        matchScore: matchResult.score,
        matchDetails: {
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          matchPercentage: matchResult.matchPercentage,
          bonusPoints: matchResult.bonusPoints
        }
      };
    });

    // Filter by minimum match score
    const filteredJobs = jobsWithScores.filter(j => j.matchScore >= parseInt(minMatchScore));

    // Sort by match score (descending)
    const sortedJobs = filteredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    const recommendedJobs = sortedJobs.slice(0, parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: recommendedJobs.length,
      totalAvailable: filteredJobs.length,
      data: {
        jobs: recommendedJobs,
        userSkills: resume.skills,
        filtersApplied: {
          minMatchScore: parseInt(minMatchScore),
          location: location || 'All',
          jobType: jobType || 'All',
          experienceLevel: experienceLevel || 'All'
        }
      }
    });
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching job recommendations'
    });
  }
};

// @desc    Get jobs similar to a specific job
// @route   GET /api/recommendations/jobs/similar/:jobId
// @access  Public
exports.getSimilarJobs = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { limit = 5 } = req.query;

    // Get the reference job
    const referenceJob = await Job.findById(jobId);

    if (!referenceJob) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }

    // Find similar jobs (same skills, location, job type, but exclude the reference job)
    const similarJobs = await Job.find({
      _id: { $ne: jobId }, // Exclude reference job
      isActive: true,
      skillsRequired: { $in: referenceJob.skillsRequired }, // At least one common skill
      jobType: referenceJob.jobType,
      location: referenceJob.location
    })
    .populate('employerId', 'name company')
    .limit(parseInt(limit))
    .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: similarJobs.length,
      data: {
        jobs: similarJobs.map(job => ({
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          skillsRequired: job.skillsRequired,
          employer: job.employerId,
          applicantsCount: job.applicantsCount,
          matchReason: 'Similar skills and location'
        })),
        referenceJob: {
          id: referenceJob._id,
          title: referenceJob.title,
          skills: referenceJob.skillsRequired
        }
      }
    });
  } catch (error) {
    console.error('Get similar jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching similar jobs'
    });
  }
};

// @desc    Get skill gap analysis for a job
// @route   GET /api/recommendations/skill-gap/:jobId
// @access  Private (Job Seeker)
exports.getSkillGapAnalysis = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get user's resume
    const resume = await Resume.findOne({ userId: req.user.id });

    if (!resume) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload your resume first'
      });
    }

    // Get the job
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        status: 'fail',
        message: 'Job not found'
      });
    }

    // Calculate match score and gap analysis
    const matchResult = calculateMatchScore(resume.skills, job.skillsRequired);

    // Generate recommendations
    const recommendations = [];
    
    if (matchResult.score >= 80) {
      recommendations.push('Excellent match! You have most of the required skills.');
      recommendations.push('Consider applying for this position.');
    } else if (matchResult.score >= 60) {
      recommendations.push('Good match! You have many of the required skills.');
      recommendations.push('You might want to learn: ' + matchResult.missingSkills.join(', '));
    } else if (matchResult.score >= 40) {
      recommendations.push('Fair match. Consider upskilling in the missing areas.');
      recommendations.push('Missing skills: ' + matchResult.missingSkills.join(', '));
    } else {
      recommendations.push('Low match. This job may require significant upskilling.');
      recommendations.push('Consider jobs that better match your current skill set.');
    }

    res.status(200).json({
      status: 'success',
      data: {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          skillsRequired: job.skillsRequired
        },
        currentUserSkills: resume.skills,
        matchScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        skillGap: matchResult.missingSkills.length,
        matchPercentage: matchResult.matchPercentage,
        recommendations: recommendations
      }
    });
  } catch (error) {
    console.error('Get skill gap analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while analyzing skill gap'
    });
  }
};

// @desc    Get trending jobs (most viewed/applications)
// @route   GET /api/recommendations/trending
// @access  Public
exports.getTrendingJobs = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'views' } = req.query;

    // Sort by viewsCount or applicantsCount
    const sortField = sortBy === 'applications' ? 'applicantsCount' : 'viewsCount';

    const trendingJobs = await Job.find({ isActive: true })
      .populate('employerId', 'name company')
      .sort(`-${sortField}`)
      .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: trendingJobs.length,
      data: {
        jobs: trendingJobs.map(job => ({
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
          trendingReason: sortBy === 'applications' ? 'High applications' : 'Most viewed'
        })),
        sortBy: sortBy
      }
    });
  } catch (error) {
    console.error('Get trending jobs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching trending jobs'
    });
  }
};

// @desc    Get personalized job feed
// @route   GET /api/recommendations/feed
// @access  Private (Job Seeker)
exports.getPersonalizedFeed = async (req, res) => {
  try {
    // Get user's resume
    const resume = await Resume.findOne({ userId: req.user.id }).populate('userId');

    if (!resume) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload your resume first'
      });
    }

    // Get all active jobs
    const jobs = await Job.find({ isActive: true })
      .populate('employerId', 'name company')
      .sort('-createdAt')
      .limit(50);

    // Calculate match scores
    const jobsWithScores = jobs.map(job => {
      const matchResult = calculateMatchScore(resume.skills, job.skillsRequired);
      
      return {
        job: job,
        matchScore: matchResult.score,
        matchDetails: matchResult
      };
    });

    // Categorize jobs
    const highMatch = jobsWithScores.filter(j => j.matchScore >= 70);
    const mediumMatch = jobsWithScores.filter(j => j.matchScore >= 40 && j.matchScore < 70);
    const lowMatch = jobsWithScores.filter(j => j.matchScore < 40);

    // Get trending jobs
    const trendingJobs = await Job.find({ isActive: true })
      .sort('-viewsCount')
      .limit(5)
      .populate('employerId', 'name company');

    res.status(200).json({
      status: 'success',
      data: {
        highMatch: {
          count: highMatch.length,
          jobs: highMatch.slice(0, 5).map(item => formatJobWithMatch(item))
        },
        mediumMatch: {
          count: mediumMatch.length,
          jobs: mediumMatch.slice(0, 5).map(item => formatJobWithMatch(item))
        },
        lowMatch: {
          count: lowMatch.length,
          jobs: lowMatch.slice(0, 5).map(item => formatJobWithMatch(item))
        },
        trending: {
          count: trendingJobs.length,
          jobs: trendingJobs.map(job => ({
            id: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            jobType: job.jobType,
            skillsRequired: job.skillsRequired,
            employer: job.employerId,
            viewsCount: job.viewsCount,
            applicantsCount: job.applicantsCount
          }))
        },
        userSkills: resume.skills,
        totalJobsAvailable: jobs.length
      }
    });
  } catch (error) {
    console.error('Get personalized feed error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching personalized feed'
    });
  }
};

// Helper function to format job with match details
function formatJobWithMatch(item) {
  return {
    id: item.job._id,
    title: item.job.title,
    company: item.job.company,
    location: item.job.location,
    jobType: item.job.jobType,
    experienceLevel: item.job.experienceLevel,
    skillsRequired: item.job.skillsRequired,
    employer: item.job.employerId,
    applicantsCount: item.job.applicantsCount,
    viewsCount: item.job.viewsCount,
    matchScore: item.matchScore,
    matchDetails: {
      matchedSkills: item.matchDetails.matchedSkills,
      missingSkills: item.matchDetails.missingSkills,
      matchPercentage: item.matchDetails.matchPercentage
    }
  };
}