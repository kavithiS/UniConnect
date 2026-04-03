import React, { useState } from 'react';
import { joinRequestAPI } from '../api/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

/**
 * JoinRequestPanel Component
 * Modal for users to send join requests to groups
 */
const JoinRequestPanel = ({ open, onClose, groupId, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!userId || !groupId) {
      setError('User ID and Group ID are required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await joinRequestAPI.send({
        userId,
        groupId
      });

      setSuccess('Join request sent successfully!');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request to Join Group</DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TextField
          fullWidth
          label="Group ID"
          value={groupId || ''}
          disabled
          margin="normal"
        />

        <TextField
          fullWidth
          label="User ID"
          value={userId || ''}
          disabled
          margin="normal"
        />

        <p sx={{ mt: 2, fontSize: 14, color: '#666' }}>
          Are you sure you want to request to join this group?
        </p>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinRequestPanel;
