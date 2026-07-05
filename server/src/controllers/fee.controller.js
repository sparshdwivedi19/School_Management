const Fee = require('../models/Fee.model');
const Student = require('../models/Student.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');

// Helper: generate unique receipt number
const generateReceiptNumber = () => {
  const now = new Date();
  const prefix = `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const suffix = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${suffix}`;
};

// @desc    Assign fee structure to a student for a session
// @route   POST /api/v1/fees/assign
// @access  Protected (Admin, Principal, Operator)
exports.assignFee = asyncHandler(async (req, res, next) => {
  const { student, academicSession, class: className, section, feeStructure } = req.body;

  // Prevent duplicate fee record for same student + session
  const existing = await Fee.findOne({ student, academicSession });
  if (existing) {
    return next(new ApiError(400, 'Fee record already exists for this student and session. Use the update endpoint instead.'));
  }

  const feeRecord = await Fee.create({
    student, academicSession, class: className, section, feeStructure,
  });

  res.status(201).json(new ApiResponse(201, { fee: feeRecord }, 'Fee structure assigned successfully'));
});

// @desc    Get all fee records (paginated, filterable)
// @route   GET /api/v1/fees
// @access  Protected (Admin, Principal, Operator)
exports.getFees = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (req.query.class) filter.class = req.query.class;
  if (req.query.section) filter.section = req.query.section;
  if (req.query.academicSession) filter.academicSession = req.query.academicSession;
  if (req.query.isDefaulter) filter.isDefaulter = req.query.isDefaulter === 'true';

  const [fees, total] = await Promise.all([
    Fee.find(filter)
      .populate('student', 'name admissionNumber photo rollNumber')
      .sort('-updatedAt')
      .skip(skip)
      .limit(limit),
    Fee.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, {
    fees,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Fee records retrieved'));
});

// @desc    Get a single student's fee record
// @route   GET /api/v1/fees/:id
// @access  Protected
exports.getFee = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id)
    .populate('student', 'name admissionNumber photo class section')
    .populate('payments.collectedBy', 'name');

  if (!fee) return next(new ApiError(404, 'Fee record not found'));

  res.status(200).json(new ApiResponse(200, { fee }, 'Fee record retrieved'));
});

// @desc    Get fee record by student ID
// @route   GET /api/v1/fees/student/:studentId
// @access  Protected
exports.getFeeByStudent = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { academicSession } = req.query;

  const filter = { student: studentId };
  if (academicSession) filter.academicSession = academicSession;

  const fees = await Fee.find(filter)
    .populate('payments.collectedBy', 'name')
    .sort('-academicSession');

  res.status(200).json(new ApiResponse(200, { fees }, 'Student fee records retrieved'));
});

// @desc    Record a payment against a fee record
// @route   POST /api/v1/fees/:id/pay
// @access  Protected (Admin, Principal, Operator)
exports.recordPayment = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id).populate('student', 'name admissionNumber class section');
  if (!fee) return next(new ApiError(404, 'Fee record not found'));

  const { amount, paymentMode, categories, remarks, paymentDate } = req.body;

  const receiptNumber = generateReceiptNumber();

  fee.payments.push({
    receiptNumber,
    amount,
    paymentMode,
    categories: categories || [],
    remarks: remarks || '',
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    collectedBy: req.user.id,
  });

  await fee.save(); // Triggers pre-save to recompute totals

  res.status(200).json(new ApiResponse(200, {
    fee,
    receiptNumber,
    message: `Payment of ₹${amount} recorded with receipt ${receiptNumber}`,
  }, 'Payment recorded successfully'));
});

