const express = require('express');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
  exportStudents
} = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo, scopeData } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createStudentSchema, updateStudentSchema } = require('../validators/student.validator');
const { uploadPhoto } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);
router.use(scopeData);

router
  .route('/export/excel')
  .get(
    restrictTo('admin', 'principal', 'operator'),
    exportStudents
  );

router
  .route('/')
  .get(
    restrictTo('admin', 'principal', 'teacher', 'operator'), 
    getStudents
  )
  .post(
    restrictTo('admin', 'principal', 'operator'), 
    validate(createStudentSchema), 
    createStudent
  );

router
  .route('/:id')
  .get(getStudent) // Open to anyone who passes scopeData (e.g. the student themselves, or staff)
  .put(
    restrictTo('admin', 'principal', 'operator'), 
    validate(updateStudentSchema), 
    updateStudent
  )
  .delete(
    restrictTo('admin', 'principal'), 
    deleteStudent
  );

router
  .route('/:id/photo')
  .post(
    restrictTo('admin', 'principal', 'operator'),
    uploadPhoto.single('photo'),
    uploadStudentPhoto
  );

module.exports = router;
