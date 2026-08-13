const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaveController');

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/employee/:id', ctrl.byEmployee);
// support both PUT /:id and PUT /:id/status from different clients
router.put('/:id/status', ctrl.updateStatus);
router.put('/:id', ctrl.updateStatus);

module.exports = router;
