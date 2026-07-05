const Student = require('../models/Student.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');
const ExcelJS = require('exceljs');

// @desc    Get all students (paginated, filtered, searched)
// @route   GET /api/v1/students
// @access  Protected (Admin, Principal, Teacher, Operator)
exports.getStudents = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);
  
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Apply scope data from RBAC middleware
  let dbQuery = Student.find({ ...queryObj, ...req.scopedQuery, isDeleted: false });

  // Text search
  if (req.query.search) {
    dbQuery = dbQuery.find({ $text: { $search: req.query.search } });
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    dbQuery = dbQuery.sort(sortBy);
  } else {
    dbQuery = dbQuery.sort('-createdAt');
  }

  // Pagination
  dbQuery = dbQuery.skip(skip).limit(limit);

  // Execute query
  const students = await dbQuery;
  const total = await Student.countDocuments({ ...queryObj, ...req.scopedQuery, isDeleted: false });

  res.status(200).json(
    new ApiResponse(200, {
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, 'Students retrieved successfully')
  );
});

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Protected
exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ 
    _id: req.params.id, 
    ...req.scopedQuery, 
    isDeleted: false 
  });

  if (!student) {
    return next(new ApiError(404, 'Student not found'));
  }

  res.status(200).json(new ApiResponse(200, { student }, 'Student retrieved'));
});

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Protected (Admin, Principal, Operator)
exports.createStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.create(req.body);

  res.status(201).json(
    new ApiResponse(201, { student }, 'Student created successfully')
  );
});

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Protected (Admin, Principal, Operator)
exports.updateStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );

  if (!student) {
    return next(new ApiError(404, 'Student not found'));
  }

  res.status(200).json(
    new ApiResponse(200, { student }, 'Student updated successfully')
  );
});

// @desc    Upload student photo
// @route   POST /api/v1/students/:id/photo
// @access  Protected (Admin, Principal, Operator)
exports.uploadStudentPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please upload an image file'));
  }

  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { photo: req.file.path },
    { new: true }
  );

  if (!student) {
    return next(new ApiError(404, 'Student not found'));
  }

  res.status(200).json(
    new ApiResponse(200, { student }, 'Student photo updated successfully')
  );
});

// @desc    Soft delete student
// @route   DELETE /api/v1/students/:id
// @access  Protected (Admin, Principal)
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!student) {
    return next(new ApiError(404, 'Student not found'));
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Student deleted successfully')
  );
});

// @desc    Export students to Excel
// @route   GET /api/v1/students/export/excel
// @access  Protected (Admin, Principal, Operator)
exports.exportStudents = asyncHandler(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let dbQuery = Student.find({ ...queryObj, ...req.scopedQuery, isDeleted: false });

  if (req.query.search) {
    dbQuery = dbQuery.find({ $text: { $search: req.query.search } });
  }
  
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    dbQuery = dbQuery.sort(sortBy);
  } else {
    dbQuery = dbQuery.sort('-createdAt');
  }

  const students = await dbQuery.lean();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  worksheet.columns = [
    { header: 'Admission No', key: 'admissionNumber', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Class', key: 'class', width: 10 },
    { header: 'Section', key: 'section', width: 10 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'DOB', key: 'dob', width: 15 },
    { header: 'Father Name', key: 'fatherName', width: 25 },
    { header: 'Mother Name', key: 'motherName', width: 25 },
    { header: 'Mobile', key: 'mobile', width: 15 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  students.forEach(student => {
    worksheet.addRow({
      admissionNumber: student.admissionNumber,
      name: student.name,
      class: student.class,
      section: student.section,
      gender: student.gender,
      dob: student.dob ? new Date(student.dob).toLocaleDateString() : '',
      fatherName: student.father?.name || '',
      motherName: student.mother?.name || '',
      mobile: student.father?.mobile || student.mother?.mobile || '',
      status: student.isActive ? 'Active' : 'Inactive'
    });
  });

  worksheet.getRow(1).font = { bold: true };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + `Students_${new Date().getTime()}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
});
