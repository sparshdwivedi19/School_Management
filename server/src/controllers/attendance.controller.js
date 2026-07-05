const Attendance = require('../models/Attendance.model');
const Student = require('../models/Student.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');

// @desc    Mark daily attendance for a class/section
// @route   POST /api/v1/attendance/batch
// @access  Protected (Admin, Principal, Teacher, Operator)
exports.markAttendance = asyncHandler(async (req, res, next) => {
  const { date, class: className, section, records } = req.body;
  const markedBy = req.user.id;

  // Validate that all students belong to the specified class/section
  const studentIds = records.map(r => r.studentId);
  const students = await Student.find({ 
    _id: { $in: studentIds },
    class: className,
    section: section
  });

  if (students.length !== records.length) {
    return next(new ApiError(400, 'Some students do not belong to the specified class/section or do not exist'));
  }

  // Create attendance docs for each student for that date
  // We use bulkWrite to either insert or update
  const bulkOps = records.map(record => ({
    updateOne: {
      filter: { studentId: record.studentId, date: new Date(date) },
      update: { 
        $set: { 
          status: record.status, 
          remarks: record.remarks,
          markedBy,
          class: className,
          section: section
        } 
      },
      upsert: true
    }
  }));

  const result = await Attendance.bulkWrite(bulkOps);

  res.status(200).json(
    new ApiResponse(200, { result }, 'Attendance marked successfully')
  );
});

// @desc    Get attendance by class, section, and date
// @route   GET /api/v1/attendance/daily
// @access  Protected (Admin, Principal, Teacher, Operator)
exports.getDailyAttendance = asyncHandler(async (req, res, next) => {
  const { date, class: className, section } = req.query;

  if (!date || !className || !section) {
    return next(new ApiError(400, 'Date, class, and section are required parameters'));
  }

  const attendance = await Attendance.find({
    date: new Date(date),
    class: className,
    section: section
  }).populate('studentId', 'name admissionNumber rollNumber photo');

  res.status(200).json(
    new ApiResponse(200, { attendance }, 'Daily attendance retrieved successfully')
  );
});

// @desc    Get attendance for a specific student over a date range
// @route   GET /api/v1/attendance/student/:studentId
// @access  Protected (Admin, Principal, Teacher, Student)
exports.getStudentAttendance = asyncHandler(async (req, res, next) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;
  
  const query = { studentId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const attendance = await Attendance.find(query)
    .sort('date')
    .populate('markedBy', 'name');

  // Calculate stats
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'Present').length;
  const absent = attendance.filter(a => a.status === 'Absent').length;
  const halfDay = attendance.filter(a => a.status === 'Half-Day').length;
  const leave = attendance.filter(a => a.status === 'Leave').length;

  res.status(200).json(
    new ApiResponse(200, { 
      attendance,
      stats: { total, present, absent, halfDay, leave }
    }, 'Student attendance retrieved successfully')
  );
});

// @desc    Update a specific attendance record
// @route   PUT /api/v1/attendance/:id
// @access  Protected (Admin, Principal, Teacher)
exports.updateAttendanceRecord = asyncHandler(async (req, res, next) => {
  const record = await Attendance.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      remarks: req.body.remarks,
      markedBy: req.user.id
    },
    { new: true, runValidators: true }
  );

  if (!record) {
    return next(new ApiError(404, 'Attendance record not found'));
  }

  res.status(200).json(
    new ApiResponse(200, { record }, 'Attendance record updated')
  );
});
