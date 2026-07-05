const mongoose = require('mongoose');
const { DOCUMENT_CATEGORIES, DOCUMENT_STATUS } = require('../config/constants');

const reminderSchema = new mongoose.Schema({
  sentAt: { type: Date },
  type: { type: String, enum: ['30days', '15days', '7days', 'expired'] },
}, { _id: false });

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: DOCUMENT_CATEGORIES, required: true },
    description: { type: String },
    
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    fileSize: { type: Number },
    
    issueDate: { type: Date },
    expiryDate: { type: Date },
    issuedBy: { type: String }, // issuing authority name
    
    // Computed
    daysUntilExpiry: { type: Number }, // recalculated via cron
    status: { type: String, enum: DOCUMENT_STATUS, default: 'NA' },
    
    renewalReminders: [reminderSchema],
    
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ expiryDate: 1 });

// Pre-save to calculate status and days
documentSchema.pre('save', function (next) {
  if (this.expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(this.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    this.daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (this.daysUntilExpiry < 0) {
      this.status = 'Expired';
    } else if (this.daysUntilExpiry <= 30) {
      this.status = 'ExpiringSoon';
    } else {
      this.status = 'Valid';
    }
  } else {
    this.status = 'NA';
    this.daysUntilExpiry = null;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
