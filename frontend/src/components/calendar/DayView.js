import React, {useContext, useEffect, useState} from 'react';
import GlobalContext from '../../context/GlobalContext';
import {Typography, Paper} from '@mui/material';
import dayjs from 'dayjs';
import {useLocation} from 'react-router-dom';
import {getDummyEventData} from '../../api/getDummyData';
import minMax from 'dayjs/plugin/minMax';

import EventInfoPopup from '../popup/EventInfoModal'; // Import the EventInfoPopup component
dayjs.extend(minMax);

export default function DayView() {
  const {daySelected} = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const [eventGroups, setEventGroups] = useState([]);
  const location = useLocation();
  const {setShowEventModal, showEventModal} = useContext(GlobalContext);
  const {
    setDaySelected,
    showEventInfoModal,
    setSelectedEvent,
    setShowInfoEventModal,
  } = useContext(GlobalContext);


  const {filters} = useContext(GlobalContext);
  const [Eventsfiltered, setFilteredEvents] = useState([]);
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

  const handleAddEvent = () => {
    setShowEventModal(true);
  };
  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getDummyEventData('eventDataQuery');
        setEvents(eventData);
        setEventGroups(calculateOverlapGroups(eventData));
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };
    fetchData();
  }, [location, daySelected]);

  useEffect(() => {
    setEventGroups(calculateOverlapGroups(events));
  }, [events]);

  const hourHeight = 90; // Height of one hour slot in pixels
  const startHour = 0; // Define startHour here
  const endHour = 24; // Define endHour here

  const calculateOverlapGroups = (events) => {
    const eventGroups = [];

    if (!Array.isArray(events)) {
      console.error("calculateOverlapGroups was called with 'events' that is not an array:", events);
      return [];
    }
    
    events.forEach((event) => {
      let added = false;
      for (const group of eventGroups) {
        if (isOverlapping(event, group)) {
          group.push(event);
          added = true;
          break;
        }
      }
      if (!added) {
        eventGroups.push([event]);
      }
    });
    return eventGroups;
  };

  const isOverlapping = (event, group) => {
    return group.some((groupEvent) => {
      return dayjs(event.startDate).isBefore(groupEvent.endDate) &&
             dayjs(groupEvent.startDate).isBefore(event.endDate);
    });
  };

  const calculateEventBlockStyles = (event) => {
    const eventStart = dayjs(event.startDate);
    const eventEnd = dayjs(event.endDate);
    const startOfDay = daySelected.startOf('day');
    const endOfDay = daySelected.endOf('day');

    // Ensure the event starts at or after the start of the day or at the event start time, whichever is later
    const displayStart = dayjs.max(startOfDay, eventStart);
    // Ensure the event ends at or before the end of the day or at the event end time, whichever is earlier
    const displayEnd = dayjs.min(endOfDay, eventEnd);

    const minutesFromMidnight = displayStart.diff(startOfDay, 'minutes');
    const durationInMinutes = displayEnd.diff(displayStart, 'minutes');

    const top = (minutesFromMidnight / 60) * hourHeight;
    const height = (durationInMinutes / 60) * hourHeight;

    const group = eventGroups.find((g) => g.includes(event));
    const width = group ? 100 / group.length : 100;
    const index = group ? group.indexOf(event) : 0;
    const left = width * index;

    return { top, height, left, width };
};


const dayEvents = Eventsfiltered.filter(evt =>
  dayjs(evt.startDate).isSame(daySelected, 'day') ||
  dayjs(evt.endDate).isSame(daySelected, 'day') ||
  (dayjs(evt.startDate).isBefore(daySelected, 'day') && dayjs(evt.endDate).isAfter(daySelected, 'day'))
);



  return (
    <Paper
      sx={{
        width: '100%',
        maxHeight: '100vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '50px 0',
      }}
    >
      <Typography
        variant="h6"
        align="center"
        gutterBottom
        marginBottom={'20px'}
        marginTop={'0px'}
      >
        {daySelected.format('dddd, MMMM D, YYYY')}
      </Typography>
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          setShowEventModal(true);
        }}
      ></div>
      <div style={{display: 'flex', alignItems: 'flex-start'}}>
        <div
          style={{
            flex: '0 0 auto',
            marginRight: '10px',
            fontWeight: '400',
            textAlign: 'right',
            marginLeft: '10px',
            paddingRight: '10px',
            borderRight: '1px solid #ddd',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            color: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          {Array.from(
              {length: endHour - startHour},
              (_, i) => i + startHour,
          ).map((hour) => (
            <div
              key={hour}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                height: `${hourHeight}px`,
                fontSize: '12px',
              }}
            >

              {dayjs().hour(hour).minute(0).format('HH:mm')}
            </div>
          ))}
        </div>
        {/* Event Column */}
        <div style={{flex: 3, position: 'relative'}}>
          {/* Hour and half-hour tickers */}
          {Array.from(
              {length: (endHour - startHour) * 4},
              (_, i) => i + startHour * 4,
          ).map((quarter) => (
            <div
              key={quarter}
              style={{
                height: `${hourHeight / 4}px`,
                borderTop: `1px solid ${
                  quarter % 4 === 0 ?
                    'rgba(0, 0, 0, 0.2)' :
                    'rgba(0, 0, 0, 0.1)'
                }`,
                position: 'relative',
              }} onClick={() => handleAddEvent()}
            >
              {/* Show a small tick for quarters and a bigger tick for half-hours */}
              {quarter % 4 === 0 ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    transform: 'translateY(-50%)',
                    width: '1px',
                    height: '5px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',


                  }}onClick={() => handleAddEvent()}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    transform: 'translateY(-50%)',
                    width: '1px',
                    height: '3px',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',

                  }}onClick={() => handleAddEvent()}
                />
              )}
            </div>
          ))}

          {/* Event rendering */}
          {/* Event rendering */}
{dayEvents.map((event) => {
  const { top, height, left, width } = calculateEventBlockStyles(event);
  return (
    <div
      key={event.id}
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
      onClick={() => handleEventClick(event)}
    >
      <Typography>{event.title}</Typography>
    </div>
  );
})}

        </div>
      </div>
      {showEventInfoModal && <EventInfoPopup />}

    </Paper>
  );
}
