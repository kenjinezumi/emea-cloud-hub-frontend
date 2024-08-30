import React, { useContext, useEffect, useState } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { Paper, Typography, Box } from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import DayColumn from '../Day/DayColumn'; // Import the DayColumn component

dayjs.extend(utc);

export default function WeekView() {
  const { daySelected, setDaySelected } = useContext(GlobalContext);

  const [currentWeek, setCurrentWeek] = useState([]);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hourHeight = 60;

  useEffect(() => {
    const startOfWeek = dayjs(daySelected).startOf('week');
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    setCurrentWeek(daysOfWeek);
  }, [daySelected]);

  return (
    <Paper sx={{ width: '100%', height: '100vh', overflow: 'hidden', padding: 2, display: 'flex', flexDirection: 'column', border: 'none' }}>
      <Typography variant="h6" align="center" gutterBottom>
        Week of {dayjs(daySelected).startOf('week').format('MMMM D, YYYY')} ({userTimezone})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1, overflowY: 'auto', position: 'relative' }}>
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
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
