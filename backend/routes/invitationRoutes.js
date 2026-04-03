const express = require('express');
const router = express.Router();
const {
  sendInvitation,
  getStudentInvitations,
  getGroupInvitations,
  acceptInvitation,
  declineInvitation,
  withdrawInvitation
} = require('../controllers/invitationController');

/**
 * POST /api/invitations
 * Send invitation from group leader to student
 */
router.post('/', sendInvitation);

/**
 * GET /api/invitations/student/:studentId
 * Get all invitations for a student
 */
router.get('/student/:studentId', getStudentInvitations);

/**
 * GET /api/invitations/group/:groupId
 * Get all invitations sent by a group
 */
router.get('/group/:groupId', getGroupInvitations);

/**
 * PUT /api/invitations/:invitationId/accept
 * Accept an invitation
 */
router.put('/:invitationId/accept', acceptInvitation);

/**
 * PUT /api/invitations/:invitationId/decline
 * Decline an invitation
 */
router.put('/:invitationId/decline', declineInvitation);

/**
 * PUT /api/invitations/:invitationId/withdraw
 * Withdraw an invitation (leader only)
 */
router.put('/:invitationId/withdraw', withdrawInvitation);

module.exports = router;
