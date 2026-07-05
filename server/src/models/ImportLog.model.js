const mongoose = require('mongoose');

const errorDetailSchema = new mongoose.Schema({
  row: { type: Number },
  field: { type: String },
  value: { type: mongoose.Schema.Types.Mixed },
  message: { type: String },
}, { _id: false });

const duplicateDetailSchema = new mongoose.Schema({
  row: { type: Number },
  admissionNumber: { type: String },
  existingId: { type: mongoose.Schema.Types.ObjectId },
}, { _id: false });

const importLogSchema = new mongoose.Schema(
  {
    importType: { type: String, enum: ['UDISE', 'Students', 'Teachers', 'Fees'], required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number }, // in bytes
    
    status: { 
      type: String, 
      enum: ['Processing', 'Completed', 'Failed', 'PartialSuccess'], 
      default: 'Processing' 
    },
    
    stats: {
      totalRows: { type: Number, default: 0 },
      successRows: { type: Number, default: 0 },
      duplicateRows: { type: Number, default: 0 },
      errorRows: { type: Number, default: 0 },
    },
    
    errors: [errorDetailSchema],
    duplicates: [duplicateDetailSchema],
    
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

importLogSchema.index({ startedAt: -1 });
importLogSchema.index({ importType: 1, status: 1 });

module.exports = mongoose.model('ImportLog', importLogSchema);
