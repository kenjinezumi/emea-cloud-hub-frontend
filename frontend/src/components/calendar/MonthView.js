import React, { useContext, useEffect, useState, useCallback } from "react";
import GlobalContext from "../../context/GlobalContext";
import { useLocation } from "react-router-dom";
import { getEventData } from "../../api/getEventData";
import EventPopup from "../popup/EventInfoModal";
import Day from "../Day/DayMonth";

export default function MonthView({ month, isYearView = false }) {
  const {
    setDaySelected,
    setShowEventModal,
    setShowInfoEventModal,
    filters,
    setSelectedEvent, // Assume these are coming from the GlobalContext
    setSelectedEvents, // Assume these are coming from the GlobalContext
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        // Only log filters once when they change

        const eventData = await getEventData("eventDataQuery");
        setEvents(eventData);

        if (!Array.isArray(eventData)) {
          console.error(
            "fetchAndFilterEvents was called with 'eventData' that is not an array:",
            eventData
          );
          return;
        }
        const hasFiltersApplied =
          [
            ...filters.subRegions,
            ...filters.gep,
            ...filters.buyerSegmentRollup,
            ...filters.accountSectors,
            ...filters.accountSegments,
            ...filters.productFamily,
            ...filters.industry,
          ].some((filter) => filter.checked) ||
          filters.isPartneredEvent !== undefined ||
          filters.draftStatus !== undefined;

        // If no filters are applied, return all events
        if (!hasFiltersApplied) {
          setFilteredEvents(eventData); // Ensure all events are shown
          return;
        }

        // Log once for each event, not repeatedly
        const results = await Promise.all(
          eventData.map(async (event) => {
            try {
              // Sub-region filter match
              const subRegionMatch =
                !filters.subRegions.some((subRegion) => subRegion.checked) ||
                filters.subRegions.some((subRegion) => {
                  try {
                    return (
                      subRegion.checked &&
                      event.subRegion?.includes(subRegion.label)
                    );
                  } catch (err) {
                    console.error(
                      "Error checking subRegion filter:",
                      err,
                      subRegion,
                      event
                    );
                    return false;
                  }
                });

              // GEP filter match
              const gepMatch =
                !filters.gep.some((gep) => gep.checked) ||
                filters.gep.some((gep) => {
                  try {
                    return gep.checked && event.gep?.includes(gep.label);
                  } catch (err) {
                    console.error(
                      "Error checking GEP filter:",
                      err,
                      gep,
                      event
                    );
                    return false;
                  }
                });

              // Buyer Segment Rollup filter match
              const buyerSegmentRollupMatch =
                !filters.buyerSegmentRollup.some(
                  (segment) => segment.checked
                ) ||
                filters.buyerSegmentRollup.some((segment) => {
                  try {
                    return (
                      segment.checked &&
                      event.buyerSegmentRollup?.includes(segment.label)
                    );
                  } catch (err) {
                    console.error(
                      "Error checking buyerSegmentRollup filter:",
                      err,
                      segment,
                      event
                    );
                    return false;
                  }
                });

              // Account Sector filter match
              const accountSectorMatch =
                !filters.accountSectors.some((sector) => sector.checked) ||
                filters.accountSectors.some((sector) => {
                  try {
                    return (
                      sector.checked && event.accountSectors?.[sector.label]
                    );
                  } catch (err) {
                    console.error(
                      "Error checking accountSectors filter:",
                      err,
                      sector,
                      event
                    );
                    return false;
                  }
                });

              // Account Segment filter match
              const accountSegmentMatch =
                !filters.accountSegments.some((segment) => segment.checked) ||
                filters.accountSegments.some((segment) => {
                  try {
                    return (
                      segment.checked &&
                      event.accountSegments?.[segment.label]?.selected
                    );
                  } catch (err) {
                    console.error(
                      "Error checking accountSegments filter:",
                      err,
                      segment,
                      event
                    );
                    return false;
                  }
                });

              // Product Family filter match
              const productFamilyMatch =
                !filters.productFamily.some((product) => product.checked) ||
                filters.productFamily.some((product) => {
                  try {
                    return (
                      product.checked &&
                      event.productAlignment?.[product.label]?.selected
                    );
                  } catch (err) {
                    console.error(
                      "Error checking productFamily filter:",
                      err,
                      product,
                      event
                    );
                    return false;
                  }
                });

              // Industry filter match
              const industryMatch =
                !filters.industry.some((industry) => industry.checked) ||
                filters.industry.some((industry) => {
                  try {
                    return (
                      industry.checked && event.industry === industry.label
                    );
                  } catch (err) {
                    console.error(
                      "Error checking industry filter:",
                      err,
                      industry,
                      event
                    );
                    return false;
                  }
                });

              // Boolean checks for isPartneredEvent and isDraft
              const isPartneredEventMatch =
                filters.isPartneredEvent === undefined ||
                filters.isPartneredEvent === event.isPartneredEvent;
              const selectedDraftStatuses = Array.isArray(filters.draftStatus)
                ? filters.draftStatus
                    .filter((option) => option.checked)
                    .map((option) => option.value)
                : [];
              const isDraftMatch =
                selectedDraftStatuses.length === 0 ||
                selectedDraftStatuses.includes(event.isDraft);

              return (
                subRegionMatch &&
                gepMatch &&
                buyerSegmentRollupMatch &&
                accountSectorMatch &&
                accountSegmentMatch &&
                productFamilyMatch &&
                industryMatch &&
                isPartneredEventMatch &&
                isDraftMatch
              );
            } catch (filterError) {
              console.error(
                "Error applying filters to event:",
                filterError,
                event
              );
              return false;
            }
          })
        );

        setFilteredEvents(eventData.filter((_, index) => results[index]));
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchAndFilterEvents();
  }, [location, filters]); // Add the necessary dependencies here
  useEffect(() => {
    console.log("Filters:", filters.isDraft);
  }, [filters.isDraft]);

  useEffect(() => {
    console.log("Filters in GlobalContext:", filters);
  }, [filters]);

  // Close modals when location changes
  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // Memoize the event handlers to prevent re-creation on each render
  const handleDayClick = useCallback(
    (day) => {
      setDaySelected(day);
      setSelectedEvents([]); // Ensure selectedEvents is set/reset as needed
      setSelectedEvent(null); // Ensure selectedEvent is set/reset as needed
    },
    [setDaySelected, setSelectedEvents, setSelectedEvent]
  );

  return (
    <div
      className={
        isYearView
          ? "year-grid"
          : "flex-1 grid grid-cols-7 grid-rows-5 overflow"
      }
    >
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
