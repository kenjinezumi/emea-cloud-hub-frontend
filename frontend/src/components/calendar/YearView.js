import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import MonthView from "./MonthView";
import { createYearData } from "../../util";
import GlobalContext from "../../context/GlobalContext";
import { Grid, Typography, Paper, Box, Chip, Tooltip } from "@mui/material";
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
  { label: 'Build Modern Apps', icon: BuildIcon, color: '#ff5722' },  // Orange
  { label: 'Data Cloud', icon: CloudIcon, color: '#2196f3' },  // Blue
  { label: 'Developer', icon: DeveloperModeIcon, color: '#4caf50' },  // Green
  { label: 'Digital Natives - Early Stage Startups', icon: PeopleIcon, color: '#9c27b0' },  // Purple
  { label: 'Google Workspace', icon: WorkspacePremiumIcon, color: '#fbc02d' },  // Yellow
  { label: 'Infrastructure Modernization', icon: StorageIcon, color: '#795548' },  // Brown
  { label: 'Not Application (Not tied to Any Global Engagement Plays)', icon: PublicIcon, color: '#607d8b' },  // Grey
  { label: 'Reimagine FSI', icon: PeopleIcon, color: '#ff9800' },  // Orange
  { label: 'Secure What Matters Most', icon: SecurityIcon, color: '#e91e63' },  // Pink
  { label: 'Solving for Innovation', icon: LightbulbIcon, color: '#ffc107' },  // Amber
];

export default function YearView() {
  const { daySelected, setShowEventModal, filters } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
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
      console.error("applyFilters was called with 'events' that is not an array:", events);
      return [];
    }

    const results = await Promise.all(
      events.map(async (event) => {
        const subRegionMatch = filters.subRegions.some(
          (subRegion) => subRegion.checked && event.subRegion?.includes(subRegion.label)
        );
        const gepMatch = filters.gep.some((gep) => gep.checked && event.gep?.includes(gep.label));

        const buyerSegmentRollupMatch = filters.buyerSegmentRollup.some(segment =>
          segment.checked && event.buyerSegmentRollup?.includes(segment.label)
        );

        const accountSectorMatch = filters.accountSectors.some(sector =>
          sector.checked && event.accountSectors?.[sector.label]
        );

        const accountSegmentMatch = filters.accountSegments.some(segment =>
          segment.checked && event.accountSegments?.[segment.label]?.selected
        );

        const productFamilyMatch = filters.productFamily.some(product =>
          product.checked && event.productAlignment?.[product.label]?.selected
        );

        const industryMatch = filters.industry.some(industry =>
          industry.checked && event.industry === industry.label
        );

        const isPartneredEventMatch = filters.isPartneredEvent.some(partner =>
          partner.checked && event.isPartneredEvent === (partner.label === 'Yes')
        );

        const isDraftMatch = filters.isDraft.some(draft => 
          draft.checked && (draft.label === 'Draft' ? event.isDraft : !event.isDraft)
        );

        return subRegionMatch && gepMatch && buyerSegmentRollupMatch &&
               accountSectorMatch && accountSegmentMatch && productFamilyMatch &&
               industryMatch && isPartneredEventMatch && isDraftMatch;
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
            for (let monthIndex = startMonth; monthIndex <= endMonth; monthIndex++) {
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

  // Helper function to render GEP chips for each month
  const getGepChip = (gepLabel, count, index) => {
    const gepOption = gepOptions.find((option) => option.label === gepLabel);
    if (!gepOption) return null;

    const IconComponent = gepOption.icon;

    return (
      <Tooltip title={gepLabel} key={`${gepLabel}-${index}`}>
        <Chip
          icon={<IconComponent style={{ color: "#FFFFFF" }} />}
          label={count}
          size="small"
          style={{
            backgroundColor: gepOption.color,
            color: "#FFFFFF",
            margin: "4px",
            fontWeight: "bold",
            borderRadius: "4px",
          }}
        />
      </Tooltip>
    );
  };

  return (
    <div style={{ padding: 16, marginLeft: "40px", width: "90%", textAlign: "center" }}>
      <Typography variant="h6" align="center" gutterBottom style={{ marginBottom: "30px" }}>
        Year Overview - {year}
      </Typography>
      <Grid container spacing={2}>
        {yearData.map((month, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <Paper className="month-container">
              <div style={{ cursor: "pointer", padding: "16px", border: "1px solid transparent" }}>
                <Typography align="center" style={{ marginBottom: "4px" }}>
                  {dayjs(new Date(year, index)).format("MMMM")}
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap" gap={2}>
                  {Object.entries(gepCounts).map(([gepLabel, counts]) => (
                    getGepChip(gepLabel, counts[index], index)
                  ))}
                </Box>
                <div style={{ padding: "8px" }}>
                  <MonthView month={month} daySelected={daySelected} isYearView={true} />
                </div>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
