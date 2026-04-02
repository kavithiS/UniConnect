const JoinRequest = require('../models/JoinRequest');
const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const User = require('../models/User');
const { getDetailedMatchAnalysis } = require('../services/matchingService');

/**
 * UNIFIED REQUESTS API
 * Handles both join requests and invitations with unified interface
 */

/**
 * Send a join request or invitation
 * POST /api/requests
 * Body: { groupId, requestType: 'join' | 'invitation', message?, toUserId? }
 */
exports.sendRequest = async (req, res) => {
  try {
    const { groupId, requestType, message, toUserId } = req.body;
    
    // Get current user from auth (or use provided userId)
    const currentUserId = req.user?.id || req.body.fromUserId;
    
    if (!currentUserId || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Current user ID and groupId are required'
      });
    }

    // Check group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check group is active
    if (group.status === 'closed' || group.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'This group is no longer accepting requests'
      });
    }

    // Check group has available slots
    if (group.members.length >= group.memberLimit) {
      return res.status(400).json({
        success: false,
        message: 'This group has reached its member limit'
      });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (requestType === 'join') {
      // Check if already member
      if (group.members.includes(currentUserId)) {
        return res.status(400).json({
          success: false,
          message: 'You are already a member of this group'
        });
      }

      // Check for existing pending request
      const existingRequest = await JoinRequest.findOne({
        userId: currentUserId,
        groupId,
        status: 'pending'
      });

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request for this group'
        });
      }

      // Calculate skill match
      const matchAnalysis = getDetailedMatchAnalysis(user.skills, group.requiredSkills);

      const newRequest = new JoinRequest({
        userId: currentUserId,
        groupId,
        requestType: 'student-request',
        status: 'pending',
        message: message || '',
        matchScore: matchAnalysis.matchScore,
        matchedSkills: matchAnalysis.matchedSkills,
        missingSkills: matchAnalysis.missingSkills,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      await newRequest.save();

      return res.status(201).json({
        success: true,
        message: 'Join request sent successfully',
        request: await newRequest.populate('userId', 'name email skills')
      });

    } else if (requestType === 'invitation') {
      // Invitation: only group members can invite
      if (!group.members.includes(currentUserId)) {
        return res.status(403).json({
          success: false,
          message: 'Only group members can send invitations'
        });
      }

      if (!toUserId) {
        return res.status(400).json({
          success: false,
          message: 'Target user ID is required for invitations'
        });
      }

      const targetUser = await User.findById(toUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Target user not found' });
      }

      if (group.members.includes(toUserId)) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this group'
        });
      }

      // Check for existing pending invitation
      const existingInvitation = await Invitation.findOne({
        from: currentUserId,
        to: toUserId,
        groupId,
        status: 'pending'
      });

      if (existingInvitation) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending invitation for this user'
        });
      }

      // Calculate skill match
      const matchAnalysis = getDetailedMatchAnalysis(targetUser.skills, group.requiredSkills);

      const newInvitation = new Invitation({
        from: currentUserId,
        to: toUserId,
        groupId,
        requestType: 'leader-invitation',
        status: 'pending',
        matchScore: matchAnalysis.matchScore,
        matchedSkills: matchAnalysis.matchedSkills,
        missingSkills: matchAnalysis.missingSkills,
        message: message || '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      await newInvitation.save();

      // Populate the invitation properly
      const populatedInvitation = await Invitation.findById(newInvitation._id)
        .populate('from', 'name email')
        .populate('to', 'name email');

      return res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        request: populatedInvitation
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid request type. Use "join" or "invitation"'
    });

  } catch (error) {
    console.error('Error in sendRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending request',
      error: error.message
    });
  }
};

/**
 * Get received requests (group creator receives join requests)
 * GET /api/requests/received?status=pending
 */
exports.getReceivedRequests = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.query.userId;
    const { status } = req.query;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find all groups created by this user
    const userGroups = await Group.find({ createdBy: currentUserId });
    const groupIds = userGroups.map(g => g._id);

    let query = { groupId: { $in: groupIds }, requestType: 'student-request' };
    if (status) {
      query.status = status;
    }

    const requests = await JoinRequest.find(query)
      .populate('userId', 'name email skills avatar')
      .populate('groupId', 'title groupCode members memberLimit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map(r => ({
        _id: r._id,
        from: r.userId,
        to: currentUserId,
        groupId: r.groupId,
        requestType: 'join',
        status: r.status,
        skillMatchScore: r.matchScore,
        message: '',
        createdAt: r.createdAt,
        respondedAt: r.respondedAt
      }))
    });

  } catch (error) {
    console.error('Error in getReceivedRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching received requests',
      error: error.message
    });
  }
};

