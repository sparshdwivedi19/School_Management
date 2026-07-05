const mongoose = require('mongoose');
const { FEE_CATEGORIES, PAYMENT_MODES } = require('../config/constants');

const feeStructureItemSchema = new mongoose.Schema({
  category: { type: String, enum: FEE_CATEGORIES, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  month: { type: String }, // e.g., "April 2025"
}, { _id: false });

const paymentRecordSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMode: { type: String, enum: PAYMENT_MODES, required: true },
  categories: [{ type: String, enum: FEE_CATEGORIES }], // What this payment covers
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: { type: String },
  receiptUrl: { type: String }, // URL to generated PDF receipt
}, { _id: false });

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    academicSession: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    
    // The specific structure applied to this student for the year
    feeStructure: [feeStructureItemSchema],
    
    payments: [paymentRecordSchema],
    
    // Computed fields for fast querying
    totalFee: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
    lastPaymentDate: { type: Date },
    
    isDefaulter: { type: Boolean, default: false },
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, academicSession: 1 }, { unique: true }); // One fee record per student per session
feeSchema.index({ class: 1, section: 1, isDefaulter: 1 });
feeSchema.index({ 'payments.receiptNumber': 1 });

// Pre-save middleware to calculate totals
feeSchema.pre('save', function (next) {
  this.totalFee = this.feeStructure.reduce((sum, item) => sum + (item.amount || 0), 0);
  this.totalPaid = this.payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
  this.totalDue = Math.max(0, this.totalFee - this.totalPaid);
  this.isDefaulter = this.totalDue > 0;
  
  if (this.payments.length > 0) {
    this.lastPaymentDate = this.payments[this.payments.length - 1].paymentDate;
  }
  
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
