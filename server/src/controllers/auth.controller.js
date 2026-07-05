const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { TOKEN_EXPIRY } = require('../config/constants');
// const emailService = require('../services/email.service'); // To be implemented

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: TOKEN_EXPIRY.ACCESS,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: TOKEN_EXPIRY.REFRESH,
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Set refresh token in HttpOnly cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json(
    new ApiResponse(statusCode, { accessToken, user }, 'Logged in successfully')
  );
};

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  // Check if locked out
  if (user.isLocked) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return next(new ApiError(429, `Account locked due to multiple failed attempts. Try again in ${remainingTime} minutes.`));
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return next(new ApiError(401, 'Invalid email or password'));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }
  
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // expire in 10 sec
    httpOnly: true,
  });
  
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json(new ApiResponse(200, { user }, 'User details retrieved'));
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  
  if (!token) {
    return next(new ApiError(401, 'Not authorized to refresh token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User no longer exists or is inactive'));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new ApiError(401, 'Invalid refresh token'));
  }
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(404, 'There is no user with that email address.'));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  // TODO: Send email using emailService

  res.status(200).json(new ApiResponse(200, null, 'Password reset token generated (email service pending)'));
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, 'Token is invalid or has expired'));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.mustChangePassword = false;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new ApiError(401, 'Incorrect current password'));
  }

  user.password = req.body.newPassword;
  user.mustChangePassword = false;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.registerStudent = asyncHandler(async (req, res, next) => {
  const { name, fatherName, dob, email, password, class: studentClass, section } = req.body;

  if (!name || !fatherName || !dob || !email || !password || !studentClass || !section) {
    return next(new ApiError(400, 'Please provide all required fields'));
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, 'Email is already registered'));
  }

  // Generate admission number
  const count = await Student.countDocuments();
  const admissionNumber = `SC${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;

  // Create student record
  const student = await Student.create({
    name,
    fatherName,
    dob,
    email,
    class: studentClass,
    section,
    academicSession: '2025-26', // Default for now
    admissionNumber,
    gender: 'Other', // Set default to pass validation if not provided
  });

  // Create user record
  const user = await User.create({
    name,
    email,
    password, // Handled by pre-save hook
    role: 'student',
    studentRef: student._id,
  });

  // Update student with user ref
  student.createdBy = user._id;
  await student.save();

  // Send token
  sendTokenResponse(user, 201, res);
});

