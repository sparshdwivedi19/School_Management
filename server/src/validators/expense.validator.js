const Joi = require('joi');

const createExpenseSchema = Joi.object({
  title: Joi.string().required(),
  category: Joi.string().valid(
    'Salary', 'Electricity', 'Maintenance', 'Internet', 'Stationery',
    'Events', 'Transportation', 'RentLease', 'Equipment', 'Miscellaneous'
  ).required(),
  amount: Joi.number().positive().required(),
  date: Joi.date().iso().required(),
  month: Joi.string().required(), // e.g. "June 2025"
  academicSession: Joi.string().required(),
  paymentMode: Joi.string().valid('Cash', 'Online', 'Cheque', 'DD', 'UPI').required(),
  vendor: Joi.string().optional().allow(''),
  invoiceNumber: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const updateExpenseSchema = createExpenseSchema.fork(
  Object.keys(createExpenseSchema.describe().keys),
  (schema) => schema.optional()
);

module.exports = { createExpenseSchema, updateExpenseSchema };
