const express = require('express');
const router = express.Router();
const joinRequestController = require('../controllers/joinRequestController');

/**
 * Join Request Routes
 * POST   /requests                           - Send join request
 * GET    /requests                           - Get all join requests
 * GET    /requests/student/:userId           - Get student's requests
 * GET    /requests/group/:groupId            - Get group's requests
 * GET    /requests/group-status/:groupId     - Get group capacity status
 * PUT    /requests/:id                       - Accept/reject request
 * PUT    /requests/check-expiration          - Check and expire old requests
 * PUT    /requests/close-for-group/:groupId  - Close requests when group full
 * DELETE /requests/:id                       - Cancel request
 */

router.post('/', joinRequestController.sendJoinRequest);
router.get('/', joinRequestController.getAllJoinRequests);
router.get('/group-status/:groupId', joinRequestController.getGroupCapacityInfo);
router.get('/student/:userId', joinRequestController.getStudentRequests);
router.get('/group/:groupId', joinRequestController.getGroupRequests);
router.put('/:id', joinRequestController.updateJoinRequest);
router.put('/check-expiration', joinRequestController.checkExpiredRequests);
router.put('/close-for-group/:groupId', joinRequestController.closeRequestsForGroup);
router.delete('/:id', joinRequestController.cancelJoinRequest);

module.exports = router;
