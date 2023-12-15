import dayjs from 'dayjs';
import React, { useContext } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { Typography, Paper, List, ListItem, Divider } from '@mui/material';

export default function DayView({ events = defaultEvents }) {
  const { daySelected } = useContext(GlobalContext);

  const startHour = 6; // 8 AM
  const endHour = 20; // 5 PM
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);

  return (
    
    <Paper sx={{ margin: 2, width: '90%', maxHeight: '100%', overflowY: 'auto', border: 'none' }}> {/* Set border to 'none' */}
      <Typography variant="h5" align="center" gutterBottom marginBottom={'20px'}>
        {daySelected.format('dddd, MMMM D, YYYY')}
      </Typography>
      {hours.map(hour => (
        <React.Fragment key={hour}>
          <Typography 
            style={{ 
              position: 'relative', 
              top: '-10px', 
              fontSize: '0.75rem', // Make font smaller
              color: 'grey' // Change color to light grey
            }}
          >
            {dayjs().hour(hour).format('h A')}
          </Typography>
          <Divider />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', minHeight: '100px' }}>
            <List style={{ width: '100%' }}>
              {events.filter(event => dayjs(event.start).hour() === hour && dayjs(event.start).isSame(daySelected, 'day')).map((event, index) => (
                <ListItem key={index} style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#e0e0e0', marginBottom: '10px' }}>
                  {event.title}
                </ListItem>
              ))}
            </List>
          </div>
        </React.Fragment>
      ))}
    </Paper>
  );
}

const defaultEvents = [
  { start: dayjs().hour(9).minute(0), title: "Team Meeting" },
  { start: dayjs().hour(13).minute(30), title: "Lunch with Client" },
  { start: dayjs().hour(15).minute(0), title: "Project Discussion" }
];
