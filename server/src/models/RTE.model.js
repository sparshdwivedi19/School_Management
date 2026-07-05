const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  receivedDate: { type: Date, required: true },
  remarks: { type: String },
  referenceNumber: { type: String },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const rteSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    academicSession: { type: String, required: true },
    
    eligibilityStatus: { 
      type: String, 
      enum: ['Eligible', 'Approved', 'Rejected', 'Pending'], 
      default: 'Pending' 
    },
    applicationDate: { type: Date },
    approvalDate: { type: Date },
    
    reimbursementAmount: { type: Number, required: true }, // expected per govt rate
    receivedAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 }, // computed
    
    payments: [paymentSchema],
    documents: [documentSchema],
    
    remarks: { type: String },
  },
  { timestamps: true }
);

rteSchema.index({ student: 1, academicSession: 1 }, { unique: true });
rteSchema.index({ eligibilityStatus: 1 });

rteSchema.pre('save', function (next) {
  this.receivedAmount = this.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  this.pendingAmount = Math.max(0, this.reimbursementAmount - this.receivedAmount);
  next();
});

module.exports = mongoose.model('RTE', rteSchema);
