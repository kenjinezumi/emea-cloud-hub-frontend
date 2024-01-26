import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import GlobalContext from '../../context/GlobalContext';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { getDummyEventData } from '../../api/getDummyData'; // Assuming this is your API call

export default function WeekView() {
  const { setShowEventModal, setDaySelected, daySelected } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const eventData = await getDummyEventData(); // Fetch events data
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    fetchEvents();
  }, [daySelected]);

  const startOfWeek = daySelected.startOf('week');
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => dayjs(startOfWeek).add(i, 'day'));
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const handleAddEvent = (day, hour) => {
    setDaySelected(day.hour(hour));
    setShowEventModal(true);
  };

  return (
    <Paper sx={{ width: '90%', overflowY: 'auto', padding: 2, border: 'none' }}>
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
                <Typography align="center" variant="subtitle1" sx={{ marginBottom: "10px", borderBottom: 1, borderColor: 'divider' }}>
                  {day.format('dddd, MMM D')}
                </Typography>
              </Grid>
            ))}
            {/* Events grid */}
            {hoursOfDay.map(hour => (
              <Grid container key={hour} sx={{ minHeight: '60px', borderBottom: 1, borderColor: 'divider' }}>
                {daysOfWeek.map(day => {
                  const hourEvents = events.filter(event => 
                    dayjs(event.startDate).isSame(day, 'day') && 
                    dayjs(event.startDate).hour() === hour
                  );
                  return (
                    <Grid item xs key={day.format('DDMMYYYY') + hour} sx={{ borderRight: 1, borderColor: 'divider' }}>
                      <Box
                        sx={{ minHeight: '60px' }}
                        className="flex-1 cursor-pointer"
                        onClick={() => handleAddEvent(day, hour)}
                      >
                        {hourEvents.map((event, index) => (
                          <Box key={index} sx={{ padding: 1, backgroundColor: 'grey.200', margin: '5px', borderRadius: 1 }}>
                            {event.title}
                          </Box>
                        ))}
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
