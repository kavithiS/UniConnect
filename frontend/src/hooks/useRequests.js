import { useState, useEffect } from 'react';
import { requestApi } from '../api/requestApi';

export const useRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch received requests
  const fetchReceivedRequests = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestApi.getReceivedRequests(status);
      setReceivedRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching received requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sent requests
  const fetchSentRequests = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestApi.getSentRequests(status);
      setSentRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching sent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send request
  const sendRequest = async (groupId, requestType, message = '', toUserId = null) => {
    try {
      setLoading(true);
      setError(null);
      const payload = { groupId, requestType, message };
      if (toUserId) payload.toUserId = toUserId;
      
      const response = await requestApi.sendRequest(payload);
      await fetchSentRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Accept request
  const acceptRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApi.acceptRequest(requestId);
      await fetchReceivedRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject request
  const rejectRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApi.rejectRequest(requestId);
      await fetchReceivedRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel request
  const cancelRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApi.cancelRequest(requestId);
      await fetchSentRequests(); // Refresh list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load both on mount
  useEffect(() => {
    fetchReceivedRequests();
    fetchSentRequests();
  }, []);

  return {
    receivedRequests,
    sentRequests,
    loading,
    error,
    fetchReceivedRequests,
    fetchSentRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest
  };
};
