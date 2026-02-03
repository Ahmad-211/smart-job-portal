const { body, query, validationResult } = require('express-validator');

// Create job validation rules
const createJobValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 5, max: 100 }).withMessage('Job title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  
  body('company')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Job location is required'),
  
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
    .withMessage('Invalid job type'),
  
  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),
  
  body('skillsRequired')
    .isArray({ min: 1 }).withMessage('At least one skill is required')
    .custom((skills) => {
      if (!skills.every(skill => typeof skill === 'string' && skill.trim().length > 0)) {
        throw new Error('All skills must be non-empty strings');
      }
      return true;
    }),
  
  body('salary.min').optional().isNumeric().withMessage('Salary min must be a number'),
  body('salary.max').optional().isNumeric().withMessage('Salary max must be a number'),
  
  body('applicationDeadline').optional().isISO8601().withMessage('Invalid date format')
];

// Update job validation rules
const updateJobValidator = [
  body('title').optional().trim().isLength({ min: 5, max: 100 }),
  body('description').optional().trim().isLength({ min: 20 }),
  body('company').optional().trim(),
  body('location').optional().trim(),
  body('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  body('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'lead']),
  body('skillsRequired').optional().isArray(),
  body('salary.min').optional().isNumeric(),
  body('salary.max').optional().isNumeric(),
  body('applicationDeadline').optional().isISO8601()
];

// Search/query validation
const searchJobValidator = [
  query('search').optional().trim(),
  query('location').optional().trim(),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  query('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'lead']),
  query('skills').optional().isArray(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
];

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  createJobValidator,
  updateJobValidator,
  searchJobValidator,
  validate
};