const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES, PAYMENT_MODES } = require('../config/constants');

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    month: { type: String, required: true }, // e.g., "June 2025"
    academicSession: { type: String, required: true },
    paymentMode: { type: String, enum: PAYMENT_MODES, required: true },
    
    vendor: { type: String },
    invoiceNumber: { type: String },
    invoiceUrl: { type: String }, // Uploaded document url
    notes: { type: String },
    
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

expenseSchema.index({ date: 1, category: 1, academicSession: 1 });
expenseSchema.index({ month: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
