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
  const {filters} = useContext(GlobalContext);
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getDummyEventData('eventDataQuery');
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    fetchData();
  }, [location]);

  useEffect(() => {
    const applyFilters = (events, filters) => {

      return events.filter((event) => {
        const regionMatch = filters.regions.some((region) => region.checked && event.region.includes(region.label));
        const eventTypeMatch = filters.eventType.some((type) => type.checked && event.eventType === type.label);
        const okrMatch = filters.okr.some((okr) => okr.checked && event.okr.includes(okr.label));
        const audienceSeniorityMatch = filters.audienceSeniority.some((seniority) => seniority.checked && event.audienceSeniority.includes(seniority.label));

        return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch;
      });
    };
    const filteredEvents = applyFilters(events, filters);
    setFilteredEvents(applyFilters(events, filters));
  }, [events, filters]);


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
              events={filteredEvents}
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
