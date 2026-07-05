const express = require('express');
const { getSalaryPayments, generatePayroll, markSalaryPaid, getSalaryAnalytics } = require('../controllers/salary.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');

const router = express.Router();
router.use(protect);
router.use(restrictTo('admin', 'principal'));

router.get('/analytics', getSalaryAnalytics);
router.get('/', getSalaryPayments);
router.post('/generate', generatePayroll);
router.put('/:id/pay', markSalaryPaid);

module.exports = router;
