import api from './api';

export const getExams = (params) => api.get('/exams', { params }).then(r => r.data.data);
export const getExam = (id) => api.get(`/exams/${id}`).then(r => r.data.data);
export const createExam = (data) => api.post('/exams', data).then(r => r.data.data);
export const updateExam = (id, data) => api.put(`/exams/${id}`, data).then(r => r.data.data);
export const deleteExam = (id) => api.delete(`/exams/${id}`).then(r => r.data.data);
export const publishResult = (id) => api.put(`/exams/${id}/publish`).then(r => r.data.data);

export const bulkEnterMarks = (data) => api.post('/exams/marks/bulk', data).then(r => r.data.data);
export const getExamMarks = (examId) => api.get(`/exams/${examId}/marks`).then(r => r.data.data);
export const getStudentMarks = (studentId) => api.get(`/exams/marks/student/${studentId}`).then(r => r.data.data);

export const getReportCardUrl = (studentId, examinationId) =>
  `/api/v1/exams/report-card/${studentId}/${examinationId}`;
