const JoinRequest = require('../models/JoinRequest');
const Group = require('../models/Group');
const User = require('../models/User');
const { getDetailedMatchAnalysis } = require('../services/matchingService');
const {
  hasAvailableSlots,
  isAlreadyMember,
  getGroupCapacityStatus,
  autoClosePendingRequestsForGroup
} = require('../utils/requestUtils');

/**
 * Send a join request
 * POST /requests
 */
exports.sendJoinRequest = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    // Validation
    if (!userId || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'userId and groupId are required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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

    // ❌ NEW: Check if student is already a member of this group
    const alreadyMember = await isAlreadyMember(userId, groupId);
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // ❌ NEW: Check if group has available slots
    const groupHasSlots = await hasAvailableSlots(groupId);
    if (!groupHasSlots) {
      const capacityStatus = await getGroupCapacityStatus(groupId);
      return res.status(400).json({
        success: false,
        message: 'Cannot send request: Group is full',
        groupStatus: capacityStatus
      });
    }

    // Prevent duplicate requests (pending or accepted) - same request type
    const existingRequest = await JoinRequest.findOne({
      userId,
      groupId,
      requestType: 'student-request',
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'User already has a pending or accepted request for this group'
      });
    }

    // Calculate match analysis
    const matchAnalysis = getDetailedMatchAnalysis(user.skills, group.requiredSkills);

    // Create join request with match data
    const newRequest = new JoinRequest({
      userId,
      groupId,
      requestType: 'student-request',
      status: 'pending',
      matchScore: matchAnalysis.matchScore,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      data: {
        ...newRequest.toObject(),
        matchAnalysis: {
          matchTier: matchAnalysis.matchTier,
          skillGapCount: matchAnalysis.skillGapCount,
          analysis: matchAnalysis.analysis,
          recommendation: matchAnalysis.recommendation
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending join request',
      error: error.message
    });
  }
};

/**
 * Get all join requests
 * GET /requests
 */
exports.getAllJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find()
      .populate('userId', 'name skills')
      .populate('groupId', 'title description');

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching join requests',
      error: error.message
    });
  }
};

/**
 * Accept or reject join request
 * PUT /requests/:id
 */
exports.updateJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    if (!['accepted', 'rejected', 'expired', 'withdrawn'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: accepted, rejected, expired, withdrawn'
      });
    }

    // Find request
    const request = await JoinRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    // If accepting, check group member limit
    if (status === 'accepted') {
      const group = await Group.findById(request.groupId);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }

      // Check if member limit is reached
      if (group.members.length >= group.memberLimit) {
        return res.status(400).json({
          success: false,
          message: 'Group member limit reached'
        });
      }

      // Add user to group
      group.members.push(request.userId);
      await group.save();

      // ❌ NEW: Auto-close all pending requests if group is now full
      const autoCloseResult = await autoClosePendingRequestsForGroup(request.groupId);
      if (autoCloseResult.closedCount > 0) {
        console.log(`Auto-closed ${autoCloseResult.closedCount} pending request(s) for group ${request.groupId}`);
      }
    }

    // Update request status and track response
    request.status = status;
    request.respondedAt = new Date();
    if (responseMessage) {
      request.responseMessage = responseMessage;
    }
    await request.save();

    // Include auto-close info in response if applicable
    const responseData = {
      success: true,
      message: `Join request ${status} successfully`,
      data: request
    };

    // Add information about auto-closed requests
    if (status === 'accepted') {
      const autoCloseResult = await autoClosePendingRequestsForGroup(request.groupId);
      if (autoCloseResult.closedCount > 0) {
        responseData.autoClosedRequests = autoCloseResult.closedCount;
        responseData.note = `${autoCloseResult.closedCount} pending request(s) were automatically closed because the group is now full`;
      }
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating join request',
      error: error.message
    });
  }
};

/**
 * Cancel join request
 * DELETE /requests/:id
 */
exports.cancelJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await JoinRequest.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Join request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Join request cancelled successfully',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling join request',
      error: error.message
    });
  }
};

/**
 * Get all join requests by a student
 * GET /requests/student/:userId
 */
exports.getStudentRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const requests = await JoinRequest.find({
      userId,
      requestType: 'student-request'
    })
      .populate('groupId', 'title description requiredSkills members memberLimit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student requests',
      error: error.message
    });
  }
};

/**
 * Get all join requests for a group
 * GET /requests/group/:groupId
 */
exports.getGroupRequests = async (req, res) => {
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

    const requests = await JoinRequest.find({
      groupId,
      requestType: 'student-request'
    })
      .populate('userId', 'name skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group requests',
      error: error.message
    });
  }
};

/**
 * Check and update expired requests
 * PUT /requests/check-expiration
 */
exports.checkExpiredRequests = async (req, res) => {
  try {
    const now = new Date();

    // Find all pending requests that have expired
    const expiredRequests = await JoinRequest.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: now }
      },
      {
        status: 'expired',
        respondedAt: now,
        responseMessage: 'Request expired after 30 days'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Checked and updated expired requests',
      data: {
        updatedCount: expiredRequests.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking expired requests',
      error: error.message
    });
  }
};

/**
 * Close requests when group reaches member limit
 * PUT /requests/close-for-group/:groupId
 */
exports.closeRequestsForGroup = async (req, res) => {
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

    // If group is at member limit, close all pending requests
    if (group.members.length >= group.memberLimit) {
      const closedRequests = await JoinRequest.updateMany(
        {
          groupId,
          status: 'pending'
        },
        {
          status: 'expired',
          respondedAt: new Date(),
          responseMessage: 'Group reached member limit'
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Closed pending requests due to member limit',
        data: {
          closedCount: closedRequests.modifiedCount
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Group has not reached member limit',
      data: {
        closedCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing requests',
      error: error.message
    });
  }
};

/**
 * Get group capacity status
 * GET /requests/group-status/:groupId
 * Returns capacity info: is full, available slots, current members, etc.
 */
exports.getGroupCapacityInfo = async (req, res) => {
  try {
    const { groupId } = req.params;

    const capacityStatus = await getGroupCapacityStatus(groupId);

    if (!capacityStatus.groupExists) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
        data: capacityStatus
      });
    }

    res.status(200).json({
      success: true,
      data: capacityStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting group capacity',
      error: error.message
    });
  }
};
