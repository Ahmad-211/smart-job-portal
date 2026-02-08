/**
 * Advanced search and filter utility for jobs
 */

/**
 * Build MongoDB query based on search filters
 * @param {Object} filters - Search filters from query params
 * @returns {Object} MongoDB query object
 */
function buildJobSearchQuery(filters) {
  const query = { isActive: true };

  // Text search (title, description, company)
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { company: searchRegex },
      { location: searchRegex }
    ];
  }

  // Location filter
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i');
  }

  // Job type filter
  if (filters.jobType) {
    query.jobType = filters.jobType;
  }

  // Experience level filter
  if (filters.experienceLevel) {
    query.experienceLevel = filters.experienceLevel;
  }

  // Skills filter (AND logic - all skills must match)
  if (filters.skills) {
    const skillsArray = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
    query.skillsRequired = { $all: skillsArray.map(s => new RegExp(s, 'i')) };
  }

  // Salary range filter
  if (filters.minSalary || filters.maxSalary) {
    query.salary = {};
    
    if (filters.minSalary) {
      query.salary.min = { $gte: parseInt(filters.minSalary) };
    }
    
    if (filters.maxSalary) {
      query.salary.max = { $lte: parseInt(filters.maxSalary) };
    }
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  // Application deadline filter
  if (filters.deadlineAfter) {
    query.applicationDeadline = { $gte: new Date(filters.deadlineAfter) };
  }

  // Exclude specific job types
  if (filters.excludeJobType) {
    query.jobType = { $ne: filters.excludeJobType };
  }

  return query;
}

/**
 * Build sort options based on query params
 * @param {String} sortBy - Sort parameter
 * @returns {Object} Sort object
 */
function buildSortOptions(sortBy = 'newest') {
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    salaryHigh: { 'salary.max': -1, 'salary.min': -1 },
    salaryLow: { 'salary.min': 1, 'salary.max': 1 },
    titleAsc: { title: 1 },
    titleDesc: { title: -1 },
    companyAsc: { company: 1 },
    companyDesc: { company: -1 },
    applicantsHigh: { applicantsCount: -1 },
    applicantsLow: { applicantsCount: 1 },
    viewsHigh: { viewsCount: -1 },
    viewsLow: { viewsCount: 1 }
  };

  return sortOptions[sortBy] || sortOptions.newest;
}

/**
 * Build aggregation pipeline for advanced search
 * @param {Object} filters - Search filters
 * @returns {Array} Aggregation pipeline
 */
function buildSearchAggregation(filters) {
  const pipeline = [];

  // Match stage
  const matchQuery = buildJobSearchQuery(filters);
  pipeline.push({ $match: matchQuery });

  // Lookup employer details
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'employerId',
      foreignField: '_id',
      as: 'employer'
    }
  });

pipeline.push({ $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } });

  // Project only needed fields
  pipeline.push({
    $project: {
      _id: 1,
      title: 1,
      description: 1,
      company: 1,
      location: 1,
      jobType: 1,
      experienceLevel: 1,
      salary: 1,
      skillsRequired: 1,
      responsibilities: 1,
      qualifications: 1,
      benefits: 1,
      applicationDeadline: 1,
      employerId: 1,
      applicantsCount: 1,
      viewsCount: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
      'employer.name': 1,
      'employer.company': 1,
      'employer.email': 1
    }
  });

  // Sort stage
  const sort = buildSortOptions(filters.sortBy);
  pipeline.push({ $sort: sort });

  return pipeline;
}

/**
 * Get search statistics
 * @param {Object} filters - Search filters
 * @returns {Object} Statistics
 */
async function getSearchStats(Job, filters) {
  const query = buildJobSearchQuery(filters);

  const [
    totalJobs,
    jobTypes,
    experienceLevels,
    locations,
    salaryRange
  ] = await Promise.all([
    Job.countDocuments(query),
    Job.aggregate([
      { $match: query },
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Job.aggregate([
      { $match: query },
      { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Job.aggregate([
      { $match: query },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Job.aggregate([
      { $match: query },
      { $group: { 
        _id: null,
        minSalary: { $min: '$salary.min' },
        maxSalary: { $max: '$salary.max' },
        avgSalary: { $avg: '$salary.min' }
      } }
    ])
  ]);

  return {
    totalJobs,
    jobTypes: jobTypes.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    experienceLevels: experienceLevels.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    topLocations: locations.map(l => ({ location: l._id, count: l.count })),
    salaryRange: salaryRange[0] || { minSalary: 0, maxSalary: 0, avgSalary: 0 }
  };
}

/**
 * Get skill suggestions based on search
 * @param {Object} filters - Search filters
 * @returns {Array} Top skills
 */
async function getSkillSuggestions(Job, filters) {
  const query = buildJobSearchQuery(filters);

  const skills = await Job.aggregate([
    { $match: query },
    { $unwind: '$skillsRequired' },
    { $group: { _id: '$skillsRequired', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  return skills.map(s => ({ skill: s._id, count: s.count }));
}

module.exports = {
  buildJobSearchQuery,
  buildSortOptions,
  buildSearchAggregation,
  getSearchStats,
  getSkillSuggestions
};