import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Stack, Divider } from '@mui/material';

// Adjusted API call function to hit your backend endpoint
const fetchEventDetails = async (eventId) => {
  // Replace this URL with your actual endpoint that fetches event details
  const response = await fetch(`https://backend.cloudhub.googleplex.com/event/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event details');
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
      .then((data) => {
        setEventDetails(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch event details:', error);
        setError('Failed to load event details.');
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Display event details with improved structure
  return (
    <Paper elevation={3} sx={{ padding: 2, margin: 'auto', maxWidth: 600, mt: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h5" component="h2">{eventDetails.title}</Typography>
        <Divider />
        {/* Display more detailed event information */}
        <Typography variant="body1">Start Date: {new Date(eventDetails.startDate).toLocaleString()}</Typography>
        <Typography variant="body1">End Date: {new Date(eventDetails.endDate).toLocaleString()}</Typography>
        <Typography variant="body1">Location: {eventDetails.location}</Typography>
        <Typography variant="body1">Organised By: {eventDetails.organisedBy}</Typography>
        <Typography variant="body1">Event Type: {eventDetails.eventType}</Typography>
        <Typography variant="body1">Description: {eventDetails.description}</Typography>
        {/* Add more event details as per your requirement */}
        {eventDetails.landingPageLink && (
          <Typography variant="body1">
            Landing Page: <a href={eventDetails.landingPageLink} target="_blank" rel="noreferrer">Click Here</a>
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default ShareEventPage;
