const mongoose = require('mongoose');

const classFeeSchema = new mongoose.Schema({
  class: { type: String },
  amount: { type: Number, default: 0 },
}, { _id: false });

const categoryAmountSchema = new mongoose.Schema({
  category: { type: String },
  amount: { type: Number, default: 0 },
}, { _id: false });

const financialReportSchema = new mongoose.Schema(
  {
    reportType: { type: String, enum: ['Monthly', 'Quarterly', 'Annual'], required: true },
    period: { type: String, required: true }, // e.g., "2025-06", "2025-Q2", "2025-26"
    academicSession: { type: String, required: true },
    
    revenue: {
      totalFeeCollected: { type: Number, default: 0 },
      byClass: [classFeeSchema],
      byCategory: [categoryAmountSchema],
    },
    
    expenses: {
      total: { type: Number, default: 0 },
      salaries: { type: Number, default: 0 },
      byCategory: [categoryAmountSchema],
    },
    
    rte: {
      expected: { type: Number, default: 0 },
      received: { type: Number, default: 0 },
      pending:  { type: Number, default: 0 },
    },
    
    profit: { type: Number, default: 0 }, // revenue.totalFeeCollected - expenses.total
    profitMargin: { type: Number, default: 0 }, // (profit / revenue) * 100
    
    isStale: { type: Boolean, default: false }, // Set to true if underlying data changed since generation
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// We usually want one report per type per period per session
financialReportSchema.index({ reportType: 1, period: 1, academicSession: 1 }, { unique: true });

module.exports = mongoose.model('FinancialReport', financialReportSchema);
