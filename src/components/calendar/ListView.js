import React, { useContext, useEffect } from 'react';
import dayjs from 'dayjs';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';


export default function ListView({ events = DummyEvents }) {

const { showEventModal, daySelected, setShowEventModal, setDaySelected } = useContext(GlobalContext);

const location = useLocation(); // useLocation hook

useEffect(() => {
 
    setShowEventModal(false);
  
}, [location]);
  return (
    <Paper sx={{ margin: 2, padding: 2, width: '90%', overflowY: 'auto' }}>
      <List>
        {events.map((event, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={<Typography variant="h6">{event.title}</Typography>}
              secondary={dayjs(event.date).format('dddd, MMMM D, YYYY')}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

const DummyEvents = [
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  { date: new Date(), title: "Event 1" },
  { date: new Date(), title: "Event 2" },
  // ... more events
];
