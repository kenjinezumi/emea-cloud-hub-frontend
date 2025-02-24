import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import dayjs from "dayjs"; // Ensure dayjs is installed
import { useLocation } from "react-router-dom";
import { CircularProgress } from "@mui/material";

// Context
import GlobalContext from "../../context/GlobalContext";

// API calls (adjust your import paths to match your project)
import { getEventData } from "../../api/getEventData";

// Components
import EventPopup from "../popup/EventInfoModal";
import Day from "../Day/DayMonth";

/**
 * MonthView
 * Renders a month’s grid of day cells and applies filters to the events.
 *
 * @param {Object} props
 * @param {Array} props.month - The days/weeks array if you’re passing in from a parent
 * @param {boolean} props.isYearView - If true, we’re rendering a smaller “month” for a year grid
 */
export default function MonthView({ month, isYearView = false }) {
  const {
    daySelected,
    setDaySelected,
    setShowEventModal,
    setShowInfoEventModal,
    filters,
    setSelectedEvent,
    setSelectedEvents,
  } = useContext(GlobalContext);

  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * generateMonthView(monthIndex, year)
   * Creates a 2D array representing the visible days for the specified month.
   */
  function generateMonthView(monthIndex, year) {
    const startOfMonth = dayjs(`${year}-${monthIndex + 1}-01`).startOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = startOfMonth.endOf("month").endOf("week");

    const days = [];
    let currentDay = startOfCalendar;

    while (currentDay.isBefore(endOfCalendar, "day")) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(currentDay.clone());
        currentDay = currentDay.add(1, "day");
      }
      days.push(week);
    }
    return days;
  }

  /**
   * monthDays
   * A memoized 2D array (month grid) for the currently selected day/month.
   */
  const monthDays = useMemo(() => {
    const year = daySelected.year();
    const monthIndex = daySelected.month(); // dayjs months are 0-based
    return generateMonthView(monthIndex, year);
  }, [daySelected]);

  /**
   * useEffect to fetch & filter events when daySelected or filters change
   */
  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      setLoading(true);

      try {
        // 1) Fetch all events
        const eventDataRaw = await getEventData("eventDataQuery");

        // Ensure we have a valid array
        if (!Array.isArray(eventDataRaw)) {
          console.error("No valid events array returned:", eventDataRaw);
          setEvents([]);
          setFilteredEvents([]);
          return;
        }

        setEvents(eventDataRaw);

        // 2) Restrict to events that occur (even partially) in the selected month
        const selectedMonthStart = daySelected.startOf("month");
        const selectedMonthEnd = daySelected.endOf("month");

        const eventsInMonth = eventDataRaw.filter((event) => {
          const eventStart = dayjs(event.startDate);
          const eventEnd = dayjs(event.endDate);

          // A simple overlap check
          const overlapsMonth =
            eventStart.isSame(selectedMonthStart, "month") ||
            eventEnd.isSame(selectedMonthStart, "month") ||
            (eventStart.isBefore(selectedMonthEnd) &&
              eventEnd.isAfter(selectedMonthStart));
          return overlapsMonth;
        });

        // 3) Check if no filters are checked => skip advanced filtering
        const anyFilterChecked =
          [
            ...filters.regions,
            ...filters.subRegions,
            ...filters.countries,
            ...filters.gep,
            ...filters.programName,
            ...filters.activityType,
            ...filters.accountSectors,
            ...filters.accountSegments,
            ...filters.buyerSegmentRollup,
            ...filters.productFamily,
            ...filters.industry,
            ...filters.partnerEvent,
            ...filters.draftStatus,
            ...filters.newlyCreated,
            // NEW: partyType
            ...(filters.partyType || []),
          ].some((f) => f.checked) ||
          (filters.organisedBy && filters.organisedBy.length > 0);

        if (!anyFilterChecked) {
          setFilteredEvents(eventsInMonth);
          return;
        }

        // 4) Apply filters
        const finalFiltered = eventsInMonth.filter((event) => {
          try {
            // Region
            const regionMatch =
              !filters.regions.some((r) => r.checked) ||
              filters.regions.some(
                (r) => r.checked && event.region?.includes(r.label)
              );

            // Sub-region
            const subRegionMatch =
              !filters.subRegions.some((s) => s.checked) ||
              filters.subRegions.some(
                (s) => s.checked && event.subRegion?.includes(s.label)
              );

            // Country
            const countryMatch =
              !filters.countries.some((c) => c.checked) ||
              filters.countries.some(
                (c) => c.checked && event.country?.includes(c.label)
              );

            // GEP
            const gepMatch =
              !filters.gep.some((g) => g.checked) ||
              filters.gep.some(
                (g) => g.checked && event.gep?.includes(g.label)
              );

            // Program
            const programMatch =
              !filters.programName.some((p) => p.checked) ||
              filters.programName.some(
                (p) =>
                  p.checked &&
                  event.programName?.some((evName) =>
                    evName.toLowerCase().includes(p.label.toLowerCase())
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

            // Account Sectors
            const accountSectorMatch =
              !filters.accountSectors.some((s) => s.checked) ||
              filters.accountSectors.some((s) => {
                if (!s.checked) return false;
                // Map label -> event data key
                const labelKeyMap = {
                  "Public Sector": "public",
                  Commercial: "commercial",
                };
                const key = labelKeyMap[s.label] || null;
                return key ? event.accountSectors?.[key] === true : false;
              });

            // Account Segments
            const accountSegmentMatch =
              !filters.accountSegments.some((seg) => seg.checked) ||
              filters.accountSegments.some((seg) => {
                if (!seg.checked) return false;
                const eSeg = event.accountSegments?.[seg.label];
                return eSeg?.selected && parseFloat(eSeg.percentage) > 0;
              });

            // Buyer Segment Rollup
            const buyerSegmentRollupMatch =
              !filters.buyerSegmentRollup.some((b) => b.checked) ||
              filters.buyerSegmentRollup.some(
                (b) =>
                  b.checked &&
                  event.audienceSeniority?.includes(b.label)
              );

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
            const partnerCheckedValues = filters.partnerEvent
              .filter((pt) => pt.checked)
              .map((pt) => pt.value); // e.g. [true or false]
            const partnerMatch =
              partnerCheckedValues.length === 0 ||
              partnerCheckedValues.includes(event.isPartneredEvent);

            // Draft Status
            const draftCheckedValues = filters.draftStatus
              .filter((ds) => ds.checked)
              .map((ds) => ds.value); // e.g. ["Draft", "Finalized", "Invite available"]
            const draftMatch =
              draftCheckedValues.length === 0 ||
              (() => {
                const statusesThisEventHas = [];
                if (event.isDraft) {
                  statusesThisEventHas.push("Draft");
                } else {
                  statusesThisEventHas.push("Finalized");
                  // If not draft and has Gmail or Salesloft -> "Invite available"
                  const hasInvites = event.languagesAndTemplates?.some((lt) =>
                    ["Gmail", "Salesloft"].includes(lt.platform)
                  );
                  if (hasInvites) {
                    statusesThisEventHas.push("Invite available");
                  }
                }
                // Does any of the statuses match the user’s chosen statuses?
                return statusesThisEventHas.some((st) =>
                  draftCheckedValues.includes(st)
                );
              })();

            // Newly Created
            const newlyCreatedFilters = filters.newlyCreated.filter((nc) => nc.checked);
            const newlyCreatedMatch =
              newlyCreatedFilters.length === 0 ||
              newlyCreatedFilters.some((nc) => {
                // If event has an entryCreatedDate, parse it
                const createdAt = event.entryCreatedDate?.value
                  ? dayjs(event.entryCreatedDate.value)
                  : null;

                // If missing or invalid, treat as "not newly created"
                if (!createdAt || !createdAt.isValid()) {
                  return nc.value === false;
                }

                // Check if it’s within 14 days
                const isWithin2Weeks = dayjs().diff(createdAt, "day") <= 14;
                return nc.value === isWithin2Weeks;
              });

            // Organised By (multi-select)
            const organiserFilterActive =
              filters.organisedBy && filters.organisedBy.length > 0;
            const organisedByMatch = !organiserFilterActive
              ? true
              : filters.organisedBy.some((org) =>
                  event.organisedBy?.includes(org)
                );

            // NEW: Party Type
            // 1) Grab any checked partyType labels
            const partyTypeChecked = filters.partyType
              ? filters.partyType.filter((p) => p.checked).map((p) => p.label)
              : [];
            // 2) If none are checked, skip filter. If some are checked, event must match
            const partyTypeMatch =
              partyTypeChecked.length === 0 ||
              partyTypeChecked.includes(event.partyType);

            // Final combination
            return (
              regionMatch &&
              subRegionMatch &&
              countryMatch &&
              gepMatch &&
              programMatch &&
              activityMatch &&
              accountSectorMatch &&
              accountSegmentMatch &&
              buyerSegmentRollupMatch &&
              productFamilyMatch &&
              industryMatch &&
              partnerMatch &&
              draftMatch &&
              newlyCreatedMatch &&
              organisedByMatch &&
              // NEW line
              partyTypeMatch
            );
          } catch (error) {
            console.error("Error applying filters to event:", event, error);
            return false;
          }
        });

        setFilteredEvents(finalFiltered);
      } catch (error) {
        console.error("Error fetching and filtering events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterEvents();
  }, [daySelected, filters, location]);

  /**
   * Close modals on route change
   */
  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  /**
   * handleDayClick(day)
   * Called when user clicks on a Day cell
   */
  const handleDayClick = useCallback(
    (day) => {
      setDaySelected(day);
      setSelectedEvents([]); // or keep if needed
      setSelectedEvent(null); // or keep if needed
    },
    [setDaySelected, setSelectedEvents, setSelectedEvent]
  );

  /**
   * Render
   */
  return (
    <div
      className={
        isYearView
          ? "year-grid"
          : "flex-1 grid grid-cols-7 grid-rows-5 overflow"
      }
    >
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress />
        </div>
      ) : isYearView ? (
        // If you’re in "year view", you might be passing in a pre-computed 'month' array
        month.map((monthRow, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {monthRow.map((day, dayIdx) => (
              <Day
                key={`day-${rowIndex}-${dayIdx}`}
                day={day}
                events={filteredEvents}
                isYearView={true}
                month={day.date.month()}
              />
            ))}
          </React.Fragment>
        ))
      ) : (
        // Default: standard month view
        monthDays.map((weekRow, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {weekRow.map((day, dayIdx) => (
              <Day
                key={`day-${rowIndex}-${dayIdx}`}
                day={day}
                events={filteredEvents}
                isYearView={false}
                month={day.month()}
                onClickDay={() => handleDayClick(day)}
              />
            ))}
          </React.Fragment>
        ))
      )}

      {/* The Event Popup / Modal */}
      <EventPopup />
    </div>
  );
}
