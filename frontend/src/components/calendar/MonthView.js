import React, { useContext, useEffect, useState } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { useLocation } from 'react-router-dom';
import { getEventData } from '../../api/getEventData'; 
import EventPopup from '../popup/EventInfoModal'; 
import Day from '../Day/DayMonth';

export default function MonthView({ month, isYearView = false }) {
  const { setDaySelected, setShowEventModal, setShowInfoEventModal, filters } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const [filteredEvents, setFilteredEvents] = useState([]);

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
  }, [location]);

  useEffect(() => {
    const applyFilters = async (events, filters) => {
      if (!Array.isArray(events)) {
        console.error("applyFilters was called with 'events' that is not an array:", events);
        return [];
      }

      const filterPromises = events.map(event => {
        return (async () => {
          const regionMatch = filters.regions.some(region => region.checked && event.region && event.region.includes(region.label));
          const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
          const okrMatch = filters.okr.some(okr => okr.checked && event.okr && event.okr.includes(okr.label));
          const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority && event.audienceSeniority.includes(seniority.label));
          const isDraftMatch = filters.isDraft.some(draft => draft.checked && (draft.label === 'Draft' ? event.isDraft : !event.isDraft));

          return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch && isDraftMatch;
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
    setShowInfoEventModal(false);
  }, [location]);

  return (
    <div className={isYearView ? 'year-grid' : 'flex-1 grid grid-cols-7 grid-rows-5 overflow'}>
      {month.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, idx) => (
            <Day
              key={`day-${i}-${idx}`} 
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
