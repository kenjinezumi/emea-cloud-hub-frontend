import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import dayjs from "dayjs";
import { Grid, Typography, Paper, Box, Chip, Tooltip, Modal } from "@mui/material";
import { useLocation } from "react-router-dom";

// Local imports (adjust paths as needed)
import MonthView from "./MonthView";
import GlobalContext from "../../context/GlobalContext";
import { createYearData } from "../../util";
import { getEventData } from "../../api/getEventData";

// Icons for GEP chips
import BuildIcon from "@mui/icons-material/Build";
import CloudIcon from "@mui/icons-material/Cloud";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import PeopleIcon from "@mui/icons-material/People";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import StorageIcon from "@mui/icons-material/Storage";
import PublicIcon from "@mui/icons-material/Public";
import SecurityIcon from "@mui/icons-material/Security";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

// GEP Options (for counting & showing chips)
export const gepOptions = [
  { label: "AI", icon: LightbulbIcon, color: "#ffc107" },
  { label: "Data & Analytics", icon: CloudIcon, color: "#2196f3" },
  { label: "Developer", icon: DeveloperModeIcon, color: "#4caf50" },
  { label: "Google Workspace", icon: WorkspacePremiumIcon, color: "#fbc02d" },
  {
    label: "Modern Infrastructure and Apps",
    icon: BuildIcon,
    color: "#ff5722",
  },
  {
    label: "Not Applicable (Not tied to Any Global Campaign)",
    icon: PublicIcon,
    color: "#607d8b",
  },
  { label: "Security", icon: SecurityIcon, color: "#e91e63" },
];

