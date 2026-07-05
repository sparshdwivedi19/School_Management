const Joi = require('joi');

// Validate creating/assigning a fee structure to a student
const assignFeeSchema = Joi.object({
  student: Joi.string().required(),
  academicSession: Joi.string().required(),
  class: Joi.string().required(),
  section: Joi.string().required(),
  feeStructure: Joi.array().items(
    Joi.object({
      category: Joi.string().valid('Tuition', 'Exam', 'Transport', 'Miscellaneous', 'Fine').required(),
      description: Joi.string().optional().allow(''),
      amount: Joi.number().min(0).required(),
      dueDate: Joi.date().iso().optional().allow(null),
      month: Joi.string().optional().allow(''),
    })
  ).min(1).required(),
});

// Validate recording a payment against a fee record
const recordPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentMode: Joi.string().valid('Cash', 'Online', 'Cheque', 'DD', 'UPI').required(),
  categories: Joi.array().items(Joi.string()).optional(),
  remarks: Joi.string().optional().allow(''),
  paymentDate: Joi.date().iso().optional(),
});

module.exports = { assignFeeSchema, recordPaymentSchema };
