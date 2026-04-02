/**
 * Matching Service - Advanced Skill-Based Matching System
 * Contains intelligent matching logic with skill gap analysis
 */

/**
 * Calculate match score between user skills and required skills
 * Score = (matchedSkills / requiredSkills.length) * 100
 * 
 * @param {Array<string>} userSkills - Array of user skills
 * @param {Array<string>} requiredSkills - Array of required skills
 * @returns {number} Match score (0-100)
 */
const calculateMatchScore = (userSkills, requiredSkills) => {
  // Handle edge cases
  if (!requiredSkills || requiredSkills.length === 0) {
    return 100; // Perfect match if no skills required
  }

  if (!userSkills || userSkills.length === 0) {
    return 0; // No match if user has no skills
  }

  // Normalize skills to lowercase for case-insensitive comparison
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map(skill => skill.toLowerCase());

  // Count matched skills
  let matchedCount = 0;
  normalizedRequiredSkills.forEach(requiredSkill => {
    if (normalizedUserSkills.includes(requiredSkill)) {
      matchedCount++;
    }
  });

  // Calculate percentage
  const matchScore = (matchedCount / normalizedRequiredSkills.length) * 100;
  return Math.round(matchScore * 100) / 100; // Round to 2 decimal places
};

/**
 * Get detailed skill matching analysis
 * Returns matched skills, missing skills, and match score
 * 
 * @param {Array<string>} userSkills - Array of user skills
 * @param {Array<string>} requiredSkills - Array of required skills
 * @returns {Object} Detailed matching analysis
 */
const getDetailedMatchAnalysis = (userSkills, requiredSkills) => {
  // Handle edge cases
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchScore: 100,
      matchedSkills: userSkills || [],
      missingSkills: [],
      matchPercentage: '100%',
      matchTier: 'Excellent',
      skillGapCount: 0,
      analysis: 'Perfect match - no required skills specified'
    };
  }

  if (!userSkills || userSkills.length === 0) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: requiredSkills,
      matchPercentage: '0%',
      matchTier: 'Poor',
      skillGapCount: requiredSkills.length,
      analysis: `Student is missing all ${requiredSkills.length} required skills`
    };
  }

  // Normalize for case-insensitive comparison
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map(skill => skill.toLowerCase());

  // Find matched and missing skills
  const matchedSkills = [];
  const missingSkills = [];

  normalizedRequiredSkills.forEach((requiredSkill, index) => {
    if (normalizedUserSkills.includes(requiredSkill)) {
      matchedSkills.push(requiredSkills[index]); // Use original case
    } else {
      missingSkills.push(requiredSkills[index]);
    }
  });

  // Calculate score
  const matchScore = (matchedSkills.length / normalizedRequiredSkills.length) * 100;
  const roundedScore = Math.round(matchScore * 100) / 100;

  // Determine match tier
  let matchTier = 'Poor';
  if (roundedScore >= 80) {
    matchTier = 'Excellent';
  } else if (roundedScore >= 60) {
    matchTier = 'Good';
  } else if (roundedScore >= 40) {
    matchTier = 'Fair';
  }

  // Generate analysis message
  const analysis = generateMatchAnalysis(matchedSkills.length, missingSkills.length, normalizedRequiredSkills.length);

  return {
    matchScore: roundedScore,
    matchedSkills,
    missingSkills,
    matchPercentage: `${roundedScore}%`,
    matchTier,
    skillGapCount: missingSkills.length,
    totalRequiredSkills: normalizedRequiredSkills.length,
    analysis,
    recommendation: getRecommendation(roundedScore, missingSkills.length)
  };
};

/**
 * Generate human-readable match analysis
 */
const generateMatchAnalysis = (matched, missing, total) => {
  if (missing === 0) {
    return `Perfect! Student has all ${total} required skills.`;
  }
  if (matched === 0) {
    return `Student is missing all ${total} required skills.`;
  }
  return `Student has ${matched} out of ${total} required skills. Missing: ${missing} skill${missing > 1 ? 's' : ''}.`;
};

/**
 * Get recommendation based on match score and skill gap
 */
const getRecommendation = (score, gapCount) => {
  if (score >= 80) {
    return 'Highly recommended - Student is well-qualified';
  }
  if (score >= 60) {
    return 'Recommended - Student has most required skills, can learn missing ones';
  }
  if (score >= 40) {
    return 'Possible - Student has foundational skills but needs training';
  }
  if (gapCount <= 2) {
    return 'Consider - Student is missing few skills, could be mentored';
  }
  return 'Not recommended - Too many skill gaps';
};

/**
 * Filter recommendations by minimum threshold
 * 
 * @param {Array<Object>} recommendations - Array of recommendations with scores
 * @param {number} minScore - Minimum score threshold (0-100)
 * @returns {Array<Object>} Filtered recommendations
 */
const filterByThreshold = (recommendations, minScore = 40) => {
  if (!Array.isArray(recommendations)) {
    return [];
  }

  return recommendations.filter(item => {
    const score = item.matchScore || 0;
    return score >= minScore;
  });
};

/**
 * Rank recommendations by match score
 * 
 * @param {Array<Object>} recommendations - Array of recommendations
 * @returns {Array<Object>} Sorted recommendations (highest score first)
 */
const rankRecommendations = (recommendations) => {
  if (!Array.isArray(recommendations)) {
    return [];
  }

  return [...recommendations].sort((a, b) => {
    const scoreA = a.matchScore || 0;
    const scoreB = b.matchScore || 0;
    return scoreB - scoreA;
  });
};

module.exports = {
  calculateMatchScore,
  getDetailedMatchAnalysis,
  filterByThreshold,
  rankRecommendations
};