// @desc    Generate PDF receipt for a payment
// @route   GET /api/v1/fees/:id/receipt/:receiptNumber
// @access  Protected
exports.generateReceipt = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id)
    .populate('student', 'name admissionNumber class section fatherName')
    .populate('payments.collectedBy', 'name');

  if (!fee) return next(new ApiError(404, 'Fee record not found'));

  const payment = fee.payments.find(p => p.receiptNumber === req.params.receiptNumber);
  if (!payment) return next(new ApiError(404, 'Payment receipt not found'));

  // Generate PDF
  const doc = new PDFDocument({ size: 'A5', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="Receipt-${payment.receiptNumber}.pdf"`);
  doc.pipe(res);

  // --- PDF Layout ---
  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('SUNCITY SCHOOL', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('Fee Payment Receipt', { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // Receipt Meta
  doc.fontSize(10).font('Helvetica-Bold').text(`Receipt No: ${payment.receiptNumber}`, { continued: true })
     .font('Helvetica').text(`   Date: ${new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, { align: 'right' });
  doc.moveDown(0.5);

  // Student Details
  const student = fee.student;
  doc.font('Helvetica-Bold').text('Student Name: ', { continued: true }).font('Helvetica').text(student.name);
  doc.font('Helvetica-Bold').text('Admission No: ', { continued: true }).font('Helvetica').text(student.admissionNumber);
  doc.font('Helvetica-Bold').text('Class/Section: ', { continued: true }).font('Helvetica').text(`${student.class} - ${student.section}`);
  doc.moveDown(0.5);

  // Payment Details
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('PAYMENT DETAILS', { align: 'center' });
  doc.moveDown(0.3);

  doc.font('Helvetica-Bold').text('Amount Paid: ', { continued: true }).font('Helvetica').text(`₹ ${payment.amount.toLocaleString('en-IN')}`);
  doc.font('Helvetica-Bold').text('Payment Mode: ', { continued: true }).font('Helvetica').text(payment.paymentMode);
  if (payment.categories?.length) {
    doc.font('Helvetica-Bold').text('For: ', { continued: true }).font('Helvetica').text(payment.categories.join(', '));
  }
  if (payment.remarks) {
    doc.font('Helvetica-Bold').text('Remarks: ', { continued: true }).font('Helvetica').text(payment.remarks);
  }

  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  // Summary
  doc.font('Helvetica-Bold').text('Total Annual Fee: ', { continued: true }).font('Helvetica').text(`₹ ${fee.totalFee.toLocaleString('en-IN')}`);
  doc.font('Helvetica-Bold').text('Total Paid to Date: ', { continued: true }).font('Helvetica').text(`₹ ${fee.totalPaid.toLocaleString('en-IN')}`);
  doc.font('Helvetica-Bold').text('Balance Due: ', { continued: true }).font('Helvetica').text(`₹ ${fee.totalDue.toLocaleString('en-IN')}`);

  doc.moveDown(2);
  doc.font('Helvetica').fontSize(9).text('Collected by: ' + (payment.collectedBy?.name || 'System'), { align: 'right' });
  doc.moveDown(0.5);
  doc.text('Authorised Signatory', { align: 'right' });
  doc.moveDown(0.3);
  doc.text('This is a computer-generated receipt.', { align: 'center', color: 'gray' });

  doc.end();
});

// @desc    Get fee defaulters list
// @route   GET /api/v1/fees/defaulters
// @access  Protected (Admin, Principal, Operator)
exports.getDefaulters = asyncHandler(async (req, res, next) => {
  const filter = { isDefaulter: true };
  if (req.query.class) filter.class = req.query.class;
  if (req.query.section) filter.section = req.query.section;
  if (req.query.academicSession) filter.academicSession = req.query.academicSession;

  const defaulters = await Fee.find(filter)
    .populate('student', 'name admissionNumber photo class section father')
    .sort('-totalDue');

  res.status(200).json(new ApiResponse(200, { defaulters, count: defaulters.length }, 'Defaulters list retrieved'));
});

// @desc    Get fee analytics summary (class-wise collection)
// @route   GET /api/v1/fees/analytics
// @access  Protected (Admin, Principal)
exports.getFeeAnalytics = asyncHandler(async (req, res, next) => {
  const { academicSession } = req.query;
  const matchStage = academicSession ? { academicSession } : {};

  const analytics = await Fee.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { class: '$class', section: '$section' },
        totalStudents: { $sum: 1 },
        totalFee: { $sum: '$totalFee' },
        totalPaid: { $sum: '$totalPaid' },
        totalDue: { $sum: '$totalDue' },
        defaulters: { $sum: { $cond: ['$isDefaulter', 1, 0] } },
      },
    },
    { $sort: { '_id.class': 1, '_id.section': 1 } },
  ]);

  const summary = await Fee.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        grandTotalFee: { $sum: '$totalFee' },
        grandTotalPaid: { $sum: '$totalPaid' },
        grandTotalDue: { $sum: '$totalDue' },
        totalDefaulters: { $sum: { $cond: ['$isDefaulter', 1, 0] } },
        totalStudents: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, {
    classWise: analytics,
    summary: summary[0] || {},
  }, 'Fee analytics retrieved'));
});
