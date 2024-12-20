import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import GlobalContext from "../../context/GlobalContext";
import { Typography, Paper, Box, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { useLocation } from "react-router-dom";
import { getEventData } from "../../api/getEventData";
import EventInfoPopup from "../popup/EventInfoModal";
import { getEventStyleAndIcon } from "../../utils/eventStyles";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Extend dayjs with these plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(minMax);

export default function DayView() {
  const eventSlotMapRef = useRef({});
  const {
    daySelected,
    setShowEventModal,
    setSelectedEvent,
    setShowInfoEventModal,
    filters,
    showEventInfoModal,
    selectedEvent, // Ensure we can pass the event to the popup
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const location = useLocation();
  const dayViewRef = useRef(null);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false); 

  const hourHeight = 90;
  const startHour = 0;
  const endHour = 24;
  const multiDayEventHeight = 30; // Fixed height for multi-day events

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      setLoading(true);
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
          filters.organisedBy !== undefined ||
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
  // Include all events if no sectors are checked
  !filters.accountSectors.some((sector) => sector.checked) ||
  // Check if any sector matches the event
  filters.accountSectors.some((sector) => {
    try {
      if (sector.checked) {
        // Map filter labels to keys in the event data
        const sectorMapping = {
          "Public Sector": "public",
          "Commercial": "commercial"
        };

        // Find the corresponding key for the filter label
        const sectorKey = sectorMapping[sector.label];
        if (!sectorKey) {
          console.warn(`No mapping found for sector label: ${sector.label}`);
          return false;
        }

        // Check if the event matches the mapped key
        return event.accountSectors?.[sectorKey] === true;
      }
      return false;
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
      const entryCreatedDate = event.entryCreatedDate?.value
        ? dayjs(event.entryCreatedDate.value)
        : null; // Access `value` property

      if (!entryCreatedDate || !entryCreatedDate.isValid()) {
        console.warn("Invalid or missing entryCreatedDate for event:", event);
        return option.value === false; // Consider missing dates as "old"
      }

      const isWithinTwoWeeks = dayjs().diff(entryCreatedDate, "day") <= 14;
      return option.value === isWithinTwoWeeks;
    }
    return false;
  });



  const organisedByMatch = (() => {
    // Check if no organiser filter is applied
    if (!filters.organisedBy || filters.organisedBy.length === 0) {
      return true; // No organiser filter applied
    }
  
    // Check if the event has no organiser data
    if (!event.organisedBy || event.organisedBy.length === 0) {
      return false; // Event does not have an organiser
    }
  
    // Check for match
    const isMatch = filters.organisedBy.some((organiser) =>
      event.organisedBy.includes(organiser)
    );
  
  
    return isMatch; // Return the match result
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
                countryMatch && 
                programNameMatch && activityTypeMatch
                && isNewlyCreatedMatch && organisedByMatch
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
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchAndFilterEvents();
  }, [location, filters, daySelected]);

  // Reset modals when location changes
  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // Separate multi-day events and single-day events
  const { multiDayEvents, singleDayEvents } = useMemo(() => {
    const multiDayEvents = filteredEvents.filter((event) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      return (
        !eventStart.isSame(daySelected, "day") ||
        !eventEnd.isSame(daySelected, "day")
      );
    });

    const singleDayEvents = filteredEvents.filter((event) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      return (
        eventStart.isSame(daySelected, "day") &&
        eventEnd.isSame(daySelected, "day")
      );
    });

    return { multiDayEvents, singleDayEvents };
  }, [filteredEvents, daySelected]);

  // Group overlapping single-day events
  const fixMissingTimeStart = (dateString) => {
    if (!dateString.includes("T")) {
      return `${dateString}T00:00`; // Default to 12:00 AM if time is missing
    }
    return dateString;
  };

  const fixMissingTimeEnd = (dateString) => {
    if (!dateString.includes("T")) {
      return `${dateString}T01:00`; // Default to 01:10 AM if time is missing
    }
    return dateString;
  };

  const groupOverlappingEvents = (events) => {
    const sortedEvents = events.sort((a, b) => {
      // 1. Check event status (Finalized or Invite-ready)
      const getEventStatusPriority = (event) => {
        const applicableStatuses = [];
        
        if (event.isDraft) {
          applicableStatuses.push("Draft");
        } else {
          applicableStatuses.push("Finalized");
          if (
            event.languagesAndTemplates?.some((template) =>
              ["Gmail", "Salesloft"].includes(template.platform)
            )
          ) {
            applicableStatuses.push("Invite available");
          }
        }
  
        if (applicableStatuses.includes("Invite available")) return 2; // Highest priority
        if (applicableStatuses.includes("Finalized")) return 1; // Second priority
        return 0; // Default priority for drafts
      };
  
      const statusPriorityA = getEventStatusPriority(a);
      const statusPriorityB = getEventStatusPriority(b);
  
      if (statusPriorityA !== statusPriorityB) {
        return statusPriorityB - statusPriorityA; // Higher status priority first
      }
  
      // 2. Check High Priority tag
      if (a.isHighPriority !== b.isHighPriority) {
        return b.isHighPriority - a.isHighPriority; // `true` comes first
      }
  
      // 3. Descending by expected attendees
      return b.expectedAttendees - a.expectedAttendees;
    });

    
    const groups = [];

    sortedEvents.forEach((event) => {
      const eventStart = dayjs(fixMissingTimeStart(event.startDate));
      const eventEnd = dayjs(fixMissingTimeEnd(event.endDate));

      let addedToGroup = false;

      for (const group of groups) {
        const isOverlapping = group.some((groupEvent) => {
          const groupEventStart = dayjs(
            fixMissingTimeStart(groupEvent.startDate)
          );
          const groupEventEnd = dayjs(fixMissingTimeEnd(groupEvent.endDate));

          // Handle zero-minute events: If start and end are the same, treat them as overlapping
          const isZeroMinuteEvent = eventStart.isSame(eventEnd);

          // Check for overlap or if it is a zero-minute event at the same time
          return (
            (eventStart.isBefore(groupEventEnd) &&
              eventEnd.isAfter(groupEventStart)) ||
            (isZeroMinuteEvent && eventStart.isSame(groupEventStart))
          );
        });

        if (isOverlapping) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }

      if (!addedToGroup) {
        groups.push([event]);
      }
    });

    return groups;
  };

  const overlappingEventGroups = useMemo(
    () => groupOverlappingEvents(singleDayEvents),
    [singleDayEvents]
  );

  const calculateEventBlockStyles = useCallback(
    (event, overlappingEvents) => {
      const eventStart = dayjs(fixMissingTimeStart(event.startDate));
      const eventEnd = dayjs(fixMissingTimeEnd(event.endDate));

      const startOfDay = daySelected.startOf("day");
      const endOfDay = daySelected.endOf("day");

      const displayStart = dayjs.max(startOfDay, eventStart);
      const displayEnd = dayjs.min(endOfDay, eventEnd);

      const minutesFromMidnight = displayStart.diff(startOfDay, "minutes");
      const durationInMinutes = displayEnd.diff(displayStart, "minutes");

      const top = (minutesFromMidnight / 60) * hourHeight;
      const height = (durationInMinutes / 60) * hourHeight || 0;

      let overlappingGroup = [];

      overlappingEvents.forEach((e) => {
        const eStart = dayjs(fixMissingTimeStart(e.startDate));
        const eEnd = dayjs(fixMissingTimeEnd(e.endDate));

        if (eventStart.isBefore(eEnd) && eventEnd.isAfter(eStart)) {
          overlappingGroup.push(e);
        }
      });

      overlappingGroup = overlappingGroup.sort((a, b) => {
        return dayjs(fixMissingTimeStart(a.startDate)).diff(
          dayjs(fixMissingTimeStart(b.startDate))
        );
      });

      const columnCount = overlappingGroup.length;
      const width = columnCount > 1 ? 100 / columnCount : 100;
      const left =
        columnCount > 1 ? overlappingGroup.indexOf(event) * width : 0;

      const zIndex = overlappingGroup.indexOf(event) + 1;

      return { top, height, width, left, zIndex };
    },
    [daySelected, hourHeight]
  );

  const handleMouseEnter = (e, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredEvent(event);
    setTooltipPosition({
      x: e.clientX + 10, // Position tooltip 10px to the right of the event
      y: e.clientY + 10, // Tooltip slightly below the mouse
    });
  };

  // Update tooltip position on mouse move
  const handleMouseMove = (e) => {
    setTooltipPosition({
      x: e.clientX + 10, // Update X position based on mouse
      y: e.clientY + 10, // Update Y position based on mouse
    });
  };

  // Handle mouse leave to hide tooltip
  const handleMouseLeave = () => {
    setHoveredEvent(null);
  };

  // Memoized event handler for adding events
  const handleAddEvent = useCallback(() => {
    setShowEventModal(true);
  }, [setShowEventModal]);

  // Memoized event handler for clicking events
  const handleEventClick = useCallback(
    (event) => {
      setSelectedEvent(event); // Set the clicked event as the selected one
      setShowInfoEventModal(true); // Trigger the modal to show
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

  // Automatically scroll to the current hour and update current time position
  useEffect(() => {
    if (dayViewRef.current) {
      const currentHourOffset = dayjs().hour() * hourHeight;
      dayViewRef.current.scrollTo({
        top: currentHourOffset - hourHeight / 2,
        behavior: "smooth",
      });
    }

    const updateCurrentTimePosition = () => {
      const now = dayjs();
      const minutesFromMidnight = now.diff(now.startOf("day"), "minutes");
      const position = (minutesFromMidnight / 60) * hourHeight;
      setCurrentTimePosition(position);
    };

    updateCurrentTimePosition();
    const interval = setInterval(updateCurrentTimePosition, 60000);

    return () => clearInterval(interval);
  }, [hourHeight]);

  return (
    <Paper
      sx={{
        width: "90%",
        maxHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "background.default",
        marginLeft: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sticky Date Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 10,
          padding: "10px 0",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          {`${daySelected.format("dddd, MMMM D, YYYY")} (${userTimezone})`}
        </Typography>
      </div>

      {loading ? ( 
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 100px)",
          }}
        >
          <CircularProgress />
        </div>
      ) : (

        <>
      {/* Multi-Day Events Section */}
      { multiDayEvents.length > 0 && (
        <Box
          sx={{
            position: "relative",
            height: "200px", // Fixed height for multi-day events section
            overflowY: "auto",
            overflowX: "hidden", // Hide horizontal scrolling
            padding: "10px 20px",
            borderBottom: "1px solid #ccc",
            marginTop: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          {multiDayEvents.map((event, index) => {
            const { backgroundColor, color, icon } = getEventStyleAndIcon(
              event.eventType
            );
            return (
              <div
                key={event.eventId}
                style={{
                  position: "absolute",
                  top: `${index * multiDayEventHeight}px`,
                  left: "0%",
                  width: "100%",
                  height: `${multiDayEventHeight}px`,
                  backgroundColor,
                  color,
                  padding: "8px 12px",
                  borderRadius: "8px", // Rounded corners
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  borderLeft: `4px solid ${color}`, // Thicker border for visual hierarchy
                  marginLeft: "20px", // Slight adjustment to avoid overlapping with time labels
                  marginRight: "60px", // Additional margin for better layout
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Subtle shadow for depth
                  transition:
                    "background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out", // Smooth transitions for hover
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = color
                    ? `${color}33`
                    : "#f0f0f0";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.2)";
                  handleMouseEnter(e, event);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = backgroundColor;
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0, 0, 0, 0.15)";
                  handleMouseLeave();
                }}
                onMouseMove={(e) => {
                  handleMouseMove(e);
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event propagation
                  handleEventClick(event); // Trigger event click handler
                }}
              >
                {icon}
                <Typography
                  noWrap
                  sx={{
                    marginLeft: "8px", // Space between icon and text
                    color: "#333", // Darker text for readability
                    flex: 1, // Let the text take up remaining space
                    fontSize: "0.875rem", // Adjusted font size for consistency
                  }}
                >
                  {event.title}
                </Typography>
              </div>
            );
          })}
        </Box>
      )}
      {hoveredEvent && (
        <Box
          sx={{
            position: "fixed",
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            backgroundColor: "#fff",
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {hoveredEvent.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {/* Conditionally render the date or show "Missing or invalid date" with one warning icon */}
            {hoveredEvent.startDate &&
            hoveredEvent.endDate &&
            dayjs(hoveredEvent.startDate).diff(
              dayjs(hoveredEvent.endDate),
              "minutes"
            ) !== 0 ? (
              `${dayjs(hoveredEvent.startDate).format(
                "MMM D, h:mm A"
              )} - ${dayjs(hoveredEvent.endDate).format("MMM D, h:mm A")}`
            ) : (
              <>
                <ErrorOutlineIcon
                  sx={{
                    fontSize: "16px",
                    color: "#d32f2f",
                    marginRight: "4px",
                  }}
                />
                Missing or invalid date
              </>
            )}
          </Typography>
        </Box>
      )}

      {/* Scrollable Calendar Grid */}
      <div
        ref={dayViewRef}
        style={{
          overflowY: "auto",
          height: "calc(100vh - 100px)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",
            height: `${hourHeight * (endHour - startHour)}px`,
            width: "100%",
            marginLeft: "0px",
          }}
        >
          {/* Hour Labels */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              zIndex: 1,
              color: "#999",
            }}
          >
            {Array.from(
              { length: endHour - startHour },
              (_, i) => i + startHour
            ).map((hour) => (
              <div
                key={hour}
                style={{
                  height: `${hourHeight}px`,
                  position: "relative",
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                  left: 0,
                  right: 0,
                  width: "100%",
                  zIndex: 1,
                }}
              >
                {dayjs().hour(hour).minute(0).format("HH:mm")}
              </div>
            ))}
          </div>

          {/* Single-Day Events */}
          {overlappingEventGroups.map((group) =>
            group.map((event) => {
              const { top, height, left, width } = calculateEventBlockStyles(
                event,
                group
              );
              const eventTypeStyle = getEventStyleAndIcon(event.eventType);
              return (
                <div
                  key={event.eventId}
                  style={{
                    position: "absolute",
                    top,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}px`,
                    backgroundColor: eventTypeStyle.backgroundColor,
                    color: eventTypeStyle.color,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    zIndex: 2,
                    borderLeft: `4px solid ${eventTypeStyle.color}`,
                    marginLeft: "60px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    transition: "background-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = eventTypeStyle.color
                      ? `${eventTypeStyle.color}33`
                      : "#f0f0f0";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.2)";
                    handleMouseEnter(e, event);
                  }}
                  onMouseMove={(e) => {
                    handleMouseMove(e);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      eventTypeStyle.backgroundColor;
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.15)";
                    handleMouseLeave();
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  {eventTypeStyle.icon}
                  <Typography noWrap>{event.title}</Typography>
                </div>
              );
            })
          )}
          {hoveredEvent && (
            <Box
              sx={{
                position: "fixed",
                top: `${tooltipPosition.y}px`,
                left: `${tooltipPosition.x}px`,
                backgroundColor: "#fff",
                padding: "8px 12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                borderRadius: "8px",
                zIndex: 1000,
                pointerEvents: "none",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {hoveredEvent.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {/* Conditionally render the date or show "Missing or invalid date" with one warning icon */}
                {hoveredEvent.startDate &&
                hoveredEvent.endDate &&
                dayjs(hoveredEvent.startDate).diff(
                  dayjs(hoveredEvent.endDate),
                  "minutes"
                ) !== 0 ? (
                  `${dayjs(hoveredEvent.startDate).format(
                    "MMM D, h:mm A"
                  )} - ${dayjs(hoveredEvent.endDate).format("MMM D, h:mm A")}`
                ) : (
                  <>
                    <ErrorOutlineIcon
                      sx={{
                        fontSize: "16px",
                        color: "#d32f2f",
                        marginRight: "4px",
                      }}
                    />
                    Missing or invalid date
                  </>
                )}
              </Typography>
            </Box>
          )}

          {/* Current Time Line */}
          <Box
            sx={{
              position: "absolute",
              top: `${currentTimePosition}px`,
              left: "0",
              right: "0",
              height: "2px",
              backgroundColor: "#d32f2f",
              zIndex: 1500,
            }}
          />
        </div>
      </div>

      {/* Show Event Info Popup when an event is selected */}
      {showEventInfoModal && selectedEvent && (
        <EventInfoPopup
          event={selectedEvent}
          onClose={() => setShowInfoEventModal(false)}
        />
      )}
      </>
    )}
    </Paper>
    
  );

}