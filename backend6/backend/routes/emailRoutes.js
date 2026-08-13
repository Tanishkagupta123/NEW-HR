const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all emails
router.get('/', emailController.getAllEmails);

// Get single email by ID
router.get('/:id', emailController.getEmailById);

// Get emails by event type
router.get('/eventType/:eventType', emailController.getEmailsByEventType);

// Get emails by recipient group
router.get('/recipientGroup/:recipientGroup', emailController.getEmailsByRecipientGroup);

// Create new email (admin only)
router.post('/', authMiddleware, emailController.createEmail);

// Update email (admin only)
router.put('/:id', authMiddleware, emailController.updateEmail);

// Send email (admin only)
router.patch('/:id/send', authMiddleware, emailController.sendEmail);

// Delete email (admin only)
router.delete('/:id', authMiddleware, emailController.deleteEmail);

module.exports = router;
