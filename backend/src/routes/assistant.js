const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');

// 智能推荐
router.post('/recommend', assistantController.getRecommendation);

// 聊天对话
router.post('/chat', assistantController.chatWithAssistant);

module.exports = router;