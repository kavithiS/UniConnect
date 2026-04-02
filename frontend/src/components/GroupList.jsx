import React, { useEffect, useState } from 'react';
import { groupAPI } from '../api/api';
import { Container, Box, CircularProgress, Alert, Grid, Card, CardContent, Button } from '@mui/material';

/**
 * GroupList Component
 * Displays all groups in a grid layout
 */
const GroupList = ({ onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await groupAPI.getAll();
      setGroups(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <h2>Groups</h2>
        <Button variant="contained" color="primary" sx={{ mb: 3 }} onClick={() => window.location.href = '/create-group'}>
          Create New Group
        </Button>

        {groups.length === 0 ? (
          <Alert severity="info">No groups found. Create one to get started!</Alert>
        ) : (
          <Grid container spacing={3}>
            {groups.map(group => (
              <Grid item xs={12} sm={6} md={4} key={group._id}>
                <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                    <p><strong>Status:</strong> {group.status}</p>
                    <p><strong>Members:</strong> {group.members.length}/{group.memberLimit}</p>
                    <p><strong>Skills:</strong> {group.requiredSkills.join(', ') || 'None'}</p>

                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => onSelectGroup(group._id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default GroupList;
