import api from './api';

export const getTeachers = async (params) => {
  const response = await api.get('/teachers', { params });
  return response.data.data;
};

export const getTeacher = async (id) => {
  const response = await api.get(`/teachers/${id}`);
  return response.data.data;
};

export const createTeacher = async (data) => {
  const response = await api.post('/teachers', data);
  return response.data.data;
};

export const updateTeacher = async (id, data) => {
  const response = await api.put(`/teachers/${id}`, data);
  return response.data.data;
};

export const deleteTeacher = async (id) => {
  const response = await api.delete(`/teachers/${id}`);
  return response.data.data;
};

export const uploadTeacherPhoto = async (id, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await api.post(`/teachers/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};
