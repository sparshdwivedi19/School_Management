const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const Fee = require('../models/Fee.model');
const Attendance = require('../models/Attendance.model');
const Expense = require('../models/Expense.model');
const Examination = require('../models/Examination.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get admin/principal dashboard KPIs
// @route   GET /api/v1/dashboard/summary
// @access  Protected (Admin, Principal, Operator)
exports.getDashboardSummary = asyncHandler(async (req, res) => {
  const { academicSession = '2025-26' } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalTeachers,
    feeSummary,
    todayAttendance,
    recentExams,
    monthlyExpense,
    lowAttendanceCount,
    newStudentsThisMonth,
  ] = await Promise.all([
    Student.countDocuments({ isDeleted: false, isActive: true }),
    Teacher.countDocuments({ isDeleted: false, isActive: true }),

    Fee.aggregate([
      { $match: { academicSession } },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalFee' },
          totalPaid: { $sum: '$totalPaid' },
          totalDue: { $sum: '$totalDue' },
          defaulters: { $sum: { $cond: ['$isDefaulter', 1, 0] } },
        },
      },
    ]),

    // Today's attendance status distribution
    Attendance.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Examination.find({ academicSession })
      .sort('-createdAt')
      .limit(5)
      .select('name type class section status startDate'),

    // This month's expenses
    Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(today.getFullYear(), today.getMonth(), 1),
            $lte: new Date(today.getFullYear(), today.getMonth() + 1, 0),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // Students with below 75% attendance (approximate: more absences than 25% of days)
    Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
        },
      },
      {
        $project: {
          attendancePct: {
            $multiply: [{ $divide: [{ $subtract: ['$total', '$absent'] }, '$total'] }, 100],
          },
        },
      },
      { $match: { attendancePct: { $lt: 75 } } },
      { $count: 'count' },
    ]),

    // New students enrolled in current month
    Student.countDocuments({
      isDeleted: false,
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), 1),
      },
    }),
  ]);

  const fee = feeSummary[0] || {};
  const attMap = {};
  todayAttendance.forEach(a => { attMap[a._id] = a.count; });
  const collectionRate = fee.totalBilled > 0
    ? Math.round((fee.totalPaid / fee.totalBilled) * 100)
    : 0;

  res.status(200).json(new ApiResponse(200, {
    students: {
      total: totalStudents,
      newThisMonth: newStudentsThisMonth,
      lowAttendance: lowAttendanceCount[0]?.count || 0,
    },
    teachers: { total: totalTeachers },
    fees: {
      totalBilled: fee.totalBilled || 0,
      totalPaid: fee.totalPaid || 0,
      totalDue: fee.totalDue || 0,
      defaulters: fee.defaulters || 0,
      collectionRate,
    },
    todayAttendance: {
      present: attMap['Present'] || 0,
      absent: attMap['Absent'] || 0,
      late: attMap['Late'] || 0,
      leave: attMap['Leave'] || 0,
      total: Object.values(attMap).reduce((s, v) => s + v, 0),
    },
    monthlyExpense: monthlyExpense[0]?.total || 0,
    recentExams,
  }, 'Dashboard data retrieved'));
});
