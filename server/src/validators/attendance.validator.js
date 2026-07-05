const Joi = require('joi');

const markAttendanceSchema = Joi.object({
  date: Joi.date().iso().required(),
  class: Joi.string().required(),
  section: Joi.string().required(),
  records: Joi.array().items(
    Joi.object({
      studentId: Joi.string().required(),
      status: Joi.string().valid('Present', 'Absent', 'Half-Day', 'Leave').required(),
      remarks: Joi.string().optional().allow('')
    })
  ).required()
});

const updateAttendanceRecordSchema = Joi.object({
  status: Joi.string().valid('Present', 'Absent', 'Half-Day', 'Leave').required(),
  remarks: Joi.string().optional().allow('')
});

module.exports = {
  markAttendanceSchema,
  updateAttendanceRecordSchema
};
