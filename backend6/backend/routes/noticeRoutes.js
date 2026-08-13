const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all notices
router.get('/', noticeController.getAllNotices);

// Get single notice by ID
router.get('/:id', noticeController.getNoticeById);

// Get notices by department
router.get('/department/:department', noticeController.getNoticesByDepartment);

// Create new notice (admin only)
router.post('/', authMiddleware, noticeController.createNotice);

// Update notice (admin only)
router.put('/:id', authMiddleware, noticeController.updateNotice);

// Delete notice (admin only)
router.delete('/:id', authMiddleware, noticeController.deleteNotice);

// Toggle pin status (admin only)
router.patch('/:id/pin', authMiddleware, noticeController.togglePin);

module.exports = router;
