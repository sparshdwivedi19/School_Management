import api from './api';

export const getStudents = async (params) => {
  const response = await api.get('/students', { params });
  return response.data.data;
};

export const getStudent = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data.data;
};

export const createStudent = async (data) => {
  const response = await api.post('/students', data);
  return response.data.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data.data;
};

export const uploadStudentPhoto = async (id, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await api.post(`/students/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};
