const Expense = require('../models/Expense.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');

// @desc    Get all expenses (paginated, filtered)
// @route   GET /api/v1/expenses
// @access  Protected (Admin, Principal)
exports.getExpenses = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.month) filter.month = req.query.month;
  if (req.query.academicSession) filter.academicSession = req.query.academicSession;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('addedBy', 'name')
      .sort('-date')
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, {
    expenses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Expenses retrieved'));
});

// @desc    Create expense
// @route   POST /api/v1/expenses
// @access  Protected (Admin, Principal)
exports.createExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.create({ ...req.body, addedBy: req.user.id });
  res.status(201).json(new ApiResponse(201, { expense }, 'Expense created successfully'));
});

// @desc    Get single expense
// @route   GET /api/v1/expenses/:id
// @access  Protected (Admin, Principal)
exports.getExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findById(req.params.id).populate('addedBy', 'name');
  if (!expense) return next(new ApiError(404, 'Expense not found'));
  res.status(200).json(new ApiResponse(200, { expense }, 'Expense retrieved'));
});

// @desc    Update expense
// @route   PUT /api/v1/expenses/:id
// @access  Protected (Admin, Principal)
exports.updateExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!expense) return next(new ApiError(404, 'Expense not found'));
  res.status(200).json(new ApiResponse(200, { expense }, 'Expense updated successfully'));
});

// @desc    Delete expense
// @route   DELETE /api/v1/expenses/:id
// @access  Protected (Admin)
exports.deleteExpense = asyncHandler(async (req, res, next) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return next(new ApiError(404, 'Expense not found'));
  res.status(200).json(new ApiResponse(200, null, 'Expense deleted'));
});

// @desc    Get expense analytics (category + month breakdown)
// @route   GET /api/v1/expenses/analytics
// @access  Protected (Admin, Principal)
exports.getExpenseAnalytics = asyncHandler(async (req, res, next) => {
  const { academicSession } = req.query;
  const match = academicSession ? { academicSession } : {};

  const [byCategory, byMonth] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$month', total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const grandTotal = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.status(200).json(new ApiResponse(200, {
    byCategory,
    byMonth,
    grandTotal: grandTotal[0]?.total || 0,
  }, 'Expense analytics retrieved'));
});
