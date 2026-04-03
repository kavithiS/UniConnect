/**
 * Request Management Utilities
 * Handles group capacity checks, expiration, and auto-closure logic
 */

const JoinRequest = require('../models/JoinRequest');
const Group = require('../models/Group');

/**
 * Check if a group has available slots
 * @param {string} groupId - Group ID
 * @returns {Promise<boolean>} - True if group has available slots
 */
const hasAvailableSlots = async (groupId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) return false;
    return group.members.length < group.memberLimit;
  } catch (error) {
    console.error('Error checking available slots:', error);
    return false;
  }
};

/**
 * Get available slots count
 * @param {string} groupId - Group ID
 * @returns {Promise<number>} - Number of available slots
 */
const getAvailableSlots = async (groupId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) return 0;
    return Math.max(0, group.memberLimit - group.members.length);
  } catch (error) {
    console.error('Error getting available slots:', error);
    return 0;
  }
};

/**
 * Check if student is already a member of group
 * @param {string} userId - User ID
 * @param {string} groupId - Group ID
 * @returns {Promise<boolean>} - True if student is already a member
 */
const isAlreadyMember = async (userId, groupId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) return false;
    return group.members.includes(userId);
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
};

/**
 * Auto-close pending requests for a group when it becomes full
 * Marks all pending requests for the group as 'expired'
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} - Result with count of closed requests
 */
const autoClosePendingRequestsForGroup = async (groupId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return { success: false, message: 'Group not found', closedCount: 0 };
    }

    // Check if group is now full
    if (group.members.length < group.memberLimit) {
      return { success: true, message: 'Group still has available slots', closedCount: 0 };
    }

    // Get all pending requests for this group
    const pendingRequests = await JoinRequest.find({
      groupId,
      status: 'pending'
    });

    // Update all pending requests to 'expired'
    const updateResult = await JoinRequest.updateMany(
      { groupId, status: 'pending' },
      {
        status: 'expired',
        respondedAt: new Date(),
        responseMessage: 'Group is now full. Request automatically closed.'
      }
    );

    return {
      success: true,
      message: `Automatically closed ${updateResult.modifiedCount} pending request(s)`,
      closedCount: updateResult.modifiedCount
    };
  } catch (error) {
    console.error('Error auto-closing requests:', error);
    return { success: false, message: error.message, closedCount: 0 };
  }
};

/**
 * Mark expired requests as 'expired' status
 * Checks all pending and accepted requests and marks those past expiresAt
 * @returns {Promise<Object>} - Result with count of expired requests
 */
const expireOldRequests = async () => {
  try {
    const now = new Date();

    // Find all pending/accepted requests that have expired
    const expiredRequests = await JoinRequest.find({
      status: { $in: ['pending', 'accepted'] },
      expiresAt: { $lt: now }
    });

    if (expiredRequests.length === 0) {
      return { success: true, message: 'No requests to expire', expiredCount: 0 };
    }

    // Update all expired requests
    const updateResult = await JoinRequest.updateMany(
      {
        status: { $in: ['pending', 'accepted'] },
        expiresAt: { $lt: now }
      },
      {
        status: 'expired',
        respondedAt: now,
        responseMessage: 'Request expired after 30 days without response'
      }
    );

    return {
      success: true,
      message: `Marked ${updateResult.modifiedCount} request(s) as expired`,
      expiredCount: updateResult.modifiedCount
    };
  } catch (error) {
    console.error('Error expiring requests:', error);
    return { success: false, message: error.message, expiredCount: 0 };
  }
};

/**
 * Get request status including whether group is now full
 * Used to show users why their request failed
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} - Group status info
 */
const getGroupCapacityStatus = async (groupId) => {
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return {
        groupExists: false,
        isFull: true,
        currentMembers: 0,
        totalSlots: 0,
        availableSlots: 0
      };
    }

    const isFull = group.members.length >= group.memberLimit;
    const availableSlots = Math.max(0, group.memberLimit - group.members.length);

    return {
      groupExists: true,
      isFull,
      currentMembers: group.members.length,
      totalSlots: group.memberLimit,
      availableSlots,
      message: isFull
        ? `Group is full (${group.members.length}/${group.memberLimit} members)`
        : `${availableSlots} slot${availableSlots !== 1 ? 's' : ''} available`
    };
  } catch (error) {
    console.error('Error getting group capacity:', error);
    return {
      groupExists: false,
      isFull: true,
      currentMembers: 0,
      totalSlots: 0,
      availableSlots: 0,
      error: error.message
    };
  }
};

/**
 * Clean up old rejected/withdrawn requests (optional data hygiene)
 * Deletes requests older than 90 days that are rejected or withdrawn
 * @returns {Promise<Object>} - Result with count of deleted requests
 */
const cleanupOldRequests = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleteResult = await JoinRequest.deleteMany({
      status: { $in: ['rejected', 'withdrawn'] },
      respondedAt: { $lt: cutoffDate }
    });

    return {
      success: true,
      message: `Deleted ${deleteResult.deletedCount} old request(s)`,
      deletedCount: deleteResult.deletedCount
    };
  } catch (error) {
    console.error('Error cleaning up requests:', error);
    return { success: false, message: error.message, deletedCount: 0 };
  }
};

module.exports = {
  hasAvailableSlots,
  getAvailableSlots,
  isAlreadyMember,
  autoClosePendingRequestsForGroup,
  expireOldRequests,
  getGroupCapacityStatus,
  cleanupOldRequests
};
