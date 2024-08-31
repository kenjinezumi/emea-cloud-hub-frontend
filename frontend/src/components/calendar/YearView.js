import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import MonthView from "./MonthView";
import { createYearData } from "../../util";
import GlobalContext from "../../context/GlobalContext";
import { Grid, Typography, Paper, Box, Chip, Tooltip } from "@mui/material";
import "../styles/Yearview.css";
import { useLocation } from "react-router-dom";
import { getEventData } from "../../api/getEventData";
import CameraIndoorIcon from "@mui/icons-material/CameraIndoor";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import CampaignIcon from "@mui/icons-material/Campaign";
import LaptopIcon from "@mui/icons-material/Laptop";

export default function YearView() {
  const { daySelected, setShowEventModal, setDaySelected, filters } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const location = useLocation();

  const year = daySelected.year();
  const yearData = useMemo(() => createYearData(year), [year]);

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

  const applyFilters = useCallback(async (events, filters) => {
    if (!Array.isArray(events)) {
      console.error("applyFilters was called with 'events' that is not an array:", events);
      return [];
    }

    const results = await Promise.all(events.map(async (event) => {
      const regionMatch = filters.regions.some(region => region.checked && event.region?.includes(region.label));
      const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
      const okrMatch = filters.okr.some(okr => okr.checked && event.okr?.includes(okr.label));
      const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority?.includes(seniority.label));
      const isDraftMatch = filters.isDraft.some(draft => draft.checked && (draft.label === "Draft" ? event.isDraft : !event.isDraft));

      return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch && isDraftMatch;
    }));

    return events.filter((_, index) => results[index]);
  }, []);

  const eventTypeCounts = useMemo(() => {
    const counts = {
      "Online Event": Array(12).fill(0),
      "Blog Post": Array(12).fill(0),
      "Customer Story": Array(12).fill(0),
      "Hybrid Event": Array(12).fill(0),
      "Physical Event": Array(12).fill(0),
    };

    filteredEvents.forEach(event => {
      if (event.startDate && event.endDate && event.eventType) {
        const startDate = dayjs(event.startDate);
        const endDate = dayjs(event.endDate);
        const startMonth = startDate.month();
        const endMonth = endDate.month();
        const eventType = event.eventType;

        for (let monthIndex = startMonth; monthIndex <= endMonth; monthIndex++) {
          counts[eventType][monthIndex]++;
        }
      }
    });

    return counts;
  }, [filteredEvents]);

  useEffect(() => {
    setShowEventModal(false);
  }, [location]);

  // Define a helper function to map event types to their corresponding colors and icons
  const getEventTypeChip = (eventType, count, index) => {
    let icon = null;
    let backgroundColor = "";

    switch (eventType) {
      case "Online Event":
        icon = <LaptopIcon style={{ color: "#FFFFFF" }} />;
        backgroundColor = "#4285F4"; // Blue for online events
        break;
      case "Blog Post":
        icon = <CameraIndoorIcon style={{ color: "#FFFFFF" }} />;
        backgroundColor = "#DB4437"; // Red for blog posts
        break;
      case "Customer Story":
        icon = <CampaignIcon style={{ color: "#FFFFFF" }} />;
        backgroundColor = "#F4B400"; // Yellow for customer stories
        break;
      case "Hybrid Event":
        icon = <EmojiPeopleIcon style={{ color: "#FFFFFF" }} />;
        backgroundColor = "#0F9D58"; // Green for hybrid events
        break;
      case "Physical Event":
        icon = <MeetingRoomIcon style={{ color: "#FFFFFF" }} />;
        backgroundColor = "#AB47BC"; // Purple for physical events
        break;
      default:
        break;
    }

    return (
      <Tooltip title={eventType} key={index}>
        <Chip
          icon={icon}
          label={count}
          size="small"
          style={{
            backgroundColor,
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
                  {Object.entries(eventTypeCounts).map(([eventType, counts]) => (
                    getEventTypeChip(eventType, counts[index], index)
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
