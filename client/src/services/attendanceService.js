import api from './api';

export const markAttendance = async (data) => {
  const response = await api.post('/attendance/batch', data);
  return response.data.data;
};

export const getDailyAttendance = async (params) => {
  const response = await api.get('/attendance/daily', { params });
  return response.data.data;
};

export const getStudentAttendance = async (studentId, params) => {
  const response = await api.get(`/attendance/student/${studentId}`, { params });
  return response.data.data;
};

export const updateAttendanceRecord = async (id, data) => {
  const response = await api.put(`/attendance/${id}`, data);
  return response.data.data;
};
