const express = require('express');
const suggestionController = require('../controllers/suggestionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, suggestionController.getMySuggestions);

module.exports = router;
