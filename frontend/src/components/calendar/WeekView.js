import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import GlobalContext from "../../context/GlobalContext";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { useLocation } from "react-router-dom";

// Components / utils
import DayColumn from "../Day/DayColumn";
import EventInfoPopup from "../popup/EventInfoModal";
import { getEventData } from "../../api/getEventData";
import { getEventStyleAndIcon } from "../../utils/eventStyles";

// Extend dayjs with UTC if needed
dayjs.extend(utc);

export default function WeekView() {
  // ─────────────────────────────────────────────────────────────────────────────
  // Constants & context
  // ─────────────────────────────────────────────────────────────────────────────
  const hourHeight = 90;  // Height for each hour row
  const startHour = 0;    // 00:00
  const endHour = 24;     // 24-hour format

  const {
    daySelected,
    setSelectedEvent,
    setShowInfoEventModal,
    showEventInfoModal,
    selectedEvent,
    filters,
  } = useContext(GlobalContext);

  // ─────────────────────────────────────────────────────────────────────────────
  // Local state
  // ─────────────────────────────────────────────────────────────────────────────
  const [currentWeek, setCurrentWeek] = useState([]);
  const [events, setEvents] = useState([]);
  // For debugging or future usage, you can store filtered events in state:
  // const [filteredEvents, setFilteredEvents] = useState([]);
  // But here we do everything in a useMemo, so we won't maintain separate state.
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const weekViewRef = useRef(null);

  // For user’s system time zone (optional usage)
  const userTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Build the “currentWeek” array from the selected day
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const startOfWeek = dayjs(daySelected).startOf("week");
    const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, "day")
    );
    setCurrentWeek(daysOfWeek);
  }, [daySelected]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch events (similar to MonthView)
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventData = await getEventData("eventDataQuery");
        setEvents(Array.isArray(eventData) ? eventData : []);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [location, filters]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper: sortEventsByPriority
  // ─────────────────────────────────────────────────────────────────────────────
  const sortEventsByPriority = (events) => {
    return events.sort((a, b) => {
      // 1) Prioritize "Invite available" > "Finalized" > "Draft"
      const getStatusPriority = (ev) => {
        const statuses = [];
        if (ev.isDraft) {
          statuses.push("Draft");
        } else {
          statuses.push("Finalized");
          const hasGmailOrSalesloft = ev.languagesAndTemplates?.some((tpl) =>
            ["Gmail", "Salesloft"].includes(tpl.platform)
          );
          if (hasGmailOrSalesloft) {
            statuses.push("Invite available");
          }
        }
        // Return a numeric priority
        if (statuses.includes("Invite available")) return 2; // highest
        if (statuses.includes("Finalized")) return 1;
        return 0; // draft is lowest
      };

      const statusA = getStatusPriority(a);
      const statusB = getStatusPriority(b);
      if (statusA !== statusB) {
        return statusB - statusA; // descending
      }

      // 2) Next check isHighPriority
      if (a.isHighPriority !== b.isHighPriority) {
        return b.isHighPriority - a.isHighPriority; // true > false
      }

      // 3) Finally, descending by expectedAttendees
      return b.expectedAttendees - a.expectedAttendees;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // filteredEvents useMemo
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) {
      return [];
    }

    // 1) If no filters are checked, return everything
    const anyFilterChecked =
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
        ...filters.partnerEvent,
        ...filters.draftStatus,
        ...filters.newlyCreated,
      ].some((f) => f.checked) ||
      (filters.organisedBy && filters.organisedBy.length > 0);

    if (!anyFilterChecked) {
      return events;
    }

    // 2) Otherwise, apply each filter
    return events.filter((event) => {
      try {
        // Sub-region
        const subRegionMatch =
          !filters.subRegions.some((sr) => sr.checked) ||
          filters.subRegions.some(
            (sr) => sr.checked && event.subRegion?.includes(sr.label)
          );

        // GEP
        const gepMatch =
          !filters.gep.some((g) => g.checked) ||
          filters.gep.some((g) => g.checked && event.gep?.includes(g.label));

        // Buyer Segment Rollup
        const buyerSegMatch =
          !filters.buyerSegmentRollup.some((b) => b.checked) ||
          filters.buyerSegmentRollup.some(
            (b) => b.checked && event.audienceSeniority?.includes(b.label)
          );

        // Account Sector
        const accountSectorMatch =
          !filters.accountSectors.some((s) => s.checked) ||
          filters.accountSectors.some((s) => {
            if (!s.checked) return false;
            // For example: map "Public Sector" => event.accountSectors.public
            const sectorMap = {
              "Public Sector": "public",
              Commercial: "commercial",
            };
            const key = sectorMap[s.label];
            return key ? event.accountSectors?.[key] === true : false;
          });

        // Region
        const regionMatch =
          !filters.regions.some((r) => r.checked) ||
          filters.regions.some((r) => r.checked && event.region?.includes(r.label));

        // Country
        const countryMatch =
          !filters.countries.some((c) => c.checked) ||
          filters.countries.some((c) => c.checked && event.country?.includes(c.label));

        // Account Segments
        const accountSegmentMatch =
          !filters.accountSegments.some((seg) => seg.checked) ||
          filters.accountSegments.some((seg) => {
            if (!seg.checked) return false;
            const eSeg = event.accountSegments?.[seg.label];
            return eSeg?.selected && parseFloat(eSeg.percentage) > 0;
          });

        // Product Family
        const productFamilyMatch =
          !filters.productFamily.some((pf) => pf.checked) ||
          filters.productFamily.some((pf) => {
            if (!pf.checked) return false;
            const alignment = event.productAlignment?.[pf.label];
            return alignment?.selected && parseFloat(alignment.percentage) > 0;
          });

        // Industry
        const industryMatch =
          !filters.industry.some((ind) => ind.checked) ||
          filters.industry.some(
            (ind) => ind.checked && event.industry?.includes(ind.label)
          );

        // Partner Event
        const partnerChecked = filters.partnerEvent.filter((p) => p.checked).map((p) => p.value);
        const partnerMatch =
          partnerChecked.length === 0 || partnerChecked.includes(event.isPartneredEvent);

        // Draft Status
        const draftStatusesChecked = filters.draftStatus
          .filter((ds) => ds.checked)
          .map((ds) => ds.value); // e.g. ["Draft", "Finalized", "Invite available"]
        const draftMatch =
          draftStatusesChecked.length === 0 ||
          (function () {
            // Figure out possible statuses for the event
            const statuses = [];
            if (event.isDraft) {
              statuses.push("Draft");
            } else {
              statuses.push("Finalized");
              const hasInvites = event.languagesAndTemplates?.some((tpl) =>
                ["Gmail", "Salesloft"].includes(tpl.platform)
              );
              if (hasInvites) {
                statuses.push("Invite available");
              }
            }
            // If any of these statuses are in the user’s chosen set, pass
            return statuses.some((st) => draftStatusesChecked.includes(st));
          })();

        // Program Name
        const programNameMatch =
          !filters.programName.some((pn) => pn.checked) ||
          filters.programName.some(
            (pn) =>
              pn.checked &&
              event.programName?.some((evName) =>
                evName.toLowerCase().includes(pn.label.toLowerCase())
              )
          );

        // Activity Type
        const activityMatch =
          !filters.activityType.some((a) => a.checked) ||
          filters.activityType.some(
            (a) =>
              a.checked &&
              event.eventType?.toLowerCase() === a.label.toLowerCase()
          );

        // Newly Created (last 14 days if "Yes")
        const newlyCreatedChecked = filters.newlyCreated.filter((nc) => nc.checked);
        const newlyCreatedMatch =
          newlyCreatedChecked.length === 0 ||
          newlyCreatedChecked.some((nc) => {
            const entryCreatedDate = event.entryCreatedDate?.value
              ? dayjs(event.entryCreatedDate.value)
              : null;
            if (!entryCreatedDate || !entryCreatedDate.isValid()) {
              // If missing, treat as “old” => matches only if user checked “No”
              return nc.value === false;
            }
            // If within 14 days => “Yes”, else “No”
            const isWithin14Days = dayjs().diff(entryCreatedDate, "day") <= 14;
            return nc.value === isWithin14Days;
          });

        // Organised By (multi-select array)
        const organiserMatch =
          !filters.organisedBy || filters.organisedBy.length === 0
            ? true
            : filters.organisedBy.some((org) => event.organisedBy?.includes(org));

        // Combine them all:
        return (
          subRegionMatch &&
          gepMatch &&
          buyerSegMatch &&
          accountSectorMatch &&
          regionMatch &&
          countryMatch &&
          accountSegmentMatch &&
          productFamilyMatch &&
          industryMatch &&
          partnerMatch &&
          draftMatch &&
          programNameMatch &&
          activityMatch &&
          newlyCreatedMatch &&
          organiserMatch
        );
      } catch (filterError) {
        console.error("Error applying filters to event:", event, filterError);
        return false;
      }
    });
  }, [events, filters]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Single-day vs multi-day separation
  // ─────────────────────────────────────────────────────────────────────────────
  const { multiDayEvents, singleDayEvents } = useMemo(() => {
    if (!Array.isArray(currentWeek) || currentWeek.length === 0) {
      return { multiDayEvents: [], singleDayEvents: [] };
    }

    const sorted = sortEventsByPriority(filteredEvents);

    const multi = sorted.filter((ev) => {
      const eventStart = dayjs(ev.startDate);
      const eventEnd = dayjs(ev.endDate);
      return (
        eventStart.isValid() &&
        eventEnd.isValid() &&
        // multi-day if they are not the same day
        !eventStart.isSame(eventEnd, "day") &&
        // also ensure at least some overlap with the current week
        eventStart.isBefore(currentWeek[currentWeek.length - 1].endOf("day")) &&
        eventEnd.isAfter(currentWeek[0].startOf("day"))
      );
    });

    const single = sorted.filter((ev) => {
      const eventStart = dayjs(ev.startDate);
      const eventEnd = dayjs(ev.endDate);
      return (
        eventStart.isValid() &&
        eventEnd.isValid() &&
        eventStart.isSame(eventEnd, "day")
      );
    });

    return {
      multiDayEvents: multi,
      singleDayEvents: single,
    };
  }, [filteredEvents, currentWeek]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper to detect overlap of events
  // ─────────────────────────────────────────────────────────────────────────────
  const isOverlapping = (event1, event2) => {
    const s1 = dayjs(event1.startDate);
    const e1 = dayjs(event1.endDate);
    const s2 = dayjs(event2.startDate);
    const e2 = dayjs(event2.endDate);
    return s1.isBefore(e2) && e1.isAfter(s2);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Group multi-day events by overlap (stack them vertically)
  // ─────────────────────────────────────────────────────────────────────────────
  const groupMultiDayEvents = useCallback((allMultiDay) => {
    const groups = [];
    allMultiDay.forEach((event) => {
      let addedToExistingGroup = false;
      for (const group of groups) {
        if (group.some((gEvent) => isOverlapping(gEvent, event))) {
          group.push(event);
          addedToExistingGroup = true;
          break;
        }
      }
      if (!addedToExistingGroup) {
        groups.push([event]);
      }
    });
    return groups;
  }, []);

  const multiDayEventGroups = useMemo(() => {
    return groupMultiDayEvents(multiDayEvents);
  }, [multiDayEvents, groupMultiDayEvents]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Layout for multi-day events (left%, width%, stacking)
  // ─────────────────────────────────────────────────────────────────────────────
  const calculateMultiDayEventStyles = useCallback(
    (event, groupIndex, eventIndex) => {
      if (!currentWeek || currentWeek.length === 0) {
        return { top: "0px", left: "0%", width: "100%" };
      }

      const eventStart = dayjs(event.startDate);
      const eventEnd = dayjs(event.endDate);

      const weekStart = currentWeek[0];
      const weekEnd = currentWeek[currentWeek.length - 1];

      // Clamp the event’s start/end if they go beyond this week
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
        return { top: "0px", left: "0%", width: "100%" };
      }

      const totalDays = endIndex - startIndex + 1; // how many days in this event’s range
      const leftPercent = (startIndex / 7) * 100;
      const widthPercent = (totalDays / 7) * 100;

      // Stack by group index and event index
      const topPosition = groupIndex * 30 + eventIndex * 30; // 30px steps

      return {
        position: "absolute",
        top: `${topPosition}px`,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
      };
    },
    [currentWeek]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Event popup triggers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleEventClick = useCallback(
    (ev) => {
      setSelectedEvent(ev);
      setShowInfoEventModal(true);
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

  const closeEventModal = useCallback(() => {
    setShowInfoEventModal(false);
    setSelectedEvent(null);
  }, [setShowInfoEventModal, setSelectedEvent]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Mouse hover tooltip
  // ─────────────────────────────────────────────────────────────────────────────
  const handleMouseEnter = (e, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredEvent(event);
    setTooltipPosition({
      x: rect.left + 10,
      y: rect.top + window.scrollY - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
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
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* --- Header row with days of the week --- */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              paddingY: "10px",
              backgroundColor: "white",
              borderBottom: "1px solid #ddd",
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
                  paddingX: "10px",
                }}
              >
                {day.format("ddd, D MMM")}
              </Typography>
            ))}
          </Box>

          {/* --- Multi-day events bar (stacked) --- */}
          {multiDayEventGroups.length > 0 && (
            <Box
              sx={{
                position: "relative",
                height: "200px",
                overflowY: "auto",
                padding: "15px 20px",
                borderBottom: "1px solid #ddd",
                marginLeft: "60px",
                marginTop: "20px",
                marginBottom: "20px",
                borderRadius: "8px",
                transition: "box-shadow 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                },
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#b3b3b3",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                },
              }}
            >
              {multiDayEventGroups.map((group, groupIndex) =>
                group.map((event, eventIndex) => {
                  const { backgroundColor, color, icon } = getEventStyleAndIcon(
                    event.eventType
                  );
                  const positionStyle = calculateMultiDayEventStyles(
                    event,
                    groupIndex,
                    eventIndex
                  );

                  return (
                    <div
                      key={event.eventId || `${event.title}-${eventIndex}`}
                      style={{
                        ...positionStyle,
                        backgroundColor,
                        color,
                        padding: "8px 12px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        height: "30px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        transition: "background-color 0.2s, box-shadow 0.2s",
                        borderLeft: `4px solid ${color}`,
                        marginBottom: "5px",
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
                      onClick={() => handleEventClick(event)}
                    >
                      {icon}
                      <Typography
                        noWrap
                        sx={{
                          marginLeft: "8px",
                          color: "#333",
                          flex: 1,
                          fontSize: "0.875rem",
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

          {/* --- Tooltip if hovering over event --- */}
          {hoveredEvent && (
            <Box
              sx={{
                position: "absolute",
                top: `${tooltipPosition.y}px`,
                left: `${tooltipPosition.x}px`,
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

          {/* --- Scrollable columns for single-day events --- */}
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

            {/* Day columns */}
            {currentWeek.map((day, index) => {
              // Single-day events for this day
              const eventsForDay = singleDayEvents.filter((ev) =>
                dayjs(ev.startDate).isSame(day, "day")
              );

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
                    events={eventsForDay}
                    onEventClick={handleEventClick}
                    showTimeLabels={index === 0}
                  />
                </Box>
              );
            })}
          </Box>

          {/* --- Modal popup for event details --- */}
          {showEventInfoModal && selectedEvent && (
            <EventInfoPopup event={selectedEvent} close={closeEventModal} />
          )}
        </>
      )}
    </Paper>
  );
}