export default function YearView() {
  const {
    daySelected,
    setDaySelected,
    setCurrentView,
    setShowEventModal,
    filters,
  } = useContext(GlobalContext);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // For the GEP modal:
  const [selectedGepEvents, setSelectedGepEvents] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedGep, setSelectedGep] = useState(null);

  const location = useLocation();

  // Generate year data from the chosen day’s year
  const year = daySelected.year();
  const yearData = useMemo(() => createYearData(year), [year]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch events
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const eventData = await getEventData("eventDataQuery");
        setEvents(Array.isArray(eventData) ? eventData : []);

        // Now apply filters
        const filtered = applyFilters(eventData);
        setFilteredEvents(filtered);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setEvents([]);
        setFilteredEvents([]);
      }
    };

    fetchAndFilterEvents();
  }, [filters, location]);

  // ─────────────────────────────────────────────────────────────────────────────
  // applyFilters (single-pass approach)
  // ─────────────────────────────────────────────────────────────────────────────
  const applyFilters = useCallback(
    (allEvents) => {
      if (!Array.isArray(allEvents)) {
        return [];
      }

      // 1) Check if any filter is actually checked
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
        // Return all events if no filters are selected
        return allEvents;
      }

      // 2) Single pass filter
      return allEvents.filter((event) => {
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
            filters.gep.some(
              (g) => g.checked && event.gep?.includes(g.label)
            );

          // Buyer Segment Rollup
          const buyerSegmentMatch =
            !filters.buyerSegmentRollup.some((b) => b.checked) ||
            filters.buyerSegmentRollup.some(
              (b) => b.checked && event.audienceSeniority?.includes(b.label)
            );

          // Account Sector
          const accountSectorMatch =
            !filters.accountSectors.some((s) => s.checked) ||
            filters.accountSectors.some((s) => {
              if (!s.checked) return false;
              const sectorMap = {
                "Public Sector": "public",
                Commercial: "commercial",
              };
              const key = sectorMap[s.label];
              return key ? event.accountSectors?.[key] === true : false;
            });

          // Account Segment
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

          // Region
          const regionMatch =
            !filters.regions.some((r) => r.checked) ||
            filters.regions.some(
              (r) => r.checked && event.region?.includes(r.label)
            );

          // Country
          const countryMatch =
            !filters.countries.some((c) => c.checked) ||
            filters.countries.some(
              (c) => c.checked && event.country?.includes(c.label)
            );

          // Program
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

          // Partner Event
          const partnerCheckedValues = filters.partnerEvent
            .filter((pe) => pe.checked)
            .map((pe) => pe.value); // e.g. [true, false]
          const partnerMatch =
            partnerCheckedValues.length === 0 ||
            partnerCheckedValues.includes(event.isPartneredEvent);

          // Draft Status
          const draftCheckedValues = filters.draftStatus
            .filter((ds) => ds.checked)
            .map((ds) => ds.value); // e.g. ["Draft", "Invite available"]
          const draftMatch =
            draftCheckedValues.length === 0 ||
            (function () {
              const statuses = [];
              if (event.isDraft) {
                statuses.push("Draft");
              } else {
                statuses.push("Finalized");
                const hasInvite = event.languagesAndTemplates?.some((t) =>
                  ["Gmail", "Salesloft"].includes(t.platform)
                );
                if (hasInvite) {
                  statuses.push("Invite available");
                }
              }
              return statuses.some((st) => draftCheckedValues.includes(st));
            })();

          // Newly Created
          const newlyCreatedFilters = filters.newlyCreated.filter((nc) => nc.checked);
          const newlyCreatedMatch =
            newlyCreatedFilters.length === 0 ||
            newlyCreatedFilters.some((nc) => {
              const createdAt = event.entryCreatedDate?.value
                ? dayjs(event.entryCreatedDate.value)
                : null;
              if (!createdAt || !createdAt.isValid()) {
                // If missing => treat as “old” => matches only if user checked “No”
                return nc.value === false;
              }
              const isWithin14Days = dayjs().diff(createdAt, "day") <= 14;
              return nc.value === isWithin14Days;
            });

          // Organised By (multi-select)
          const organiserMatch =
            !filters.organisedBy || filters.organisedBy.length === 0
              ? true
              : filters.organisedBy.some((org) =>
                  event.organisedBy?.includes(org)
                );

          // Final check
          return (
            subRegionMatch &&
            gepMatch &&
            buyerSegmentMatch &&
            accountSectorMatch &&
            accountSegmentMatch &&
            productFamilyMatch &&
            industryMatch &&
            regionMatch &&
            countryMatch &&
            programNameMatch &&
            activityMatch &&
            partnerMatch &&
            draftMatch &&
            newlyCreatedMatch &&
            organiserMatch
          );
        } catch (err) {
          console.error("Error applying filters to event:", event, err);
          return false;
        }
      });
    },
    [filters]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Count GEP occurrences by month
  // ─────────────────────────────────────────────────────────────────────────────
  const gepCounts = useMemo(() => {
    // For each GEP label, store an array of 12 months => 0 count initially
    const counts = gepOptions.reduce((acc, gepOpt) => {
      acc[gepOpt.label] = Array(12).fill(0);
      return acc;
    }, {});

    filteredEvents.forEach((event) => {
      if (!event.startDate || !event.endDate || !Array.isArray(event.gep)) return;

      const startDate = dayjs(event.startDate);
      const endDate = dayjs(event.endDate);

      if (!startDate.isValid() || !endDate.isValid()) return;

      const startYear = startDate.year();
      const endYear = endDate.year();
      const startMonth = startDate.month(); // 0-11
      const endMonth = endDate.month();

      // We'll only increment counts if the event's year overlaps our "year"
      // The event might span multiple months
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        // Condition: The event covers this monthIndex in the target year
        const coversThisMonth =
          (startYear < year || (startYear === year && startMonth <= monthIndex)) &&
          (endYear > year || (endYear === year && endMonth >= monthIndex));

        if (coversThisMonth) {
          event.gep.forEach((g) => {
            if (counts[g]) {
              counts[g][monthIndex]++;
            }
          });
        }
      }
    });

    return counts;
  }, [filteredEvents, year]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Close modals on route change
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setShowEventModal(false);
  }, [location, setShowEventModal]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Click event => go to “day” view
  // ─────────────────────────────────────────────────────────────────────────────
  const handleEventClick = useCallback(
    (event) => {
      // Jump to the event’s start date in day view
      const eventStartDate = dayjs(event.startDate);
      setDaySelected(eventStartDate);
      setCurrentView("day");
    },
    [setDaySelected, setCurrentView]
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // GEP Chip
  // ─────────────────────────────────────────────────────────────────────────────
  const getGepChip = (gepLabel, count, monthIndex) => {
    const gepOption = gepOptions.find((opt) => opt.label === gepLabel);
    if (!gepOption) return null;

    const IconComp = gepOption.icon;

    // When user clicks a GEP chip for a given month, show relevant events
    const handleGepClick = () => {
      // All events for that GEP in that month
      const eventsForMonthAndGep = filteredEvents.filter((ev) => {
        const sDate = dayjs(ev.startDate);
        const eDate = dayjs(ev.endDate);
        if (!sDate.isValid() || !eDate.isValid()) return false;

        const sMonth = sDate.month();
        const eMonth = eDate.month();
        const sYear = sDate.year();
        const eYear = eDate.year();

        const coversMonth =
          (sYear < year || (sYear === year && sMonth <= monthIndex)) &&
          (eYear > year || (eYear === year && eMonth >= monthIndex));

        return coversMonth && ev.gep?.includes(gepLabel);
      });

      setSelectedGepEvents(eventsForMonthAndGep);
      setSelectedMonth(monthIndex);
      setSelectedGep(gepLabel);
    };

    return (
      <Tooltip title={gepLabel} key={`${gepLabel}-${monthIndex}`}>
        <Chip
          icon={<IconComp style={{ color: "#FFFFFF" }} />}
          label={count}
          size="small"
          onClick={handleGepClick}
          style={{
            backgroundColor: gepOption.color,
            color: "#FFFFFF",
            margin: "4px",
            fontWeight: "bold",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        />
      </Tooltip>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Close the GEP events modal
  // ─────────────────────────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setSelectedGepEvents(null);
    setSelectedMonth(null);
    setSelectedGep(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: 16,
        marginLeft: "40px",
        width: "90%",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h6"
        align="center"
        gutterBottom
        style={{ marginBottom: "30px" }}
      >
        Year Overview - {year}
      </Typography>

      <Grid container spacing={2}>
        {yearData.map((monthArray, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <Paper className="month-container">
              <div
                style={{
                  cursor: "pointer",
                  padding: "16px",
                  border: "1px solid transparent",
                }}
              >
                <Typography align="center" style={{ marginBottom: "4px" }}>
                  {dayjs(new Date(year, index)).format("MMMM")}
                </Typography>

                {/* GEP Chips for this month */}
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={2}
                >
                  {Object.entries(gepCounts).map(([gLabel, counts]) =>
                    getGepChip(gLabel, counts[index], index)
                  )}
                </Box>

                {/* The miniature MonthView inside each month cell */}
                <div style={{ padding: "8px" }}>
                  <MonthView
                    month={monthArray}
                    daySelected={daySelected}
                    isYearView={true} // ensures the smaller layout
                  />
                </div>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Modal with events for a clicked GEP & month */}
      <Modal open={!!selectedGepEvents} onClose={handleCloseModal}>
        <Paper
          style={{
            padding: "16px",
            width: "30%",
            margin: "50px auto",
            maxHeight: "80vh",
            overflowY: "auto",
            borderRadius: "12px",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            style={{
              fontWeight: 500,
              fontSize: "18px",
              paddingBottom: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            Events for {selectedGep} in{" "}
            {selectedMonth !== null
              ? dayjs().month(selectedMonth).format("MMMM")
              : ""}
          </Typography>

          {selectedGepEvents?.length ? (
            selectedGepEvents.map((event) => (
              <Box
                key={event.eventId || event.title}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                  border: "1px solid #e0e0e0",
                }}
                onClick={() => handleEventClick(event)}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    {event.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#666", marginTop: "4px" }}
                  >
                    Start date:{" "}
                    {dayjs(event.startDate).format("dddd, MMMM D, YYYY")}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Location: {event.location || "N/A"}
                  </Typography>
                </Box>

                <Box sx={{ marginLeft: "10px", color: "#1a73e8" }}>
                  <span style={{ fontSize: "20px" }}>→</span>
                </Box>
              </Box>
            ))
          ) : (
            <Typography>
              No events found for this GEP in the selected month.
            </Typography>
          )}
        </Paper>
      </Modal>
    </div>
  );
}
