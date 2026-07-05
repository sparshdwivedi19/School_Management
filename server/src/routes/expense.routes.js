const express = require('express');
const { getExpenses, createExpense, getExpense, updateExpense, deleteExpense, getExpenseAnalytics } = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expense.validator');

const router = express.Router();
router.use(protect);
router.use(restrictTo('admin', 'principal'));

router.get('/analytics', getExpenseAnalytics);
router.route('/').get(getExpenses).post(validate(createExpenseSchema), createExpense);
router.route('/:id').get(getExpense).put(validate(updateExpenseSchema), updateExpense).delete(deleteExpense);

module.exports = router;
