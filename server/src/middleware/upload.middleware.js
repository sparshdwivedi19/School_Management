const multer = require('multer');
const { logoStorage, photoStorage, documentStorage } = require('../config/cloudinary');
const { UPLOAD_LIMITS } = require('../config/constants');
const ApiError = require('../utils/ApiError');

// Multer filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Not an image! Please upload only images.'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF documents are allowed!'), false);
  }
};

const excelFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only Excel documents are allowed!'), false);
  }
};

exports.uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: UPLOAD_LIMITS.PHOTO },
  fileFilter,
});

exports.uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: UPLOAD_LIMITS.PHOTO },
  fileFilter,
});

exports.uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: UPLOAD_LIMITS.DOCUMENT },
  fileFilter: pdfFilter,
});

exports.uploadExcel = multer({
  dest: 'uploads/temp/', // Local storage temporarily before processing
  limits: { fileSize: UPLOAD_LIMITS.IMPORT },
  fileFilter: excelFilter,
});
