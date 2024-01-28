import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // ensure you import this

import GlobalContext from '../../context/GlobalContext';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { getDummyEventData } from '../../api/getDummyData';
dayjs.extend(utc); // and use the plugin

export default function WeekView() {
  const { setShowEventModal, setDaySelected, daySelected } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const eventData = await getDummyEventData();
        console.log('Fetched Events:', eventData); // Logging to check the fetched events
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    fetchEvents();
  }, [daySelected]);

  const startOfWeek = dayjs(daySelected).startOf('week');
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const calculateEventBlockStyles = (event, overlappingEvents) => {
    // Convert event times from UTC to local time
    const eventStart = dayjs.utc(event.startDate).local();
    const eventEnd = dayjs.utc(event.endDate).local();

    const minutesFromMidnight = eventStart.diff(dayjs(eventStart).startOf("day"), "minutes");
    const durationInMinutes = eventEnd.diff(eventStart, "minutes");

    const top = (minutesFromMidnight / 60) * 60; // Adjusted for 60px per hour
    const height = (durationInMinutes / 60) * 60; // Adjusted for 60px per hour
    
    // Calculate width and left position based on overlapping events
    const width = 100 / overlappingEvents;
    const positionIndex = events.findIndex(e => e.eventId === event.eventId); // Use eventId to find index
    const left = (positionIndex % overlappingEvents) * width;

    return { top, height, left, width };
  };

  const handleAddEvent = (day, hour) => {
    setDaySelected(day.hour(hour));
    setShowEventModal(true);
  };

  const getOverlappingEventsCount = (day, hour) => {
    return events.filter(event => {
      const eventStart = dayjs.utc(event.startDate).local();
      const eventEnd = dayjs.utc(event.endDate).local();
      return eventStart.isSame(day, 'day') &&
             eventStart.hour() <= hour &&
             eventEnd.hour() >= hour;
    }).length;
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
                  const overlappingEvents = getOverlappingEventsCount(day, hour);
                  return (
                    <Grid item xs key={day.format('DDMMYYYY') + hour} sx={{ borderRight: 1, borderColor: 'divider' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: '60px',
                          alignItems: 'flex-start',
                          justifyContent: 'flex-start',
                          position: 'relative',
                        }}
                      >

{events.filter(event => 
  dayjs.utc(event.startDate).local().isSame(day, 'day') &&
  dayjs.utc(event.startDate).local().hour() === hour
).map((event, index) => {
  const overlappingCount = getOverlappingEventsCount(day, hour);
  const { top, height, left, width } = calculateEventBlockStyles(event, overlappingCount);

  return (
    <Box
      key={event.eventId}
      sx={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}px`,
        backgroundColor: 'primary.main',
        color: 'white',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
      onClick={() => handleAddEvent(day, hour)}
    >
      {event.title}
    </Box>
  );
})}
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

