const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', feedbackController.createFeedback);
router.get('/received', feedbackController.getReceivedFeedback);
router.get('/received/:userId', feedbackController.getReceivedFeedback);
router.get('/given', feedbackController.getGivenFeedback);
router.put('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
