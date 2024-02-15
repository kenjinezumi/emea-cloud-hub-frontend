import Day from '../Day/DayMonth';
import React, {useContext, useEffect, useState} from 'react';
import GlobalContext from '../../context/GlobalContext';
import {useLocation} from 'react-router-dom';
import {getDummyEventData} from '../../api/getDummyData'; // Assuming this is your API call
import EventPopup from '../popup/EventInfoModal'; // Import the EventPopup component

export default function MonthView({month, isYearView = false}) {
  const {setDaySelected, setShowEventModal, setShowInfoEventModal} = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getDummyEventData();
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    fetchData();
  }, [location]);


  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location]);

  return (
    <div className={isYearView ? 'year-grid' : 'flex-1 grid grid-cols-7 grid-rows-5'}>
      {month.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, idx) => (
            <Day
              key={`day-${i}-${idx}`} // Add a unique key prop
              day={day}
              events={events}
              setDaySelected={setDaySelected}
              isYearView={isYearView}
            />
          ))}
        </React.Fragment>
      ))}

      <EventPopup /> {/* Render the EventPopup component */}
    </div>
  );
}
