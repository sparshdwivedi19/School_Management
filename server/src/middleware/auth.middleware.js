const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User.model');

/**
 * Protect routes - Verifies JWT and checks if user still exists/is active
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // 1) Get token and check if it's there
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Alternatively, from cookies if we use them
  // else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  if (!token) {
    return next(new ApiError(401, 'You are not logged in! Please log in to get access.'));
  }

  // 2) Verification token
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id).select('+isActive');
  if (!currentUser) {
    return next(new ApiError(401, 'The user belonging to this token does no longer exist.'));
  }

  // 4) Check if user is active
  if (!currentUser.isActive) {
    return next(new ApiError(403, 'Your account has been deactivated. Please contact an administrator.'));
  }

  // 5) (Optional) Check if user changed password after the token was issued
  // We can add passwordChangedAt field to User schema and check here
  
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

module.exports = { protect };
