const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/biometricController');

router.get('/config',          ctrl.getConfig);
router.post('/config',         ctrl.saveConfig);
router.post('/test-connection', ctrl.testConnection);
router.post('/sync',           ctrl.syncNow);

module.exports = router;
