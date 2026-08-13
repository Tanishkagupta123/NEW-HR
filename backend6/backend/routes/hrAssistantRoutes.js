const express = require('express');
const router = express.Router();
const hrAssistantController = require('../controllers/hrAssistantController');

router.get('/status', hrAssistantController.status);
router.post('/ask', hrAssistantController.ask);

module.exports = router;
