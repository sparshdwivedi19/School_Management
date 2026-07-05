const SchoolSettings = require('../models/SchoolSettings.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to ensure there's only one settings document
const getSettingsDoc = async () => {
  let settings = await SchoolSettings.findOne();
  if (!settings) {
    settings = await SchoolSettings.create({
      schoolName: 'Suncity School',
      shortName: 'SCS',
      academicSession: '2025-26',
    });
  }
  return settings;
};

exports.getSettings = asyncHandler(async (req, res, next) => {
  const settings = await getSettingsDoc();
  res.status(200).json(new ApiResponse(200, { settings }, 'School settings retrieved'));
});

exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await getSettingsDoc();

  // Protect sensitive fields if user is not admin
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Only admins can update school settings'));
  }

  const updatedSettings = await SchoolSettings.findByIdAndUpdate(
    settings._id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, { settings: updatedSettings }, 'School settings updated successfully'));
});

exports.uploadLogo = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please upload an image file'));
  }

  let settings = await getSettingsDoc();
  settings.logo = req.file.path; // Cloudinary URL
  await settings.save();

  res.status(200).json(new ApiResponse(200, { settings }, 'School logo updated successfully'));
});
