const cloudinary   = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Storage for student/teacher photos
 */
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'suncity/photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

/**
 * Storage for school documents (NOC, certificates, etc.)
 * Stored as raw files (PDF)
 */
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'suncity/documents',
    allowed_formats: ['pdf'],
    resource_type: 'raw',
  },
});

/**
 * Storage for school logo
 */
const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'suncity/branding',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 300, height: 300, crop: 'fit', quality: 'auto' }],
  },
});

module.exports = { cloudinary, photoStorage, documentStorage, logoStorage };
