const express = require('express');
const {
  getExams, getExam, createExam, updateExam, deleteExam,
  publishResult,
  bulkEnterMarks, getExamMarks, getStudentMarks,
  generateReportCard,
} = require('../controllers/exam.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createExamSchema, updateExamSchema, bulkMarksSchema } = require('../validators/exam.validator');

const router = express.Router();
router.use(protect);

// Exam CRUD
router.get('/', getExams);
router.post('/', restrictTo('admin', 'principal'), validate(createExamSchema), createExam);
router.get('/:id', getExam);
router.put('/:id', restrictTo('admin', 'principal'), validate(updateExamSchema), updateExam);
router.delete('/:id', restrictTo('admin', 'principal'), deleteExam);
router.put('/:id/publish', restrictTo('admin', 'principal'), publishResult);

// Marks
router.post('/marks/bulk', restrictTo('admin', 'principal', 'teacher', 'operator'), validate(bulkMarksSchema), bulkEnterMarks);
router.get('/:examId/marks', getExamMarks);
router.get('/marks/student/:studentId', getStudentMarks);

// Report Card PDF
router.get('/report-card/:studentId/:examinationId', generateReportCard);

module.exports = router;
