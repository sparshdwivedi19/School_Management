const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboard.controller');
const { studentReport, feeReport, attendanceReport, salaryReport, financialReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');

const dashRouter = express.Router();
dashRouter.use(protect);
dashRouter.get('/summary', getDashboardSummary);

const reportRouter = express.Router();
reportRouter.use(protect);
reportRouter.use(restrictTo('admin', 'principal', 'operator'));
reportRouter.get('/students', studentReport);
reportRouter.get('/fees', feeReport);
reportRouter.get('/attendance', attendanceReport);
reportRouter.get('/salary', salaryReport);
reportRouter.get('/financial', financialReport);

module.exports = { dashRouter, reportRouter };
