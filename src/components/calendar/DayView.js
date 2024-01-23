import React, { useContext, useEffect } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { Typography, Paper, Divider, Button } from '@mui/material';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';

export default function DayView() {
  const { showEventModal, daySelected, setShowEventModal, setDaySelected } = useContext(GlobalContext);

  const startHour = 6; // 6 AM
  const endHour = 20; // 8 PM
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);

  const handleAddEvent = () => {
    setShowEventModal(true);
  };

  const location = useLocation(); // useLocation hook

  useEffect(() => {
   
      setShowEventModal(false);
    
  }, [location]);




  return (
    <Paper sx={{ width: '90%', maxHeight: '100%', overflowY: 'auto'}}>
      <Typography variant="h6" align="center" gutterBottom marginBottom={'20px'} marginTop={'20px'}>
        {daySelected.format('dddd, MMMM D, YYYY')}
      </Typography>
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          setShowEventModal(true);
        }}
      ></div>
      {hours.map(hour => (
        <React.Fragment key={hour}>
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => handleAddEvent()} 
            style={{ width: '100%', textAlign: 'left', padding: '20px' }} 
            variant="text"
          >
            <Typography style={{ fontSize: '0.75rem', color: 'grey' }}>
              {dayjs().hour(hour).format('h A')}
            </Typography>
            <Divider style={{ marginTop: '10px' }} />
            </div>
        </React.Fragment>
      ))}
    </Paper>
  );
}

