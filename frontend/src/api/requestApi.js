import axios from 'axios';

const API_BASE = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const requestApi = {
  // Send request or invitation
  sendRequest: async (payload) => {
    try {
      const response = await api.post('/api/requests', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get received requests
  getReceivedRequests: async (status = null) => {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await api.get(`/api/requests/received${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get sent requests
  getSentRequests: async (status = null) => {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await api.get(`/api/requests/sent${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Accept request
  acceptRequest: async (requestId) => {
    try {
      const response = await api.put(`/api/requests/${requestId}/accept`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reject request
  rejectRequest: async (requestId) => {
    try {
      const response = await api.put(`/api/requests/${requestId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel request
  cancelRequest: async (requestId) => {
    try {
      const response = await api.delete(`/api/requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
