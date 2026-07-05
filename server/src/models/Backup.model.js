const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Manual', 'Scheduled'], required: true },
    status: { type: String, enum: ['Running', 'Completed', 'Failed'], default: 'Running' },
    format: { type: String, enum: ['JSON', 'Excel'], required: true },
    
    fileUrl: { type: String }, // e.g., Google Drive link or path
    fileSize: { type: Number },
    collections: [{ type: String }], // Which collections were backed up
    
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    expiresAt: { type: Date }, // Optional: auto-delete old backups
  },
  { timestamps: true }
);

backupSchema.index({ startedAt: -1 });
backupSchema.index({ type: 1, status: 1 });
// TTL index for automatic cleanup of expired backup records (not the actual files, just records)
backupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

module.exports = mongoose.model('Backup', backupSchema);
