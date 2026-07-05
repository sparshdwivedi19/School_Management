const Joi = require('joi');

const createExamSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('UnitTest', 'Quarterly', 'HalfYearly', 'Annual', 'Internal').required(),
  academicSession: Joi.string().required(),
  class: Joi.string().required(),
  section: Joi.string().required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  subjects: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      code: Joi.string().optional().allow(''),
      maxMarks: Joi.number().min(1).required(),
      passingMarks: Joi.number().min(0).required(),
      examDate: Joi.date().iso().optional(),
      duration: Joi.number().optional(),
    })
  ).min(1).required(),
});

const updateExamSchema = createExamSchema.fork(
  Object.keys(createExamSchema.describe().keys),
  (s) => s.optional()
);

// Bulk marks entry schema
const bulkMarksSchema = Joi.object({
  examinationId: Joi.string().required(),
  entries: Joi.array().items(
    Joi.object({
      studentId: Joi.string().required(),
      subjectMarks: Joi.array().items(
        Joi.object({
          subject: Joi.string().required(),
          marksObtained: Joi.number().min(0).required(),
          maxMarks: Joi.number().min(1).required(),
          isAbsent: Joi.boolean().optional(),
        })
      ).required(),
    })
  ).min(1).required(),
});

module.exports = { createExamSchema, updateExamSchema, bulkMarksSchema };
