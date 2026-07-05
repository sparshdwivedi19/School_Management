const Joi = require('joi');

const guardianSchema = Joi.object({
  name: Joi.string().required(),
  relation: Joi.string().required(),
  mobile: Joi.string().required(),
  email: Joi.string().email().optional().allow(''),
  occupation: Joi.string().optional().allow(''),
  education: Joi.string().optional().allow(''),
});

const createStudentSchema = Joi.object({
  admissionNumber: Joi.string().required(),
  name: Joi.string().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  dob: Joi.date().iso().required(),
  aadhaar: Joi.string().optional().allow(''),
  
  bloodGroup: Joi.string().optional().allow(''),
  religion: Joi.string().optional().allow(''),
  caste: Joi.string().optional().allow(''),
  category: Joi.string().valid('General', 'OBC', 'SC', 'ST', 'Other').optional(),
  
  class: Joi.string().required(),
  section: Joi.string().required(),
  rollNumber: Joi.string().optional().allow(''),
  admissionDate: Joi.date().iso().optional(),
  academicSession: Joi.string().required(),
  
  father: guardianSchema.required(),
  mother: guardianSchema.required(),
  localGuardian: guardianSchema.optional(),
  
  address: Joi.object({
    current: Joi.string().required(),
    permanent: Joi.string().required(),
  }).required(),
  
  medicalConditions: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional(),
});

const updateStudentSchema = createStudentSchema.fork(
  Object.keys(createStudentSchema.describe().keys),
  (schema) => schema.optional()
);

module.exports = {
  createStudentSchema,
  updateStudentSchema,
};
