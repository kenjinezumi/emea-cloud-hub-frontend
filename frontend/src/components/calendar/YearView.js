import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import dayjs from "dayjs";
import MonthView from "./MonthView";
import { createYearData } from "../../util";
import GlobalContext from "../../context/GlobalContext";
import {
  Grid,
  Typography,
  Paper,
  Box,
  Chip,
  Tooltip,
  Modal,
} from "@mui/material";
import "../styles/Yearview.css";
import { useLocation } from "react-router-dom";
import { getEventData } from "../../api/getEventData";

// Import icons for each GEP option
import BuildIcon from "@mui/icons-material/Build";
import CloudIcon from "@mui/icons-material/Cloud";
import DeveloperModeIcon from "@mui/icons-material/DeveloperMode";
import PeopleIcon from "@mui/icons-material/People";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import StorageIcon from "@mui/icons-material/Storage";
import PublicIcon from "@mui/icons-material/Public";
import SecurityIcon from "@mui/icons-material/Security";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

export const gepOptions = [
  { label: "Build Modern Apps", icon: BuildIcon, color: "#ff5722" }, // Orange
  { label: "Data Cloud", icon: CloudIcon, color: "#2196f3" }, // Blue
  { label: "Developer", icon: DeveloperModeIcon, color: "#4caf50" }, // Green
  {
    label: "Digital Natives - Early Stage Startups",
    icon: PeopleIcon,
    color: "#9c27b0",
  }, // Purple
  { label: "Google Workspace", icon: WorkspacePremiumIcon, color: "#fbc02d" }, // Yellow
  {
    label: "Infrastructure Modernization",
    icon: StorageIcon,
    color: "#795548",
  }, // Brown
  {
    label: "Not Application (Not tied to Any Global Engagement Plays)",
    icon: PublicIcon,
    color: "#607d8b",
  }, // Grey
  { label: "Reimagine FSI", icon: PeopleIcon, color: "#ff9800" }, // Orange
  { label: "Secure What Matters Most", icon: SecurityIcon, color: "#e91e63" }, // Pink
  { label: "Solving for Innovation", icon: LightbulbIcon, color: "#ffc107" }, // Amber
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
  const [selectedGepEvents, setSelectedGepEvents] = useState(null); // For showing filtered events
  const [selectedMonth, setSelectedMonth] = useState(null); // For filtering events by month
  const [selectedGep, setSelectedGep] = useState(null); //
  const location = useLocation();

  const year = daySelected.year();
  const yearData = useMemo(() => createYearData(year), [year]);

  // Fetch and filter event data based on filters
  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const eventData = await getEventData("eventDataQuery");
        setEvents(eventData);

        if (!Array.isArray(eventData)) {
          console.error("Fetched data is not an array:", eventData);
          return;
        }

        const filtered = await applyFilters(eventData, filters);
        setFilteredEvents(filtered);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchAndFilterEvents();
  }, [filters]);

  // Apply filters to the events data
  const applyFilters = useCallback(async (events, filters) => {
    if (!Array.isArray(events)) {
      console.error(
        "applyFilters was called with 'events' that is not an array:",
        events
      );
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

    const results = await Promise.all(
      events.map(async (event) => {
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
                console.error("Error checking GEP filter:", err, gep, event);
                return false;
              }
            });

          // Buyer Segment Rollup filter match
          const buyerSegmentRollupMatch =
            !filters.buyerSegmentRollup.some((segment) => segment.checked) ||
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
                return sector.checked && event.accountSectors?.[sector.label];
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

          // Product Family filter match
          const productFamilyMatch =
          !filters.productFamily.some((product) => product.checked) ||
          filters.productFamily.some((product) => {
            try {
              const productAlignment = event.productAlignment?.[product.label];
              return (
                product.checked &&
                productAlignment?.selected === "true" && // Convert selected to a boolean
                parseFloat(productAlignment?.percentage) > 0 // Convert percentage to a number and ensure it's greater than 0
              );
            } catch (err) {
              console.error("Error checking productFamily filter:", err);
              return false;
            }
          });
        

          // Industry filter match
          const industryMatch =
            !filters.industry.some((industry) => industry.checked) ||
            filters.industry.some((industry) => {
              try {
                return industry.checked && event.industry === industry.label;
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
        } catch (filterError) {
          console.error("Error applying filters to event:", filterError, event);
          return false;
        }
      })
    );

    return events.filter((_, index) => results[index]);
  }, []);

  // Calculate GEP occurrences per month
  const gepCounts = useMemo(() => {
    const counts = gepOptions.reduce((acc, gepOption) => {
      acc[gepOption.label] = Array(12).fill(0); // One entry per month for each GEP option
      return acc;
    }, {});

    filteredEvents.forEach((event) => {
      if (event.startDate && event.endDate && event.gep) {
        const startDate = dayjs(event.startDate);
        const endDate = dayjs(event.endDate);
        const startMonth = startDate.month();
        const endMonth = endDate.month();

        event.gep.forEach((gep) => {
          if (counts[gep]) {
            for (
              let monthIndex = startMonth;
              monthIndex <= endMonth;
              monthIndex++
            ) {
              counts[gep][monthIndex]++; // Increment the count for this GEP and month
            }
          }
        });
      }
    });

    return counts;
  }, [filteredEvents]);

  useEffect(() => {
    setShowEventModal(false);
  }, [location]);

  const handleEventClick = useCallback(
    (event) => {
      // Get the event's start date
      const eventStartDate = dayjs(event.startDate);

      // Set the daySelected to the event's start date
      setDaySelected(eventStartDate);

      // Switch the current view to "day"
      setCurrentView("day");
    },
    [setDaySelected, setCurrentView]
  );

  // Helper function to render GEP chips for each month
  const getGepChip = (gepLabel, count, monthIndex) => {
    const gepOption = gepOptions.find((option) => option.label === gepLabel);
    if (!gepOption) return null;

    const IconComponent = gepOption.icon;

    // Handle GEP chip click
    const handleGepClick = () => {
      const eventsForMonthAndGep = filteredEvents.filter((event) => {
        const startDate = dayjs(event.startDate);
        const endDate = dayjs(event.endDate);

        return (
          event.gep?.includes(gepLabel) &&
          (startDate.month() === monthIndex || endDate.month() === monthIndex)
        );
      });

      // Update state to show filtered events
      setSelectedGepEvents(eventsForMonthAndGep);
      setSelectedMonth(monthIndex);
      setSelectedGep(gepLabel);
    };

    return (
      <Tooltip title={gepLabel} key={`${gepLabel}-${monthIndex}`}>
        <Chip
          icon={<IconComponent style={{ color: "#FFFFFF" }} />}
          label={count}
          size="small"
          onClick={handleGepClick} // Handle GEP chip click
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
  const handleCloseModal = () => {
    setSelectedGepEvents(null);
    setSelectedMonth(null);
    setSelectedGep(null);
  };

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
        {yearData.map((month, index) => (
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
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={2}
                >
                  {Object.entries(gepCounts).map(([gepLabel, counts]) =>
                    getGepChip(gepLabel, counts[index], index)
                  )}
                </Box>
                <div style={{ padding: "8px" }}>
                  <MonthView
                    month={month}
                    daySelected={daySelected}
                    isYearView={true}
                  />
                </div>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Modal for displaying the events filtered by GEP */}
      <Modal open={!!selectedGepEvents} onClose={handleCloseModal}>
        <Paper
          style={{
            padding: "16px",
            width: "30%",
            margin: "50px auto",
            maxHeight: "80vh",
            overflowY: "auto",
            borderRadius: "12px", // Smooth rounded edges
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            style={{
              fontWeight: 500,
              fontSize: "18px",
              paddingBottom: "10px",
              borderBottom: "1px solid #ddd", // A subtle separator line for the header
            }}
          >
            Events for {selectedGep} in{" "}
            {dayjs().month(selectedMonth).format("MMMM")}
          </Typography>

          {selectedGepEvents?.length ? (
            selectedGepEvents.map((event) => (
              <Box
                key={event.eventId}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff", // White background for the event card
                  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)", // Lighter shadow for a soft look
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                  border: "1px solid #e0e0e0", // Border around the card
                }}
                onClick={() => handleEventClick(event)} // Assuming you have a click handler
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
                  {/* Arrow icon for navigation */}
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
