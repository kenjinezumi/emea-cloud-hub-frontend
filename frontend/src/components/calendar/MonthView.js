import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import GlobalContext from "../../context/GlobalContext";
import { useLocation } from "react-router-dom";
import { getEventData } from "../../api/getEventData";
import EventPopup from "../popup/EventInfoModal";
import Day from "../Day/DayMonth";
import dayjs from "dayjs";
export default function MonthView({ month, isYearView = false }) {
  const {
    daySelected,
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
  function generateMonthView(month, year) {
    const startOfMonth = dayjs(`${year}-${month + 1}-01`).startOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = startOfMonth.endOf("month").endOf("week");
  
    const days = [];
    let currentDay = startOfCalendar;
  
    while (currentDay.isBefore(endOfCalendar, "day")) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(currentDay.clone()); // Clone to avoid mutation
        currentDay = currentDay.add(1, "day");
      }
      days.push(week);
    }
  
    return days;
  }
  
  
  const monthDays = useMemo(() => {
    const year = daySelected.year(); // Extract year from the selected day
    const month = daySelected.month(); // Extract month (0-based) from the selected day
    return generateMonthView(month, year);
  }, [daySelected]);
  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const eventData = await getEventData("eventDataQuery");
        setEvents(eventData);

        if (!Array.isArray(eventData)) {
          console.error(
            "fetchAndFilterEvents was called with 'eventData' that is not an array:",
            eventData
          );
          return;
        }

        const filteredByDay = eventData.filter((event) => {
          const eventStart = dayjs(event.startDate);
          const eventEnd = dayjs(event.endDate);
          const selectedDayStart = daySelected.startOf("day");
          const selectedDayEnd = daySelected.endOf("day");

          return (
            eventStart.isSame(daySelected, "day") ||
            eventEnd.isSame(daySelected, "day") ||
            (eventStart.isBefore(selectedDayEnd) &&
              eventEnd.isAfter(selectedDayStart))
          );
        });

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
            ...filters.programName,
            ...filters.activityType,
            


          ].some((filter) => filter.checked) ||
          filters.partnerEvent !== undefined ||
          filters.isNewlyCreated !== undefined ||
          filters.draftStatus !== undefined;

        if (!hasFiltersApplied) {
          setEvents(filteredByDay);
          setFilteredEvents(filteredByDay);
          return;
        }

        const results = await Promise.all(
          filteredByDay.map(async (event) => {
            try {
              const subRegionMatch =
                !filters.subRegions.some((subRegion) => subRegion.checked) ||
                filters.subRegions.some((subRegion) => {
                  try {
                    return (
                      subRegion.checked &&
                      event.subRegion?.includes(subRegion.label)
                    );
                  } catch (err) {
                    console.error("Error checking subRegion filter:", err);
                    return false;
                  }
                });

              const gepMatch =
                !filters.gep.some((gep) => gep.checked) ||
                filters.gep.some((gep) => {
                  try {
                    return gep.checked && event.gep?.includes(gep.label);
                  } catch (err) {
                    console.error("Error checking GEP filter:", err);
                    return false;
                  }
                });
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
                      err
                    );
                    return false;
                  }
                });

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

              const productFamilyMatch =
                !filters.productFamily.some((product) => product.checked) ||
                filters.productFamily.some((product) => {
                  try {
                    const productAlignment =
                      event.productAlignment?.[product.label];
                    return (
                      product.checked &&
                      productAlignment?.selected &&
                      parseFloat(productAlignment?.percentage) > 0
                    );
                  } catch (err) {
                    console.error("Error checking productFamily filter:", err);
                    return false;
                  }
                });

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
              const selectedPartneredStatuses = Array.isArray(
                filters.partnerEvent
              )
                ? filters.partnerEvent
                    .filter((option) => option.checked)
                    .map((option) => option.value)
                : [];

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
                      event.languagesAndTemplates?.some(template =>
                        ["Gmail", "Salesloft"].includes(template.platform)
                      )
                    ) {
                      applicableStatuses.push("Invite available");
                    }
                  }
              
                  // Check if any selectedDraftStatuses match the applicable statuses
                  return selectedDraftStatuses.some(status => applicableStatuses.includes(status));
                })();
                const programNameMatch =
                filters.programName.every((filter) => !filter.checked) ||
                filters.programName.some((filter) => {
                  const isChecked = filter.checked;
                  const matches = event.programName?.some((name) =>
                    name.toLowerCase().includes(filter.label.toLowerCase())
                  );
              
                  return isChecked && matches;
                });

                const activityTypeMatch =
                !filters.activityType.some((activity) => activity.checked) || // If no activity types are checked, consider all events
                filters.activityType.some((activity) => {
                  try {
                    // Check if the event type matches the checked activity types
                    return (
                      activity.checked &&
                      event.eventType?.toLowerCase() === activity.label.toLowerCase() // Ensure case-insensitive comparison
                    );
                  } catch (err) {
                    console.error("Error checking activityType filter:", err, activity, event);
                    return false; // Handle errors gracefully
                  }
                });
              
                const isNewlyCreatedMatch =
  !filters.newlyCreated?.some((option) => option.checked) ||
  filters.newlyCreated?.some((option) => {
    if (option.checked) {
      const entryCreatedDate = event.entryCreatedDate
        ? dayjs(event.entryCreatedDate)
        : null;

      if (!entryCreatedDate || !entryCreatedDate.isValid()) {
        console.warn("Invalid or missing entryCreatedDate for event:", event);
        return option.value === false; // Consider missing dates as "old"
      }

      const isWithinTwoWeeks = dayjs().diff(entryCreatedDate, "day") <= 14;
      return option.value === isWithinTwoWeeks;
    }
    return false;
  });

              
              
                
                
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
                countryMatch && 
                programNameMatch && activityTypeMatch && isNewlyCreatedMatch

              );
            } catch (filterError) {
              console.error("Error applying filters to event:", filterError);
              return false;
            }
          })
        );

        const finalFilteredEvents = filteredByDay.filter(
          (_, index) => results[index]
        );

        setFilteredEvents(finalFilteredEvents);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchAndFilterEvents();
  }, [location, filters, daySelected]);
  



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
