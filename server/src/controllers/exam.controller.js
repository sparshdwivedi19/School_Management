const Examination = require('../models/Examination.model');
const Marks = require('../models/Marks.model');
const Student = require('../models/Student.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');
const { computeResult, addSubjectGrades } = require('../utils/gradeCalculator');
const PDFDocument = require('pdfkit');

// ─── EXAMINATION CRUD ──────────────────────────────────────────────────────────

exports.getExams = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.class) filter.class = req.query.class;
  if (req.query.section) filter.section = req.query.section;
  if (req.query.academicSession) filter.academicSession = req.query.academicSession;
  if (req.query.status) filter.status = req.query.status;

  const [exams, total] = await Promise.all([
    Examination.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Examination.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, {
    exams,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Exams retrieved'));
});

exports.getExam = asyncHandler(async (req, res, next) => {
  const exam = await Examination.findById(req.params.id).populate('createdBy', 'name');
  if (!exam) return next(new ApiError(404, 'Exam not found'));
  res.status(200).json(new ApiResponse(200, { exam }, 'Exam retrieved'));
});

exports.createExam = asyncHandler(async (req, res) => {
  const exam = await Examination.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(new ApiResponse(201, { exam }, 'Exam created successfully'));
});

exports.updateExam = asyncHandler(async (req, res, next) => {
  const exam = await Examination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!exam) return next(new ApiError(404, 'Exam not found'));
  res.status(200).json(new ApiResponse(200, { exam }, 'Exam updated'));
});

exports.deleteExam = asyncHandler(async (req, res, next) => {
  const exam = await Examination.findByIdAndDelete(req.params.id);
  if (!exam) return next(new ApiError(404, 'Exam not found'));
  // Also delete associated marks
  await Marks.deleteMany({ examination: req.params.id });
  res.status(200).json(new ApiResponse(200, null, 'Exam and marks deleted'));
});

exports.publishResult = asyncHandler(async (req, res, next) => {
  const exam = await Examination.findByIdAndUpdate(
    req.params.id,
    { status: 'ResultPublished' },
    { new: true }
  );
  if (!exam) return next(new ApiError(404, 'Exam not found'));
  res.status(200).json(new ApiResponse(200, { exam }, 'Result published successfully'));
});

// ─── MARKS ENTRY ──────────────────────────────────────────────────────────────

// Bulk marks entry for an entire class
exports.bulkEnterMarks = asyncHandler(async (req, res, next) => {
  const { examinationId, entries } = req.body;

  const exam = await Examination.findById(examinationId);
  if (!exam) return next(new ApiError(404, 'Examination not found'));

  const bulkOps = entries.map(entry => {
    // Calculate grades for each subject
    const enrichedSubjects = addSubjectGrades(entry.subjectMarks);
    const { totalObtained, totalMax, percentage, grade, gpa, remark, isPassed } = computeResult(entry.subjectMarks);

    return {
      updateOne: {
        filter: { examination: examinationId, student: entry.studentId },
        update: {
          $set: {
            examination: examinationId,
            student: entry.studentId,
            class: exam.class,
            section: exam.section,
            academicSession: exam.academicSession,
            subjectMarks: enrichedSubjects,
            totalMarks: totalObtained,
            totalMaxMarks: totalMax,
            percentage,
            grade,
            gpa,
            remarks: remark,
            isPassed,
            enteredBy: req.user.id,
          }
        },
        upsert: true,
      }
    };
  });

  await Marks.bulkWrite(bulkOps);

  // Compute class ranks after bulk insert
  await computeClassRanks(examinationId, exam.class, exam.section);

  res.status(200).json(new ApiResponse(200, { count: entries.length }, 'Marks entered and grades calculated'));
});

// Get marks for an exam (class result sheet)
exports.getExamMarks = asyncHandler(async (req, res, next) => {
  const marks = await Marks.find({ examination: req.params.examId })
    .populate('student', 'name admissionNumber rollNumber photo')
    .sort('rank');

  res.status(200).json(new ApiResponse(200, { marks }, 'Exam marks retrieved'));
});

// Get all marks for a student across exams
exports.getStudentMarks = asyncHandler(async (req, res) => {
  const marks = await Marks.find({ student: req.params.studentId })
    .populate('examination', 'name type academicSession startDate')
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, { marks }, 'Student marks retrieved'));
});

// ─── REPORT CARD PDF ──────────────────────────────────────────────────────────

