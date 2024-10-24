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
  const hourHeight = 90;  // Define the height for each hour block
  const startHour = 0;    // Define the start hour (00:00 or 12:00 AM)
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
  const userTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const weekViewRef = useRef(null);
  const location = useLocation();

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
      ].some((filter) => filter.checked) ||
      filters.partnerEvent !== undefined ||
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
        filters.accountSectors.some(
          (sector) => sector.checked && event.accountSectors?.[sector.label]
        );

        const accountSegmentMatch =
        !filters.accountSegments.some((segment) => segment.checked) ||
        filters.accountSegments.some((segment) => {
          try {
            const accountSegment = event.accountSegments?.[segment.label];
            return (
              segment.checked &&
              accountSegment?.selected === "true" && // Convert selected to a boolean
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
        filters.productFamily.some(
          (product) =>
            product.checked && event.productAlignment?.[product.label]?.selected
        );

      const industryMatch =
        !filters.industry.some((industry) => industry.checked) ||
        filters.industry.some(
          (industry) => industry.checked && event.industry === industry.label
        );

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
  
    const multiDayEvents = filteredEvents.filter(event => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
  
      // Ensure that the event spans more than one day
      // Also ensure the event falls within the bounds of the current week
      return eventStart.isValid() &&
        eventEnd.isValid() &&
        !eventStart.isSame(eventEnd, 'day') &&  // Exclude single-day events
        eventStart.isBefore(currentWeek[currentWeek.length - 1].endOf('day')) &&
        eventEnd.isAfter(currentWeek[0].startOf('day'));
    });
  
    const singleDayEvents = filteredEvents.filter(event => {
      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);
      
      // Include only events that start and end on the same day
      return eventStart.isSame(eventEnd, 'day') && eventStart.isValid() && eventEnd.isValid();
    });
  
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

  multiDayEvents.forEach(event => {
    let addedToGroup = false;

    // Check each group to see if the event overlaps with any event in the group
    for (const group of groups) {
      const overlaps = group.some(groupEvent => isOverlapping(event, groupEvent));

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


  const multiDayEventGroups = useMemo(() => groupMultiDayEvents(multiDayEvents), [multiDayEvents, groupMultiDayEvents]);

  // Calculate styles for multi-day events including stacking
  const calculateMultiDayEventStyles = (event, groupIndex, eventIndex, currentWeek) => {
    // Defensive check to make sure currentWeek is not undefined or empty
    if (!currentWeek || currentWeek.length === 0) {
      return { top: '0px', left: '0%', width: '100%' }; // Default safe values
    }
  
    const eventStart = dayjs(event.startDate);
    const eventEnd = dayjs(event.endDate);
  
    // Calculate the first day of the week and the last day of the week
    const weekStart = currentWeek[0];
    const weekEnd = currentWeek[currentWeek.length - 1];
  
    // Ensure the event spans across the correct number of days in the current week
    const startOfWeekEvent = eventStart.isBefore(weekStart) ? weekStart : eventStart;
    const endOfWeekEvent = eventEnd.isAfter(weekEnd) ? weekEnd : eventEnd;
  
    const startIndex = currentWeek.findIndex(day => day.isSame(startOfWeekEvent, 'day'));
    const endIndex = currentWeek.findIndex(day => day.isSame(endOfWeekEvent, 'day'));
  
    if (startIndex === -1 || endIndex === -1) {
      // If the event's start or end doesn't match any days in the current week, return default values
      return { top: '0px', left: '0%', width: '100%' };
    }
  
    const eventSpan = endIndex - startIndex + 1;  // Number of days the event spans in the current week
    const leftPosition = (startIndex / 7) * 100;  // Left position as a percentage of the week
    const width = (eventSpan / 7) * 100;          // Width as a percentage of the week
  
    // Stack events vertically by their group and index within the group
    const topPosition = (groupIndex * 30) + (eventIndex * 30);  // Stack by both group and event
  
    return {
      top: `${topPosition}px`,
      left: `${leftPosition}%`,
      width: `${width}%`,
    };
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
      height: "200px",  // Fixed height for multi-day events section
      overflowY: "auto",  // Allow vertical scrolling
      padding: "15px 20px",  // More balanced padding
      borderBottom: "1px solid #ddd", 
      paddingTop: '10px', // Subtle bottom border
      marginLeft: "60px",  // Maintain the margin to align with other content
      marginTop: "20px",
      marginBottom: "20px",
      borderRadius: "8px",  // Add rounded corners for a modern look
      transition: "box-shadow 0.3s ease-in-out",  // Smooth transition for shadow
      '&:hover': {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",  // Increase shadow on hover
      },
      scrollbarWidth: "thin",  // Thin scrollbar for non-Chrome browsers
      '&::-webkit-scrollbar': {
        width: '8px',  // Set the width for the scrollbar in Chrome/Safari
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: "#b3b3b3",  // Scrollbar thumb color
        borderRadius: '4px',  // Rounded scrollbar thumb
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#f1f1f1',  // Scrollbar track color
      }
    }}
  >
    {multiDayEventGroups.map((group, groupIndex) =>
      group.map((event, eventIndex) => {
        const { backgroundColor, color, icon } = getEventStyleAndIcon(event.eventType);
        const styles = calculateMultiDayEventStyles(event, groupIndex, eventIndex, currentWeek);

        return (
          <div
            key={event.eventId}
            style={{
              position: 'absolute',
              ...styles,  // Apply calculated styles for top, left, and width
              backgroundColor,
              color,
              padding: '8px 12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              height: '30px',  // Fixed height for multi-day events
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', // Add shadow
              transition: 'background-color 0.2s, box-shadow 0.2s', // Smooth transitions
              borderLeft: `4px solid ${color}`,  // Border to indicate event type
              marginBottom: '5px',  // Add spacing between events
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = color ? `${color}33` : "#f0f0f0";  // Change background on hover
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';  // Increase shadow on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = backgroundColor;  // Reset background
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';  // Reset shadow
            }}
            onClick={() => handleEventClick(event)}
          >
            {icon}
            <Typography
              noWrap
              sx={{
                marginLeft: '8px',  // Add space between icon and text
                color: '#333',  // Text color
                flex: 1,  // Allow text to take available space
                fontSize: '0.875rem',  // Adjust font size
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
                position: 'absolute',
                top: `${hour * hourHeight}px`,
                width: '50px',
                textAlign: 'right',
                paddingRight: '10px',
                fontSize: '12px',
                color: '#666',
              }}
            >
              {dayjs().hour(hour).minute(0).format('HH:mm')}
            </Typography>
          ))}
        </Box>

        {/* Actual day columns */}
        {currentWeek.map((day, index) => {
          const filteredEventsForDay = singleDayEvents.filter(event => {
            return dayjs(event.startDate).isSame(day, 'day');
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
                showTimeLabels={index === 0}  // Only show time labels for the first column
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