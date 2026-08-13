const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/register', auth.register);
router.post('/login', auth.login);
// Dev: list test users
router.get('/test-users', auth.listTestUsers);

module.exports = router;
