import React, { useContext, useEffect, useState, useRef } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { Typography, Paper, Box } from '@mui/material';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { useLocation } from 'react-router-dom';
import { getEventData } from '../../api/getEventData';
import EventInfoPopup from '../popup/EventInfoModal';
import OnlineEventIcon from '@mui/icons-material/Computer';
import PhysicalEventIcon from '@mui/icons-material/LocationOn';
import HybridEventIcon from '@mui/icons-material/Autorenew';
import CustomerStoryIcon from '@mui/icons-material/LibraryBooks';
import BlogPostIcon from '@mui/icons-material/Create';

dayjs.extend(minMax);

// Define styles for each event type
const eventTypeStyles = {
  'Online Event': {
    color: '#1E88E5',
    icon: <OnlineEventIcon style={{ marginRight: '5px', color: '#1E88E5' }} />,
    backgroundColor: '#E3F2FD',
  },
  'Physical Event': {
    color: '#43A047',
    icon: <PhysicalEventIcon style={{ marginRight: '5px', color: '#43A047' }} />,
    backgroundColor: '#E8F5E9',
  },
  'Hybrid Event': {
    color: '#FB8C00',
    icon: <HybridEventIcon style={{ marginRight: '5px', color: '#FB8C00' }} />,
    backgroundColor: '#FFF3E0',
  },
  'Customer Story': {
    color: '#E53935',
    icon: <CustomerStoryIcon style={{ marginRight: '5px', color: '#E53935' }} />,
    backgroundColor: '#FFEBEE',
  },
  'Blog Post': {
    color: '#8E24AA',
    icon: <BlogPostIcon style={{ marginRight: '5px', color: '#8E24AA' }} />,
    backgroundColor: '#F3E5F5',
  },
};

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
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const location = useLocation();
  const dayViewRef = useRef(null);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const hourHeight = 90;
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
        const okrMatch = filters.okr.some(okr => 
          okr.checked && event.okr?.some(eventOkr => eventOkr.type === okr.label)
        );        
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
    if (dayViewRef.current) {
      const currentHourOffset = dayjs().hour() * hourHeight;
      dayViewRef.current.scrollTo({
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
      sx={{
        width: '90%',
        maxHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'background.default',
        marginLeft: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sticky Date Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10,
          padding: '10px 0',
          borderBottom: '1px solid #ddd',
        }}
      >
        <Typography
          variant="h6"
          align="center"
          gutterBottom
        >
          {`${daySelected.format('dddd, MMMM D, YYYY')} (${userTimezone})`}
        </Typography>
      </div>

      {/* Scrollable Calendar Grid */}
      <div
        ref={dayViewRef}
        style={{
          overflowY: 'auto',
          height: 'calc(100vh - 100px)',
          position: 'relative',
        }}
      >
        {/* Event Grid Container */}
        <div
          style={{
            position: 'relative',
            height: `${hourHeight * (endHour - startHour)}px`,
            width: 'calc(100% - 40px)',
            marginLeft: '50px',
          }}
        >
          {/* Hour Labels */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-50px',
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
          <div style={{ position: 'relative' }}>
            {Array.from({ length: (endHour - startHour) * 2 }, (_, i) => i).map((quarter) => (
              <div
                key={quarter}
                style={{
                  height: `${hourHeight / 2}px`,
                  borderTop: `1px solid rgba(0, 0, 0, 0.1)`,
                  backgroundColor: '#f5f5f5',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={handleAddEvent}
              ></div>
            ))}

            {/* Render Events */}
            {dayEvents.map((event) => {
              const { top, height, left, width } = calculateEventBlockStyles(event);
              const eventTypeStyle = eventTypeStyles[event.eventType] || {};
              return (
                <div
                  key={event.eventId}
                  style={{
                    position: 'absolute',
                    top: `${top}px`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}px`,
                    backgroundColor: eventTypeStyle.backgroundColor,
                    color: eventTypeStyle.color,
                    padding: '2px 4px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    zIndex: 2,
                    boxSizing: 'border-box',
                    borderLeft: `4px solid ${eventTypeStyle.color}`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'background-color 0.2s, box-shadow 0.2s',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = eventTypeStyle.color ? `${eventTypeStyle.color}33` : '#c5e1f9';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = eventTypeStyle.backgroundColor;
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  {eventTypeStyle.icon}
                  <Typography variant="body2" noWrap>{event.title}</Typography>
                </div>
              );
            })}

            {/* Current Time Line */}
            <Box
              sx={{
                position: 'absolute',
                top: `${currentTimePosition}px`,
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: '#d32f2f',
                zIndex: 5,
              }}
            />

            {/* Single Dot for Current Time Line */}
            <Box
              sx={{
                position: 'absolute',
                top: `${currentTimePosition - 4}px`,
                left: '-5px',
                width: '8px',
                height: '8px',
                backgroundColor: '#d32f2f',
                borderRadius: '50%',
                zIndex: 6,
              }}
            />
          </div>
        </div>
      </div>

      {showEventInfoModal && <EventInfoPopup />}
    </Paper>
  );
}
