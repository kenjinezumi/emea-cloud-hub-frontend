import React, { useContext, useEffect, useState, useRef } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { useLocation } from 'react-router-dom';
import { getEventData } from '../../api/getEventData';
import EventInfoPopup from '../popup/EventInfoModal';

dayjs.extend(minMax);

export default function DayView() {
  const {
    daySelected,
    setShowEventModal,
    setSelectedEvent,
    setShowInfoEventModal,
    filters,
    showEventInfoModal,
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [eventGroups, setEventGroups] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const location = useLocation();
  const dayViewRef = useRef(null); // Reference for auto-scroll
  const currentHour = dayjs().hour(); // Get the current hour for auto-scroll
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Retrieve user's timezone

  const hourHeight = 90; // Height of one hour slot in pixels
  const startHour = 0;
  const endHour = 24;

  useEffect(() => {
    async function fetchEvents() {
      try {
        const eventData = await getEventData('eventDataQuery');
        setEvents(eventData);
        setEventGroups(calculateOverlapGroups(eventData));
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    }
    fetchEvents();
  }, [location, daySelected]);

  useEffect(() => {
    const applyFilters = async (events, filters) => {
      if (!Array.isArray(events)) {
        console.error("applyFilters was called with 'events' that is not an array:", events);
        return [];
      }

      const results = await Promise.all(events.map(async (event) => {
        const regionMatch = filters.regions.some(region => region.checked && event.region?.includes(region.label));
        const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
        const okrMatch = filters.okr.some(okr => okr.checked && event.okr?.includes(okr.label));
        const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority?.includes(seniority.label));
        const isDraftMatch = filters.isDraft.some(draft => draft.checked && (draft.label === 'Draft' ? event.isDraft : !event.isDraft));
        return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch && isDraftMatch;
      }));

      return events.filter((_, index) => results[index]);
    };

    (async () => {
      const filteredEvents = await applyFilters(events, filters);
      setFilteredEvents(filteredEvents);
    })();
  }, [events, filters]);

  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location]);

  useEffect(() => {
    setEventGroups(calculateOverlapGroups(events));
  }, [events]);

  useEffect(() => {
    // Auto-scroll to current hour when the day view is loaded
    if (dayViewRef.current) {
      const currentHourOffset = currentHour * hourHeight; // Calculate the offset based on the current hour
      dayViewRef.current.scrollTo({
        top: currentHourOffset - hourHeight / 2, // Scroll to a position just above the current time for better visibility
        behavior: 'smooth',
      });
    }
  }, [currentHour]);

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

    const displayStart = dayjs.max(startOfDay, eventStart);
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

  const handleAddEvent = () => {
    setShowEventModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowInfoEventModal(true);
  };

  const dayEvents = filteredEvents.filter(evt =>
    dayjs(evt.startDate).isSame(daySelected, 'day') ||
    dayjs(evt.endDate).isSame(daySelected, 'day') ||
    (dayjs(evt.startDate).isBefore(daySelected, 'day') && dayjs(evt.endDate).isAfter(daySelected, 'day'))
  );

  return (
    <Paper
      ref={dayViewRef}
      sx={{
        width: '80%',
        maxHeight: '100vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '50px 0',
        backgroundColor: 'background.default',
        marginLeft: '20px',  // Adjust margin to avoid affecting the sidebar
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        align="center"
        gutterBottom
        sx={{ mb: '20px', mt: '0px' }}
      >
        {`${daySelected.format('dddd, MMMM D, YYYY')} (${userTimezone})`}
      </Typography>
      <div
        style={{ position: 'relative', height: `${hourHeight * (endHour - startHour)}px`, width: 'calc(100% - 40px)' }}
      >
        {/* Hour Labels */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
            paddingRight: '10px',
            color: 'rgba(0, 0, 0, 0.6)',
            borderRight: '1px solid #ddd',
            boxSizing: 'border-box',
          }}
        >
          {Array.from({ length: endHour - startHour }, (_, i) => i + startHour).map((hour) => (
            <div
              key={hour}
              style={{
                height: `${hourHeight}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                fontSize: '12px',
              }}
            >
              {dayjs().hour(hour).minute(0).format('HH:mm')}
            </div>
          ))}
        </div>

        {/* Event Grid */}
        <div style={{ flex: 1, marginLeft: '50px', position: 'relative' }}>
          {Array.from({ length: (endHour - startHour) * 2 }, (_, i) => i).map((quarter) => (
            <div
              key={quarter}
              style={{
                height: `${hourHeight / 2}px`,
                borderTop: `1px solid ${quarter % 2 === 0 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={handleAddEvent}
            ></div>
          ))}

          {/* Render Events */}
          {dayEvents.map((event) => {
            const { top, height, left, width } = calculateEventBlockStyles(event);
            return (
              <div
                key={event.eventId}
                style={{
                  position: 'absolute',
                  top: `${top}px`,
                  left: `${left}%`,
                  width: `${width}%`,
                  height: `${height}px`,
                  backgroundColor: '#e3f2fd',
                  color: '#1a73e8',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  zIndex: 2,
                  boxSizing: 'border-box',
                  borderLeft: '2px solid #1a73e8',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c5e1f9';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e3f2fd';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
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
