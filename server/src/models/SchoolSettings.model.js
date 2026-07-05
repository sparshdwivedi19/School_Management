const mongoose = require('mongoose');
const { CLASSES, SECTIONS, PAYMENT_MODES } = require('../config/constants');

const feeStructureSchema = new mongoose.Schema({
  className:    { type: String, enum: CLASSES },
  section:      { type: String, enum: SECTIONS },
  tuitionFee:   { type: Number, default: 0 },
  examFee:      { type: Number, default: 0 },
  transportFee: { type: Number, default: 0 },
  miscFee:      { type: Number, default: 0 },
}, { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } });

feeStructureSchema.virtual('totalFee').get(function() {
  return this.tuitionFee + this.examFee + this.transportFee + this.miscFee;
});

const schoolSettingsSchema = new mongoose.Schema(
  {
    schoolName:  { type: String, required: true, default: 'Suncity School' },
    shortName:   { type: String, default: 'SCS' },
    logo:        { type: String },

    address: {
      street:   String,
      city:     String,
      district: String,
      state:    { type: String, default: 'Rajasthan' },
      pincode:  String,
    },

    contact: {
      phone:    String,
      altPhone: String,
      email:    String,
      website:  String,
    },

    principalName:    { type: String },
    academicSession:  { type: String, default: '2025-26' },
    schoolCode:       String,
    udiseCode:        String,
    affiliationNumber:String,
    board:            { type: String, enum: ['CBSE','ICSE','State Board','Other'], default: 'CBSE' },

    // Nursery to Class 10 — confirmed
    classes:  { type: [String], default: ['Nursery','LKG','UKG','1','2','3','4','5','6','7','8','9','10'] },
    sections: { type: [String], default: ['A','B','C','D'] },

    // Section-specific fee structure (confirmed)
    feeStructure: [feeStructureSchema],

    // Email config (stored encrypted)
    smtpConfig: {
      host: String,
      port: { type: Number, default: 587 },
      user: String,
      pass: { type: String, select: false },
    },

    // Twilio SMS (WhatsApp API not available — confirmed)
    twilioConfig: {
      sid:   { type: String, select: false },
      token: { type: String, select: false },
      from:  String,
    },

    // OpenAI (confirmed)
    openaiApiKey: { type: String, select: false },

    // RTE reimbursement rates per class (varies by class — confirmed)
    rteRates: [{
      className: { type: String, enum: CLASSES },
      annualAmount: { type: Number, default: 0 }, // govt rate per student per year
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchoolSettings', schoolSettingsSchema);
