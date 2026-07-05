const Teacher = require('../models/Teacher.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');
const ExcelJS = require('exceljs');

// @desc    Get all teachers
// @route   GET /api/v1/teachers
// @access  Protected (Admin, Principal)
exports.getTeachers = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);
  
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let dbQuery = Teacher.find({ ...queryObj, isDeleted: false });

  if (req.query.search) {
    dbQuery = dbQuery.find({ $text: { $search: req.query.search } });
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    dbQuery = dbQuery.sort(sortBy);
  } else {
    dbQuery = dbQuery.sort('-createdAt');
  }

  dbQuery = dbQuery.skip(skip).limit(limit);

  const teachers = await dbQuery;
  const total = await Teacher.countDocuments({ ...queryObj, isDeleted: false });

  res.status(200).json(
    new ApiResponse(200, {
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, 'Teachers retrieved successfully')
  );
});

// @desc    Get single teacher
// @route   GET /api/v1/teachers/:id
// @access  Protected
exports.getTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOne({ 
    _id: req.params.id, 
    isDeleted: false 
  }).populate('classesAssigned.classId'); // if class references exist later

  if (!teacher) {
    return next(new ApiError(404, 'Teacher not found'));
  }

  res.status(200).json(new ApiResponse(200, { teacher }, 'Teacher retrieved'));
});

// @desc    Create new teacher
// @route   POST /api/v1/teachers
// @access  Protected (Admin, Principal)
exports.createTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.create(req.body);
  res.status(201).json(
    new ApiResponse(201, { teacher }, 'Teacher created successfully')
  );
});

// @desc    Update teacher
// @route   PUT /api/v1/teachers/:id
// @access  Protected (Admin, Principal)
exports.updateTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );

  if (!teacher) {
    return next(new ApiError(404, 'Teacher not found'));
  }

  res.status(200).json(
    new ApiResponse(200, { teacher }, 'Teacher updated successfully')
  );
});

// @desc    Soft delete teacher
// @route   DELETE /api/v1/teachers/:id
// @access  Protected (Admin, Principal)
exports.deleteTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await Teacher.findOneAndUpdate(
    { _id: req.params.id },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!teacher) {
    return next(new ApiError(404, 'Teacher not found'));
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Teacher deleted successfully')
  );
});

// @desc    Upload teacher photo
// @route   POST /api/v1/teachers/:id/photo
// @access  Protected (Admin, Principal)
exports.uploadTeacherPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please upload an image file'));
  }

  const teacher = await Teacher.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { photo: req.file.path },
    { new: true }
  );

  if (!teacher) {
    return next(new ApiError(404, 'Teacher not found'));
  }

  res.status(200).json(
    new ApiResponse(200, { teacher }, 'Teacher photo updated successfully')
  );
});
