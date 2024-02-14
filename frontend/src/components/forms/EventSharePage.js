import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Paper,
  Typography,
  Stack,
  Divider,
} from '@mui/material';

// Mock API call function 
const fetchEventDetails = async (eventId) => {
  // Example:
  const response = await fetch(`https://blablablabla.com/events/${eventId}`);
  if (!response.ok) {
    throw new Error('whataver');
  }
  return response.json();
};

function ShareEventPage() {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventDetails(eventId)
      .then(data => {
        setEventDetails(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch event details:', error);
        setError('Failed to load event details.');
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Display event details
  return (
    <Paper elevation={3} sx={{ padding: 2, margin: 'auto', maxWidth: 600, mt: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5" component="h2">{eventDetails.title}</Typography>
        <Divider />
        {/* Display other event details */}
        {/* Ensure you replace these placeholders with actual event data properties */}
        <Typography variant="body1">Date: {eventDetails.date}</Typography>
        <Typography variant="body1">Location: {eventDetails.location}</Typography>
        {/* Add more details as needed */}
      </Stack>
    </Paper>
  );
}

export default ShareEventPage;
