const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Get single announcement by ID
router.get('/:id', announcementController.getAnnouncementById);

// Get announcements by department
router.get('/department/:department', announcementController.getAnnouncementsByDepartment);

// Create new announcement (admin only)
router.post('/', authMiddleware, announcementController.createAnnouncement);

// Update announcement (admin only)
router.put('/:id', authMiddleware, announcementController.updateAnnouncement);

// Delete announcement (admin only)
router.delete('/:id', authMiddleware, announcementController.deleteAnnouncement);

module.exports = router;
