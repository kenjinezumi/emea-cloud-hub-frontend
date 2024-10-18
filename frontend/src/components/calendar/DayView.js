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
import { getEventStyleAndIcon } from "../../utils/eventStyles";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

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

  const hourHeight = 90;
  const startHour = 0;
  const endHour = 24;
  const multiDayEventHeight = 30; // Fixed height for multi-day events

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
          ].some((filter) => filter.checked) ||
          filters.partnerEvent !== undefined ||
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
                      sector.checked && event.accountSectors?.[sector.label]
                    );
                  } catch (err) {
                    console.error("Error checking accountSectors filter:", err);
                    return false;
                  }
                });

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
                      err
                    );
                    return false;
                  }
                });

              const productFamilyMatch =
                !filters.productFamily.some((product) => product.checked) ||
                filters.productFamily.some((product) => {
                  try {
                    return (
                      product.checked &&
                      event.productAlignment?.[product.label]?.selected
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
                      industry.checked && event.industry === industry.label
                    );
                  } catch (err) {
                    console.error("Error checking industry filter:", err);
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
    if (!dateString.includes('T')) {
      return `${dateString}T00:00`; // Default to 12:00 AM if time is missing
    }
    return dateString;
  };
  
  const fixMissingTimeEnd = (dateString) => {
    if (!dateString.includes('T')) {
      return `${dateString}T01:00`; // Default to 01:10 AM if time is missing
    }
    return dateString;
  };
  
  const groupOverlappingEvents = (events) => {
    const groups = [];
  
    events.forEach((event) => {
      const eventStart = dayjs(fixMissingTimeStart(event.startDate));
      const eventEnd = dayjs(fixMissingTimeEnd(event.endDate));
  
      let addedToGroup = false;
  
      for (const group of groups) {
        const isOverlapping = group.some((groupEvent) => {
          const groupEventStart = dayjs(fixMissingTimeStart(groupEvent.startDate));
          const groupEventEnd = dayjs(fixMissingTimeEnd(groupEvent.endDate));
  
          // Check if there is any overlap between events
          return (
            (eventStart.isBefore(groupEventEnd) && eventEnd.isAfter(groupEventStart))
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
  
      // Check if the dates are valid
      if (!eventStart.isValid() || !eventEnd.isValid()) {
        console.error('Invalid event dates:', event.startDate, event.endDate);
        return { top: 0, height: 0, width: 100, left: 0, zIndex: 1 }; // Skip invalid events
      }
  
      const startOfDay = daySelected.startOf("day");
      const endOfDay = daySelected.endOf("day");
  
      const displayStart = dayjs.max(startOfDay, eventStart);
      const displayEnd = dayjs.min(endOfDay, eventEnd);
  
      const minutesFromMidnight = displayStart.diff(startOfDay, "minutes");
      const durationInMinutes = displayEnd.diff(displayStart, "minutes");
  
      const top = (minutesFromMidnight / 60) * hourHeight;
      const height = (durationInMinutes / 60) * hourHeight || 0;
  
      let overlappingGroup = []; // Events that overlap with the current event
  
      // Find all events that overlap with this one
      overlappingEvents.forEach((e) => {
        const eStart = dayjs(fixMissingTimeStart(e.startDate));
        const eEnd = dayjs(fixMissingTimeEnd(e.endDate));
  
        if (eventStart.isBefore(eEnd) && eventEnd.isAfter(eStart)) {
          overlappingGroup.push(e);
        }
      });
  
      // Sort the overlapping events by start time for better column allocation
      overlappingGroup = overlappingGroup.sort((a, b) => {
        const aStart = dayjs(fixMissingTimeStart(a.startDate));
        const bStart = dayjs(fixMissingTimeStart(b.startDate));
        return aStart.diff(bStart);
      });
  
      const columnCount = overlappingGroup.length;
      let width = 100;
      let left = 0;
  
      if (columnCount > 1) {
        // If there are overlapping events, each event takes a fraction of the width
        width = 100 / columnCount;
  
        // Find the index of the current event within the overlapping group
        const columnIndex = overlappingGroup.indexOf(event);
        left = columnIndex * width;
      }
  
      // Use zIndex to handle visual stacking (higher for later events)
      const zIndex = overlappingGroup.indexOf(event) + 1;
  
      return { top, height, width, left, zIndex };
    },
    [daySelected, hourHeight]
  );
  
  
  
  

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

      {/* Multi-Day Events Section */}
      {multiDayEvents.length > 0 && (
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
                    : "#f0f0f0"; // Lightened background on hover
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.2)"; // Enhanced shadow on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = backgroundColor; // Reset background
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0, 0, 0, 0.15)"; // Reset shadow
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
                  <Typography noWrap>{event.title}</Typography>
                </div>
              );
            })
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
    </Paper>
  );
}
