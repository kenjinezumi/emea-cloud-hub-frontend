import React, { useEffect, useContext } from "react";
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import GlobalContext from "../../context/GlobalContext";


const EventListPopup = ({ events, onClose }) => {

  const {
    setDaySelected,
    setCurrentView,
    daySelected
  } = useContext(GlobalContext);

  const handleSeeMoreClick = (e) => {
    e.stopPropagation();
    setCurrentView("day");
  };

  return (
    <Paper className="absolute z-10 shadow-lg rounded p-4" style={{ width: '300px', maxHeight: '400px', overflowY: 'auto', top: '20%', left: 'calc(50% - 150px)' }}>
       <IconButton onClick={onClose} size="small" sx={{position: 'absolute', right: 8, top: 8}}>
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" style={{ marginBottom: '16px' }}>Events</Typography>
      <List>
        {events.map((evt, idx) => (
          <ListItem 
            key={idx} 
            divider 
           
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light hover effect
              },
              cursor: 'pointer',
              margin: '4px 0',
              padding: '10px',
              borderLeft: '4px solid #1a73e8', // Blue left border for event type indication
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
              transition: 'background-color 0.2s, box-shadow 0.2s', // Smooth transitions for hover effects
            }}>
            <ListItemText
              primary={<Typography variant="h6">{evt.title}</Typography>}
              secondary={
                `Start date: ${dayjs(evt.startDate).format('dddd, MMMM D, YYYY')}\nLocation: ${evt.location || 'N/A'}`
              }
            />
             <IconButton 
                edge="end" 
                aria-label="go-to-day" 
                onClick={handleSeeMoreClick}
                sx={{ color: '#1976d2' }} // Set the icon color to blue
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
