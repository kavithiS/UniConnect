import React, { useEffect, useState } from 'react';
import { groupAPI, recommendationAPI } from '../api/api';
import {
  Container,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';

/**
 * GroupDetails Component
 * Displays detailed information about a specific group
 */
const GroupDetails = ({ groupId, onBack }) => {
  const [group, setGroup] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch group details and recommendations
  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const groupResponse = await groupAPI.getById(groupId);
      setGroup(groupResponse.data.data);

      // Fetch recommended users for this group
      const usersResponse = await recommendationAPI.getUsersForGroup(groupId);
      setRecommendedUsers(usersResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  if (!group) return <Alert severity="warning">Group not found</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button onClick={onBack} sx={{ mb: 2 }}>← Back</Button>

        <h2>{group.title}</h2>
        <p>{group.description}</p>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant={activeTab === 'details' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('details')}
          >
            Details
          </Button>
          <Button
            variant={activeTab === 'members' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('members')}
          >
            Members ({group.members.length})
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommended Users
          </Button>
        </Box>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography><strong>Status:</strong> {group.status}</Typography>
              <Typography><strong>Member Limit:</strong> {group.memberLimit}</Typography>
              <Typography><strong>Current Members:</strong> {group.members.length}</Typography>
              <Box sx={{ mt: 2 }}>
                <strong>Required Skills:</strong>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {group.requiredSkills.map(skill => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <Box>
            {group.members.length === 0 ? (
              <Alert severity="info">No members yet</Alert>
            ) : (
              <Grid container spacing={2}>
                {group.members.map(member => (
                  <Grid item xs={12} sm={6} key={member._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{member.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {member.skills.map(skill => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <Box>
            {recommendedUsers.length === 0 ? (
              <Alert severity="info">No user recommendations available</Alert>
            ) : (
              <Grid container spacing={2}>
                {recommendedUsers.map(user => (
                  <Grid item xs={12} sm={6} key={user._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography color="textSecondary">
                          Match Score: {user.matchScore}%
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {user.skills.map(skill => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default GroupDetails;
