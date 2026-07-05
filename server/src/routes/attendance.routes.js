const express = require('express');
const {
  markAttendance,
  getDailyAttendance,
  getStudentAttendance,
  updateAttendanceRecord
} = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { markAttendanceSchema, updateAttendanceRecordSchema } = require('../validators/attendance.validator');

const router = express.Router();

router.use(protect);

router.post(
  '/batch',
  restrictTo('admin', 'principal', 'teacher', 'operator'),
  validate(markAttendanceSchema),
  markAttendance
);

router.get(
  '/daily',
  restrictTo('admin', 'principal', 'teacher', 'operator'),
  getDailyAttendance
);

router.get(
  '/student/:studentId',
  // Students can only see their own attendance (handled by scopeData/RBAC in a fully robust system, simplified here)
  getStudentAttendance
);

router.put(
  '/:id',
  restrictTo('admin', 'principal', 'teacher', 'operator'),
  validate(updateAttendanceRecordSchema),
  updateAttendanceRecord
);

module.exports = router;
