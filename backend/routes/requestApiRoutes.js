const express = require('express');
const router = express.Router();
const requestApiController = require('../controllers/requestApiController');

/**
 * UNIFIED REQUESTS API ROUTES
 * For both join requests and invitations with unified interface
 */

// Send request or invitation
router.post('/', requestApiController.sendRequest);

// Get received requests (for group creators)
router.get('/received', requestApiController.getReceivedRequests);

// Get sent requests (for users who sent requests)
router.get('/sent', requestApiController.getSentRequests);

// Accept request
router.put('/:id/accept', requestApiController.acceptRequest);

// Reject request
router.put('/:id/reject', requestApiController.rejectRequest);

// Cancel request (sender only)
router.delete('/:id', requestApiController.cancelRequest);

module.exports = router;
