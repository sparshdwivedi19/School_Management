const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ['Principal', 'Accountant', 'StudentCoach', 'Assistant'], 
      required: true 
    },
    query: { type: String }, // Original user question/prompt, if applicable
    contextSnapshot: { type: mongoose.Schema.Types.Mixed }, // Data snapshot used for generation
    response: { type: String, required: true }, // AI markdown response
    
    generatedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // if student-specific
    
    tokens: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
    },
    model: { type: String, default: 'gpt-4o' },
    durationMs: { type: Number },
    
    feedback: { type: String, enum: ['helpful', 'not_helpful'] },
  },
  { timestamps: true }
);

aiInsightSchema.index({ type: 1, generatedFor: 1, createdAt: -1 });
// TTL Index: automatically delete records after 90 days (60*60*24*90 = 7776000 seconds)
aiInsightSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AIInsight', aiInsightSchema);
