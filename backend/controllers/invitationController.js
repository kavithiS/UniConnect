const Invitation = require('../models/JoinRequest');
const Group = require('../models/Group');
const User = require('../models/User');
const { getDetailedMatchAnalysis } = require('../services/matchingService');
const {
  hasAvailableSlots,
  getGroupCapacityStatus,
  autoClosePendingRequestsForGroup
} = require('../utils/requestUtils');

/**
 * Send Invitation from Group Leader to Student
 * POST /api/invitations
 */
exports.sendInvitation = async (req, res) => {
  try {
    const { studentId, groupId, message } = req.body;

    // Validation
    if (!studentId || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Group ID are required'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if student is already in group
    if (group.members.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student is already a member of this group'
      });
    }

    // ❌ NEW: Check if group has available slots
    const groupHasSlots = await hasAvailableSlots(groupId);
    if (!groupHasSlots) {
      const capacityStatus = await getGroupCapacityStatus(groupId);
      return res.status(400).json({
        success: false,
        message: 'Cannot send invitation: Group is full',
        groupStatus: capacityStatus
      });
    }

    // Prevent duplicate invitations (pending or accepted)
    const existingInvitation = await Invitation.findOne({
      userId: studentId,
      groupId,
      requestType: 'leader-invitation',
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'An active invitation already exists for this student'
      });
    }

    // Calculate match analysis
    const matchAnalysis = getDetailedMatchAnalysis(student.skills, group.requiredSkills);

    // Create invitation
    const invitation = new Invitation({
      userId: studentId,
      groupId,
      requestType: 'leader-invitation',
      status: 'pending',
      matchScore: matchAnalysis.matchScore,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      responseMessage: message || ''
    });

    await invitation.save();

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: invitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending invitation',
      error: error.message
    });
  }
};

/**
 * Get All Active Invitations for a Student
 * GET /api/invitations/student/:studentId
 */
exports.getStudentInvitations = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all invitations for student
    const invitations = await Invitation.find({
      userId: studentId,
      requestType: 'leader-invitation'
    })
      .populate('groupId', 'title description requiredSkills members memberLimit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invitations',
      error: error.message
    });
  }
};

/**
 * Get All Invitations Sent by a Group
 * GET /api/invitations/group/:groupId
 */
exports.getGroupInvitations = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Get all invitations sent by group
    const invitations = await Invitation.find({
      groupId,
      requestType: 'leader-invitation'
    })
      .populate('userId', 'name skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invitations',
      error: error.message
    });
  }
};

/**
 * Accept Invitation
 * PUT /api/invitations/:invitationId/accept
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Find invitation
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if already responded
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept invitation with status: ${invitation.status}`
      });
    }

    // Get group
    const group = await Group.findById(invitation.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check member limit
    if (group.members.length >= group.memberLimit) {
      invitation.status = 'expired';
      invitation.respondedAt = new Date();
      invitation.responseMessage = 'Group member limit reached';
      await invitation.save();

      return res.status(400).json({
        success: false,
        message: 'Group has reached member limit'
      });
    }

    // Add user to group members
    group.members.push(invitation.userId);
    await group.save();

    // Update invitation
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: invitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting invitation',
      error: error.message
    });
  }
};

/**
 * Decline Invitation
 * PUT /api/invitations/:invitationId/decline
 */
exports.declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { reason } = req.body;

    // Find invitation
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if already responded
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot decline invitation with status: ${invitation.status}`
      });
    }

    // Update invitation
    invitation.status = 'rejected';
    invitation.respondedAt = new Date();
    invitation.responseMessage = reason || 'Student declined invitation';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation declined successfully',
      data: invitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error declining invitation',
      error: error.message
    });
  }
};

/**
 * Withdraw Invitation (Group Leader can withdraw)
 * PUT /api/invitations/:invitationId/withdraw
 */
exports.withdrawInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Find invitation
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw invitation with status: ${invitation.status}`
      });
    }

    // Update invitation
    invitation.status = 'withdrawn';
    invitation.respondedAt = new Date();
    invitation.responseMessage = 'Group leader withdrew invitation';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation withdrawn successfully',
      data: invitation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing invitation',
      error: error.message
    });
  }
};
