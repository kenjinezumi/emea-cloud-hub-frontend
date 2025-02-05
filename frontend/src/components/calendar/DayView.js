import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Typography, Paper, Box, CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import minMax from "dayjs/plugin/minMax";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import GlobalContext from "../../context/GlobalContext";
import { getEventData } from "../../api/getEventData";
import EventInfoPopup from "../popup/EventInfoModal";
import { getEventStyleAndIcon } from "../../utils/eventStyles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// Extend dayjs
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function DayView() {
  const {
    daySelected,
    setShowEventModal,
    setSelectedEvent,
    setShowInfoEventModal,
    filters,
    showEventInfoModal,
    selectedEvent,
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const dayViewRef = useRef(null);

  // Constants for layout
  const hourHeight = 90;
  const startHour = 0;
  const endHour = 24;
  const multiDayEventHeight = 30;
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch events and apply filters
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      setLoading(true);
      try {
        const eventData = await getEventData("eventDataQuery");
        // Make sure we have an array
        const allEvents = Array.isArray(eventData) ? eventData : [];

        setEvents(allEvents);

        // 1) Filter for only events that overlap the chosen day
        const selectedDayStart = daySelected.startOf("day");
        const selectedDayEnd = daySelected.endOf("day");

        const dayOverlappingEvents = allEvents.filter((event) => {
          const eventStart = dayjs(event.startDate);
          const eventEnd = dayjs(event.endDate);

          // If no valid dates, skip
          if (!eventStart.isValid() || !eventEnd.isValid()) return false;

          // Overlap check for the selected day
          return (
            eventStart.isSame(daySelected, "day") ||
            eventEnd.isSame(daySelected, "day") ||
            (eventStart.isBefore(selectedDayEnd) &&
              eventEnd.isAfter(selectedDayStart))
          );
        });

        // 2) If no filters are checked, skip further filtering
        const anyFilterChecked =
          [
            ...filters.regions,
            ...filters.subRegions,
            ...filters.countries,
            ...filters.gep,
            ...filters.buyerSegmentRollup,
            ...filters.accountSectors,
            ...filters.accountSegments,
            ...filters.productFamily,
            ...filters.industry,
            ...filters.programName,
            ...filters.activityType,
            ...filters.partnerEvent,
            ...filters.draftStatus,
            ...filters.newlyCreated,
          ].some((f) => f.checked) ||
          (filters.organisedBy && filters.organisedBy.length > 0);

        if (!anyFilterChecked) {
          setFilteredEvents(dayOverlappingEvents);
          return;
        }

        // 3) Single-pass filter
        const finalFiltered = dayOverlappingEvents.filter((event) => {
          try {
            const {
              subRegions,
              gep,
              buyerSegmentRollup,
              accountSectors,
              accountSegments,
              productFamily,
              industry,
              regions,
              countries,
              programName,
              activityType,
              partnerEvent,
              draftStatus,
              newlyCreated,
              organisedBy,
            } = filters;

            // Region
            const regionMatch =
              !regions.some((r) => r.checked) ||
              regions.some((r) => r.checked && event.region?.includes(r.label));

            // Sub-region
            const subRegionMatch =
              !subRegions.some((sr) => sr.checked) ||
              subRegions.some(
                (sr) => sr.checked && event.subRegion?.includes(sr.label)
              );

            // Country
            const countryMatch =
              !countries.some((c) => c.checked) ||
              countries.some(
                (c) => c.checked && event.country?.includes(c.label)
              );

            // GEP
            const gepMatch =
              !gep.some((g) => g.checked) ||
              gep.some((g) => g.checked && event.gep?.includes(g.label));

            // Buyer Segment
            const buyerMatch =
              !buyerSegmentRollup.some((b) => b.checked) ||
              buyerSegmentRollup.some(
                (b) => b.checked && event.audienceSeniority?.includes(b.label)
              );

            // Account Sectors
            const sectorMatch =
              !accountSectors.some((s) => s.checked) ||
              accountSectors.some((s) => {
                if (!s.checked) return false;
                const labelToKey = {
                  "Public Sector": "public",
                  Commercial: "commercial",
                };
                const key = labelToKey[s.label];
                return key ? event.accountSectors?.[key] === true : false;
              });

            // Account Segments
            const segMatch =
              !accountSegments.some((seg) => seg.checked) ||
              accountSegments.some((seg) => {
                if (!seg.checked) return false;
                const eSeg = event.accountSegments?.[seg.label];
                return eSeg?.selected && parseFloat(eSeg.percentage) > 0;
              });

            // Product Family
            const productMatch =
              !productFamily.some((pf) => pf.checked) ||
              productFamily.some((pf) => {
                if (!pf.checked) return false;
                const alignment = event.productAlignment?.[pf.label];
                return alignment?.selected && parseFloat(alignment.percentage) > 0;
              });

            // Industry
            const industryMatch =
              !industry.some((ind) => ind.checked) ||
              industry.some(
                (ind) => ind.checked && event.industry?.includes(ind.label)
              );

            // Program
            const programMatch =
              !programName.some((pn) => pn.checked) ||
              programName.some(
                (pn) =>
                  pn.checked &&
                  event.programName?.some((evName) =>
                    evName.toLowerCase().includes(pn.label.toLowerCase())
                  )
              );

            // Activity Type
            const activityMatch =
              !activityType.some((a) => a.checked) ||
              activityType.some(
                (a) =>
                  a.checked &&
                  event.eventType?.toLowerCase() === a.label.toLowerCase()
              );

            // Partner Event
            const partnerChecked = partnerEvent
              .filter((pe) => pe.checked)
              .map((pe) => pe.value); // [true, false]
            const partnerMatch =
              partnerChecked.length === 0 ||
              partnerChecked.includes(event.isPartneredEvent);

            // Draft Status
            const draftChecked = draftStatus
              .filter((ds) => ds.checked)
              .map((ds) => ds.value);
            const draftMatch =
              draftChecked.length === 0 ||
              (() => {
                const st = [];
                if (event.isDraft) {
                  st.push("Draft");
                } else {
                  st.push("Finalized");
                  // If not draft, check invites
                  const hasInvite = event.languagesAndTemplates?.some((tmpl) =>
                    ["Gmail", "Salesloft"].includes(tmpl.platform)
                  );
                  if (hasInvite) st.push("Invite available");
                }
                return st.some((x) => draftChecked.includes(x));
              })();

            // Newly Created
            const newlyChecked = newlyCreated.filter((nc) => nc.checked);
            const newlyMatch =
              newlyChecked.length === 0 ||
              newlyChecked.some((nc) => {
                const entryCreated = event.entryCreatedDate?.value
                  ? dayjs(event.entryCreatedDate.value)
                  : null;
                if (!entryCreated || !entryCreated.isValid()) {
                  // If missing => treat as old => matches if user picked "No"
                  return nc.value === false;
                }
                const within2Weeks = dayjs().diff(entryCreated, "day") <= 14;
                return nc.value === within2Weeks;
              });

            // Organised By (multi-select)
            const orgMatch =
              !organisedBy || organisedBy.length === 0
                ? true
                : organisedBy.some((org) => event.organisedBy?.includes(org));

            // Combine
            return (
              regionMatch &&
              subRegionMatch &&
              countryMatch &&
              gepMatch &&
              buyerMatch &&
              sectorMatch &&
              segMatch &&
              productMatch &&
              industryMatch &&
              programMatch &&
              activityMatch &&
              partnerMatch &&
              draftMatch &&
              newlyMatch &&
              orgMatch
            );
          } catch (err) {
            console.error("Error applying filters to event:", event, err);
            return false;
          }
        });

        setFilteredEvents(finalFiltered);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterEvents();
  }, [filters, daySelected, location]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Close modals on location change
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Multi-day vs single-day
  // ─────────────────────────────────────────────────────────────────────────────
  const { multiDayEvents, singleDayEvents } = useMemo(() => {
    const multi = [];
    const single = [];

    filteredEvents.forEach((ev) => {
      const start = dayjs(ev.startDate);
      const end = dayjs(ev.endDate);

      // If start == selectedDay and end == selectedDay => single day
      if (start.isSame(daySelected, "day") && end.isSame(daySelected, "day")) {
        single.push(ev);
      } else {
        multi.push(ev);
      }
    });

    return { multiDayEvents: multi, singleDayEvents: single };
  }, [filteredEvents, daySelected]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Sorting & grouping single-day events (overlaps)
  // ─────────────────────────────────────────────────────────────────────────────
  const fixMissingTimeStart = (dateString) =>
    dateString.includes("T") ? dateString : `${dateString}T00:00`;
  const fixMissingTimeEnd = (dateString) =>
    dateString.includes("T") ? dateString : `${dateString}T01:00`;

  const groupOverlappingEvents = useCallback((events) => {
    // Sort by (1) status priority, (2) isHighPriority, (3) expectedAttendees
    const sorted = [...events].sort((a, b) => {
      const getStatusPriority = (ev) => {
        // Draft < Finalized < Invite available
        const statuses = [];
        if (ev.isDraft) {
          statuses.push("Draft");
        } else {
          statuses.push("Finalized");
          const hasInvite = ev.languagesAndTemplates?.some((tpl) =>
            ["Gmail", "Salesloft"].includes(tpl.platform)
          );
          if (hasInvite) statuses.push("Invite available");
        }
        if (statuses.includes("Invite available")) return 2;
        if (statuses.includes("Finalized")) return 1;
        return 0; // Draft
      };

      const statA = getStatusPriority(a);
      const statB = getStatusPriority(b);
      if (statA !== statB) return statB - statA;

      // Next: isHighPriority
      if (a.isHighPriority !== b.isHighPriority) {
        return b.isHighPriority - a.isHighPriority; // true first
      }

      // Finally: expectedAttendees
      return (b.expectedAttendees || 0) - (a.expectedAttendees || 0);
    });

    // Then group
    const groups = [];
    sorted.forEach((ev) => {
      const evStart = dayjs(fixMissingTimeStart(ev.startDate));
      const evEnd = dayjs(fixMissingTimeEnd(ev.endDate));

      let placed = false;
      for (const group of groups) {
        const isOverlapping = group.some((gEv) => {
          const gS = dayjs(fixMissingTimeStart(gEv.startDate));
          const gE = dayjs(fixMissingTimeEnd(gEv.endDate));

          // Overlap or zero-minute at same time
          const zeroMinuteEvent = evStart.isSame(evEnd);
          return (
            (evStart.isBefore(gE) && evEnd.isAfter(gS)) ||
            (zeroMinuteEvent && evStart.isSame(gS))
          );
        });
        if (isOverlapping) {
          group.push(ev);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groups.push([ev]);
      }
    });

    return groups;
  }, []);

  const overlappingEventGroups = useMemo(() => {
    return groupOverlappingEvents(singleDayEvents);
  }, [singleDayEvents, groupOverlappingEvents]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Layout for single-day event blocks
  // ─────────────────────────────────────────────────────────────────────────────
  const calculateEventBlockStyles = useCallback(
    (event, overlappingGroup) => {
      const eventStart = dayjs(fixMissingTimeStart(event.startDate));
      const eventEnd = dayjs(fixMissingTimeEnd(event.endDate));

      const dayStart = daySelected.startOf("day");
      const dayEnd = daySelected.endOf("day");

      // Clamp if event extends beyond this day
      const displayStart = dayjs.max(dayStart, eventStart);
      const displayEnd = dayjs.min(dayEnd, eventEnd);

      const minutesFromMidnight = displayStart.diff(dayStart, "minutes");
      const durationInMinutes = displayEnd.diff(displayStart, "minutes");

      const top = (minutesFromMidnight / 60) * hourHeight;
      const height = (durationInMinutes / 60) * hourHeight || 0;

      // Which events in the group overlap with this event?
      let overlap = overlappingGroup.filter((ev) => {
        const s = dayjs(fixMissingTimeStart(ev.startDate));
        const e = dayjs(fixMissingTimeEnd(ev.endDate));
        return eventStart.isBefore(e) && eventEnd.isAfter(s);
      });

      // Sort them so we know their index
      overlap.sort((a, b) => {
        return dayjs(fixMissingTimeStart(a.startDate)).diff(
          dayjs(fixMissingTimeStart(b.startDate))
        );
      });

      // Column logic
      const columnCount = overlap.length;
      const width = columnCount > 1 ? 100 / columnCount : 100;
      const left = columnCount > 1 ? overlap.indexOf(event) * width : 0;
      const zIndex = overlap.indexOf(event) + 1;

      return { top, height, width, left, zIndex };
    },
    [daySelected, hourHeight]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Hover tooltip
  // ─────────────────────────────────────────────────────────────────────────────
  const handleMouseEnter = (e, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredEvent(event);
    setTooltipPosition({
      x: e.clientX + 10,
      y: e.clientY + 10,
    });
  };

  const handleMouseMove = (e) => {
    setTooltipPosition({
      x: e.clientX + 10,
      y: e.clientY + 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredEvent(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Add & click handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddEvent = useCallback(() => {
    setShowEventModal(true);
  }, [setShowEventModal]);

  const handleEventClick = useCallback(
    (ev) => {
      setSelectedEvent(ev);
      setShowInfoEventModal(true);
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Auto-scroll to current time
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (dayViewRef.current) {
      const currentHourOffset = dayjs().hour() * hourHeight;
      dayViewRef.current.scrollTo({
        top: currentHourOffset - hourHeight / 2,
        behavior: "smooth",
      });
    }

    // Position line for current time
    const updatePosition = () => {
      const now = dayjs();
      const minutesFromMidnight = now.diff(now.startOf("day"), "minutes");
      const pos = (minutesFromMidnight / 60) * hourHeight;
      setCurrentTimePosition(pos);
    };

    updatePosition();
    const intervalId = setInterval(updatePosition, 60_000);
    return () => clearInterval(intervalId);
  }, [hourHeight]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 100px)",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Multi-Day Events Section */}
          {multiDayEvents.length > 0 && (
            <Box
              sx={{
                position: "relative",
                height: "200px",
                overflowY: "auto",
                overflowX: "hidden",
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
                    key={event.eventId || `${event.title}-${index}`}
                    style={{
                      position: "absolute",
                      top: `${index * multiDayEventHeight}px`,
                      left: "0%",
                      width: "100%",
                      height: `${multiDayEventHeight}px`,
                      backgroundColor,
                      color,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      zIndex: 2,
                      borderLeft: `4px solid ${color}`,
                      marginLeft: "20px",
                      marginRight: "60px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      transition: "background-color 0.2s, box-shadow 0.2s",
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
                    onMouseMove={handleMouseMove}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
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

          {/* Scrollable Day Grid */}
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
              {/* Hour labels */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  zIndex: 1,
                  color: "#999",
                  width: "100%",
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
                      width: "100%",
                      zIndex: 1,
                    }}
                  >
                    {dayjs().hour(hour).minute(0).format("HH:mm")}
                  </div>
                ))}
              </div>

              {/* Single-day events */}
              {overlappingEventGroups.map((group) =>
                group.map((ev) => {
                  const { top, height, left, width } = calculateEventBlockStyles(
                    ev,
                    group
                  );
                  const evStyle = getEventStyleAndIcon(ev.eventType);

                  return (
                    <div
                      key={ev.eventId || ev.title}
                      style={{
                        position: "absolute",
                        top,
                        left: `${left}%`,
                        width: `${width}%`,
                        height: `${height}px`,
                        backgroundColor: evStyle.backgroundColor,
                        color: evStyle.color,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        zIndex: 2,
                        borderLeft: `4px solid ${evStyle.color}`,
                        marginLeft: "60px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        transition: "background-color 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = evStyle.color
                          ? `${evStyle.color}33`
                          : "#f0f0f0";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0, 0, 0, 0.2)";
                        handleMouseEnter(e, ev);
                      }}
                      onMouseMove={(e) => handleMouseMove(e)}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          evStyle.backgroundColor;
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0, 0, 0, 0.15)";
                        handleMouseLeave();
                      }}
                      onClick={() => handleEventClick(ev)}
                    >
                      {evStyle.icon}
                      <Typography noWrap>{ev.title}</Typography>
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

          {/* Info Popup */}
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
