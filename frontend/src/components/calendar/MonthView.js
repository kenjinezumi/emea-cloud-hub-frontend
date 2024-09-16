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
  
        // Log once for each event, not repeatedly
        const results = await Promise.all(eventData.map(async (event) => {
          try {
            // Check each filter match and log the results
            const subRegionMatch = filters.subRegions.some(subRegion => {
              const match = subRegion.checked && event.subRegion?.includes(subRegion.label);
              console.log(`SubRegion Match for event ${event.eventId}:`, match);
              return match;
            });
  
            const gepMatch = filters.gep.some(gep => {
              const match = gep.checked && event.gep?.includes(gep.label);
              console.log(`GEP Match for event ${event.eventId}:`, match);
              return match;
            });
  
            const buyerSegmentRollupMatch = filters.buyerSegmentRollup.some(segment => {
              const match = segment.checked && event.buyerSegmentRollup?.includes(segment.label);
              console.log(`Buyer Segment Rollup Match for event ${event.eventId}:`, match);
              return match;
            });
  
            const accountSectorMatch = filters.accountSectors.some(sector => {
              const match = sector.checked && event.accountSectors?.[sector.label];
              console.log(`Account Sector Match for event ${event.eventId}:`, match);
              return match;
            });
  
            const accountSegmentMatch = filters.accountSegments.some(segment => {
              const match = segment.checked && event.accountSegments?.[segment.label]?.selected;
              console.log(`Account Segment Match for event ${event.eventId}:`, match);
              return match;
            });
  
            const productFamilyMatch = filters.productFamily.some(product => {
              const match = product.checked && event.productAlignment?.[product.label]?.selected;
              console.log(`Product Family Match for event ${event.eventId}:`, match);
              return match;
            });
  
            const industryMatch = filters.industry.some(industry => {
              const match = industry.checked && event.industry === industry.label;
              console.log(`Industry Match for event ${event.eventId}:`, match);
              return match;
            });
  
            const isPartneredEventMatch = filters.isPartneredEvent === event.isPartneredEvent;
            console.log(`Is Partnered Event Match for event ${event.eventId}:`, isPartneredEventMatch);
  
            const isDraftMatch = filters.isDraft === event.isDraft;
            console.log(`Is Draft Match for event ${event.eventId}:`, isDraftMatch);
  
            const eventMatches = subRegionMatch || gepMatch || buyerSegmentRollupMatch || accountSectorMatch || accountSegmentMatch || productFamilyMatch || industryMatch || isPartneredEventMatch || isDraftMatch;
            console.log(`Event ${event.eventId} Match Result:`, eventMatches);
  
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
