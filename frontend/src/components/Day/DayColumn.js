import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import { getEventStyleAndIcon } from '../../utils/eventStyles';

export default function DayColumn({ daySelected, events, onEventClick, showTimeLabels }) {
  const { setShowEventModal, setDaySelected } = useContext(GlobalContext);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const hourHeight = 90; // Height for one hour
  const startHour = 0;
  const endHour = 24;
  const dayColumnRef = useRef(null);

  // Update current time position
  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = dayjs();
      const minutesFromMidnight = now.diff(now.startOf('day'), 'minutes');
      const position = (minutesFromMidnight / 60) * hourHeight;
      setCurrentTimePosition(position);
    };
    updateCurrentTimePosition();
    const interval = setInterval(updateCurrentTimePosition, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [hourHeight]);

  // Separate multi-day events and single-day events
  const { multiDayEvents, singleDayEvents } = useMemo(() => {
    const multiDayEvents = events.filter((event) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      return eventStart.isBefore(daySelected.endOf('day')) && eventEnd.isAfter(daySelected.startOf('day'));
    });

    const singleDayEvents = events.filter((event) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      return eventStart.isSame(daySelected, 'day') && eventEnd.isSame(daySelected, 'day');
    });

    return { multiDayEvents, singleDayEvents };
  }, [events, daySelected]);

  // Calculate event block styles (top, height, width, and left)
  const calculateEventBlockStyles = useCallback((event, overlappingEvents) => {
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

    // Calculate width based on number of overlapping events
    const overlapCount = overlappingEvents.length;
    const width = 100 / overlapCount;  // Divide the width by number of overlapping events
    const left = overlappingEvents.indexOf(event) * width;

    return { top, height, width, left };
  }, [daySelected, hourHeight]);

  // Group overlapping single-day events
  const groupOverlappingEvents = (events) => {
    const groups = [];

    events.forEach((event) => {
      let addedToGroup = false;
      for (const group of groups) {
        const isOverlapping = group.some((groupEvent) => {
          return dayjs(event.startDate).isBefore(groupEvent.endDate) &&
                 dayjs(event.endDate).isAfter(groupEvent.startDate);
        });

        if (isOverlapping) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }

      if (!addedToGroup) {
        groups.push([event]);
      }
    });

    return groups;
  };

  const overlappingEventGroups = useMemo(() => groupOverlappingEvents(singleDayEvents), [singleDayEvents]);

  return (
    <>
      {/* <Box
        sx={{
          height: '100px',  // Fixed height for the multi-day events section
          overflowY: 'auto', // Allow scroll if there are too many events
          backgroundColor: '#f9f9f9', 
          borderBottom: '1px solid #ccc',
          padding: '10px 20px',
        }}
      >
        {multiDayEvents.map((event, index) => {
          const { backgroundColor, color, icon } = getEventStyleAndIcon(event.eventType);
          return (
            <div
              key={event.eventId}
              style={{
                backgroundColor,
                color,
                padding: '8px 10px',
                marginBottom: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              {icon}
              <Typography noWrap>{event.title}</Typography>
            </div>
          );
        })}
      </Box>

      {/* Scrollable Grid Below the Fixed Multi-Day Events */}
      <Box
        sx={{
          position: 'relative',
          height: `${hourHeight * (endHour - startHour)}px`, // Ensures it stretches fully
          backgroundColor: "#ffffff",  // Light background color
          width: '100%',
          flex: 1,
          boxSizing: 'border-box',
          borderLeft: '1px solid #ccc',
          borderBottom: '1px solid #ccc',
        }}
        ref={dayColumnRef}
        onClick={() => setShowEventModal(true)}  // Add this onClick to open add event modal
      > 
        {Array.from({ length: endHour - startHour }, (_, hour) => (
          <React.Fragment key={hour}>
            <Box
              sx={{
                position: 'absolute',
                top: `${hour * hourHeight}px`,
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: '#ddd',
                zIndex: 1,
              }}
            />
          </React.Fragment>
        ))}

        {/* Render Single-Day Events */}
        {overlappingEventGroups.map((group, groupIndex) =>
          group.map((event) => {
            const { top, height, left, width } = calculateEventBlockStyles(event, group);
            const { backgroundColor, color, icon } = getEventStyleAndIcon(event.eventType);
            return (
              <div
              key={event.eventId}
              style={{
                position: 'absolute',
                top,               // Top position based on time
                left: `${left}%`,  // Left position based on overlapping events
                width: `${width}%`,// Width is divided among overlapping events
                height: `${height}px`,
                backgroundColor,
                color,
                padding: '8px 12px', // More padding for better content spacing
                borderRadius: '8px', // Rounded corners for a modern look
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 2,
                borderLeft: `4px solid ${color}`, // Thicker border for better visual distinction
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Soft shadow for better visibility
                transition: 'background-color 0.2s, box-shadow 0.2s', // Smooth transition for hover effects
              }}
              onClick={(e) => {
                e.stopPropagation();  // Prevent grid click from triggering
                onEventClick(event);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = color ? `${color}33` : "#f0f0f0";  // Slight background change on hover
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';  // Enhance shadow on hover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = backgroundColor;  // Reset background
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';  // Reset shadow
              }}
            >
              {icon}
              <Typography
                noWrap
                sx={{
                  marginLeft: '8px',  // Space between icon and text
                  color: '#333',      // Darker text color for better readability
                  flex: 1,            // Make sure text takes up available space
                  fontSize: '0.875rem', // Slightly smaller font size for a clean look
                }}
              >
                {event.title}
              </Typography>
            </div>
            
            );
          })
        )}

        {/* Current Time Line */}
        <Box
          sx={{
            position: 'absolute',
            top: `${currentTimePosition}px`,
            left: '0',
            right: '0',
            height: '2px',
            width: '100%',
            backgroundColor: '#d32f2f',
          }}
        />
      </Box>
    </>
  );
}
