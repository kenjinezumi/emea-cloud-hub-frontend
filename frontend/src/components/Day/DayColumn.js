import React, { useContext, useEffect, useState } from 'react';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { getEventData } from '../../api/getEventData';
import EventInfoPopup from '../popup/EventInfoModal';
import { Box, Typography } from '@mui/material';

dayjs.extend(minMax);

export default function DayColumn({ daySelected }) {
  const {
    setShowEventModal,
    setDaySelected,
    setSelectedEvent,
    setShowInfoEventModal,
    filters,
    showEventInfoModal,
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [eventGroups, setEventGroups] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const hourHeight = 60; // Height of one hour slot in pixels
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
  }, [daySelected]);

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
  }, []);

  useEffect(() => {
    setEventGroups(calculateOverlapGroups(events));
  }, [events]);

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

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowInfoEventModal(true);
  };

  const handleSlotClick = (hour) => {
    setDaySelected(daySelected.hour(hour).minute(0));
    setShowEventModal(true);
  };

  const dayEvents = filteredEvents.filter(evt =>
    dayjs(evt.startDate).isSame(daySelected, 'day') ||
    dayjs(evt.endDate).isSame(daySelected, 'day') ||
    (dayjs(evt.startDate).isBefore(daySelected, 'day') && dayjs(evt.endDate).isAfter(daySelected, 'day'))
  );

  return (
    <Box
      sx={{
        position: 'relative',
        height: `${hourHeight * (endHour - startHour)}px`,
        borderRight: '2px solid #bbb',  // Thicker border for more distinct separation
        borderBottom: '1px solid #ddd',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Render Hour Lines and Clickable Slots */}
      {Array.from({ length: endHour - startHour }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * hourHeight}px`,
            left: 0,
            right: 0,
            height: `${hourHeight}px`,
            borderTop: '1px solid #ddd', // Light gray line for hours
            cursor: 'pointer',
          }}
          onClick={() => handleSlotClick(i + startHour)}
        />
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
              marginLeft: "4px",
              marginRight: "4px",
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
            onClick={(e) => {
              e.stopPropagation();
              handleEventClick(event);
            }}
          >
            <Typography>{event.title}</Typography>
          </div>
        );
      })}
      {showEventInfoModal && <EventInfoPopup />}
    </Box>
  );
}
