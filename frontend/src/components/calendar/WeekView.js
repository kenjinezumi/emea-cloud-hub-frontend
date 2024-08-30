import React, { useContext, useEffect, useState, useRef } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { Paper, Typography, Box } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import DayColumn from '../Day/DayColumn'; // Import the DayColumn component

dayjs.extend(utc);

export default function WeekView() {
  const { daySelected } = useContext(GlobalContext);
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
    // Auto-scroll to the current hour when the week view is loaded
    if (weekViewRef.current) {
      const currentHour = dayjs().hour();
      const currentHourOffset = currentHour * hourHeight; // Calculate the offset based on the current hour
      weekViewRef.current.scrollTo({
        top: currentHourOffset - hourHeight / 2, // Scroll to a position just above the current time for better visibility
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

    updateCurrentTimePosition(); // Initial update
    const interval = setInterval(updateCurrentTimePosition, 60000); // Update every minute

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <Paper sx={{ width: '100%', height: '100vh', overflow: 'hidden', padding: 2, display: 'flex', flexDirection: 'column', border: 'none' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Week of {dayjs(daySelected).startOf('week').format('MMMM D, YYYY')} ({userTimezone})
      </Typography>
      <Box ref={weekViewRef} sx={{ display: 'flex', flexDirection: 'row', flex: 1, overflowY: 'auto', position: 'relative' }}>
        {/* Hour labels on the left side */}
        <Box sx={{ flex: '0 0 50px', borderRight: '2px solid #bbb', display: 'flex', flexDirection: 'column' }}>
          {Array.from({ length: 24 }, (_, i) => (
            <Typography key={i} align="right" sx={{ height: `${hourHeight}px`, lineHeight: `${hourHeight}px`, paddingRight: '5px', fontSize: '12px', color: 'grey.500' }}>
              {dayjs().hour(i).minute(0).format('HH:mm')}
            </Typography>
          ))}
        </Box>

        {/* Week days columns */}
        {currentWeek.map((day) => (
          <Box key={day.format('YYYY-MM-DD')} sx={{ flex: 1, position: 'relative' }}>
            <Typography align="center" variant="subtitle1" sx={{ padding: '5px 0', borderBottom: '1px solid #ddd', backgroundColor: 'white', position: 'sticky', top: 0, zIndex: 1 }}>
              {day.format('ddd, D MMM')}
            </Typography>
            <DayColumn daySelected={day} />

            {/* Current Time Line inside each day column */}
            <Box
              sx={{
                position: 'absolute',
                top: `${currentTimePosition}px`, // Position based on current time
                left: '0', // Start the line right after the hour labels
                right: '0',
                height: '1px',
                backgroundColor: '#d32f2f', // Red color for the line, similar to Google Calendar
                zIndex: 5,
              }}
            />
          </Box>
        ))}

        {/* Single Dot for Current Time Line */}
        <Box
          sx={{
            position: 'absolute',
            top: `${currentTimePosition - 4}px`, // Position the dot centered vertically on the line
            left: '50px', // Position the dot right after the hour labels (50px width)
            width: '8px',
            height: '8px',
            backgroundColor: '#d32f2f', // Same red color for the dot
            borderRadius: '50%',
            zIndex: 6, // Ensure it appears above the time line
          }}
        />
      </Box>
    </Paper>
  );
}
