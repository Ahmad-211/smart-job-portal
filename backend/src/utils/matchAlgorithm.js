/**
 * Calculate match score between resume skills and job requirements
 * @param {Array} resumeSkills - Skills extracted from resume
 * @param {Array} jobSkills - Skills required for the job
 * @returns {Object} Match score and details
 */
function calculateMatchScore(resumeSkills, jobSkills) {
  if (!resumeSkills || !jobSkills || jobSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: jobSkills || [],
      matchPercentage: 0
    };
  }

  // Convert to lowercase for case-insensitive matching
  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

  // Find matched skills
  const matchedSkills = jobSkillsLower.filter(skill => 
    resumeSkillsLower.some(resumeSkill => 
      isSkillMatch(resumeSkill, skill)
    )
  );

  // Find missing skills
  const missingSkills = jobSkillsLower.filter(skill => 
    !resumeSkillsLower.some(resumeSkill => 
      isSkillMatch(resumeSkill, skill)
    )
  );

  // Calculate match score (0-100)
  const matchPercentage = Math.round((matchedSkills.length / jobSkillsLower.length) * 100);
  
  // Bonus points for having extra relevant skills
  const extraSkills = resumeSkillsLower.filter(skill => 
    !jobSkillsLower.includes(skill) && isRelevantSkill(skill)
  );
  
  const bonusPoints = Math.min(extraSkills.length * 2, 10); // Max 10 bonus points
  const finalScore = Math.min(matchPercentage + bonusPoints, 100);

  return {
    score: finalScore,
    matchedSkills: matchedSkills.map(s => capitalizeFirstLetter(s)),
    missingSkills: missingSkills.map(s => capitalizeFirstLetter(s)),
    matchPercentage: matchPercentage,
    bonusPoints: bonusPoints,
    extraSkills: extraSkills.map(s => capitalizeFirstLetter(s))
  };
}

/**
 * Check if two skills match (handles variations)
 * @param {String} skill1
 * @param {String} skill2
 * @returns {Boolean}
 */
function isSkillMatch(skill1, skill2) {
  // Exact match
  if (skill1 === skill2) return true;

  // Fuzzy matching for common variations
  const variations = {
    'javascript': ['js', 'javascript', 'ecmascript'],
    'node.js': ['node', 'nodejs', 'node.js'],
    'react': ['react', 'reactjs', 'react.js'],
    'python': ['python', 'python3', 'py'],
    'mongodb': ['mongo', 'mongodb', 'mongo db'],
    'typescript': ['ts', 'typescript'],
    'angular': ['angular', 'angularjs', 'angular.js'],
    'vue': ['vue', 'vuejs', 'vue.js'],
    'express': ['express', 'express.js'],
    'next.js': ['next', 'nextjs', 'next.js'],
    'firebase': ['firebase', 'google firebase']
  };

  const key1 = Object.keys(variations).find(key => variations[key].includes(skill1));
  const key2 = Object.keys(variations).find(key => variations[key].includes(skill2));

  return key1 === key2;
}

/**
 * Check if a skill is relevant (not too generic)
 * @param {String} skill
 * @returns {Boolean}
 */
function isRelevantSkill(skill) {
  const genericSkills = [
    'computer', 'software', 'programming', 'coding', 
    'development', 'technology', 'it', 'tech'
  ];
  return !genericSkills.includes(skill.toLowerCase());
}

/**
 * Capitalize first letter of each word
 * @param {String} str
 * @returns {String}
 */
function capitalizeFirstLetter(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Rank applicants by match score
 * @param {Array} applications
 * @returns {Array} Sorted applications
 */
function rankApplicants(applications) {
  return applications.sort((a, b) => {
    // Primary: match score (descending)
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    
    // Secondary: application date (newest first)
    return new Date(b.appliedAt) - new Date(a.appliedAt);
  });
}

/**
 * Get skill gap analysis
 * @param {Array} resumeSkills
 * @param {Array} jobSkills
 * @returns {Object}
 */
function getSkillGapAnalysis(resumeSkills, jobSkills) {
  const matchResult = calculateMatchScore(resumeSkills, jobSkills);
  
  return {
    currentMatch: matchResult.score,
    skillsToLearn: matchResult.missingSkills,
    strengths: matchResult.matchedSkills,
    improvementNeeded: 100 - matchResult.score,
    recommendation: getRecommendation(matchResult.score)
  };
}

/**
 * Get recommendation based on match score
 * @param {Number} score
 * @returns {String}
 */
function getRecommendation(score) {
  if (score >= 80) return "Excellent match! Highly recommended to apply.";
  if (score >= 60) return "Good match. You have most required skills.";
  if (score >= 40) return "Fair match. Consider learning missing skills.";
  return "Low match. This job may not be the best fit for your current skill set.";
}

module.exports = {
  calculateMatchScore,
  rankApplicants,
  getSkillGapAnalysis,
  getRecommendation
};