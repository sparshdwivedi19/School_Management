/**
 * RAG Context Builder
 * Fetches live school data and assembles it into a context string for the AI
 */

const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const Fee = require('../models/Fee.model');
const Attendance = require('../models/Attendance.model');
const Expense = require('../models/Expense.model');
const SalaryPayment = require('../models/SalaryPayment.model');
const Marks = require('../models/Marks.model');
const Examination = require('../models/Examination.model');

/**
 * Build a comprehensive school context for the Principal AI
 */
const buildSchoolContext = async (academicSession = '2025-26') => {
  const [
    totalStudents,
    totalTeachers,
    feeSummary,
    expenseSummary,
    recentExams,
    attendanceSummary,
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
        }
      }
    ]),

    Expense.aggregate([
      { $match: { academicSession } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),

    Examination.find({ academicSession, status: 'ResultPublished' })
      .select('name type class section')
      .limit(5)
      .lean(),

    // Today's attendance snapshot
    Attendance.aggregate([
      { $match: { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const fee = feeSummary[0] || {};
  const collectionRate = fee.totalBilled > 0 ? ((fee.totalPaid / fee.totalBilled) * 100).toFixed(1) : 0;

  const attendanceMap = {};
  attendanceSummary.forEach(a => { attendanceMap[a._id] = a.count; });

  const context = `
=== SUNCITY SCHOOL — LIVE DATA CONTEXT (Session: ${academicSession}) ===

SCHOOL OVERVIEW:
- Total Active Students: ${totalStudents}
- Total Active Teaching Staff: ${totalTeachers}

FEE COLLECTION:
- Total Fee Billed: ₹${(fee.totalBilled || 0).toLocaleString('en-IN')}
- Total Collected: ₹${(fee.totalPaid || 0).toLocaleString('en-IN')}
- Total Due: ₹${(fee.totalDue || 0).toLocaleString('en-IN')}
- Collection Rate: ${collectionRate}%
- Fee Defaulters: ${fee.defaulters || 0} students

TOP EXPENSE CATEGORIES (${academicSession}):
${expenseSummary.map(e => `- ${e._id}: ₹${e.total.toLocaleString('en-IN')}`).join('\n') || '- No expense data'}

TODAY'S ATTENDANCE:
- Present: ${attendanceMap['Present'] || 0}
- Absent: ${attendanceMap['Absent'] || 0}
- Leave: ${attendanceMap['Leave'] || 0}
- Half-Day: ${attendanceMap['Half-Day'] || 0}

RECENTLY PUBLISHED RESULTS:
${recentExams.map(e => `- ${e.name} (${e.type}) — Class ${e.class}-${e.section}`).join('\n') || '- No published results yet'}

=== END OF CONTEXT ===`;

  return context.trim();
};

/**
 * Build student-specific context for the Student Coach AI
 */
const buildStudentContext = async (studentId, academicSession = '2025-26') => {
  const [student, feeRecord, allMarks, attendanceStats] = await Promise.all([
    Student.findById(studentId).select('name class section admissionNumber').lean(),

    Fee.findOne({ student: studentId, academicSession })
      .select('totalFee totalPaid totalDue isDefaulter')
      .lean(),

    Marks.find({ student: studentId, academicSession })
      .populate('examination', 'name type')
      .select('examination percentage grade isPassed totalMarks totalMaxMarks rank')
      .lean(),

    Attendance.aggregate([
      { $match: { studentId: require('mongoose').Types.ObjectId(studentId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  if (!student) return 'Student not found.';

  const attMap = {};
  attendanceStats.forEach(a => { attMap[a._id] = a.count; });
  const totalDays = Object.values(attMap).reduce((s, v) => s + v, 0);
  const presentDays = attMap['Present'] || 0;
  const attendancePct = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 'N/A';

  const context = `
=== STUDENT PROFILE: ${student.name} ===
Admission No: ${student.admissionNumber}
Class: ${student.class} - ${student.section}
Academic Session: ${academicSession}

ATTENDANCE:
- Present: ${presentDays} / ${totalDays} days (${attendancePct}%)
- Absent: ${attMap['Absent'] || 0} | Leave: ${attMap['Leave'] || 0}

FEE STATUS:
- Total Fee: ₹${(feeRecord?.totalFee || 0).toLocaleString('en-IN')}
- Paid: ₹${(feeRecord?.totalPaid || 0).toLocaleString('en-IN')}
- Balance Due: ₹${(feeRecord?.totalDue || 0).toLocaleString('en-IN')}

EXAM RESULTS:
${allMarks.length > 0
  ? allMarks.map(m =>
    `- ${m.examination?.name} (${m.examination?.type}): ${m.percentage?.toFixed(1)}% | Grade: ${m.grade} | ${m.isPassed ? 'PASSED' : 'FAILED'} | Rank: ${m.rank || 'N/A'}`
  ).join('\n')
  : '- No exam results recorded yet'
}

=== END OF STUDENT CONTEXT ===`;

  return context.trim();
};

module.exports = { buildSchoolContext, buildStudentContext };
