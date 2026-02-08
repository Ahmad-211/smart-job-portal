const Resume = require('../models/Resume');
const User = require('../models/User');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
// @access  Private (Job Seeker only)
exports.uploadResume = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a PDF resume file'
      });
    }

    console.log('📄 File uploaded:', req.file.filename);
    console.log('📁 File path:', req.file.path);

    // Verify file exists
    const pdfPath = path.join(__dirname, '../../', req.file.path);
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ File not found at path:', pdfPath);
      return res.status(400).json({
        status: 'fail',
        message: 'Uploaded file not found. Please try again.'
      });
    }

    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('✅ File read successfully, size:', pdfBuffer.length, 'bytes');

    // Parse PDF to extract text
    const pdfData = await pdf(pdfBuffer);
    console.log('✅ PDF parsed, extracted', pdfData.text.length, 'characters');

    // Save resume data to database
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        extractedText: pdfData.text
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log('✅ Resume saved to database:', resume._id);

    // Optional: Keep files for debugging, delete later in production
    // fs.unlinkSync(pdfPath);

    res.status(201).json({
      status: 'success',
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        uploadedAt: resume.uploadedAt,
        extractedTextPreview: resume.extractedText.substring(0, 200) + '...'
      }
    });
  } catch (error) {
    console.error('❌ Upload resume error:', error.message);
    console.error('Stack:', error.stack);

    // Clean up file if upload failed
    if (req.file && req.file.path) {
      const filePath = path.join(__dirname, '../../', req.file.path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('🧹 Cleaned up failed upload:', req.file.filename);
        } catch (cleanupError) {
          console.error('❌ Cleanup error:', cleanupError.message);
        }
      }
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while uploading resume'
    });
  }
};

// @desc    Get user's resume
// @route   GET /api/resume/my-resume
// @access  Private
exports.getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id })
      .populate('userId', 'name email');

    if (!resume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      status: 'success',
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        uploadedAt: resume.uploadedAt,
        extractedText: resume.extractedText.substring(0, 500) + '...', // Preview only
        skills: resume.skills,
        education: resume.education,
        experience: resume.experience,
        summary: resume.summary,
        user: resume.userId
      }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching resume'
    });
  }
};

// @desc    Delete user's resume
// @route   DELETE /api/resume/my-resume
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ userId: req.user.id });

    if (!resume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resume not found'
      });
    }

    // Delete the file from disk
    const filePath = path.join(__dirname, '../../', resume.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Deleted resume file:', resume.fileName);
    }

    res.status(200).json({
      status: 'success',
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting resume'
    });
  }
};

// @desc    Extract and analyze resume text
// @route   POST /api/resume/analyze
// @access  Private
exports.analyzeResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });

    if (!resume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resume not found. Please upload a resume first.'
      });
    }

    // Extract skills from text (basic keyword matching)
    const skillsDictionary = require('../utils/skillsDictionary');
    const extractedSkills = extractSkills(resume.extractedText, skillsDictionary);
    
    // Extract education (basic pattern matching)
    const education = extractEducation(resume.extractedText);
    
    // Extract experience (basic pattern matching)
    const experience = extractExperience(resume.extractedText);
    
    // Generate summary
    const summary = generateSummary(resume.extractedText);

    // Update resume with extracted data
    resume.skills = extractedSkills;
    resume.education = education;
    resume.experience = experience;
    resume.summary = summary;
    await resume.save();

    res.status(200).json({
      status: 'success',
      message: 'Resume analyzed successfully',
      analysis: {
        skills: extractedSkills,
        education: education,
        experience: experience,
        summary: summary
      }
    });
  } catch (error) {
    console.error('Analyze resume error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while analyzing resume'
    });
  }
};

