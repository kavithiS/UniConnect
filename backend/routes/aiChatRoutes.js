const express = require('express');
const router = express.Router();
const aiChatController = require('../controllers/aiChatController');

// Send chat message to AI
router.post('/message', aiChatController.chatWithAI);

module.exports = router;
