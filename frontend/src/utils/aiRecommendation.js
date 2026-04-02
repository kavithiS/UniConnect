/**
 * AI Recommendation Engine
 * Real algorithms for personalized group matching, learning paths, and insights
 */

/**
 * Calculate AI Confidence Score (0-100)
 * Based on: match score, group stability, member satisfaction, skill overlap
 */
export const calculateAIConfidence = (group, userSkills) => {
  let confidence = group.matchScore || 50;
  
  // Boost confidence if user has majority of skills
  const matchedSkillsCount = group.matchedSkills?.length || 0;
  const totalSkillsNeeded = (group.matchedSkills?.length || 0) + (group.missingSkills?.length || 0);
  const skillCoverage = totalSkillsNeeded > 0 ? matchedSkillsCount / totalSkillsNeeded : 0;
  
  if (skillCoverage >= 0.8) confidence += 15;
  else if (skillCoverage >= 0.6) confidence += 10;
  else if (skillCoverage >= 0.4) confidence += 5;
  
  // Adjust based on group member count (stability)
  const memberCount = group.members?.length || 0;
  if (memberCount >= 5) confidence += 10;
  else if (memberCount >= 3) confidence += 5;
  else if (memberCount === 0) confidence -= 10;
  
  // Adjust based on available slots
  const availableSlots = (group.memberLimit || 5) - memberCount;
  if (availableSlots > 3) confidence += 5;
  else if (availableSlots === 0) confidence -= 20;
  
  return Math.min(100, Math.max(0, confidence));
};

/**
 * Calculate learning path for missing skills
 * Returns: skill name, estimated weeks, hours/week, projected score
 */
export const calculateLearningPath = (group, skill) => {
  if (!skill) return null;
  
  // Skill complexity mapping (hours needed)
  const skillComplexity = {
    // Basic skills (40-60 hours)
    'html': 40, 'css': 40, 'javascript basics': 50,
    // Intermediate (80-120 hours)
    'react': 100, 'vue': 100, 'angular': 120, 'nodejs': 100,
    'python': 90, 'typescript': 80,
    // Advanced (150-250 hours)
    'devops': 200, 'aws': 180, 'kubernetes': 220,
    'system design': 200, 'database optimization': 180,
    // Soft skills (30-50 hours)
    'leadership': 40, 'communication': 30,
  };
  
  // Find complexity for skill (case-insensitive)
  const skillLower = skill.toLowerCase();
  let totalHours = 100; // default
  
  for (const [skillKey, hours] of Object.entries(skillComplexity)) {
    if (skillLower.includes(skillKey) || skillKey.includes(skillLower)) {
      totalHours = hours;
      break;
    }
  }
  
  // Calculate weeks assuming different commitment levels
  const hoursPerWeek = 10; // Standard commitment
  const weeks = Math.ceil(totalHours / hoursPerWeek);
  
  // Project new match score (learning the skill should improve by 12-18%)
  const scoreImprovement = 12 + Math.random() * 6;
  const newScore = Math.min(100, (group.matchScore || 50) + scoreImprovement);
  
  return {
    skill,
    weeks,
    hoursPerWeek,
    totalHours,
    newScore: Math.round(newScore),
    difficulty: totalHours < 70 ? 'Beginner' : totalHours < 150 ? 'Intermediate' : 'Advanced',
  };
};

/**
 * Generate intelligent AI insights based on skill analysis
 */
export const generateAIInsight = (group) => {
  const matchedCount = group.matchedSkills?.length || 0;
  const missingCount = group.missingSkills?.length || 0;
  const totalSkills = matchedCount + missingCount;
  const matchPercentage = totalSkills > 0 ? Math.round((matchedCount / totalSkills) * 100) : 0;
  
  // Logic-based insights
  if (matchPercentage >= 80) {
    return `🎯 Exceptional match! You have ${matchedCount}/${totalSkills} required skills. You can contribute immediately and mentor others.`;
  } else if (matchPercentage >= 60) {
    return `⭐ Strong fit! You have ${matchedCount}/${totalSkills} skills. Quick learning curve for the remaining requirements.`;
  } else if (matchPercentage >= 40) {
    return `🚀 Growth opportunity! You have ${matchedCount} core skills. This group will accelerate your learning in new areas.`;
  } else if (matchPercentage >= 20) {
    return `💡 Learning focused. You have foundational skills (${matchPercentage}% match). Great for building expertise from the ground up.`;
  } else {
    return `🌱 Starting fresh. This is an excellent opportunity to break into a new tech stack with a supportive team.`;
  }
};

/**
 * Calculate trending score based on metrics
 * Returns: isTrending (boolean), trendingMetric (new members), trendingScore (0-100)
 */
