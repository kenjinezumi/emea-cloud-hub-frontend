import React, { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';
import { getDummyEventData } from '../../api/getDummyData'; // Assuming this is your API call

export default function ListView() {
  const [events, setEvents] = useState([]);
  const { setShowEventModal } = useContext(GlobalContext);
  const location = useLocation(); // useLocation hook

  useEffect(() => {
    setShowEventModal(false);
    
    const fetchData = async () => {
      try {
        const eventData = await getDummyEventData();
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchData();
  }, [location, setShowEventModal]);

  return (
    <Paper sx={{ margin: 2, padding: 2, width: '90%', overflowY: 'auto' }}>
      <List>
        {events.map((event, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={<Typography variant="h6">{event.title}</Typography>}
              secondary={dayjs(event.startDate).format('dddd, MMMM D, YYYY')} // Assuming event has startDate
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
