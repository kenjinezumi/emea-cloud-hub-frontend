import React, { useContext, useEffect, useState, useCallback } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { useLocation } from 'react-router-dom';
import { getEventData } from '../../api/getEventData'; 
import EventPopup from '../popup/EventInfoModal'; 
import Day from '../Day/DayMonth';

export default function MonthView({ month, isYearView = false }) {
  const {
    setDaySelected,
    setShowEventModal,
    setShowInfoEventModal,
    filters,
    selectedEvent,    // Assume these are coming from the GlobalContext
    setSelectedEvent, // Assume these are coming from the GlobalContext
    selectedEvents,   // Assume these are coming from the GlobalContext
    setSelectedEvents // Assume these are coming from the GlobalContext
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const location = useLocation();

  // Fetch events and apply filters whenever location or filters change
  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const eventData = await getEventData('eventDataQuery');
        setEvents(eventData);

        if (!Array.isArray(eventData)) {
          console.error("fetchAndFilterEvents was called with 'eventData' that is not an array:", eventData);
          return;
        }

        const results = await Promise.all(eventData.map(async (event) => {
          const regionMatch = filters.regions.some(region => region.checked && event.region?.includes(region.label));
          const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
          const okrMatch = filters.okr.some(okr => okr.checked && event.okr?.some(eventOkr => eventOkr.type === okr.label));
          const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority?.includes(seniority.label));
          const isDraftMatch = filters.isDraft.some(draft => draft.checked && (draft.label === 'Draft' ? event.isDraft : !event.isDraft));

          return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch && isDraftMatch;
        }));

        setFilteredEvents(eventData.filter((_, index) => results[index]));
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    fetchAndFilterEvents();
  }, [location, filters]);

  // Close modals when location changes
  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // Memoize the event handlers to prevent re-creation on each render
  const handleDayClick = useCallback((day) => {
    setDaySelected(day);
    setSelectedEvents([]); // Ensure selectedEvents is set/reset as needed
    setSelectedEvent(null); // Ensure selectedEvent is set/reset as needed
  }, [setDaySelected, setSelectedEvents, setSelectedEvent]);

  return (
    <div className={isYearView ? 'year-grid' : 'flex-1 grid grid-cols-7 grid-rows-5 overflow'}>
      {month.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, idx) => (
            <Day
              key={`day-${i}-${idx}`} 
              day={day}
              events={filteredEvents}
              setDaySelected={handleDayClick}
              isYearView={isYearView}
            />
          ))}
        </React.Fragment>
      ))}

      <EventPopup /> {/* Render the EventPopup component */}
    </div>
  );
}
