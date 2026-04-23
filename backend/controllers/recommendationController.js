const Group = require('../models/Group');
const User = require('../models/User');
const Student = require('../models/Student');
const mongoose = require('mongoose');
const {
  getDetailedMatchAnalysis,
  filterByThreshold,
  rankRecommendations
} = require('../services/matchingService');

/**
 * Get recommended groups for a user based on skill match
 * GET /recommend/groups/:userId?minScore=40
 */
exports.getRecommendedGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const { minScore = 40 } = req.query; // Default minimum score 40%

    // Check if user profile exists (supports both User and Student collections)
    let user = null;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
      if (!user) {
        student = await Student.findById(userId);
      }
    }

    if (!user) {
      user = await User.findOne({ userId });
    }

    if (!student) {
      student = await Student.findOne({ userId });
    }

    const profileSkills = Array.isArray(user?.skills)
      ? user.skills
      : Array.isArray(student?.skills)
        ? student.skills
        : [];

    if (!user && !student) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all active groups
    const groups = await Group.find({ status: 'active' })
      .populate('members', 'name skills');

    // Calculate detailed match analysis for each group
    const recommendedGroups = groups
      .map(group => {
        const matchAnalysis = getDetailedMatchAnalysis(profileSkills, group.requiredSkills);
        return {
          _id: group._id,
          title: group.title,
          description: group.description,
          requiredSkills: group.requiredSkills,
          members: group.members,
          memberLimit: group.memberLimit,
          status: group.status,
          matchScore: matchAnalysis.matchScore,
          matchTier: matchAnalysis.matchTier,
          matchedSkills: matchAnalysis.matchedSkills,
          missingSkills: matchAnalysis.missingSkills,
          skillGapCount: matchAnalysis.skillGapCount,
          analysis: matchAnalysis.analysis,
          recommendation: matchAnalysis.recommendation,
          availableSlots: group.memberLimit - group.members.length
        };
      });

    // Filter by minimum score threshold
    const filteredRecommendations = filterByThreshold(recommendedGroups, parseInt(minScore));

    // Rank by match score (highest first)
    const rankedRecommendations = rankRecommendations(filteredRecommendations);

    res.status(200).json({
      success: true,
      count: rankedRecommendations.length,
      minScoreFilter: `${minScore}%`,
      data: rankedRecommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended groups',
      error: error.message
    });
  }
};

/**
 * Get recommended users for a group based on skill match
 * GET /recommend/users/:groupId?minScore=40
 */
exports.getRecommendedUsers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { minScore = 40 } = req.query; // Default minimum score 40%

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Get all users
    const users = await User.find();

    // Calculate detailed match analysis for each user
    const memberIdSet = new Set((group.members || []).map((memberId) => memberId?.toString()));

    const recommendedUsers = users
      .filter(user => !memberIdSet.has(user._id.toString())) // Exclude current members
      .map(user => {
        const matchAnalysis = getDetailedMatchAnalysis(user.skills, group.requiredSkills);
        return {
          _id: user._id,
          name: user.name,
          skills: user.skills,
          matchScore: matchAnalysis.matchScore,
          matchTier: matchAnalysis.matchTier,
          matchedSkills: matchAnalysis.matchedSkills,
          missingSkills: matchAnalysis.missingSkills,
          skillGapCount: matchAnalysis.skillGapCount,
          analysis: matchAnalysis.analysis,
          recommendation: matchAnalysis.recommendation
        };
      });

    // Filter by minimum score threshold
    const filteredRecommendations = filterByThreshold(recommendedUsers, parseInt(minScore));

    // Rank by match score (highest first)
    const rankedRecommendations = rankRecommendations(filteredRecommendations);

    res.status(200).json({
      success: true,
      count: rankedRecommendations.length,
      minScoreFilter: `${minScore}%`,
      data: rankedRecommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recommended users',
      error: error.message
    });
  }
};
