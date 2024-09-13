import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import { getEventData } from '../../api/getEventData';
import { Box, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArticleIcon from '@mui/icons-material/Article';

dayjs.extend(minMax);

export default function DayColumn({ daySelected, onEventClick }) {
  const {
    setShowEventModal,
    setDaySelected,
    setSelectedEvent,
    setShowInfoEventModal,
    filters,
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [eventGroups, setEventGroups] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentTimePosition, setCurrentTimePosition] = useState(0); // State for current time position
  const hourHeight = 60;
  const startHour = 0;
  const endHour = 24;
  const dayColumnRef = useRef(null); // Reference for auto-scroll

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
        const subRegionMatch = filters.subRegions.some(subRegion => subRegion.checked && event.subRegion?.includes(subRegion.label));
        const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
  
        const gepMatch = filters.gep.some(gep => gep.checked && event.gep?.includes(gep.label));
  
        const buyerSegmentRollupMatch = filters.buyerSegmentRollup.some(segment => 
          segment.checked && event.buyerSegmentRollup?.includes(segment.label)
        );
  
        const accountSectorMatch = filters.accountSectors.some(sector => 
          sector.checked && event.accountSectors?.[sector.label]
        );
  
        const accountSegmentMatch = filters.accountSegments.some(segment => 
          segment.checked && event.accountSegments?.[segment.label]?.selected
        );
  
        const productFamilyMatch = filters.productFamily.some(product => 
          product.checked && event.productAlignment?.[product.label]?.selected
        );
  
        const industryMatch = filters.industry.some(industry => 
          industry.checked && event.industry === industry.label
        );
  
        const isPartneredEventMatch = filters.isPartneredEvent.some(partner => 
          partner.checked && event.isPartneredEvent === (partner.label === 'Yes')
        );
  
        const isDraftMatch = filters.isDraft.some(draft => draft.checked && (draft.label === 'Draft' ? event.isDraft : !event.isDraft));
  
        return subRegionMatch && eventTypeMatch && gepMatch && buyerSegmentRollupMatch &&
               accountSectorMatch && accountSegmentMatch && productFamilyMatch &&
               industryMatch && isPartneredEventMatch && isDraftMatch;
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
  }, [setShowEventModal, setShowInfoEventModal]);

  useEffect(() => {
    setEventGroups(calculateOverlapGroups(events));
  }, [events]);

  useEffect(() => {
    // Update current time position
    const updateCurrentTimePosition = () => {
      const now = dayjs();
      const position = now.hour() * hourHeight + (now.minute() / 60) * hourHeight;
      setCurrentTimePosition(position);
    };

    updateCurrentTimePosition(); // Initial update
    const interval = setInterval(updateCurrentTimePosition, 60000); // Update every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [hourHeight]);

  const calculateOverlapGroups = useCallback((events) => {
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
  }, []);

  const isOverlapping = useCallback((event, group) => {
    return group.some((groupEvent) => {
      return dayjs(event.startDate).isBefore(groupEvent.endDate) &&
             dayjs(groupEvent.startDate).isBefore(event.endDate);
    });
  }, []);

  const calculateEventBlockStyles = useCallback((event) => {
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
  }, [daySelected, eventGroups]);

  const handleEventClickInternal = useCallback((event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  }, [onEventClick]);

  const handleSlotClick = useCallback((hour) => {
    setDaySelected(daySelected.hour(hour).minute(0));
    setShowEventModal(true);
  }, [daySelected, setDaySelected, setShowEventModal]);

  const dayEvents = useMemo(() => {
    return filteredEvents.filter(evt =>
      dayjs(evt.startDate).isSame(daySelected, 'day') ||
      dayjs(evt.endDate).isSame(daySelected, 'day') ||
      (dayjs(evt.startDate).isBefore(daySelected, 'day') && dayjs(evt.endDate).isAfter(daySelected, 'day'))
    );
  }, [filteredEvents, daySelected]);

  const getEventStyleAndIcon = useCallback((eventType) => {
    switch (eventType) {
      case 'Online Event':
        return { backgroundColor: '#e3f2fd', color: '#1a73e8', icon: <LanguageIcon fontSize="small" style={{ marginRight: '5px' }} /> };
      case 'Physical Event':
        return { backgroundColor: '#fce4ec', color: '#d32f2f', icon: <LocationOnIcon fontSize="small" style={{ marginRight: '5px' }} /> };
      case 'Hybrid Event':
        return { backgroundColor: '#f3e5f5', color: '#6a1b9a', icon: <EventIcon fontSize="small" style={{ marginRight: '5px' }} /> };
      case 'Customer Story':
        return { backgroundColor: '#e8f5e9', color: '#2e7d32', icon: <EventIcon fontSize="small" style={{ marginRight: '5px' }} /> };
      case 'Blog Post':
        return { backgroundColor: '#fffde7', color: '#f57f17', icon: <ArticleIcon fontSize="small" style={{ marginRight: '5px' }} /> };
      default:
        return { backgroundColor: '#e3f2fd', color: '#1a73e8', icon: <EventIcon fontSize="small" style={{ marginRight: '5px' }} /> };
    }
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        height: `${hourHeight * (endHour - startHour)}px`,
        borderRight: '2px solid #bbb',
        borderBottom: '1px solid #ddd',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',  // Adjusted for transparency
      }}
      ref={dayColumnRef}
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
            borderTop: '1px solid #ddd',
            borderBottom: i === (endHour - startHour - 1) ? 'none' : '1px solid rgba(0, 0, 0, 0.1)', // Add a bottom border for visibility
            cursor: 'pointer',
          }}
          onClick={() => handleSlotClick(i + startHour)}
        />
      ))}

      {/* Current Time Line */}
      <Box
        sx={{
          position: 'absolute',
          top: `${currentTimePosition}px`,
          left: '0',
          right: '0',
          height: '2px',  // Make the line thicker
          backgroundColor: '#d32f2f',
          zIndex: 5,
        }}
      />

      {/* Render Events */}
      {dayEvents.map((event) => {
        const { top, height, left, width } = calculateEventBlockStyles(event);
        const { backgroundColor, color, icon } = getEventStyleAndIcon(event.eventType);
        return (
          <div
            key={event.eventId}
            style={{
              position: 'absolute',
              top: `${top}px`,
              left: `${left}%`,
              width: `${width}%`,
              height: `${height}px`,
              backgroundColor: backgroundColor,
              color: color,
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
              borderLeft: `2px solid ${color}`,
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
              e.currentTarget.style.backgroundColor = backgroundColor;
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleEventClickInternal(event);
            }}
          >
            {icon}
            <Typography>{event.title}</Typography>
          </div>
        );
      })}
    </Box>
  );
}
