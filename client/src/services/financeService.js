import api from './api';

export const getFees = (params) => api.get('/fees', { params }).then(r => r.data.data);
export const getFee = (id) => api.get(`/fees/${id}`).then(r => r.data.data);
export const getFeeByStudent = (studentId, params) => api.get(`/fees/student/${studentId}`, { params }).then(r => r.data.data);
export const assignFee = (data) => api.post('/fees/assign', data).then(r => r.data.data);
export const recordPayment = (id, data) => api.post(`/fees/${id}/pay`, data).then(r => r.data.data);
export const getDefaulters = (params) => api.get('/fees/defaulters', { params }).then(r => r.data.data);
export const getFeeAnalytics = (params) => api.get('/fees/analytics', { params }).then(r => r.data.data);
export const getReceiptUrl = (feeId, receiptNumber) => `/api/v1/fees/${feeId}/receipt/${receiptNumber}`;

export const getExpenses = (params) => api.get('/expenses', { params }).then(r => r.data.data);
export const createExpense = (data) => api.post('/expenses', data).then(r => r.data.data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data).then(r => r.data.data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then(r => r.data.data);
export const getExpenseAnalytics = (params) => api.get('/expenses/analytics', { params }).then(r => r.data.data);

export const getSalaryPayments = (params) => api.get('/salary', { params }).then(r => r.data.data);
export const generatePayroll = (data) => api.post('/salary/generate', data).then(r => r.data.data);
export const markSalaryPaid = (id, data) => api.put(`/salary/${id}/pay`, data).then(r => r.data.data);
export const getSalaryAnalytics = (params) => api.get('/salary/analytics', { params }).then(r => r.data.data);
