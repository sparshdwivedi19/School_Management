const ApiError = require('../utils/ApiError');

/**
 * Restrict to certain roles
 * @param  {...string} roles - array of allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set in auth middleware (protect)
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

/**
 * Scopes data based on role (Data Scoping rule)
 * Can be used inside controllers or as a middleware to attach a query filter to req
 */
const scopeData = (req, res, next) => {
  req.scopedQuery = {};
  
  if (req.user.role === 'admin' || req.user.role === 'principal') {
    // Full access, no scope restrictions
    req.scopedQuery = {};
  } else if (req.user.role === 'teacher') {
    // Teachers might only see their own class, or just their own data
    // (Actual logic depends on the specific route and controller)
    // e.g. req.scopedQuery = { class: req.user.teacherRef.classTeacherOf.class }
  } else if (req.user.role === 'student') {
    // Students only see their own data
    req.scopedQuery = { student: req.user.studentRef };
  } else if (req.user.role === 'operator') {
    // Operators might have full access but limited actions (handled by restrictTo)
  }
  
  next();
};

module.exports = { restrictTo, scopeData };
