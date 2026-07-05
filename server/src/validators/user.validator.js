const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'principal', 'operator', 'teacher', 'student').required(),
  referenceId: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'principal', 'operator', 'teacher', 'student').optional(),
  referenceId: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().optional(),
});

const updatePasswordSchema = Joi.object({
  password: Joi.string().min(6).required()
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema
};
