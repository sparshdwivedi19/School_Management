const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination } = require('../utils/pagination');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Protected (Admin only)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);
  
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);

  let dbQuery = User.find(queryObj).select('-password');

  if (req.query.search) {
    dbQuery = dbQuery.or([
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ]);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    dbQuery = dbQuery.sort(sortBy);
  } else {
    dbQuery = dbQuery.sort('-createdAt');
  }

  dbQuery = dbQuery.skip(skip).limit(limit);

  const users = await dbQuery;
  const total = await User.countDocuments(queryObj);

  res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, 'Users retrieved successfully')
  );
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Protected (Admin only)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.status(200).json(new ApiResponse(200, { user }, 'User retrieved'));
});

// @desc    Create new user
// @route   POST /api/v1/users
// @access  Protected (Admin only)
exports.createUser = asyncHandler(async (req, res, next) => {
  const userExists = await User.findOne({ email: req.body.email });
  
  if (userExists) {
    return next(new ApiError(400, 'User with this email already exists'));
  }

  const user = await User.create(req.body);
  user.password = undefined; // don't send back password

  res.status(201).json(
    new ApiResponse(201, { user }, 'User created successfully')
  );
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Protected (Admin only)
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Prevent password update through this route
  if (req.body.password) {
    delete req.body.password;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'User updated successfully')
  );
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Protected (Admin only)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Prevent deleting oneself
  if (req.params.id === req.user.id) {
    return next(new ApiError(400, 'You cannot delete yourself'));
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.status(200).json(
    new ApiResponse(200, null, 'User deleted successfully')
  );
});
