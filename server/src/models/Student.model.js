const mongoose = require('mongoose');
const { CLASSES, SECTIONS } = require('../config/constants');

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: { type: String, unique: true, required: true, trim: true },

    // Personal
    name:       { type: String, required: true, trim: true },
    fatherName: { type: String, trim: true },
    motherName: { type: String, trim: true },
    gender:     { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob:        { type: Date },
    aadhaar:    { type: String },            // AES-encrypted
    photo:      { type: String },            // Cloudinary URL
    bloodGroup: { type: String },

    // Academic
    class:           { type: String, enum: CLASSES, required: true },
    section:         { type: String, enum: SECTIONS, required: true },
    rollNumber:      { type: Number },
    academicSession: { type: String, required: true },
    admissionDate:   { type: Date, default: Date.now },
    previousSchool:  { type: String },

    // RTE (Right to Education)
    isRTE:                 { type: Boolean, default: false },
    rteApprovalStatus:     { type: String, enum: ['Pending', 'Approved', 'Rejected', 'NA'], default: 'NA' },
    rteReimbursementAmount:{ type: Number, default: 0 }, // per class rate from SchoolSettings

    // Contact
    mobile:          { type: String },
    alternateMobile: { type: String },
    email:           { type: String, lowercase: true },
    address: {
      street:  String,
      city:    String,
      pincode: String,
    },

    // Fee category
    feeCategory: {
      type: String,
      enum: ['Regular', 'RTE', 'Scholarship', 'Staff'],
      default: 'Regular',
    },

    // Status
    isActive:   { type: Boolean, default: true },
    leftDate:   Date,
    tcIssued:   { type: Boolean, default: false },
    tcIssuedOn: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
studentSchema.index({ admissionNumber: 1 }, { unique: true });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ academicSession: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ isRTE: 1 });
studentSchema.index({ name: 'text', fatherName: 'text', mobile: 'text', admissionNumber: 'text' });

module.exports = mongoose.model('Student', studentSchema);
