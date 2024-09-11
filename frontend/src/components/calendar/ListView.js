import React, { useContext, useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';
import { getEventData } from '../../api/getEventData';
import EventInfoPopup from '../popup/EventInfoModal';

export default function ListView() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const {
    filters,
    setShowEventModal,
    setShowInfoEventModal,
    searchText,
    showEventInfoModal,
    setSelectedEvent,
  } = useContext(GlobalContext);
  const location = useLocation(); // useLocation hook

  // Fetch events whenever the location changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getEventData('eventDataQuery');
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    fetchData();
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // Apply filters to events
  useEffect(() => {
    const applyFilters = async () => {
      if (!Array.isArray(events)) {
        console.error("applyFilters was called with 'events' that is not an array:", events);
        return;
      }

      const results = await Promise.all(events.map(async (event) => {
        const regionMatch = filters.regions.some(region => region.checked && event.region?.includes(region.label));
        const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
        const okrMatch = filters.okr.some(okr => okr.checked && event.okr?.some(eventOkr => eventOkr.type === okr.label));
        const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority?.includes(seniority.label));

        return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch;
      }));

      setFilteredEvents(events.filter((_, index) => results[index]));
    };

    applyFilters();
  }, [events, filters]);

  // Filter events based on search text
  useEffect(() => {
    if (searchText) {
      const lowercasedSearchText = searchText.toLowerCase();
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(lowercasedSearchText) ||
        event.description.toLowerCase().includes(lowercasedSearchText)
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchText, events]);

  // Memoized function to handle event click
  const handleEventClick = useCallback((eventData) => {
    setSelectedEvent(eventData);
    setShowInfoEventModal(true);
  }, [setSelectedEvent, setShowInfoEventModal]);

  // Helper function to determine the border color based on the event type
  const getBorderColor = (eventType) => {
    switch (eventType) {
      case 'Online Event':
        return '#4285F4'; // Blue
      case 'Physical Event':
        return '#DB4437'; // Red
      case 'Hybrid Event':
        return '#0F9D58'; // Green
      case 'Customer Story':
        return '#F4B400'; // Yellow
      case 'Blog Post':
        return '#AB47BC'; // Purple
      default:
        return '#e3f2fd'; // Default Light Blue
    }
  };

  return (
    <Paper sx={{ margin: 2, padding: 2, width: '90%', overflowY: 'auto' }}>
      <List>
        {filteredEvents.map((event, index) => {
          const borderColor = getBorderColor(event.eventType);

          return (
            <ListItem
              key={index}
              divider
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                cursor: 'pointer',
                margin: '4px 0',
                padding: '10px',
                borderLeft: `8px solid ${borderColor}`, // Apply the dynamic border color
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.2s, box-shadow 0.2s',
              }}
              onClick={() => handleEventClick(event)}
            >
              <ListItemText
                primary={<Typography variant="h6">{event.title} {event.emoji}</Typography>}
                secondary={`Start date: ${dayjs(event.startDate).format('dddd, MMMM D, YYYY')}\nCountries: ${event.country?.join(', ')}`}
              />
            </ListItem>
          );
        })}
      </List>
      {showEventInfoModal && <EventInfoPopup />}
    </Paper>
  );
}
