const { v4: uuidv4 } = require('uuid');

/**
 * Generate a sequential receipt number: RCP-YYYYMM-XXXX
 * XXXX is random 4-char alphanumeric for uniqueness
 */
const generateReceiptNumber = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand  = uuidv4().replace(/-/g, '').slice(0, 5).toUpperCase();
  return `RCP-${year}${month}-${rand}`;
};

/**
 * Generate employee ID: EMP-YYYY-XXX
 */
const generateEmployeeId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `EMP-${year}-${rand}`;
};

/**
 * Get current academic session string based on April start
 * e.g. if current date is June 2025 → "2025-26"
 *      if current date is Feb 2026 → "2025-26"
 */
const getCurrentSession = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based
  const startYear = month >= 4 ? year : year - 1;
  const endYear   = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYear}`;
};

/**
 * Format Indian currency: ₹1,23,456.00
 */
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Get month string from date: "June 2025"
 */
const getMonthLabel = (date = new Date()) => {
  return new Date(date).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

module.exports = {
  generateReceiptNumber,
  generateEmployeeId,
  getCurrentSession,
  formatCurrency,
  formatDate,
  getMonthLabel,
};
