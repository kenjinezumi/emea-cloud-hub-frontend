import React, { useContext } from 'react';
import dayjs from 'dayjs';
import GlobalContext from '../../context/GlobalContext';
import {
    Button,
    Typography,
    Paper,
    IconButton,
    Divider,
  } from '@mui/material';
  import CloseIcon from '@mui/icons-material/Close';
  import { useNavigate } from 'react-router-dom';

export default function EventInfoPopup() {
    const navigate = useNavigate();
  const { selectedEvent, setShowInfoEventModal } = useContext(GlobalContext);

  const handleClose = () => {
    setShowInfoEventModal(false); // Close the pop-up by setting showEventInfoModal to false
  };

  if (!selectedEvent) {
    return null; // Don't render the pop-up if no event is selected
  }
  
  const formattedStartDate = new Date(selectedEvent.startDate);
  const formattedStartTime = formattedStartDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const formattedEndDate = new Date(selectedEvent.endDate);
  const formattedEndTime = formattedEndDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formattedStartDateString = formattedStartDate.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleEditEvent = () => {
    if (selectedEvent) {
        // Pass the selected event data to the EventForm component and navigate to it
        console.log(selectedEvent)
        selectedEvent.startDate = null;
        selectedEvent.endDate = null
        navigate('/create-event',);
    }
};

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center" style={{ zIndex: 6000 }}>
      <Paper elevation={1} className="bg-white">
        <header className="px-4 py-2  flex justify-between items-center">
        <Typography variant="subtitle1" style={{fontSize:'20px'}}>
                {selectedEvent.title} {selectedEvent.emoji}
              </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </header>
        {selectedEvent && (
          <div>
            <div className="p-3">
             
            <Typography variant="subtitle1">
              <strong>Start Date:</strong> {formattedStartDateString} {formattedStartTime}
            </Typography>
            <Typography variant="subtitle1">
              <strong>End Date:</strong> {formattedEndTime}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Event Type:</strong> {selectedEvent.eventType}
            </Typography>
            <Typography variant="subtitle1">
              <strong>High Priority:</strong>{' '}
              {selectedEvent.isHighPriority ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Global region:</strong>{' '}
              {selectedEvent.region }
            </Typography>            
            <Typography variant="subtitle1">
              <strong>Subb-region:</strong>{' '}
              {selectedEvent.subRegion }
            </Typography>            
            <Typography variant="subtitle1">
              <strong>Countries:</strong>{' '}
              {selectedEvent.country }
            </Typography>            </div>
            <Divider />
            <footer className="flex justify-end border-t p-3">
              <Button variant="outlined" onClick={ handleEditEvent}>
                Edit Event
              </Button>
            </footer>
          </div>
        )}
      </Paper>
    </div>
  );
}
