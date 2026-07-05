const mongoose = require('mongoose');
const { NOTIFICATION_TYPES, ROLES } = require('../config/constants');

const readReceiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readAt: { type: Date, default: Date.now },
}, { _id: false });

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    severity: { type: String, enum: ['info', 'warning', 'error', 'success'], default: 'info' },
    
    // Targeting
    targetRole: [{ type: String, enum: Object.values(ROLES) }], // Empty array means all roles
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Specific users
    
    // Read receipts
    readBy: [readReceiptSchema],
    
    // Action link
    actionUrl: { type: String },
    
    expiresAt: { type: Date }, // Optional: auto-delete after this date
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ targetRole: 1 });
notificationSchema.index({ targetUsers: 1 });
// TTL index for automatic cleanup of expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

module.exports = mongoose.model('Notification', notificationSchema);
