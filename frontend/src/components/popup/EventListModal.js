import React, { useContext } from "react";
import { List, ListItem, ListItemText, Typography, Paper, IconButton, Divider, Stack } from '@mui/material';
import dayjs from 'dayjs';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import GlobalContext from "../../context/GlobalContext";

const EventListPopup = ({ events, onClose }) => {
  const { setCurrentView } = useContext(GlobalContext);

  const handleSeeMoreClick = (e) => {
    e.stopPropagation();
    setCurrentView("day");
  };

  return (
    <Paper 
      className="absolute z-10 shadow-lg rounded p-4" 
      sx={{ 
        width: '320px', 
        maxHeight: '450px', 
        overflowY: 'auto', 
        top: '20%', 
        left: 'calc(50% - 160px)', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Subtle shadow for depth
        borderRadius: '8px', // Rounded corners
        padding: '16px', // Padding inside the paper
        position: 'fixed' // Ensures the popup stays fixed on the page
      }}
    >
      {/* Close button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
          Events
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#5f6368' }}>
          <CloseIcon />
        </IconButton>
      </Stack>
      
      <Divider sx={{ mb: 2 }} />

      {/* List of events */}
      <List sx={{ padding: 0 }}>
        {events.map((evt, idx) => (
          <ListItem 
            key={idx} 
            divider 
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light hover effect
              },
              cursor: 'pointer',
              padding: '10px 16px',
              borderRadius: '4px', // Rounded edges for each item
              marginBottom: '8px', // Space between list items
              transition: 'background-color 0.2s, box-shadow 0.2s', // Smooth hover transitions
            }}
            onClick={handleSeeMoreClick}
          >
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#202124' }}>{evt.title}</Typography>}
              secondary={
                <Typography variant="body2" sx={{ color: '#5f6368' }}>
                  Start date: {dayjs(evt.startDate).format('dddd, MMMM D, YYYY')}
                  <br />
                  Location: {evt.location || 'N/A'}
                </Typography>
              }
            />
            <IconButton 
              edge="end" 
              aria-label="go-to-day" 
              onClick={handleSeeMoreClick}
              sx={{ color: '#1a73e8', marginLeft: 'auto' }} // Blue color for the icon
            >
              <ArrowForwardIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default EventListPopup;
