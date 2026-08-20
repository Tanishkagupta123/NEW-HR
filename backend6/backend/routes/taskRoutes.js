const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/taskController');

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/employee/:empId', ctrl.listByEmployee);
router.get('/groups', ctrl.listGroups);
router.post('/groups', ctrl.createGroup);
router.delete('/groups/:id', ctrl.deleteGroup);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
