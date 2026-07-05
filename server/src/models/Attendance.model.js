const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const attendanceRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status:  { type: String, enum: ATTENDANCE_STATUS, required: true },
  remark:  { type: String },
}, { _id: false });

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // Stored as UTC midnight
    class: { type: String, required: true },
    section: { type: String, required: true },
    academicSession: { type: String, required: true },
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    records: [attendanceRecordSchema],
    
    summary: {
      totalStudents: { type: Number, default: 0 },
      present:       { type: Number, default: 0 },
      absent:        { type: Number, default: 0 },
      late:          { type: Number, default: 0 },
      percentage:    { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Enforce one attendance document per class-section per day
attendanceSchema.index({ date: 1, class: 1, section: 1 }, { unique: true });
attendanceSchema.index({ date: 1, class: 1, section: 1, academicSession: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
