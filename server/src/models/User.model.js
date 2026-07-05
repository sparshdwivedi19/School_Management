const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    phone: { type: String, trim: true },
    avatar: { type: String },

    // Role-specific refs
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    teacherRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },

    // Status
    isActive: { type: Boolean, default: true },

    // Password reset
    resetPasswordToken:  String,
    resetPasswordExpire: Date,

    // Security
    loginAttempts: { type: Number, default: 0 },
    lockUntil:     Date,
    lastLogin:     Date,

    // Force password change on first login
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ─── Virtual: isLocked ──────────────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─── Pre-save: hash password ─────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Method: compare password ────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: increment login attempts ───────────────────────────────────────
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS   = 5;
  const LOCK_TIME_MS   = 30 * 60 * 1000; // 30 minutes

  if (this.lockUntil && this.lockUntil < Date.now()) {
    // Lock expired — reset
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME_MS };
  }
  return this.updateOne(updates);
};

// ─── Method: generate password reset token ──────────────────────────────────
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
