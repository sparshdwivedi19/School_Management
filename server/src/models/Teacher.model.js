const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, required: true, trim: true },
    name:       { type: String, required: true, trim: true },
    qualification: { type: String, required: true },
    subjects:   { type: [String], required: true },
    
    classTeacherOf: {
      class:   { type: String },
      section: { type: String },
    },
    
    // Personal
    gender:  { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dob:     { type: Date },
    aadhaar: { type: String },            // AES-encrypted
    photo:   { type: String },            // Cloudinary URL
    
    // Contact
    mobile:  { type: String, required: true },
    email:   { type: String, lowercase: true },
    address: { type: String },
    
    // Employment
    joiningDate: { type: Date, required: true, default: Date.now },
    designation: { type: String, required: true },
    department:  { type: String },
    salary:      { type: Number, required: true },
    
    bankAccount: {
      accountNumber: { type: String },     // AES-encrypted
      ifsc:          { type: String },
      bankName:      { type: String },
    },
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teacherSchema.index({ employeeId: 1 }, { unique: true });
teacherSchema.index({ isActive: 1 });
teacherSchema.index({ name: 'text', email: 'text', mobile: 'text' });

module.exports = mongoose.model('Teacher', teacherSchema);
