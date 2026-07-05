// Application-wide constants

const ROLES = Object.freeze({
  ADMIN:     'admin',
  PRINCIPAL: 'principal',
  OPERATOR:  'operator',
  TEACHER:   'teacher',
  STUDENT:   'student',
});

const CLASSES = Object.freeze([
  'Nursery', 'LKG', 'UKG',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
]);

const SECTIONS = Object.freeze(['A', 'B', 'C', 'D', 'E']);

const EXAM_TYPES = Object.freeze(['UnitTest', 'Quarterly', 'HalfYearly', 'Annual', 'Internal']);

const ATTENDANCE_STATUS = Object.freeze(['Present', 'Absent', 'Late', 'Holiday', 'Leave']);

const FEE_CATEGORIES = Object.freeze(['Tuition', 'Exam', 'Transport', 'Miscellaneous', 'Fine']);

const PAYMENT_MODES = Object.freeze(['Cash', 'Online', 'Cheque', 'DD', 'UPI']);

const EXPENSE_CATEGORIES = Object.freeze([
  'Salary', 'Electricity', 'Maintenance', 'Internet', 'Stationery',
  'Events', 'Transportation', 'RentLease', 'Equipment', 'Miscellaneous',
]);

const DOCUMENT_CATEGORIES = Object.freeze([
  'Recognition', 'FireNOC', 'BuildingSafety', 'Affiliation',
  'TeacherVerification', 'Insurance', 'Land', 'Other',
]);

const DOCUMENT_STATUS = Object.freeze(['Valid', 'ExpiringSoon', 'Expired', 'NA']);

const NOTIFICATION_TYPES = Object.freeze([
  'Attendance', 'Fee', 'RTE', 'Document', 'Result', 'Import', 'System', 'AI',
]);

const TOKEN_EXPIRY = Object.freeze({
  ACCESS:  '15m',
  REFRESH: '7d',
  RESET:   '1h',
});

const UPLOAD_LIMITS = Object.freeze({
  PHOTO:    5  * 1024 * 1024,   // 5 MB
  DOCUMENT: 20 * 1024 * 1024,   // 20 MB
  IMPORT:   50 * 1024 * 1024,   // 50 MB
});

module.exports = {
  ROLES,
  CLASSES,
  SECTIONS,
  EXAM_TYPES,
  ATTENDANCE_STATUS,
  FEE_CATEGORIES,
  PAYMENT_MODES,
  EXPENSE_CATEGORIES,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUS,
  NOTIFICATION_TYPES,
  TOKEN_EXPIRY,
  UPLOAD_LIMITS,
};
