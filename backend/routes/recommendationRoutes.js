const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

/**
 * Recommendation Routes
 * GET /recommend/groups/:userId   - Get recommended groups for user
 * GET /recommend/users/:groupId   - Get recommended users for group
 */

router.get('/groups/:userId', recommendationController.getRecommendedGroups);
router.get('/users/:groupId', recommendationController.getRecommendedUsers);

module.exports = router;