exports.generateReportCard = asyncHandler(async (req, res, next) => {
  const { studentId, examinationId } = req.params;

  const [marksDoc, exam] = await Promise.all([
    Marks.findOne({ student: studentId, examination: examinationId })
      .populate('student', 'name admissionNumber class section dob father mother photo'),
    Examination.findById(examinationId),
  ]);

  if (!marksDoc) return next(new ApiError(404, 'Result not found for this student and exam'));

  const student = marksDoc.student;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="ReportCard-${student.admissionNumber}-${exam.name}.pdf"`);
  doc.pipe(res);

  // ─── PDF Layout ───────────────────────────────────────────────────────────
  // Header
  doc.rect(0, 0, 595, 130).fill('#f8fafc');
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e293b').text('SUNCITY SCHOOL', 50, 30, { align: 'center' });
  doc.fontSize(11).font('Helvetica').fillColor('#64748b').text('Progress Report Card', { align: 'center' });
  doc.fontSize(10).text(`${exam.name} | Academic Session: ${exam.academicSession}`, { align: 'center' });
  doc.moveDown(0.5);

  // Divider
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#6366f1').lineWidth(2).stroke();
  doc.moveDown(0.8);

  // Student Info Box
  const infoY = doc.y;
  doc.rect(50, infoY, 495, 80).fill('#f1f5f9').stroke('#e2e8f0');
  doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text(student.name, 65, infoY + 10);
  doc.fillColor('#64748b').fontSize(9).font('Helvetica');
  doc.text(`Admission No: ${student.admissionNumber}`, 65, infoY + 28);
  doc.text(`Class: ${student.class} | Section: ${student.section}`, 65, infoY + 42);
  if (student.dob) doc.text(`Date of Birth: ${new Date(student.dob).toLocaleDateString('en-IN')}`, 65, infoY + 56);
  if (student.father?.name) doc.text(`Father: ${student.father.name}`, 300, infoY + 28);
  if (student.mother?.name) doc.text(`Mother: ${student.mother.name}`, 300, infoY + 42);

  doc.y = infoY + 95;
  doc.moveDown(0.5);

  // Subject Marks Table
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e293b').text('Subject-wise Performance', { underline: false });
  doc.moveDown(0.4);

  // Table header
  const tableX = 50;
  const colWidths = [180, 80, 80, 80, 75];
  const headers = ['Subject', 'Max Marks', 'Obtained', 'Percentage', 'Grade'];
  const headerY = doc.y;

  doc.rect(tableX, headerY, 495, 20).fill('#6366f1');
  let cx = tableX + 8;
  headers.forEach((h, i) => {
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(h, cx, headerY + 5, { width: colWidths[i] - 8 });
    cx += colWidths[i];
  });
  doc.y = headerY + 22;

  // Table rows
  marksDoc.subjectMarks.forEach((sm, idx) => {
    const rowY = doc.y;
    const rowBg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc.rect(tableX, rowY, 495, 18).fill(rowBg);

    const pct = sm.isAbsent ? 'AB' : ((sm.marksObtained / sm.maxMarks) * 100).toFixed(1) + '%';

    cx = tableX + 8;
    const cells = [
      sm.subject,
      sm.maxMarks,
      sm.isAbsent ? 'Absent' : sm.marksObtained,
      pct,
      sm.grade || '-',
    ];
    cells.forEach((cell, i) => {
      doc.fillColor(sm.grade === 'E' && i >= 2 ? '#ef4444' : '#374151')
         .fontSize(9).font('Helvetica').text(String(cell), cx, rowY + 4, { width: colWidths[i] - 8 });
      cx += colWidths[i];
    });

    doc.y = rowY + 20;
  });

  doc.moveDown(0.8);

  // Summary Box
  const summaryY = doc.y;
  doc.rect(50, summaryY, 495, 70).fill('#f0fdf4').stroke('#86efac');
  const gradeColor = marksDoc.isPassed ? '#16a34a' : '#dc2626';

  doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold').text('RESULT SUMMARY', 65, summaryY + 10);
  doc.fontSize(9).font('Helvetica');
  doc.text(`Total Marks: ${marksDoc.totalMarks} / ${marksDoc.totalMaxMarks}`, 65, summaryY + 26);
  doc.text(`Percentage: ${marksDoc.percentage?.toFixed(2)}%`, 65, summaryY + 40);
  doc.text(`Remarks: ${marksDoc.remarks}`, 65, summaryY + 54);

  doc.fillColor(gradeColor).fontSize(28).font('Helvetica-Bold').text(marksDoc.grade, 420, summaryY + 15, { align: 'right' });
  doc.fillColor(gradeColor).fontSize(9).font('Helvetica-Bold').text(marksDoc.isPassed ? 'PASSED' : 'FAILED', 380, summaryY + 50, { align: 'right' });
  if (marksDoc.rank) {
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text(`Class Rank: ${marksDoc.rank}`, 380, summaryY + 62, { align: 'right' });
  }

  doc.y = summaryY + 80;
  doc.moveDown(1.5);

  // Signatures
  const sigY = doc.y;
  doc.fillColor('#64748b').fontSize(8).font('Helvetica');
  doc.text('Class Teacher Signature', 60, sigY).moveTo(60, sigY - 5).lineTo(200, sigY - 5).stroke('#94a3b8');
  doc.text('Principal Signature', 390, sigY).moveTo(390, sigY - 5).lineTo(530, sigY - 5).stroke('#94a3b8');

  doc.moveDown(1);
  doc.fillColor('#94a3b8').fontSize(7).text(
    `Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} | This is a computer-generated document.`,
    { align: 'center' }
  );

  doc.end();
});

// ─── HELPER: Compute Ranks ────────────────────────────────────────────────────

async function computeClassRanks(examinationId, className, section) {
  const allMarks = await Marks.find({ examination: examinationId, class: className, section }).sort('-percentage');
  const bulkOps = allMarks.map((m, idx) => ({
    updateOne: {
      filter: { _id: m._id },
      update: { $set: { rank: idx + 1 } },
    }
  }));
  if (bulkOps.length) await Marks.bulkWrite(bulkOps);
}
