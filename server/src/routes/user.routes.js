const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');

const router = express.Router();

// All user management routes require admin privileges
router.use(protect);
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getUsers)
  .post(validate(createUserSchema), createUser);

router
  .route('/:id')
  .get(getUser)
  .put(validate(updateUserSchema), updateUser)
  .delete(deleteUser);

module.exports = router;
