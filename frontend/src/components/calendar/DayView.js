import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import GlobalContext from "../../context/GlobalContext";
import { Typography, Paper, Box } from "@mui/material";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import { useLocation } from "react-router-dom";
import { getEventData } from "../../api/getEventData";
import EventInfoPopup from "../popup/EventInfoModal";
import OnlineEventIcon from "@mui/icons-material/Computer";
import PhysicalEventIcon from "@mui/icons-material/LocationOn";
import HybridEventIcon from "@mui/icons-material/Autorenew";
import CustomerStoryIcon from "@mui/icons-material/LibraryBooks";
import BlogPostIcon from "@mui/icons-material/Create";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { getEventStyleAndIcon } from "../../utils/eventStyles"; // Adjust the relative path

// Extend dayjs with these plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(minMax);

// Define styles for each event type


export default function DayView() {
  const eventSlotMapRef = useRef({});

  const {
    daySelected,
    setShowEventModal,
    setSelectedEvent,
    setShowInfoEventModal,
    filters,
    showEventInfoModal,
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [eventSlots, setEventSlots] = useState({}); // Track the slots for each day

  const [eventGroups, setEventGroups] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const location = useLocation();
  const dayViewRef = useRef(null);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const hourHeight = 90;
  const startHour = 0;
  const endHour = 24;

  // Fetch events and calculate overlap groups on location or daySelected change
  // useEffect(() => {
  //   async function fetchEvents() {
  //     try {
  //       const eventData = await getEventData("eventDataQuery");

  //       // Filter the eventData to only include events on the selected day
  //       const filteredEvents = eventData.filter((event) => {
  //         const eventStart = dayjs(event.startDate);
  //         const eventEnd = dayjs(event.endDate);
  //         const selectedDayStart = daySelected.startOf("day");
  //         const selectedDayEnd = daySelected.endOf("day");

  //         // Event starts and ends on the selected day, or spans over the selected day
  //         return (
  //           eventStart.isSame(daySelected, "day") ||  // Starts on selected day
  //           eventEnd.isSame(daySelected, "day") ||    // Ends on selected day
  //           (eventStart.isBefore(selectedDayEnd) && eventEnd.isAfter(selectedDayStart)) // Spans across selected day
  //         );
  //       });

  //       console.log("Filtered events for the selected day:", filteredEvents);  // Debugging log

  //       setEvents(filteredEvents);  // Set only the filtered events
  //       setEventGroups(calculateOverlapGroups(filteredEvents));  // Calculate overlap for the filtered events
  //     } catch (error) {
  //       console.error("Error fetching event data:", error);
  //     }
  //   }

  //   fetchEvents();
  // }, [location, daySelected]);  // Re-run when location or daySelected changes

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

        // Filter events by the selected day first
        const filteredByDay = eventData.filter((event) => {
          const eventStart = dayjs(event.startDate);
          const eventEnd = dayjs(event.endDate);
          const selectedDayStart = daySelected.startOf("day");
          const selectedDayEnd = daySelected.endOf("day");

          // Event starts, ends, or spans across the selected day
          return (
            eventStart.isSame(daySelected, "day") || // Event starts on selected day
            eventEnd.isSame(daySelected, "day") || // Event ends on selected day
            (eventStart.isBefore(selectedDayEnd) &&
              eventEnd.isAfter(selectedDayStart)) // Event spans across selected day
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
          ].some((filter) => filter.checked) ||
          filters.partnerEvent !== undefined ||
          filters.draftStatus !== undefined;

        if (!hasFiltersApplied) {
          setEvents(filteredByDay);
          setFilteredEvents(filteredByDay); // No further filtering needed
          return;
        }

        const results = await Promise.all(
          filteredByDay.map(async (event) => {
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

        const finalFilteredEvents = filteredByDay.filter(
          (_, index) => results[index]
        );

        setFilteredEvents(finalFilteredEvents);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchAndFilterEvents();
  }, [location, filters, daySelected]); // Added daySelected as a dependency

  // Reset modals when location changes
  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // Recalculate event groups whenever events change
  useEffect(() => {
    setEventGroups(calculateOverlapGroups(events));
  }, [events]);

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
      const minutesFromMidnight = now.diff(now.startOf("day"), "minutes"); // Calculate minutes from midnight accurately
      const position = (minutesFromMidnight / 60) * hourHeight; // Convert minutes into the vertical position
      setCurrentTimePosition(position);
    };

    updateCurrentTimePosition();
    const interval = setInterval(updateCurrentTimePosition, 60000);

    return () => clearInterval(interval);
  }, [hourHeight]);
  useEffect(() => {
    eventSlotMapRef.current = {}; // Reset the slot map on each render
  }, [events, daySelected]);

  // Memoized function to calculate overlapping event groups
  const calculateOverlapGroups = useCallback((events) => {
    const eventGroups = [];

    if (!Array.isArray(events)) {
      console.error(
        "calculateOverlapGroups was called with 'events' that is not an array:",
        events
      );
      return [];
    }

    // Sort events by start time to make grouping easier
    const sortedEvents = [...events].sort((a, b) =>
      dayjs(a.startDate).diff(dayjs(b.startDate))
    );

    sortedEvents.forEach((event) => {
      let added = false;

      // Iterate through existing groups to check for overlap
      for (const group of eventGroups) {
        const isOverlap = group.some((groupEvent) => {
          const eventStart = dayjs(event.startDate);
          const eventEnd = dayjs(event.endDate);
          const groupEventStart = dayjs(groupEvent.startDate);
          const groupEventEnd = dayjs(groupEvent.endDate);

          // Check if events overlap
          return (
            eventStart.isBefore(groupEventEnd) &&
            eventEnd.isAfter(groupEventStart)
          );
        });

        // If an overlap is found, add the event to the group
        if (isOverlap && !added) {
          // Ensure event is only added once
          group.push(event);
          added = true;
        }
      }

      // If no overlap was found, create a new group for this event
      if (!added) {
        eventGroups.push([event]);
      }
    });

    // Calculate widths and positions for each event in each group
    const styledEventGroups = eventGroups.map((group) => {
      const numEvents = group.length;
      const eventWidth = 100 / numEvents; // Divide the width equally among overlapping events

      return group.map((event, index) => ({
        ...event,
        width: eventWidth, // Each event's width
        left: eventWidth * index, // Position event based on its index in the group
      }));
    });

    return styledEventGroups.flat(); // Flatten the array to get a list of styled events
  }, []);

  useEffect(() => {
    eventSlotMapRef.current = {}; // Reset the slot map on each render
  }, [events, daySelected]);

  // Helper function to determine if events overlap
  const isOverlapping = useCallback((event, group) => {
    return group.some((groupEvent) => {
      return (
        dayjs(event.startDate).isBefore(groupEvent.endDate) &&
        dayjs(groupEvent.startDate).isBefore(event.endDate)
      );
    });
  }, []);

  const slotData = useMemo(() => {
    const slots = {}; // Store slots for overlapping events
    events.forEach((event) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);

      // Calculate overlapping events
      const overlappingEvents = events.filter((otherEvent) => {
        const otherEventStart = dayjs(otherEvent.startDate);
        const otherEventEnd = dayjs(otherEvent.endDate);
        return (
          event !== otherEvent &&
          eventStart.isBefore(otherEventEnd) &&
          eventEnd.isAfter(otherEventStart) &&
          dayjs(otherEvent.startDate).isSame(event.startDate, "day")
        );
      });

      // Calculate total overlapping events (including itself)
      const totalOverlappingEvents = overlappingEvents.length + 1;
      let availableSlot = 0;

      // Track first available slot
      for (let i = 0; i < totalOverlappingEvents; i++) {
        if (!slots[i]) {
          slots[i] = true;
          availableSlot = i;
          break;
        }
      }

      // Return event position and width
      const width = 100 / totalOverlappingEvents;
      const left = width * availableSlot;
      slots[event.id] = { width, left };
    });
    return slots;
  }, [events]);

  const calculateEventBlockStyles = useCallback(
    (event, multiDayEventIndex = 0) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      const startOfDay = daySelected.startOf("day");
      const endOfDay = daySelected.endOf("day");

      const fixedMultiDayHeight = 30; // Fixed height for multi-day events
      const multiDayEventTop = multiDayEventIndex * fixedMultiDayHeight;

      // Check if the event spans multiple days
      const isMultiDayEvent =
        !eventStart.isSame(daySelected, "day") ||
        !eventEnd.isSame(daySelected, "day");

      if (isMultiDayEvent) {
        return {
          top: `${multiDayEventTop}px`, // Stack the event based on its index
          height: `${fixedMultiDayHeight}px`, // Fixed height for multi-day events
          left: "0%", // Always start at the left-most position
          width: "100%", // Span the full width
          isMultiDay: true, // Mark this as a multi-day event for special handling
        };
      }

      // Handle single-day events (as previously calculated)
      const displayStart = dayjs.max(startOfDay, eventStart);
      const displayEnd = dayjs.min(endOfDay, eventEnd);

      const minutesFromMidnight = displayStart.diff(startOfDay, "minutes");
      const durationInMinutes = displayEnd.diff(displayStart, "minutes");

      const top = (minutesFromMidnight / 60) * hourHeight;
      const height = (durationInMinutes / 60) * hourHeight;

      // Reset the slot map for the day on each render to avoid re-use of previous slot calculations
      if (!eventSlotMapRef.current[daySelected]) {
        eventSlotMapRef.current[daySelected] = [];
      }

      // Filter single-day overlapping events only
      const overlappingEvents = events.filter((otherEvent) => {
        const otherEventStart = dayjs(otherEvent.startDate); // Ensure this is a dayjs object
        const otherEventEnd = dayjs(otherEvent.endDate); // Ensure this is a dayjs object

        const otherIsMultiDayEvent =
          !otherEventStart.isSame(daySelected, "day") ||
          !otherEventEnd.isSame(daySelected, "day");

        return (
          event !== otherEvent &&
          displayStart.isBefore(otherEventEnd) &&
          displayEnd.isAfter(otherEventStart) &&
          !otherIsMultiDayEvent // Only include single-day events in overlap calculation
        );
      });

      const totalOverlappingEvents = overlappingEvents.length + 1;
      const width = 100 / totalOverlappingEvents;

      let leftPosition = 0;
      for (let i = 0; i < totalOverlappingEvents; i++) {
        if (!eventSlotMapRef.current[daySelected][i]) {
          eventSlotMapRef.current[daySelected][i] = true;
          leftPosition = width * i;
          break;
        }
      }

      return {
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPosition}%`,
        width: `${width}%`,
        isMultiDay: false, // Mark as a single-day event
      };
    },
    [daySelected, events, hourHeight]
  );

  // Memoized event handler for adding events
  const handleAddEvent = useCallback(() => {
    setShowEventModal(true);
  }, [setShowEventModal]);

  // Memoized event handler for clicking events
  const handleEventClick = useCallback(
    (event) => {
      setSelectedEvent(event);
      setShowInfoEventModal(true);
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

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

      {/* Scrollable Calendar Grid */}
      <div
        ref={dayViewRef}
        style={{
          overflowY: "auto",
          height: "calc(100vh - 100px)",
          position: "relative",
        }}
      >
        {/* Event Grid Container */}
        <div
          style={{
            position: "relative",
            height: `${hourHeight * (endHour - startHour)}px`,
            width: "100%", // Ensure the container takes up the full width
            marginLeft: "0px", // Ensure proper alignment
          }}
        >
          {/* Hour Labels */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0, // Ensure it's correctly positioned to the left
              width: "50px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              paddingRight: "10px",
              color: "rgba(0, 0, 0, 0.6)",
              borderRight: "1px solid #ddd",
              boxSizing: "border-box",
              zIndex: 3500, // Ensure it appears above the grid
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  fontSize: "12px",
                }}
              >
                {dayjs().hour(hour).minute(0).format("HH:mm")}
              </div>
            ))}
          </div>

          {/* Event Grid */}
          <div style={{ position: "relative", height: "100%", width: "100%" }}>
            {Array.from({ length: (endHour - startHour) * 2 }, (_, i) => i).map(
              (quarter) => (
                <div
                  key={quarter}
                  style={{
                    height: `${hourHeight / 2}px`,
                    borderTop: `1px solid rgba(0, 0, 0, 0.1)`,
                    backgroundColor: "#f5f5f5",
                    position: "relative",
                    cursor: "pointer",
                    width: "100%",
                  }}
                  onClick={handleAddEvent}
                ></div>
              )
            )}

            {/* Render Events */}
            {filteredEvents.map((event, index) => {
              const { top, height, left, width, isMultiDay } =
                calculateEventBlockStyles(event, index);
                const eventTypeStyle = getEventStyleAndIcon(event.eventType);

              return (
                <div
                  key={event.eventId}
                  style={{
                    position: "absolute",
                    top,
                    left,
                    width,
                    height,
                    backgroundColor: eventTypeStyle.backgroundColor,
                    color: eventTypeStyle.color,
                    padding: "0px 4px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    marginLeft:"60px",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    zIndex: isMultiDay ? 20 : 10, // Multi-day events should be above single-day ones
                    boxSizing: "border-box",
                    borderLeft: `4px solid ${eventTypeStyle.color}`,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = eventTypeStyle.color
                      ? `${eventTypeStyle.color}33`
                      : "#c5e1f9";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      eventTypeStyle.backgroundColor;
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.15)";
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  {eventTypeStyle.icon}
                  <Typography component="span" variant="body2" noWrap>
                    {event.title}
                  </Typography>
                </div>
              );
            })}

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
      </div>

      {showEventInfoModal && <EventInfoPopup />}
    </Paper>
  );
}
