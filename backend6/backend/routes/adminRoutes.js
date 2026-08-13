const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');

router.get('/dashboard', admin.dashboard);

module.exports = router;
