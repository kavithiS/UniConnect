const User = require('../models/User');

const SKILL_MAP = {
  frontend: {
    teammateSkills: ['Backend', 'Database', 'API Design'],
    resources: ['Node.js Basics', 'REST API Design', 'MongoDB Fundamentals'],
  },
  backend: {
    teammateSkills: ['Frontend', 'UI/UX', 'Testing'],
    resources: ['React Fundamentals', 'User Experience Basics', 'Integration Testing'],
  },
  database: {
    teammateSkills: ['Backend', 'Data Modeling', 'Security'],
    resources: ['MongoDB Aggregation', 'Schema Design', 'Database Security'],
  },
  testing: {
    teammateSkills: ['QA', 'Automation', 'Debugging'],
    resources: ['Testing Fundamentals', 'API Testing', 'Debugging Techniques'],
  },
};

exports.getMySuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userSkillsLower = (user.skills || []).map((s) => String(s).toLowerCase());

    const teammateSkillSet = new Set();
    const resourceSet = new Set();

    userSkillsLower.forEach((skill) => {
      if (SKILL_MAP[skill]) {
        SKILL_MAP[skill].teammateSkills.forEach((x) => teammateSkillSet.add(x));
        SKILL_MAP[skill].resources.forEach((x) => resourceSet.add(x));
      }
    });

    if (!userSkillsLower.includes('testing')) {
      teammateSkillSet.add('Testing');
      resourceSet.add('Software Testing Basics');
    }

    if (userSkillsLower.includes('frontend')) {
      teammateSkillSet.add('Backend');
      teammateSkillSet.add('Database');
    }

    const recommendations = [
      `Based on your skills (${(user.skills || []).join(', ') || 'none'}), consider collaborating with teammates strong in ${Array.from(teammateSkillSet).slice(0, 2).join(' and ') || 'Backend and Testing'}.`,
      'Try building one mini project this week with one unfamiliar skill.',
      'Request peer feedback after each milestone to improve collaboration quality.',
    ];

    res.status(200).json({
      success: true,
      suggestions: {
        suggestedTeammateSkills: Array.from(teammateSkillSet),
        suggestedResources: Array.from(resourceSet),
        personalizedRecommendations: recommendations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating suggestions',
      error: error.message,
    });
  }
};
