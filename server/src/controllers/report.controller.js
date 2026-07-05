const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const Fee = require('../models/Fee.model');
const Attendance = require('../models/Attendance.model');
const Expense = require('../models/Expense.model');
const SalaryPayment = require('../models/SalaryPayment.model');
const Marks = require('../models/Marks.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// Helper: send Excel response
const sendExcel = (res, worksheetData, sheetName, fileName) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
  res.send(buf);
};

// @desc    Student Report (Excel)
// @route   GET /api/v1/reports/students
exports.studentReport = asyncHandler(async (req, res) => {
  const { class: cls, section, academicSession } = req.query;
  const filter = { isDeleted: false };
  if (cls) filter.class = cls;
  if (section) filter.section = section;
  if (academicSession) filter.academicSession = academicSession;

  const students = await Student.find(filter).sort('class section name').lean();

  const rows = [
    ['#', 'Name', 'Admission No', 'Class', 'Section', 'Gender', 'Category', 'DOB', 'Father Name', 'Mobile', 'Enrollment Date', 'Status'],
  ];
  students.forEach((s, i) => {
    rows.push([
      i + 1,
      s.name,
      s.admissionNumber,
      s.class,
      s.section,
      s.gender,
      s.category,
      s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '',
      s.father?.name || '',
      s.father?.mobile || '',
      s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : '',
      s.isActive ? 'Active' : 'Inactive',
    ]);
  });

  sendExcel(res, rows, 'Students', `Student-Report-${Date.now()}`);
});

// @desc    Fee Report (Excel)
// @route   GET /api/v1/reports/fees
exports.feeReport = asyncHandler(async (req, res) => {
  const { academicSession = '2025-26', class: cls, section } = req.query;
  const filter = { academicSession };
  if (cls) filter.class = cls;
  if (section) filter.section = section;

  const fees = await Fee.find(filter)
    .populate('student', 'name admissionNumber class section father')
    .sort('class section')
    .lean();

  const rows = [
    ['#', 'Student Name', 'Admission No', 'Class', 'Section', 'Total Fee', 'Paid', 'Due', 'Last Payment', 'Status'],
  ];
  fees.forEach((f, i) => {
    rows.push([
      i + 1,
      f.student?.name,
      f.student?.admissionNumber,
      f.class,
      f.section,
      f.totalFee,
      f.totalPaid,
      f.totalDue,
      f.lastPaymentDate ? new Date(f.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A',
      f.isDefaulter ? 'Defaulter' : 'Cleared',
    ]);
  });

  sendExcel(res, rows, 'Fee Report', `Fee-Report-${academicSession}`);
});

// @desc    Attendance Report (Excel) - Monthly
// @route   GET /api/v1/reports/attendance
exports.attendanceReport = asyncHandler(async (req, res) => {
  const { class: cls, section, month, year = new Date().getFullYear() } = req.query;
  if (!cls || !section) return next(new ApiError(400, 'Class and Section required'));

  const students = await Student.find({ class: cls, section, isDeleted: false, isActive: true })
    .sort('rollNumber name')
    .select('name admissionNumber rollNumber')
    .lean();

  const attendance = await Attendance.find({ class: cls, section })
    .lean();

  // Build date→student→status map
  const attMap = {};
  attendance.forEach(a => {
    const sid = a.studentId.toString();
    const d = new Date(a.date).toLocaleDateString('en-IN');
    if (!attMap[sid]) attMap[sid] = {};
    attMap[sid][d] = a.status?.charAt(0) || 'P'; // P/A/L/H
  });

  // Unique dates sorted
  const allDates = [...new Set(attendance.map(a => new Date(a.date).toLocaleDateString('en-IN')))].sort();

  const headerRow = ['#', 'Name', 'Admission No', ...allDates, 'Present', 'Absent', 'Leave'];
  const rows = [headerRow];

  students.forEach((s, i) => {
    const sid = s._id.toString();
    const statuses = allDates.map(d => attMap[sid]?.[d] || '-');
    const present = statuses.filter(s => s === 'P').length;
    const absent = statuses.filter(s => s === 'A').length;
    const leave = statuses.filter(s => s === 'L').length;
    rows.push([i + 1, s.name, s.admissionNumber, ...statuses, present, absent, leave]);
  });

  sendExcel(res, rows, 'Attendance', `Attendance-${cls}-${section}-${month || 'Full'}`);
});

// @desc    Salary Report (Excel)
// @route   GET /api/v1/reports/salary
exports.salaryReport = asyncHandler(async (req, res) => {
  const { month, academicSession } = req.query;
  const filter = {};
  if (month) filter.month = month;
  if (academicSession) filter.academicSession = academicSession;

  const payments = await SalaryPayment.find(filter)
    .populate('teacher', 'name employeeId designation department')
    .lean();

  const rows = [
    ['#', 'Employee', 'Employee ID', 'Designation', 'Department', 'Month', 'Net Salary', 'Status', 'Payment Date', 'Mode'],
  ];
  payments.forEach((p, i) => {
    rows.push([
      i + 1,
      p.teacher?.name,
      p.teacher?.employeeId,
      p.teacher?.designation,
      p.teacher?.department,
      p.month,
      p.netSalary,
      p.status,
      p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : 'Pending',
      p.paymentMode || '-',
    ]);
  });

  sendExcel(res, rows, 'Salary', `Salary-Report-${month || 'All'}`);
});

// @desc    Financial Summary Report (Excel)
// @route   GET /api/v1/reports/financial
exports.financialReport = asyncHandler(async (req, res) => {
  const { academicSession = '2025-26' } = req.query;

  const [feeData, expenseData, salaryData] = await Promise.all([
    Fee.aggregate([
      { $match: { academicSession } },
      { $group: { _id: null, billed: { $sum: '$totalFee' }, paid: { $sum: '$totalPaid' }, due: { $sum: '$totalDue' } } },
    ]),
    Expense.aggregate([
      { $match: { academicSession } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    SalaryPayment.aggregate([
      { $match: { academicSession, status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]),
  ]);

  const fee = feeData[0] || {};
  const salaryTotal = salaryData[0]?.total || 0;
  const expenseTotal = expenseData.reduce((s, e) => s + e.total, 0);
  const totalExpenditure = salaryTotal + expenseTotal;
  const netSurplus = (fee.paid || 0) - totalExpenditure;

  const summaryRows = [
    ['FINANCIAL SUMMARY REPORT', '', `Session: ${academicSession}`],
    [],
    ['FEE INCOME', '', ''],
    ['Total Fee Billed', '', fee.billed || 0],
    ['Total Fee Collected', '', fee.paid || 0],
    ['Total Fee Due', '', fee.due || 0],
    ['Collection Rate', '', fee.billed > 0 ? `${Math.round((fee.paid / fee.billed) * 100)}%` : '0%'],
    [],
    ['EXPENDITURE', '', ''],
    ['Total Salary Disbursed', '', salaryTotal],
    ...expenseData.map(e => [e._id, '', e.total]),
    ['TOTAL EXPENDITURE', '', totalExpenditure],
    [],
    ['NET SURPLUS / DEFICIT', '', netSurplus],
  ];

  sendExcel(res, summaryRows, 'Financial Summary', `Financial-Summary-${academicSession}`);
});
