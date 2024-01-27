import Day from "../Day/DayMonth";
import React, { useContext, useEffect, useState } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { useLocation } from 'react-router-dom';
import { getDummyEventData } from '../../api/getDummyData'; // Assuming this is your API call

export default function MonthView({ month, isYearView = false }) {
  const { setShowEventModal,setDaySelected } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getDummyEventData();
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchData();
    setShowEventModal(false);
  }, [location, setShowEventModal]);

  return (
    <div className={isYearView ? 'year-grid' : 'flex-1 grid grid-cols-7 grid-rows-5'}>
      {month.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, idx) => (
            <Day 
              day={day} 
              events={events} // Make sure 'events' is passed here
              setDaySelected={setDaySelected}
              isYearView={isYearView}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

