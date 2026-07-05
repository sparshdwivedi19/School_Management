const express = require('express');
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  uploadTeacherPhoto
} = require('../controllers/teacher.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createTeacherSchema, updateTeacherSchema } = require('../validators/teacher.validator');
const { uploadPhoto } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(
    restrictTo('admin', 'principal'), 
    getTeachers
  )
  .post(
    restrictTo('admin', 'principal'), 
    validate(createTeacherSchema), 
    createTeacher
  );

router
  .route('/:id')
  .get(getTeacher) 
  .put(
    restrictTo('admin', 'principal'), 
    validate(updateTeacherSchema), 
    updateTeacher
  )
  .delete(
    restrictTo('admin', 'principal'), 
    deleteTeacher
  );

router
  .route('/:id/photo')
  .post(
    restrictTo('admin', 'principal'),
    uploadPhoto.single('photo'),
    uploadTeacherPhoto
  );

module.exports = router;
