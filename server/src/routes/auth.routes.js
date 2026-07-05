const express = require('express');
const {
  login,
  logout,
  getMe,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  registerStudent,
} = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/register-student', registerStudent);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/change-password', validate(changePasswordSchema), changePassword);

module.exports = router;
