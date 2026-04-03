const express = require('express');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, profileController.getMyProfile);
router.put('/setup', authMiddleware, profileController.setupProfile);

module.exports = router;
