const mongoose = require('mongoose');
const { EXAM_TYPES } = require('../config/constants');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  maxMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  examDate: { type: Date },
  duration: { type: Number }, // in minutes
}, { _id: false });

const examinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Unit Test 1", "Half Yearly"
    type: { type: String, enum: EXAM_TYPES, required: true },
    academicSession: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true }, // Can be "All" if applied to whole class
    
    subjects: [subjectSchema],
    
    status: { 
      type: String, 
      enum: ['Scheduled', 'Ongoing', 'Completed', 'ResultPublished'], 
      default: 'Scheduled' 
    },
    startDate: { type: Date },
    endDate:   { type: Date },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

examinationSchema.index({ academicSession: 1, class: 1, section: 1, type: 1 });

module.exports = mongoose.model('Examination', examinationSchema);
