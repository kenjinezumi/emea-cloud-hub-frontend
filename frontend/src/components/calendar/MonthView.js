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

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        // Only log filters once when they change
        console.log('Selected Filters:', filters);
  
        const eventData = await getEventData('eventDataQuery');
        setEvents(eventData);
  
        if (!Array.isArray(eventData)) {
          console.error("fetchAndFilterEvents was called with 'eventData' that is not an array:", eventData);
          return;
        }
        const hasFiltersApplied = [
          ...filters.subRegions,
          ...filters.gep,
          ...filters.buyerSegmentRollup,
          ...filters.accountSectors,
          ...filters.accountSegments,
          ...filters.productFamily,
          ...filters.industry
        ].some(filter => filter.checked) || filters.isPartneredEvent !== undefined || filters.isDraft !== undefined;
       
        // If no filters are applied, return all events
        if (!hasFiltersApplied) {
          console.log('The events are', events)
          return events;
        }
  
        // Log once for each event, not repeatedly
        const results = await Promise.all(eventData.map(async (event) => {
          try {
            // Check each filter match and log the results
            const subRegionMatch = filters.subRegions.some(subRegion => {
              const match = subRegion.checked && event.subRegion?.includes(subRegion.label);
              return match;
            });
  
            const gepMatch = filters.gep.some(gep => {
              const match = gep.checked && event.gep?.includes(gep.label);
              return match;
            });
  
            const buyerSegmentRollupMatch = filters.buyerSegmentRollup.some(segment => {
              const match = segment.checked && event.buyerSegmentRollup?.includes(segment.label);
              return match;
            });
  
            const accountSectorMatch = filters.accountSectors.some(sector => {
              const match = sector.checked && event.accountSectors?.[sector.label];
              return match;
            });
  
            const accountSegmentMatch = filters.accountSegments.some(segment => {
              const match = segment.checked && event.accountSegments?.[segment.label]?.selected;
              return match;
            });
  
            const productFamilyMatch = filters.productFamily.some(product => {
              const match = product.checked && event.productAlignment?.[product.label]?.selected;
              return match;
            });
  
            const industryMatch = filters.industry.some(industry => {
              const match = industry.checked && event.industry === industry.label;
              return match;
            });
  
            const isPartneredEventMatch = filters.isPartneredEvent === event.isPartneredEvent;
  
            const isDraftMatch = filters.isDraft === event.isDraft;
  
            const eventMatches = subRegionMatch || gepMatch || buyerSegmentRollupMatch || accountSectorMatch || accountSegmentMatch || productFamilyMatch || industryMatch || isPartneredEventMatch || isDraftMatch;
  
            return eventMatches;
          } catch (filterError) {
            console.error('Error applying filters to event:', filterError, event);
            return false;
          }
        }));
  
        setFilteredEvents(eventData.filter((_, index) => results[index]));
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };
  
    fetchAndFilterEvents();
  }, [location, filters]); // Add the necessary dependencies here
  
  

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
