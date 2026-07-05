const Joi = require('joi');

const createTeacherSchema = Joi.object({
  employeeId: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  dob: Joi.date().iso().required(),
  doj: Joi.date().iso().required(),
  
  qualification: Joi.string().required(),
  experience: Joi.number().min(0).optional(),
  
  designation: Joi.string().required(),
  subjects: Joi.array().items(Joi.string()).optional(),
  
  address: Joi.object({
    current: Joi.string().required(),
    permanent: Joi.string().required(),
  }).required(),
  
  bankDetails: Joi.object({
    accountNumber: Joi.string().allow(''),
    ifscCode: Joi.string().allow(''),
    bankName: Joi.string().allow(''),
  }).optional(),
  
  aadhaar: Joi.string().allow(''),
  pan: Joi.string().allow(''),
  isActive: Joi.boolean().optional(),
});

const updateTeacherSchema = createTeacherSchema.fork(
  Object.keys(createTeacherSchema.describe().keys),
  (schema) => schema.optional()
);

module.exports = {
  createTeacherSchema,
  updateTeacherSchema,
};
