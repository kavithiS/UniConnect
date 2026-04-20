const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Group Routes
 * POST   /groups         - Create group
 * GET    /groups         - Get all groups
 * GET    /groups/:id     - Get single group
 * GET    /groups/code/:code - Get group by code
 * PUT    /groups/:id     - Update group
 * DELETE /groups/:id     - Archive group
 */

router.post('/', groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/my/members', authMiddleware, groupController.getMyMemberGroups);
router.get('/code/:code', groupController.getGroupByCode);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.archiveGroup);

module.exports = router;
