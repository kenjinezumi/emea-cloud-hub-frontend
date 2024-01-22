import React, { useContext, useEffect } from 'react';
import dayjs from 'dayjs';
import GlobalContext from '../../context/GlobalContext';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';

export default function WeekView({ weekStart = dayjs().startOf('week'), events = defaultEvents }) {
  const { setShowEventModal, setDaySelected, daySelected  } = useContext(GlobalContext);

  const startOfWeek = daySelected.startOf('week');
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => dayjs(startOfWeek).add(i, 'day'));
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

   const handleAddEvent = (day, hour) => {
    setDaySelected(day.hour(hour));
    setShowEventModal(true);
  };
  const location = useLocation(); // useLocation hook

  useEffect(() => {
   
    setShowEventModal(false);
  
}, [location]);

  return (
    <Paper sx={{ marginLeft: '40px', width: '90%', overflowY: 'auto', padding: 2, border: 'none' }}>
      <Grid container>
        {/* Hours Column */}
        <Grid item xs={1} sx={{ display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
          {hoursOfDay.map(hour => (
            <Box key={hour} sx={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                {dayjs().hour(hour).format('h A')}
              </Typography>
            </Box>
          ))}
        </Grid>
        {/* Event Grid */}
        <Grid item xs={11}>
          <Grid container>
            {/* Days of the week header */}
            {daysOfWeek.map(day => (
              <Grid item xs key={day.format('DDMMYYYY')}>
                <Typography align="center" variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
                  {day.format('dddd, MMM D')}
                </Typography>
              </Grid>
            ))}
            {/* Events grid */}
            {hoursOfDay.map(hour => (
              <Grid container key={hour} sx={{ minHeight: '60px', borderBottom: 1, borderColor: 'divider' }}>
                {daysOfWeek.map(day => {
                  const hourEvents = events.filter(event => dayjs(event.start).isSame(day, 'day') && dayjs(event.start).hour() === hour);
                  return (
                    <Grid item xs key={day.format('DDMMYYYY') + hour} sx={{ borderRight: 1, borderColor: 'divider' }}>
                      <Box 
                        sx={{ minHeight: '60px' }}
                        className="flex-1 cursor-pointer"
                        onClick={() => handleAddEvent(day, hour)} // Add event handler
                      >
                        {hourEvents.length > 0 ? 
                          hourEvents.map((event, index) => (
                            <Box key={index} sx={{ padding: 1, backgroundColor: 'grey.200', margin: '5px', borderRadius: 1 }}>
                              {event.title}
                            </Box>
                          )) : null
                        }
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}

const defaultEvents = [
  { start: dayjs().hour(9).minute(0), title: "Team Meeting" },
  { start: dayjs().hour(13).minute(30), title: "Lunch with Client" },
  { start: dayjs().hour(15).minute(0), title: "Project Discussion" }
];
