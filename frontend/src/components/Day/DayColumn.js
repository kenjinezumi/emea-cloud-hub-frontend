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
    <Box
      sx={{
        position: 'relative',
        height: `${hourHeight * (endHour - startHour)}px`, // Ensures it stretches fully
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        width: '100%',
        flex: 1,
        boxSizing: 'border-box',
        borderLeft: '1px solid #ccc',
        borderBottom: '1px solid #ccc',
      }}
      ref={dayColumnRef}
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
          {/* {showTimeLabels && (
            <Typography
              sx={{
                position: 'absolute',
                top: `${hour * hourHeight}px`,
                width: '50px',
                textAlign: 'right',
                paddingRight: '10px',
                fontSize: '12px',
                color: '#666',
                zIndex: 1200,
              }}
            >
              {dayjs().hour(hour).minute(0).format('HH:mm')}
            </Typography>
          )} */}
        </React.Fragment>
      ))}

      {/* Render Multi-Day Events */}
      {multiDayEvents.map((event, index) => {
        const { top, height, left, width } = calculateEventBlockStyles(event, multiDayEvents); // Multi-day events
        const { backgroundColor, color, icon } = getEventStyleAndIcon(event.eventType);
        return (
          <div
            key={event.eventId}
            style={{
              position: 'absolute',
              top: `${index * 30}px`, // Stack multi-day events at the top
              left: '0%',
              width: '100%',
              height: '30px', // Fixed height for multi-day events
              backgroundColor,
              color,
              padding: '2px 4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 2,
              borderLeft: `2px solid ${color}`,
              boxSizing: 'border-box',
            }}
            onClick={() => onEventClick(event)}
          >
            {icon}
            <Typography noWrap>{event.title}</Typography>
          </div>
        );
      })}

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
                padding: '2px 4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 2,
                borderLeft: `2px solid ${color}`,
                boxSizing: 'border-box',
              }}
              onClick={() => onEventClick(event)}
            >
              {icon}
              <Typography noWrap>{event.title}</Typography>
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
  );
}
