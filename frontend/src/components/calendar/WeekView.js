import React, { useContext, useEffect, useState, useRef } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { Paper, Typography, Box } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import DayColumn from '../Day/DayColumn';
import EventInfoPopup from '../popup/EventInfoModal';

dayjs.extend(utc);

export default function WeekView() {
  const { daySelected, setSelectedEvent, setShowInfoEventModal, showEventInfoModal, selectedEvent } = useContext(GlobalContext);
  const [currentWeek, setCurrentWeek] = useState([]);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hourHeight = 60; // Define the height of each hour slot in pixels
  const weekViewRef = useRef(null); // Reference to the scrollable container

  useEffect(() => {
    const startOfWeek = dayjs(daySelected).startOf('week');
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    setCurrentWeek(daysOfWeek);
  }, [daySelected]);

  useEffect(() => {
    if (weekViewRef.current) {
      const currentHour = dayjs().hour();
      const currentHourOffset = currentHour * hourHeight;
      weekViewRef.current.scrollTo({
        top: currentHourOffset - hourHeight / 2,
        behavior: 'smooth',
      });
    }

    const updateCurrentTimePosition = () => {
      const now = dayjs();
      const currentHour = now.hour();
      const currentMinute = now.minute();
      const position = currentHour * hourHeight + (currentMinute / 60) * hourHeight;
      setCurrentTimePosition(position);
    };

    updateCurrentTimePosition();
    const interval = setInterval(updateCurrentTimePosition, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleEventClick = (event) => {
    console.log("Event clicked:", event); // Debug log
    setSelectedEvent(event);  // Set the selected event
    setShowInfoEventModal(true);  // Open the modal
    console.log("Modal should be open:", showEventInfoModal); // Check the state change
  };

  const closeEventModal = () => {
    setShowInfoEventModal(false);
    setSelectedEvent(null);
  };

  return (
    <Paper sx={{ width: '90%', height: '100vh', overflow: 'hidden', padding: 2, display: 'flex', flexDirection: 'column', border: 'none' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Week of {dayjs(daySelected).startOf('week').format('MMMM D, YYYY')} ({userTimezone})
      </Typography>
      <Box ref={weekViewRef} sx={{ display: 'flex', flexDirection: 'row', flex: 1, overflowY: 'auto', position: 'relative', width: '100%' }}>
        <Box sx={{ flex: '0 0 50px', borderRight: '2px solid #bbb', display: 'flex', flexDirection: 'column' }}>
          {Array.from({ length: 24 }, (_, i) => (
            <Typography key={i} align="right" sx={{ height: `${hourHeight}px`, lineHeight: `${hourHeight}px`, paddingRight: '5px', fontSize: '12px', color: 'grey.500' }}>
              {dayjs().hour(i).minute(0).format('HH:mm')}
            </Typography>
          ))}
        </Box>

        {currentWeek.map((day) => (
          <Box key={day.format('YYYY-MM-DD')} sx={{ flex: 1, position: 'relative' }}>
            {/* Sticky Header for Day and Date */}
            <Typography 
              align="center" 
              variant="subtitle1" 
              sx={{ 
                padding: '5px 0', 
                borderBottom: '1px solid #ddd', 
                backgroundColor: 'white', 
                position: 'sticky', 
                top: 0, 
                zIndex: 10 // Increase z-index to ensure it stays above other elements
              }}
            >
              {day.format('ddd, D MMM')}
            </Typography>
            <DayColumn daySelected={day} onEventClick={handleEventClick} />

            {/* Current Time Line inside each day column */}
            <Box
              sx={{
                position: 'absolute',
                top: `${currentTimePosition}px`,
                left: '0',
                right: '0',
                height: '1px',
                backgroundColor: '#d32f2f',
                zIndex: 5,
              }}
            />
          </Box>
        ))}

        {/* Single Dot for Current Time Line */}
        <Box
          sx={{
            position: 'absolute',
            top: `${currentTimePosition - 4}px`,
            left: '50px',
            width: '8px',
            height: '8px',
            backgroundColor: '#d32f2f',
            borderRadius: '50%',
            zIndex: 6,
          }}
        />
      </Box>

      {/* Conditionally render EventInfoPopup */}
      {showEventInfoModal && selectedEvent && (
        <EventInfoPopup event={selectedEvent} close={closeEventModal} />
      )}
    </Paper>
  );
}
