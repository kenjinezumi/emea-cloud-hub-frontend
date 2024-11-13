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
            ...filters.regions,
            ...filters.countries,
          ].some((filter) => filter.checked) ||
          filters.partnerEvent !== undefined ||
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
                      event.audienceSeniority?.includes(segment.label)
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
                      sector.checked &&
                      event.accountSectors?.[sector.label.toLowerCase()] ===
                        true
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
                    const accountSegment =
                      event.accountSegments?.[segment.label];
                    return (
                      segment.checked &&
                      accountSegment?.selected && // Convert selected to a boolean
                      parseFloat(accountSegment?.percentage) > 0 // Convert percentage to a number
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
                    const productAlignment =
                      event.productAlignment?.[product.label];
                    return (
                      product.checked &&
                      productAlignment?.selected && // Convert selected to a boolean
                      parseFloat(productAlignment?.percentage) > 0 // Convert percentage to a number and ensure it's greater than 0
                    );
                  } catch (err) {
                    console.error("Error checking productFamily filter:", err);
                    return false;
                  }
                });

              // Industry filter match
              const industryMatch =
                !filters.industry.some((industry) => industry.checked) ||
                filters.industry.some((industry) => {
                  try {
                    return (
                      industry.checked &&
                      event.industry?.includes(industry.label)
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

              const selectedPartneredStatuses = Array.isArray(
                filters.partnerEvent
              )
                ? filters.partnerEvent
                    .filter((option) => option.checked)
                    .map((option) => option.value)
                : [];

              const regionMatch =
                !filters.regions.some((region) => region.checked) ||
                filters.regions.some((region) => {
                  try {
                    return (
                      region.checked && event.region?.includes(region.label)
                    );
                  } catch (err) {
                    console.error(
                      "Error checking region filter:",
                      err,
                      region,
                      event
                    );
                    return false;
                  }
                });

              const countryMatch =
                !filters.countries.some((country) => country.checked) ||
                filters.countries.some((country) => {
                  try {
                    return (
                      country.checked && event.country?.includes(country.label)
                    );
                  } catch (err) {
                    console.error(
                      "Error checking country filter:",
                      err,
                      country,
                      event
                    );
                    return false;
                  }
                });

              const isPartneredEventMatch =
                selectedPartneredStatuses.length === 0 ||
                selectedPartneredStatuses.includes(event.isPartneredEvent);

              const selectedDraftStatuses = Array.isArray(filters.draftStatus)
                ? filters.draftStatus
                    .filter((option) => option.checked)
                    .map((option) => option.value)
                : [];
              const isDraftMatch =
                selectedDraftStatuses.length === 0 ||
                (() => {
                  // Initialize an array to hold applicable statuses
                  const applicableStatuses = [];

                  // Add "Draft" if the event is in draft mode
                  if (event.isDraft) {
                    applicableStatuses.push("Draft");
                  } else {
                    // If not a draft, add "Finalized" as a base status
                    applicableStatuses.push("Finalized");

                    // Add "Invite available" if the event is not a draft and invite options (Gmail or Salesloft) are available
                    if (
                      !event.isDraft &&
                      event.languagesAndTemplates?.some((template) =>
                        ["Gmail", "Salesloft"].includes(template.platform)
                      )
                    ) {
                      applicableStatuses.push("Invite available");
                    }
                  }

                  // Check if any selectedDraftStatuses match the applicable statuses
                  return selectedDraftStatuses.some((status) =>
                    applicableStatuses.includes(status)
                  );
                })();

              return (
                subRegionMatch &&
                gepMatch &&
                buyerSegmentRollupMatch &&
                accountSectorMatch &&
                accountSegmentMatch &&
                productFamilyMatch &&
                industryMatch &&
                isPartneredEventMatch &&
                isDraftMatch &&
                regionMatch &&
                countryMatch
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
              day={day} // Pass the updated day object
              events={filteredEvents}
              isYearView={isYearView}
              month={day.month} // Access the month correctly from day.date
            />
          ))}
        </React.Fragment>
      ))}
      <EventPopup /> {/* Render the EventPopup component */}
    </div>
  );
}