/**
 * Get sent requests (user who sent the join request)
 * GET /api/requests/sent?status=pending
 */
exports.getSentRequests = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.query.userId;
    const { status } = req.query;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let query = { userId: currentUserId, requestType: 'student-request' };
    if (status) {
      query.status = status;
    }

    const requests = await JoinRequest.find(query)
      .populate('userId', 'name email skills')
      .populate('groupId', 'title groupCode createdBy')
      .sort({ createdAt: -1 });

    // Also get invitations sent by this user
    const invitations = await Invitation.find({ from: currentUserId })
      .populate('to', 'name email')
      .populate('groupId', 'title groupCode')
      .sort({ createdAt: -1 });

    const combined = [
      ...requests.map(r => ({
        _id: r._id,
        from: currentUserId,
        to: r.groupId.createdBy,
        groupId: r.groupId,
        requestType: 'join',
        status: r.status,
        skillMatchScore: r.matchScore,
        message: r.message || '',
        createdAt: r.createdAt,
        respondedAt: r.respondedAt
      })),
      ...invitations.map(i => ({
        _id: i._id,
        from: currentUserId,
        to: i.to,
        groupId: i.groupId,
        requestType: 'invitation',
        status: i.status,
        skillMatchScore: i.skillMatchScore,
        message: i.message,
        createdAt: i.createdAt,
        respondedAt: i.respondedAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: combined.length,
      requests: combined
    });

  } catch (error) {
    console.error('Error in getSentRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sent requests',
      error: error.message
    });
  }
};

/**
 * Accept a join request
 * PUT /api/requests/:id/accept
 */
exports.acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const request = await JoinRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const group = await Group.findById(request.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Verify current user is group creator (to user)
    if (currentUserId && group.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You can only accept requests for your groups' });
    }

    if (group.members.length >= group.memberLimit) {
      return res.status(400).json({ success: false, message: 'Group member limit reached' });
    }

    // Add user to group
    group.members.push(request.userId);
    await group.save();

    // Update request status
    request.status = 'accepted';
    request.respondedAt = new Date();
    await request.save();

    // Auto-close other pending requests from same user to same group
    await JoinRequest.updateMany(
      {
        userId: request.userId,
        groupId: request.groupId,
        status: 'pending',
        _id: { $ne: id }
      },
      { status: 'withdrawn', respondedAt: new Date() }
    );

    // If group now full, reject all other pending requests
    if (group.members.length >= group.memberLimit) {
      await JoinRequest.updateMany(
        { groupId: request.groupId, status: 'pending' },
        { status: 'rejected', respondedAt: new Date() }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      request
    });

  } catch (error) {
    console.error('Error in acceptRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting request',
      error: error.message
    });
  }
};

/**
 * Reject a join request
 * PUT /api/requests/:id/reject
 */
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await JoinRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a ${request.status} request`
      });
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      request
    });

  } catch (error) {
    console.error('Error in rejectRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting request',
      error: error.message
    });
  }
};

/**
 * Cancel a request (sender only)
 * DELETE /api/requests/:id
 */
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || req.body.userId;

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required to cancel a request'
      });
    }

    let request = await JoinRequest.findById(id);
    
    if (request) {
      // Verify current user is the sender
      if (!request.userId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: user ID missing'
        });
      }

      if (request.userId.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel your own requests'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel a ${request.status} request`
        });
      }

      request.status = 'withdrawn';
      request.respondedAt = new Date();
      await request.save();

      return res.status(200).json({
        success: true,
        message: 'Request cancelled successfully',
        request
      });
    }

    // Try to find it as an invitation
    const invitation = await Invitation.findById(id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify current user is the sender
    if (!invitation.from) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation: sender ID missing'
      });
    }

    if (invitation.from.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${invitation.status} request`
      });
    }

    invitation.status = 'withdrawn';
    invitation.respondedAt = new Date();
    await invitation.save();

    return res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully',
      request: invitation
    });

  } catch (error) {
    console.error('Error in cancelRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message
    });
  }
};