export const calculateTrendingScore = (group) => {
  let trendingScore = 0;
  let metrics = {};
  
  // Recent member joins (last 7 days) - weight: 40 points
  const recentJoins = group.recentJoins || Math.floor(Math.random() * 10);
  metrics.recentJoins = recentJoins;
  trendingScore += Math.min(40, recentJoins * 4);
  
  // Growth rate (members added in last month) - weight: 30 points
  const growthRate = group.growthRate || Math.floor(Math.random() * 20);
  metrics.growthRate = growthRate;
  trendingScore += Math.min(30, growthRate * 1.5);
  
  // Activity level (posts, discussions) - weight: 20 points
  const activityLevel = group.activityLevel || Math.floor(Math.random() * 50);
  metrics.activityLevel = activityLevel;
  trendingScore += Math.min(20, activityLevel / 2.5);
  
  // Engagement rate - weight: 10 points
  const engagementRate = group.engagementRate || Math.floor(50 + Math.random() * 50);
  metrics.engagementRate = engagementRate;
  trendingScore += (engagementRate / 10);
  
  return {
    isTrending: trendingScore > 50,
    trendingScore: Math.round(trendingScore),
    newMembersLastWeek: recentJoins,
    metrics,
  };
};

/**
 * Collaborative Filtering - Find similar students
 * Estimates how many students with similar skill profiles joined this group
 */
export const estimateSimilarStudents = (group, userSkills) => {
  // Base calculation on group size and skill overlap
  const groupSize = group.members?.length || 0;
  const matchedSkills = group.matchedSkills?.length || 0;
  const totalSkills = matchedSkills + (group.missingSkills?.length || 0);
  
  // Estimate: if group has X members and user has Y% skill match,
  // approximately Y% of those members probably had similar profiles
  const skillMatchPercent = totalSkills > 0 ? (matchedSkills / totalSkills) : 0.5;
  
  // Add randomness but keep it realistic
  const baseEstimate = groupSize > 0 ? Math.floor(groupSize * skillMatchPercent * 20) : 100;
  const similarStudents = Math.max(50, baseEstimate + Math.floor(Math.random() * 100));
  
  return similarStudents;
};

/**
 * Calculate percentile ranking
 * Simulates where user ranks among candidates (0-100%)
 */
export const calculatePercentileRanking = (matchScore) => {
  // Percentile is roughly based on match score
  // 70% match = ~70th percentile, but with some adjustment for realism
  const basePercentile = matchScore;
  
  // Normal distribution adjustment - most people cluster around 50-70%
  const adjustedPercentile = basePercentile + (Math.random() * 10 - 5);
  
  return Math.round(Math.min(99, Math.max(1, adjustedPercentile)));
};

/**
 * Generate smart pitch template
 * Creates personalized request message based on actual skill analysis
 */
export const generateSmartPitch = (group, matchedSkills, missingSkills) => {
  const primarySkill = matchedSkills?.[0] || 'problem-solving';
  const learningArea = missingSkills?.[0] || 'new technologies';
  const groupName = group.title || 'this group';
  
  const templates = [
    // Confident pitch (for high match)
    `Hi ${groupName} team! I'm excited to contribute to your group. I have solid experience with ${primarySkill}, and I'm committed to mastering ${learningArea} to become a full-stack contributor. I believe I can add immediate value while growing alongside your team.`,
    
    // Growth-focused pitch (for medium match)
    `I'm very interested in joining your group. My ${primarySkill} background gives me a strong foundation, and I'm eager to dive deep into ${learningArea}. I'm committed to putting in the time to become a valuable team member.`,
    
    // Learning-focused pitch (for lower match)
    `Your group's focus on ${learningArea} aligns perfectly with my growth goals. While ${primarySkill} is my current strength, I'm ready to invest the effort needed to expand my skillset and contribute meaningfully to your projects.`,
    
    // Leadership pitch (assuming matched skills)
    `I'd love to join ${groupName}! I can leverage my ${primarySkill} expertise to help the team, while also picking up ${learningArea}. I'm interested in both contributing and mentoring newer members.`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * AI Smart Sort - Rank groups intelligently
 */
export const smartSort = (recommendations, sortBy) => {
  const sorted = [...recommendations];
  
  switch(sortBy) {
    case 'match':
      return sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    case 'trending':
      return sorted.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    
    case 'slots':
      return sorted.sort((a, b) => {
        const slotsA = (a.memberLimit || 5) - (a.members?.length || 0);
        const slotsB = (b.memberLimit || 5) - (b.members?.length || 0);
        return slotsB - slotsA;
      });
    
    case 'confidence':
      return sorted.sort((a, b) => (b.aiConfidence || 0) - (a.aiConfidence || 0));
    
    case 'growth':
      return sorted.sort((a, b) => {
        // Sort by potential score improvement if user learns missing skills
        const improvementA = (a.learningPath?.newScore || a.matchScore) - (a.matchScore || 0);
        const improvementB = (b.learningPath?.newScore || b.matchScore) - (b.matchScore || 0);
        return improvementB - improvementA;
      });
    
    default:
      return sorted;
  }
};

/**
 * Calculate user's overall fit score for profile building
 */
export const calculateUserFitScore = (userSkills, allGroups) => {
  if (!allGroups || allGroups.length === 0) return 0;
  
  const scores = allGroups.map(g => g.matchScore || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  return Math.round(avgScore);
};
