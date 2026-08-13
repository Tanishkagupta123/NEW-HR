const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/today', attendanceController.getMonthlyAttendance);
router.get('/employee/:id', attendanceController.getEmployeeAttendance);
router.post('/mark', attendanceController.markAttendance);

module.exports = router;
