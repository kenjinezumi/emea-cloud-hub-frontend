import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';
import { getEventData } from '../../api/getEventData';
import EventInfoPopup from '../popup/EventInfoModal'; 

export default function ListView({}) {
  const [events, setEvents] = useState([]);
  const { filters } = useContext(GlobalContext);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const {
    setShowEventModal,
    setShowInfoEventModal,
    searchText,
    setSearchText,
    showEventInfoModal,
    setSelectedEvent,
  } = useContext(GlobalContext);
  const location = useLocation(); // useLocation hook

  const fetchData = async () => {
    try {
      const eventData = await getEventData('eventDataQuery');
      setEvents(eventData);
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location]);

  useEffect(() => {
    const applyFilters = async (events, filters) => {
      // Ensure 'events' is an array before proceeding
      if (!Array.isArray(events)) {
        console.error("applyFilters was called with 'events' that is not an array:", events);
        return [];
      }

      const filterPromises = events.map(event => {
        // Immediately invoked asynchronous function to handle possible async conditions inside the filter logic
        return (async () => {
          const regionMatch = filters.regions.some(region => region.checked && event.region && event.region.includes(region.label));
          const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
          const okrMatch = filters.okr.some(okr => okr.checked && event.okr && event.okr.includes(okr.label));
          const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority && event.audienceSeniority.includes(seniority.label));

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

  useEffect(() => {
    setShowEventModal(false);

    const fetchData = async () => {
      try {
        const eventData = await getEventData('eventDataQuery');
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    fetchData();
  }, [location, setShowEventModal]);

  useEffect(() => {
    // Fetch events when searchText changes
    fetchData();
  }, [searchText]);

  useEffect(() => {
    // Filter events based on searchText here
    if (searchText) {
      const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(searchText.toLowerCase()),
      );
      setEvents(filteredEvents);
    }
  }, [searchText, events, location, setShowEventModal]);

  const handleEventClick = (eventData) => {
    setSelectedEvent(eventData);
    setShowInfoEventModal(true);
  };

  return (
    <Paper sx={{ margin: 2, padding: 2, width: '90%', overflowY: 'auto' }}>
      <List>
        {filteredEvents.map((event, index) => (
          <ListItem
            key={index}
            divider
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light hover effect
              },
              cursor: 'pointer',
              margin: '4px 0',
              padding: '10px',
              borderLeft: '4px solid #1a73e8', // Blue left border for event type indication
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
              transition: 'background-color 0.2s, box-shadow 0.2s', // Smooth transitions for hover effects
            }}
            onClick={() => {
              handleEventClick(event);
            }}
          >
            <ListItemText
              primary={<Typography variant="h6">{event.title} {event.emoji}</Typography>}
              secondary={`Start date: ${dayjs(event.startDate).format('dddd, MMMM D, YYYY')}\nCountries: ${event.country?.join(', ')}`}
            />
          </ListItem>
        ))}
      </List>
      {showEventInfoModal && <EventInfoPopup />}
    </Paper>
  );
}
