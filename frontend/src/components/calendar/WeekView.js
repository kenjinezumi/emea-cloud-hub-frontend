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
  const [currentTimePosition, setCurrentTimePosition] = useState(0); // State for auto-scroll
  const userTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const hourHeight = 60;
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
            segment.checked && event.buyerSegmentRollup?.includes(segment.label)
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
    });
  }, [filters, events]);

  useEffect(() => {}, [filteredEvents]);

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

  useEffect(() => {
    if (weekViewRef.current) {
      const currentHourOffset = dayjs().hour() * hourHeight;
      weekViewRef.current.scrollTo({
        top: currentHourOffset - hourHeight / 2,
        behavior: "smooth",
      });
    }

    const updateCurrentTimePosition = () => {
      const now = dayjs();
      const position =
        now.hour() * hourHeight + (now.minute() / 60) * hourHeight;
      setCurrentTimePosition(position);
    };

    updateCurrentTimePosition();
    const interval = setInterval(updateCurrentTimePosition, 60000);

    return () => clearInterval(interval);
  }, [hourHeight]);

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

  const timeSlotLabels = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => (
        <Typography
          key={i}
          align="right"
          sx={{
            height: `${hourHeight}px`,
            lineHeight: `${hourHeight}px`,
            paddingRight: "5px",
            fontSize: "12px",
            color: "grey.500",
          }}
        >
          {dayjs().hour(i).minute(0).format("HH:mm")}
        </Typography>
      )),
    [hourHeight]
  );

  return (
    <Paper
      sx={{
        width: "90%",
        height: "100vh",
        overflow: "hidden",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        border: "none",
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Week of {dayjs(daySelected).startOf("week").format("MMMM D, YYYY")} (
        {userTimezone})
      </Typography>
      <Box
        ref={weekViewRef}
        sx={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          overflowY: "auto",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Hour Labels */}
        <Box
          sx={{
            flex: "0 0 50px",
            borderRight: "2px solid #bbb",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {timeSlotLabels}
        </Box>

        {/* Horizontal Lines */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 50,
            right: 0,
            height: "100%",
            zIndex: 1,
            pointerEvents: "none", // Ensure lines do not intercept clicks
          }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                top: `${i * hourHeight}px`,
                left: 0,
                right: 0,
                height: "1px",
                borderTop: "1px solid #ddd",
              }}
            />
          ))}
        </Box>

        {currentWeek.map((day) => (
          <Box
            key={day.format("YYYY-MM-DD")}
            sx={{ flex: 1, position: "relative" }}
          >
            <Typography
              align="center"
              variant="subtitle1"
              sx={{
                padding: "5px 0",
                borderBottom: "1px solid #ddd",
                backgroundColor: "white",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              {day.format("ddd, D MMM")}
            </Typography>

            <DayColumn
              daySelected={day}
              events={filteredEvents} // Pass all filtered events
              onEventClick={handleEventClick}
            />
          </Box>
        ))}
      </Box>

      {/* Conditionally render EventInfoPopup */}
      {showEventInfoModal && selectedEvent && (
        <EventInfoPopup event={selectedEvent} close={closeEventModal} />
      )}
    </Paper>
  );
}
