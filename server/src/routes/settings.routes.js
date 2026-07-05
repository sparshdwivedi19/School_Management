const express = require('express');
const { getSettings, updateSettings, uploadLogo } = require('../controllers/settings.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const { uploadLogo: uploadLogoMiddleware } = require('../middleware/upload.middleware');

const router = express.Router();

// All settings routes require authentication
router.use(protect);

router.get('/', getSettings);
router.put('/', restrictTo('admin'), updateSettings);
router.post('/logo', restrictTo('admin'), uploadLogoMiddleware.single('logo'), uploadLogo);

module.exports = router;
