const express = require('express');
const authRoutes = require('./auth.routes');
const settingsRoutes = require('./settings.routes');
const studentRoutes = require('./student.routes');
const teacherRoutes = require('./teacher.routes');
const userRoutes = require('./user.routes');
const attendanceRoutes = require('./attendance.routes');
const feeRoutes = require('./fee.routes');
const expenseRoutes = require('./expense.routes');
const salaryRoutes = require('./salary.routes');
const examRoutes = require('./exam.routes');
const aiRoutes = require('./ai.routes');
const { dashRouter, reportRouter } = require('./dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/users', userRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees', feeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/salary', salaryRoutes);
router.use('/exams', examRoutes);
router.use('/ai', aiRoutes);
router.use('/dashboard', dashRouter);
router.use('/reports', reportRouter);

module.exports = router;

