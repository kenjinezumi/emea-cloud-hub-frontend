import React, {useContext, useEffect, useState} from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import GlobalContext from '../../context/GlobalContext';
import {Paper, Typography, Grid} from '@mui/material';
import {getDummyEventData} from '../../api/getDummyData';
import EventInfoPopup from '../popup/EventInfoModal'; // Import the EventInfoPopup component
import {useLocation} from 'react-router-dom';

dayjs.extend(utc);

export default function WeekView() {
  const {
    setShowEventModal,
    setDaySelected,
    daySelected,
    showEventInfoModal,
    setSelectedEvent,
    setShowInfoEventModal,
  } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const {filters} = useContext(GlobalContext);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const applyFilters = async (events, filters) => {
      // Ensure 'events' is an array before proceeding
      if (!Array.isArray(events)) {
        console.error("applyFilters was called with 'events' that is not an array:", events);
        return [];
      }
      
      console.log(events);
  
      const filterPromises = events.map(event => {
        // Immediately invoked asynchronous function to handle possible async conditions inside the filter logic
        return (async () => {
          const regionMatch = filters.regions.some(region => region.checked && event.region.includes(region.label));
          const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
          const okrMatch = filters.okr.some(okr => okr.checked && event.okr.includes(okr.label));
          const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority.includes(seniority.label));
  
          return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch;
        })();
      });
  
      const results = await Promise.all(filterPromises);
      return events.filter((_, index) => results[index]);
    };
  
    (async () => {
      const filteredEvents = await applyFilters(events, filters);
      setFilteredEvents(filteredEvents);
    })();
  }, [events, filters]);

  const handleEventClick = (eventData) => {
    setSelectedEvent(eventData);
    setShowInfoEventModal(true);
  };

  const handleDayClick = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const location = useLocation(); // useLocation hook

  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location]);


  useEffect(() => {
    async function fetchEvents() {
      try {
        const eventData = await getDummyEventData('eventDataQuery');
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }

    fetchEvents();
  }, [daySelected]);

  const startOfWeek = dayjs(daySelected).startOf('week');
  const daysOfWeek = Array.from({length: 7}, (_, i) =>
    startOfWeek.add(i, 'day'),
  );
  const hoursOfDay = Array.from({length: 24}, (_, i) => i);

  const calculateEventBlockStyles = (event, overlappingEvents) => {
    const eventStart = dayjs.utc(event.startDate).local();
    const eventEnd = dayjs.utc(event.endDate).local();

    const minutesFromMidnight = eventStart.diff(
        daySelected.startOf('day'),
        'minutes',
    );
    const durationInMinutes = eventEnd.diff(eventStart, 'minutes');

    const top = (minutesFromMidnight / 60) * 8;
    const height = (durationInMinutes / 60) * 60;

    const width = 100 / overlappingEvents;
    const positionIndex = events.findIndex((e) => e.eventId === event.eventId);
    const left = (positionIndex % overlappingEvents) * width;

    return {top, height, left, width};
  };

  const getOverlappingEventsCount = (day, hour) => {
    if (!Array.isArray(events)) {
      console.error("calculateOverlapGroups was called with 'events' that is not an array:", events);
      return [];
    }
    return events.filter((event) => {
      const eventStart = dayjs.utc(event.startDate).local();
      const eventEnd = dayjs.utc(event.endDate).local();
      return (
        eventStart.isSame(day, 'day') &&
        eventStart.hour() <= hour &&
        eventEnd.hour() >= hour
      );
    }).length;
  };
  const globalContext = useContext(GlobalContext);


  return (
    <Paper sx={{width: '80%', overflowY: 'auto', padding: 2, border: 'none'}}>
      <Grid container>
        {/* Hours Column */}
        <Grid
          item
          xs={1}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          {hoursOfDay.map((hour) => (
            <div
              key={hour}
              style={{
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{color: 'grey.500', marginRight: '2px'}}>
                {dayjs().hour(hour).minute(0).format('HH:mm')}
              </Typography>
            </div>
          ))}
        </Grid>

        {/* Event Grid */}
        <Grid item xs={11}>
          <Grid container>
            {/* Days of the week header */}
            {daysOfWeek.map((day) => (
              <Grid item xs key={day.format('DDMMYYYY')}>
                <Typography
                  align="center"
                  variant="subtitle1"
                  sx={{
                    marginBottom: '10px',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  {day.format('dddd, D')}
                </Typography>
              </Grid>
            ))}

            {/* Events grid */}
            {hoursOfDay.map((hour) => (
              <Grid
                container
                key={hour}
                sx={{
                  minHeight: '60px',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                {daysOfWeek.map((day) => (
                  <Grid
                    item
                    xs
                    key={day.format('DDMMYYYY') + hour}
                    sx={{borderRight: 1, borderColor: 'divider'}}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '60px',
                        position: 'relative',
                      }}
                    >
                      {filteredEvents
                          .filter(
                              (event) =>
                                dayjs
                                    .utc(event.startDate)
                                    .local()
                                    .isSame(day, 'day') &&
                            dayjs.utc(event.startDate).local().hour() === hour,
                          )
                          .map((event) => {
                            const overlappingEvents = getOverlappingEventsCount(
                                day,
                                hour,
                            );
                            const {top, height, left, width} =
                            calculateEventBlockStyles(event, overlappingEvents);

                            return (
                              <div
                                key={event.eventId}
                                style={{
                                  position: 'absolute',
                                  top: `${top}px`,
                                  left: `${left}%`,
                                  width: `${width}%`,
                                  height: `${height}px`,
                                  backgroundColor: '#fff', // White background for the event block
                                  color: '#5f6368', // Dark text color for contrast
                                  padding: '2px 4px', // Padding inside the event block
                                  borderRadius: '4px', // Rounded corners like Google Calendar events
                                  display: 'flex',
                                  alignItems: 'top',
                                  justifyContent: 'flex-start',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  zIndex: 2,
                                  boxSizing: 'border-box',
                                  borderLeft: '4px solid #1a73e8', // Blue left border as an indicator of event type
                                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow for a 3D effect
                                  margin: '4px 0', // Margin for spacing between events
                                  marginLeft: '4px', // Left margin to align with the grid
                                  transition: 'background-color 0.2s, box-shadow 0.2s', // Smooth transitions for hover effects
                                  fontSize: '0.875rem', // 14px for text size
                                  fontWeight: '500', // Medium font weight for readability
                                }}
                                onClick={() => {
                                  handleEventClick(event);
                                }}
                              >
                                {event.title}
                              </div>
                            );
                          })}
                      {/* If there are no events, render a div to add an event */}
                      {events.filter(
                          (event) =>
                            dayjs
                                .utc(event.startDate)
                                .local()
                                .isSame(day, 'day') &&
                          dayjs.utc(event.startDate).local().hour() === hour,
                      ).length === 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            handleDayClick(day, hour); // Handle adding an event when clicked
                          }}
                        ></div>
                      )}
                    </div>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      {showEventInfoModal && <EventInfoPopup />}
    </Paper>
  );
}
