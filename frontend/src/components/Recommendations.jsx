import React, { useEffect, useState } from 'react';
import { recommendationAPI } from '../api/api';
import {
  Container,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField
} from '@mui/material';

/**
 * Recommendations Component
 * Displays AI-based group and user recommendations
 */
const Recommendations = ({ userId, isUserRecommendations = true }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch recommendations on component mount
  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (isUserRecommendations) {
        response = await recommendationAPI.getGroupsForUser(userId);
      } else {
        response = await recommendationAPI.getUsersForGroup(userId);
      }
      setRecommendations(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Filter recommendations based on search term
  const filteredRecommendations = recommendations.filter(item => {
    const searchText = (item.title || item.name || '').toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <h2>
          {isUserRecommendations ? 'Recommended Groups For You' : 'Recommended Users'}
        </h2>

        <TextField
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3, width: '100%', maxWidth: 300 }}
        />

        {filteredRecommendations.length === 0 ? (
          <Alert severity="info">No recommendations found</Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredRecommendations.map(item => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <h3>{item.title || item.name}</h3>

                    {isUserRecommendations && (
                      <p>{item.description}</p>
                    )}

                    <Box sx={{ mb: 2 }}>
                      <strong>Match Score: {item.matchScore}%</strong>
                      <Box sx={{
                        mt: 1,
                        height: 8,
                        backgroundColor: '#e0e0e0',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          height: '100%',
                          width: `${item.matchScore}%`,
                          backgroundColor: item.matchScore >= 75 ? '#4caf50' : item.matchScore >= 50 ? '#ff9800' : '#f44336',
                          transition: 'width 0.3s'
                        }} />
                      </Box>
                    </Box>

                    {isUserRecommendations && item.availableSlots !== undefined && (
                      <p><strong>Available Slots:</strong> {item.availableSlots}</p>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {isUserRecommendations
                        ? item.requiredSkills?.map(skill => (
                          <Chip key={skill} label={skill} size="small" />
                        ))
                        : item.skills?.map(skill => (
                          <Chip key={skill} label={skill} size="small" />
                        ))
                      }
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 2 }}>
                    <Button fullWidth variant="contained" color="primary">
                      {isUserRecommendations ? 'Request to Join' : 'Invite User'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Recommendations;
