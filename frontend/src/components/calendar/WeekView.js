import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import GlobalContext from "../../context/GlobalContext";
import { Paper, Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import DayColumn from "../Day/DayColumn";
import EventInfoPopup from "../popup/EventInfoModal";
import { getEventData } from "../../api/getEventData";
import { useLocation } from "react-router-dom";
import { getEventStyleAndIcon } from "../../utils/eventStyles";

dayjs.extend(utc);

export default function WeekView() {
  const hourHeight = 90; // Define the height for each hour block
  const startHour = 0; // Define the start hour (00:00 or 12:00 AM)
  const endHour = 24;
  const {
    daySelected,
    setSelectedEvent,
    setShowInfoEventModal,
    showEventInfoModal,
    selectedEvent,
    filters,
  } = useContext(GlobalContext);

  const [currentWeek, setCurrentWeek] = useState([]);
  const [events, setEvents] = useState([]);
  const [setFilteredEvents] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const userTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const weekViewRef = useRef(null);
  const location = useLocation();
  const sortEventsByPriority = (events) => {
    return events.sort((a, b) => {
      // 1. Prioritize Finalized or Invite-ready statuses
      const getStatusPriority = (event) => {
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
        if (applicableStatuses.includes("Invite available")) return 2; // Highest
        if (applicableStatuses.includes("Finalized")) return 1; // Medium
        return 0; // Lowest (Draft)
      };
  
      const statusPriorityA = getStatusPriority(a);
      const statusPriorityB = getStatusPriority(b);
  
      if (statusPriorityA !== statusPriorityB) {
        return statusPriorityB - statusPriorityA; // Descending order
      }
  
      // 2. High Priority flag
      if (a.isHighPriority !== b.isHighPriority) {
        return b.isHighPriority - a.isHighPriority; // High Priority comes first
      }
  
      // 3. Descending by expected attendees
      return b.expectedAttendees - a.expectedAttendees;
    });
  };
  useEffect(() => {
    const startOfWeek = dayjs(daySelected).startOf("week");
    const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, "day")
    );
    setCurrentWeek(daysOfWeek);
  }, [daySelected]);

  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) {
      return [];
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
        ...filters.programName,
        ...filters.activityType,

      ].some((filter) => filter.checked) ||
      filters.partnerEvent !== undefined ||
      filters.isNewlyCreated !== undefined ||
      filters.organisedBy !== undefined ||
      filters.draftStatus !== undefined;     


    // If no filters are applied, return all events
    if (!hasFiltersApplied) {
      return events;
    }

    return events.filter((event) => {
      const subRegionMatch =
        !filters.subRegions.some((subRegion) => subRegion.checked) ||
        filters.subRegions.some(
          (subRegion) =>
            subRegion.checked && event.subRegion?.includes(subRegion.label)
        );

      const gepMatch =
        !filters.gep.some((gep) => gep.checked) ||
        filters.gep.some(
          (gep) => gep.checked && event.gep?.includes(gep.label)
        );

      const buyerSegmentRollupMatch =
        !filters.buyerSegmentRollup.some((segment) => segment.checked) ||
        filters.buyerSegmentRollup.some(
          (segment) =>
            segment.checked && event.audienceSeniority?.includes(segment.label)
        );

      const accountSectorMatch =
        !filters.accountSectors.some((sector) => sector.checked) ||
        filters.accountSectors.some((sector) => {
          try {
            return (
              sector.checked &&
              event.accountSectors?.[sector.label.toLowerCase()] === true
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


      const accountSegmentMatch =
        !filters.accountSegments.some((segment) => segment.checked) ||
        filters.accountSegments.some((segment) => {
          try {
            const accountSegment = event.accountSegments?.[segment.label];
            return (
              segment.checked &&
              accountSegment?.selected  && // Convert selected to a boolean
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
            const productAlignment = event.productAlignment?.[product.label];
            return (
              product.checked &&
              productAlignment?.selected  &&
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
            return industry.checked && event.industry?.includes(industry.label);
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

      const selectedPartneredStatuses = Array.isArray(filters.partnerEvent)
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
  const organisedByMatch = (() => {
    // Check if no organiser filter is applied
    if (!filters.organisedBy || filters.organisedBy.length === 0) {
      console.log("No organiser filter applied, matching all events.");
      return true; // No organiser filter applied
    }
  
    // Check if the event has no organiser data
    if (!event.organisedBy || event.organisedBy.length === 0) {
      console.log("Event has no organiser data:", event);
      return false; // Event does not have an organiser
    }
  
    // Check for match
    const isMatch = filters.organisedBy.every((organiser) =>
      event.organisedBy.includes(organiser)
    );
  
    console.log("OrganisedBy filter applied:", filters.organisedBy);
    console.log("Event organisedBy field:", event.organisedBy);
    console.log("OrganisedBy match result:", isMatch);
  
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
    });
  }, [filters, events]);

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const eventData = await getEventData("eventDataQuery");
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchAndFilterEvents();
  }, [filters, location]);

  const handleEventClick = useCallback(
    (event) => {
      setSelectedEvent(event);
      setShowInfoEventModal(true);
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

  const closeEventModal = useCallback(() => {
    setShowInfoEventModal(false);
    setSelectedEvent(null);
  }, [setShowInfoEventModal, setSelectedEvent]);

  const { multiDayEvents, singleDayEvents } = useMemo(() => {
    if (!currentWeek.length) return { multiDayEvents: [], singleDayEvents: [] };

    const multiDayEvents = sortEventsByPriority(
      filteredEvents.filter((event) => {
        const eventStart = dayjs(event.startDate);
        const eventEnd = dayjs(event.endDate);
  
        return (
          eventStart.isValid() &&
          eventEnd.isValid() &&
          !eventStart.isSame(eventEnd, "day") &&
          eventStart.isBefore(currentWeek[currentWeek.length - 1].endOf("day")) &&
          eventEnd.isAfter(currentWeek[0].startOf("day"))
        );
      })
    );
  
    const singleDayEvents = sortEventsByPriority(
      filteredEvents.filter((event) => {
        const eventStart = dayjs(event.startDate);
        const eventEnd = dayjs(event.endDate);
  
        return (
          eventStart.isSame(eventEnd, "day") &&
          eventStart.isValid() &&
          eventEnd.isValid()
        );
      })
    );

    return { multiDayEvents, singleDayEvents };
  }, [filteredEvents, currentWeek]);

  // Helper function to check event overlap
  const isOverlapping = (event1, event2) => {
    const event1Start = dayjs(event1.startDate);
    const event1End = dayjs(event1.endDate);
    const event2Start = dayjs(event2.startDate);
    const event2End = dayjs(event2.endDate);

    return event1Start.isBefore(event2End) && event1End.isAfter(event2Start);
  };

  // Group multi-day events by overlap and stack them vertically
  // Group multi-day events by overlap and stack them vertically
  const groupMultiDayEvents = useCallback((multiDayEvents) => {
    const groups = [];

    multiDayEvents.forEach((event) => {
      let addedToGroup = false;

      // Check each group to see if the event overlaps with any event in the group
      for (const group of groups) {
        const overlaps = group.some((groupEvent) =>
          isOverlapping(event, groupEvent)
        );

        if (overlaps) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }

      // If the event doesn't overlap with any group, create a new group
      if (!addedToGroup) {
        groups.push([event]);
      }
    });

    return groups;
  }, []);

  const multiDayEventGroups = useMemo(
    () => groupMultiDayEvents(multiDayEvents),
    [multiDayEvents, groupMultiDayEvents]
  );

  // Calculate styles for multi-day events including stacking
  const calculateMultiDayEventStyles = (
    event,
    groupIndex,
    eventIndex,
    currentWeek
  ) => {
    // Defensive check to make sure currentWeek is not undefined or empty
    if (!currentWeek || currentWeek.length === 0) {
      return { top: "0px", left: "0%", width: "100%" }; // Default safe values
    }

    const eventStart = dayjs(event.startDate);
    const eventEnd = dayjs(event.endDate);

    // Calculate the first day of the week and the last day of the week
    const weekStart = currentWeek[0];
    const weekEnd = currentWeek[currentWeek.length - 1];

    // Ensure the event spans across the correct number of days in the current week
    const startOfWeekEvent = eventStart.isBefore(weekStart)
      ? weekStart
      : eventStart;
    const endOfWeekEvent = eventEnd.isAfter(weekEnd) ? weekEnd : eventEnd;

    const startIndex = currentWeek.findIndex((day) =>
      day.isSame(startOfWeekEvent, "day")
    );
    const endIndex = currentWeek.findIndex((day) =>
      day.isSame(endOfWeekEvent, "day")
    );

    if (startIndex === -1 || endIndex === -1) {
      // If the event's start or end doesn't match any days in the current week, return default values
      return { top: "0px", left: "0%", width: "100%" };
    }

    const eventSpan = endIndex - startIndex + 1; // Number of days the event spans in the current week
    const leftPosition = (startIndex / 7) * 100; // Left position as a percentage of the week
    const width = (eventSpan / 7) * 100; // Width as a percentage of the week

    // Stack events vertically by their group and index within the group
    const topPosition = groupIndex * 30 + eventIndex * 30; // Stack by both group and event

    return {
      top: `${topPosition}px`,
      left: `${leftPosition}%`,
      width: `${width}%`,
    };
  };

  const handleMouseEnter = (e, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredEvent(event);
    setTooltipPosition({
      x: rect.left + 10, // Tooltip 10px to the right of the event
      y: rect.top + window.scrollY - 10, // Tooltip slightly above the event
    });
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null); // Hide the tooltip
  };

  return (
    <Paper
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header for displaying days of the week */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "10px",
          paddingTop: "10px",
          backgroundColor: "white",
          borderBottom: "1px solid ",
        }}
      >
        {currentWeek.map((day) => (
          <Typography
            key={day.format("YYYY-MM-DD")}
            align="center"
            variant="h6"
            sx={{
              flex: 1,
              textAlign: "center",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            {day.format("ddd, D MMM")}
          </Typography>
        ))}
      </Box>

      {/* Multi-day Events Section */}
      {multiDayEventGroups.length > 0 && (
        <Box
          sx={{
            position: "relative",
            height: "200px", // Fixed height for multi-day events section
            overflowY: "auto", // Allow vertical scrolling
            padding: "15px 20px", // More balanced padding
            borderBottom: "1px solid #ddd",
            paddingTop: "10px", // Subtle bottom border
            marginLeft: "60px", // Maintain the margin to align with other content
            marginTop: "20px",
            marginBottom: "20px",
            borderRadius: "8px", // Add rounded corners for a modern look
            transition: "box-shadow 0.3s ease-in-out", // Smooth transition for shadow
            "&:hover": {
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)", // Increase shadow on hover
            },
            scrollbarWidth: "thin", // Thin scrollbar for non-Chrome browsers
            "&::-webkit-scrollbar": {
              width: "8px", // Set the width for the scrollbar in Chrome/Safari
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#b3b3b3", // Scrollbar thumb color
              borderRadius: "4px", // Rounded scrollbar thumb
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f1f1", // Scrollbar track color
            },
          }}
        >
          {multiDayEventGroups.map((group, groupIndex) =>
            group.map((event, eventIndex) => {
              const { backgroundColor, color, icon } = getEventStyleAndIcon(
                event.eventType
              );
              const styles = calculateMultiDayEventStyles(
                event,
                groupIndex,
                eventIndex,
                currentWeek
              );


              

              return (
                <div
                  key={event.eventId}
                  style={{
                    position: "absolute",
                    ...styles, // Apply calculated styles for top, left, and width
                    backgroundColor,
                    color,
                    padding: "8px 12px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    height: "30px", // Fixed height for multi-day events
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Add shadow
                    transition: "background-color 0.2s, box-shadow 0.2s", // Smooth transitions
                    borderLeft: `4px solid ${color}`, // Border to indicate event type
                    marginBottom: "5px", // Add spacing between events
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = color
                      ? `${color}33`
                      : "#f0f0f0"; // Change background on hover
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.2)";
                    handleMouseEnter(e, event); // Increase shadow on hover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = backgroundColor; // Reset background
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.15)";
                    handleMouseLeave();
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  {icon}
                  <Typography
                    noWrap
                    sx={{
                      marginLeft: "8px", // Add space between icon and text
                      color: "#333", // Text color
                      flex: 1, // Allow text to take available space
                      fontSize: "0.875rem", // Adjust font size
                    }}
                  >
                    {event.title}
                  </Typography>
                </div>
              );
            })
          )}
        </Box>
      )}
      {hoveredEvent && (
        <Box
          sx={{
            position: "absolute",
            top: `${tooltipPosition.y}px`, // Use tooltipPosition state for Y
            left: `${tooltipPosition.x}px`, // Use tooltipPosition state for X
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            padding: "8px 12px",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {hoveredEvent.title}
          </Typography>
          <Typography variant="body2">
            {dayjs(hoveredEvent.startDate).format("MMM D, h:mm A")} -{" "}
            {dayjs(hoveredEvent.endDate).format("MMM D, h:mm A")}
          </Typography>
        </Box>
      )}

      {/* Scrollable Week View for Single-day Events */}
      <Box
        ref={weekViewRef}
        sx={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Time labels column */}
        <Box
          sx={{
            flex: "0 0 60px",
            borderRight: "1px solid #ddd",
            position: "relative",
          }}
        >
          {Array.from({ length: endHour - startHour }, (_, hour) => (
            <Typography
              key={hour}
              sx={{
                position: "absolute",
                top: `${hour * hourHeight}px`,
                width: "50px",
                textAlign: "right",
                paddingRight: "10px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              {dayjs().hour(hour).minute(0).format("HH:mm")}
            </Typography>
          ))}
        </Box>

        {/* Actual day columns */}
        {currentWeek.map((day, index) => {
          const filteredEventsForDay = singleDayEvents.filter((event) => {
            return dayjs(event.startDate).isSame(day, "day");
          });

          return (
            <Box
              key={day.format("YYYY-MM-DD")}
              sx={{
                flex: 1,
                position: "relative",
                borderLeft: "1px solid #ddd",
                borderBottom: "1px solid #ddd",
              }}
            >
              <DayColumn
                daySelected={day}
                events={filteredEventsForDay}
                onEventClick={handleEventClick}
                showTimeLabels={index === 0} // Only show time labels for the first column
              />
            </Box>
          );
        })}
      </Box>

      {showEventInfoModal && selectedEvent && (
        <EventInfoPopup event={selectedEvent} close={closeEventModal} />
      )}
    </Paper>
  );
}