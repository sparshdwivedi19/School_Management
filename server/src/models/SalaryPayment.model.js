const mongoose = require('mongoose');
const { PAYMENT_MODES } = require('../config/constants');

const salaryPaymentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    month: { type: String, required: true }, // e.g., "June 2025"
    academicSession: { type: String, required: true },
    
    basicSalary: { type: Number, required: true },
    allowances:  { type: Number, default: 0 },
    deductions:  { type: Number, default: 0 },
    netSalary:   { type: Number, required: true },
    
    status: { type: String, enum: ['Pending', 'Paid', 'Partial', 'OnHold'], default: 'Pending' },
    paidDate: { type: Date },
    paymentMode: { type: String, enum: PAYMENT_MODES },
    transactionId: { type: String },
    
    remarks: { type: String },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

salaryPaymentSchema.index({ teacher: 1, month: 1 }, { unique: true });
salaryPaymentSchema.index({ month: 1, status: 1, academicSession: 1 });

module.exports = mongoose.model('SalaryPayment', salaryPaymentSchema);
