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
        filters.accountSegments.some(
          (segment) =>
            segment.checked && event.accountSegments?.[segment.label]?.selected
        );

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
          // Filter events for each specific day
          const filteredEventsForDay = filteredEvents.filter(event => {
            const eventStart = dayjs(event.startDate);
            return eventStart.isSame(day, 'day');
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