// Helper function to extract skills from text
function extractSkills(text, skillsDictionary) {
  const skills = new Set();
  const lowerText = text.toLowerCase();

  // Check for programming languages
  skillsDictionary.programmingLanguages.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  // Check for frameworks
  skillsDictionary.frameworks.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  // Check for databases
  skillsDictionary.databases.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  // Check for tools
  skillsDictionary.tools.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

// Helper function to extract education
// Helper function to extract education (PRECISE)
function extractEducation(text) {
  const education = new Set();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 5 && line.length < 100);

  // Patterns for degree types
  const degreePatterns = [
    /bachelor|bs|b\.s\.|bcs|b\.c\.s\.|undergraduate/i,
    /master|ms|m\.s\.|mcs|m\.c\.s\.|graduate/i,
    /phd|ph\.d\.|doctorate/i,
    /associate|diploma|certification/i,
    /fast-nuces|nust|lums|comsats|giki|uet/i // Pakistani universities
  ];

  // Patterns for years/dates (education typically has year ranges)
  const yearPattern = /\b(19|20)\d{2}\b/;

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Check if line contains degree keyword AND a year OR university name
    const hasDegree = degreePatterns.some(pattern => pattern.test(line));
    const hasYear = yearPattern.test(line);
    const hasUniversity = /university|college|institute|school|fast|nust|lums|comsats|giki|uet/i.test(lowerLine);
    
    if (hasDegree && (hasYear || hasUniversity)) {
      // Clean up the line: remove contact info, emails, URLs
      let cleaned = line
        .replace(/[\|•\*\-]\s*/g, '')
        .replace(/\b\d{4}\s*[-–—]\s*\d{4}\b/g, '') // Remove year ranges temporarily for cleaning
        .replace(/http\S+|www\.\S+|\S+@\S+/g, '') // Remove URLs/emails
        .replace(/\s+/g, ' ')
        .trim();
      
      // Restore year ranges if present
      const yearMatch = line.match(/\b\d{4}\s*[-–—]\s*\d{4}\b/);
      if (yearMatch) {
        cleaned = cleaned + ' (' + yearMatch[0] + ')';
      }
      
      if (cleaned.length > 10) {
        education.add(cleaned);
      }
    }
  });

  return Array.from(education);
}

// Helper function to extract experience (PRECISE)
function extractExperience(text) {
  const experience = new Set();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 15 && line.length < 120);

  // Job title keywords
  const jobKeywords = [
    'developer', 'engineer', 'programmer', 'software', 'frontend', 'backend', 
    'full[-\s]?stack', 'intern', 'trainee', 'researcher', 'analyst', 'qa', 'tester',
    'sde', 'sse', 'lead', 'manager', 'architect'
  ];

  // Company indicators
  const companyIndicators = [
    'inc', 'llc', 'ltd', 'corp', 'technologies', 'solutions', 'systems',
    'google', 'microsoft', 'amazon', 'facebook', 'meta', 'apple', 'netflix',
    'pakistan', 'karachi', 'lahore', 'islamabad', 'remote'
  ];

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Check for job title keywords
    const hasJobKeyword = jobKeywords.some(keyword => 
      new RegExp(`\\b${keyword}\\b`, 'i').test(line)
    );
    
    // Check for company indicators or location
    const hasCompanyIndicator = companyIndicators.some(indicator => 
      lowerLine.includes(indicator)
    );
    
    // Check for date patterns (e.g., "2023 - Present", "Jan 2022")
    const hasDate = /\b(20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(line);
    
    // Strong signal: line contains job keyword AND (date OR company)
    if (hasJobKeyword && (hasDate || hasCompanyIndicator)) {
      // Clean the line
      let cleaned = line
        .replace(/[\|•\*\-]\s*/g, '')
        .replace(/http\S+|www\.\S+|\S+@\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleaned.length > 20) {
        experience.add(cleaned);
      }
    }
  });

  return Array.from(experience);
}

// Helper function to generate summary (BETTER)
function generateSummary(text) {
  // Remove contact info, emails, URLs, social links first
  let cleanedText = text
    .replace(/\S+@\S+/g, '') // Emails
    .replace(/http\S+|www\.\S+/g, '') // URLs
    .replace(/linkedin\.com\S*/gi, '')
    .replace(/github\.com\S*/gi, '')
    .replace(/\(\+\d{2}\)\s*\d{3}[-\s]?\d{4,}/g, '') // Phone numbers
    .replace(/[\|•\*\-]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into sentences (more robust splitting)
  const sentences = cleanedText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => 
      s.length > 30 && // Minimum length
      !s.toLowerCase().includes('phone') &&
      !s.toLowerCase().includes('email') &&
      !s.toLowerCase().includes('linkedin') &&
      !s.toLowerCase().includes('github') &&
      !/\d{4}/.test(s) // Exclude lines with just years
    );

  // Prioritize sentences with strong keywords
  const priorityKeywords = ['passionate', 'experienced', 'skilled', 'specialized', 'expert', 'professional', 'developer', 'engineer'];
  const prioritized = sentences.sort((a, b) => {
    const scoreA = priorityKeywords.filter(kw => a.toLowerCase().includes(kw)).length;
    const scoreB = priorityKeywords.filter(kw => b.toLowerCase().includes(kw)).length;
    return scoreB - scoreA;
  });

  // Take top 2-3 unique sentences
  const summarySentences = [...new Set(prioritized)].slice(0, 3);
  
  return summarySentences.join('. ') + (summarySentences.length > 0 ? '.' : 'Professional profile extracted from resume.');
}