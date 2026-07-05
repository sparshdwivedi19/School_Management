const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  marksObtained: { type: Number, default: 0 },
  maxMarks: { type: Number, required: true },
  isAbsent: { type: Boolean, default: false },
  grade: { type: String }, // Calculated using gradeCalculator
}, { _id: false });

const marksSchema = new mongoose.Schema(
  {
    examination: { type: mongoose.Schema.Types.ObjectId, ref: 'Examination', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    academicSession: { type: String, required: true },
    
    subjectMarks: [subjectMarkSchema],
    
    // Computed aggregates (denormalized for performance)
    totalMarks: { type: Number },
    totalMaxMarks: { type: Number },
    percentage: { type: Number },
    grade: { type: String },
    gpa: { type: Number },
    rank: { type: Number },
    
    isPassed: { type: Boolean },
    remarks: { type: String }, // General remark based on grade
    
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// A student can only have one marks document per examination
marksSchema.index({ examination: 1, student: 1 }, { unique: true });
marksSchema.index({ student: 1, academicSession: 1 });
marksSchema.index({ class: 1, section: 1, examination: 1, rank: 1 });

module.exports = mongoose.model('Marks', marksSchema);
