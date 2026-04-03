import React, { useState } from 'react';
import { groupAPI } from '../api/api';
import { TextField, Button, Container, Box, CircularProgress, Alert } from '@mui/material';

/**
 * GroupForm Component
 * Form to create or update a group
 */
const GroupForm = ({ onSuccess, group = null }) => {
  const [formData, setFormData] = useState(
    group || {
      title: '',
      description: '',
      requiredSkills: '',
      memberLimit: 5
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'memberLimit' ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Convert skills string to array
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill)
      };

      if (group) {
        await groupAPI.update(group._id, payload);
        setSuccess('Group updated successfully!');
      } else {
        await groupAPI.create(payload);
        setSuccess('Group created successfully!');
        setFormData({
          title: '',
          description: '',
          requiredSkills: '',
          memberLimit: 5
        });
      }

      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <h2>{group ? 'Update Group' : 'Create Group'}</h2>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Group Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Required Skills (comma-separated)"
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleChange}
            placeholder="e.g., React, Node.js, MongoDB"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Member Limit"
            name="memberLimit"
            type="number"
            value={formData.memberLimit}
            onChange={handleChange}
            required
            inputProps={{ min: 1, max: 100 }}
            margin="normal"
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : group ? 'Update Group' : 'Create Group'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default GroupForm;
