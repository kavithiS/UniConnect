import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============ GROUP ENDPOINTS ============
export const groupAPI = {
  create: (data) => api.post('/groups', data),
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  getByCode: (code) => api.get(`/groups/code/${code}`),
  update: (id, data) => api.put(`/groups/${id}`, data),
  archive: (id) => api.delete(`/groups/${id}`),
  delete: (id) => api.delete(`/groups/${id}`)
};

// ============ USER ENDPOINTS ============
export const userAPI = {
  create: (data) => api.post('/users', data),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// ============ JOIN REQUEST ENDPOINTS ============
export const joinRequestAPI = {
  send: (data) => api.post('/requests', data),
  getAll: () => api.get('/requests'),
  getStudentRequests: (userId) => api.get(`/requests/student/${userId}`),
  getGroupRequests: (groupId) => api.get(`/requests/group/${groupId}`),
  update: (id, data) => api.put(`/requests/${id}`, data),
  checkExpiration: () => api.put('/requests/check-expiration'),
  closeForGroup: (groupId) => api.put(`/requests/close-for-group/${groupId}`),
  cancel: (id) => api.delete(`/requests/${id}`)
};

// ============ INVITATION ENDPOINTS ============
export const invitationAPI = {
  send: (data) => api.post('/invitations', data),
  getStudentInvitations: (studentId) => api.get(`/invitations/student/${studentId}`),
  getGroupInvitations: (groupId) => api.get(`/invitations/group/${groupId}`),
  accept: (invitationId) => api.put(`/invitations/${invitationId}/accept`),
  decline: (invitationId, data) => api.put(`/invitations/${invitationId}/decline`, data),
  withdraw: (invitationId) => api.put(`/invitations/${invitationId}/withdraw`)
};

// ============ RECOMMENDATION ENDPOINTS ============
export const recommendationAPI = {
  getGroupsForUser: (userId) => api.get(`/recommend/groups/${userId}`),
  getUsersForGroup: (groupId) => api.get(`/recommend/users/${groupId}`)
};

export default api;
