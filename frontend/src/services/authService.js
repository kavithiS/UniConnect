import { getApiBaseUrl } from '../utils/backendUrl';

const TOKEN_KEY = 'authToken';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const jsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const registerUser = async ({ email, password }) => {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
};

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

export const fetchCurrentUser = async (token) => {
  const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: jsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load user');
  }

  return data.user;
};

export const setupUserProfile = async (token, payload) => {
  const response = await fetch(`${getApiBaseUrl()}/profile/setup`, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Profile setup failed');
  }

  return data.user;
};

export const fetchSuggestions = async (token) => {
  const response = await fetch(`${getApiBaseUrl()}/suggestions/me`, {
    headers: jsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load suggestions');
  }

  return data.suggestions;
};

export const fetchFeedbackReceived = async (token, userId) => {
  const route = userId ? `/feedback/received/${userId}` : '/feedback/received';
  const response = await fetch(`${getApiBaseUrl()}${route}`, {
    headers: jsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load feedback');
  }

  return data.data || [];
};

export const fetchFeedbackGiven = async (token) => {
  const response = await fetch(`${getApiBaseUrl()}/feedback/given`, {
    headers: jsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load given feedback');
  }

  return data.data || [];
};

export const createFeedback = async (token, payload) => {
  const response = await fetch(`${getApiBaseUrl()}/feedback`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create feedback');
  }

  return data.data;
};

export const updateFeedback = async (token, feedbackId, payload) => {
  const response = await fetch(`${getApiBaseUrl()}/feedback/${feedbackId}`, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update feedback');
  }

  return data.data;
};

export const deleteFeedback = async (token, feedbackId) => {
  const response = await fetch(`${getApiBaseUrl()}/feedback/${feedbackId}`, {
    method: 'DELETE',
    headers: jsonHeaders(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete feedback');
  }

  return data;
};

export const fetchUsers = async (token) => {
  const response = await fetch(`${getApiBaseUrl()}/users`, {
    headers: jsonHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load users');
  }
  return data.data || [];
};

export const fetchMyMemberGroups = async (token) => {
  const response = await fetch(`${getApiBaseUrl()}/groups/my/members`, {
    headers: jsonHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to load member groups');
  }
  return data.data || [];
};
