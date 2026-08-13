const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all chat routes
router.get('/history', authMiddleware, chatController.getHistory);
router.post('/message', authMiddleware, chatController.postMessage);
router.post('/groups', authMiddleware, chatController.createGroup);
router.get('/groups', authMiddleware, chatController.getGroups);

module.exports = router;
