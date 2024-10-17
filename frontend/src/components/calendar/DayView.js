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
            (eventStart.isBefore(selectedDayEnd) && eventEnd.isAfter(selectedDayStart))
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
                    console.error("Error checking accountSegments filter:", err);
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
        eventStart.isSame(daySelected, "day") && eventEnd.isSame(daySelected, "day")
      );
    });

    return { multiDayEvents, singleDayEvents };
  }, [filteredEvents, daySelected]);

  // Group overlapping single-day events
  const groupOverlappingEvents = (events) => {
    const groups = [];
    events.forEach((event) => {
      let addedToGroup = false;
      for (const group of groups) {
        const isOverlapping = group.some((groupEvent) => {
          return dayjs(event.startDate).isBefore(groupEvent.endDate) &&
                 dayjs(event.endDate).isAfter(groupEvent.startDate);
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

  const overlappingEventGroups = useMemo(() => groupOverlappingEvents(singleDayEvents), [singleDayEvents]);

  // Helper function to calculate the event block styles
  const calculateEventBlockStyles = useCallback(
    (event, overlappingEvents) => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      const startOfDay = daySelected.startOf("day");
      const endOfDay = daySelected.endOf("day");

      const displayStart = dayjs.max(startOfDay, eventStart);
      const displayEnd = dayjs.min(endOfDay, eventEnd);

      const minutesFromMidnight = displayStart.diff(startOfDay, "minutes");
      const durationInMinutes = displayEnd.diff(displayStart, "minutes");

      const top = (minutesFromMidnight / 60) * hourHeight;
      const height = (durationInMinutes / 60) * hourHeight;

      const overlapCount = overlappingEvents.length;
      const width = 100 / overlapCount;
      const left = overlappingEvents.indexOf(event) * width;

      return { top, height, width, left };
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
      setSelectedEvent(event);  // Set the clicked event as the selected one
      setShowInfoEventModal(true);  // Trigger the modal to show
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
          onClick={handleAddEvent}
        >
          {/* Hour Labels */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0, // Ensures the lines stretch across the full width of the grid
              width: "100%", // Make sure the width spans the entire grid
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              zIndex: 1, // Ensures the lines are on top
              color: "#999", // Lighter grey color for the label
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
                  position: "relative", // Ensures it's within the grid
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)", // Line style
                  left: 0, // Start the line from the left
                  right: 0, // Stretch the line to the right
                  width: "100%", // Ensures the line spans the entire width of the container
                  zIndex: 1, // Ensures it's behind the events
                }}
              >
                {dayjs().hour(hour).minute(0).format("HH:mm")}
              </div>
            ))}
          </div>

          {/* Multi-Day Events */}
          {multiDayEvents.map((event, index) => {
            const { backgroundColor, color, icon } = getEventStyleAndIcon(event.eventType);
            return (
              <div
                key={event.eventId}
                style={{
                  position: "absolute",
                  top: `${index * multiDayEventHeight}px`, // Stack multi-day events
                  left: "0%",
                  width: "100%",
                  height: `${multiDayEventHeight}px`, // Fixed height
                  backgroundColor,
                  color,
                  padding: "2px 4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  borderLeft: `2px solid ${color}`,
                  boxSizing: "border-box",
                  marginLeft: '60px', // Adjust to avoid overlapping with labels
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent grid click handler
                  handleEventClick(event);
                }}              >
                {icon}
                <Typography noWrap>{event.title}</Typography>
              </div>
            );
          })}

          {/* Single-Day Events */}
          {overlappingEventGroups.map((group) =>
            group.map((event) => {
              const { top, height, left, width } = calculateEventBlockStyles(event, group);
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
                    padding: "2px 4px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    zIndex: 2,
                    borderLeft: `2px solid ${eventTypeStyle.color}`,
                    marginLeft: '60px', // Adjust to avoid overlapping with labels
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
                  onClick={() => handleEventClick(event)}                  >
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
          event={selectedEvent} // Pass the selected event to the popup
          onClose={() => setShowInfoEventModal(false)} // Close modal handler
        />
      )}
    </Paper>
  );
}
