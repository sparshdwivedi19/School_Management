const express = require('express');
const {
  assignFee,
  getFees,
  getFee,
  getFeeByStudent,
  recordPayment,
  generateReceipt,
  getDefaulters,
  getFeeAnalytics,
} = require('../controllers/fee.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { assignFeeSchema, recordPaymentSchema } = require('../validators/fee.validator');

const router = express.Router();

router.use(protect);

// Analytics & special routes (before :id to avoid conflicts)
router.get('/analytics', restrictTo('admin', 'principal'), getFeeAnalytics);
router.get('/defaulters', restrictTo('admin', 'principal', 'operator'), getDefaulters);
router.get('/student/:studentId', getFeeByStudent);

// Assign fee structure
router.post('/assign', restrictTo('admin', 'principal', 'operator'), validate(assignFeeSchema), assignFee);

// CRUD
router.get('/', restrictTo('admin', 'principal', 'operator'), getFees);
router.get('/:id', getFee);

// Payment routes
router.post('/:id/pay', restrictTo('admin', 'principal', 'operator'), validate(recordPaymentSchema), recordPayment);
router.get('/:id/receipt/:receiptNumber', generateReceipt);

module.exports = router;
