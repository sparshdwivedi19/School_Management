const Teacher = require('../models/Teacher.model');
const SalaryPayment = require('../models/SalaryPayment.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');

// @desc    Get salary records (paginated)
// @route   GET /api/v1/salary
// @access  Protected (Admin, Principal)
exports.getSalaryPayments = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.month) filter.month = req.query.month;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.teacherId) filter.teacher = req.query.teacherId;

  const [payments, total] = await Promise.all([
    SalaryPayment.find(filter)
      .populate('teacher', 'name employeeId designation')
      .populate('paidBy', 'name')
      .sort('-month')
      .skip(skip)
      .limit(limit),
    SalaryPayment.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, {
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Salary payments retrieved'));
});

// @desc    Generate payroll for a month (create pending records for all active teachers)
// @route   POST /api/v1/salary/generate
// @access  Protected (Admin, Principal)
exports.generatePayroll = asyncHandler(async (req, res, next) => {
  const { month, academicSession } = req.body;

  if (!month || !academicSession) {
    return next(new ApiError(400, 'Month and academic session are required'));
  }

  // Get all active teachers
  const teachers = await Teacher.find({ isActive: true, isDeleted: false }).select('_id name salary');

  if (teachers.length === 0) {
    return next(new ApiError(404, 'No active teachers found'));
  }

  // Check if payroll already generated for this month
  const existing = await SalaryPayment.findOne({ month, academicSession });
  if (existing) {
    return next(new ApiError(400, `Payroll for ${month} has already been generated`));
  }

  const payrollRecords = teachers.map(teacher => ({
    teacher: teacher._id,
    month,
    academicSession,
    basicSalary: teacher.salary || 0,
    grossSalary: teacher.salary || 0,
    netSalary: teacher.salary || 0,
    status: 'Pending',
  }));

  await SalaryPayment.insertMany(payrollRecords);

  res.status(201).json(new ApiResponse(201, {
    count: payrollRecords.length,
    month,
  }, `Payroll generated for ${payrollRecords.length} staff members`));
});

// @desc    Mark salary as paid
// @route   PUT /api/v1/salary/:id/pay
// @access  Protected (Admin, Principal)
exports.markSalaryPaid = asyncHandler(async (req, res, next) => {
  const { paymentMode, bankTransactionId, remarks } = req.body;

  const payment = await SalaryPayment.findByIdAndUpdate(
    req.params.id,
    {
      status: 'Paid',
      paymentDate: new Date(),
      paymentMode: paymentMode || 'Online',
      bankTransactionId,
      remarks,
      paidBy: req.user.id,
    },
    { new: true }
  ).populate('teacher', 'name employeeId');

  if (!payment) return next(new ApiError(404, 'Salary record not found'));

  res.status(200).json(new ApiResponse(200, { payment }, 'Salary marked as paid'));
});

// @desc    Get salary analytics for a month/session
// @route   GET /api/v1/salary/analytics
// @access  Protected (Admin, Principal)
exports.getSalaryAnalytics = asyncHandler(async (req, res, next) => {
  const { academicSession } = req.query;
  const match = academicSession ? { academicSession } : {};

  const [byMonth, statusSummary] = await Promise.all([
    SalaryPayment.aggregate([
      { $match: match },
      { $group: { _id: '$month', totalPaid: { $sum: '$netSalary' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    SalaryPayment.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$netSalary' } } },
    ]),
  ]);

  res.status(200).json(new ApiResponse(200, { byMonth, statusSummary }, 'Salary analytics retrieved'));
});
