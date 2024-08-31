import React, { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import MonthView from "./MonthView";
import { createYearData } from "../../util";
import GlobalContext from "../../context/GlobalContext";
import { Grid, Typography, Paper, Box, Chip, Tooltip } from "@mui/material";
import { useLocation } from "react-router-dom";
import { getEventData } from "../../api/getEventData";
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction'; // For "Online Event"
import EventIcon from '@mui/icons-material/Event'; // For "Physical Event"
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'; // For "Hybrid Event"
import ImportContactsIcon from '@mui/icons-material/ImportContacts'; // For "Customer Story"
import EditIcon from '@mui/icons-material/Edit'; // For "Blog Post"

export default function YearView() {
  const { daySelected, setShowEventModal, filters } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const year = daySelected.year();
  const yearData = createYearData(year);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getEventData("eventDataQuery");
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchData();
  }, [location]);

  useEffect(() => {
    const applyFilters = async (events, filters) => {
      if (!Array.isArray(events)) {
        console.error("applyFilters was called with 'events' that is not an array:", events);
        return [];
      }

      const filterPromises = events.map(event => {
        return (async () => {
          const regionMatch = filters.regions.some(region => region.checked && event.region?.includes(region.label));
          const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
          const okrMatch = filters.okr.some(okr => okr.checked && event.okr?.some(eventOkr => eventOkr.type === okr.label));        
          const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority?.includes(seniority.label));
          const isDraftMatch = filters.isDraft.some(draft => draft.checked && (draft.label === "Draft" ? event.isDraft : !event.isDraft));

          return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch && isDraftMatch;
        })();
      });

      const results = await Promise.all(filterPromises);
      return events.filter((_, index) => results[index]);
    };

    (async () => {
      const filteredEvents = await applyFilters(events, filters);
      setFilteredEvents(filteredEvents);
    })();
  }, [events, filters]);

  useEffect(() => {
    setShowEventModal(false);
  }, [location]);

  const eventTypeCounts = {
    "Online Event": Array(12).fill(0),
    "Blog Post": Array(12).fill(0),
    "Customer Story": Array(12).fill(0),
    "Hybrid Event": Array(12).fill(0),
    "Physical Event": Array(12).fill(0),
  };

  if (Array.isArray(filteredEvents)) {
    filteredEvents.forEach((event) => {
      if (event.startDate && event.endDate && event.eventType) {
        const startDate = dayjs(event.startDate);
        const endDate = dayjs(event.endDate);
        const startMonth = startDate.month();
        const endMonth = endDate.month();
        const eventType = event.eventType;

        if (!eventTypeCounts[eventType]) {
          eventTypeCounts[eventType] = Array(12).fill(0);
        }

        for (let monthIndex = startMonth; monthIndex <= endMonth; monthIndex++) {
          eventTypeCounts[eventType][monthIndex]++;
        }
      } else {
        console.warn("Encountered an event with missing startDate, endDate, or eventType", event);
      }
    });
  } else {
    console.error("Expected events to be an array", events);
  }

  return (
    <div style={{ padding: 16, marginLeft: "40px", width: "90%", align: "center" }}>
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
                  <Tooltip title="Online event">
                    <Chip
                      icon={<OnlinePredictionIcon style={{ color: "#FFFFFF" }} />}
                      label={eventTypeCounts["Online Event"][index]}
                      size="small"
                      style={{
                        backgroundColor: "#4285F4",
                        color: "#FFFFFF",
                        margin: "4px",
                        fontWeight: "bold",
                        borderRadius: "4px",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Blog post">
                    <Chip
                      icon={<EditIcon style={{ color: "#FFFFFF" }} />}
                      label={eventTypeCounts["Blog Post"][index]}
                      size="small"
                      style={{
                        backgroundColor: "#DB4437",
                        color: "#FFFFFF",
                        margin: "4px",
                        fontWeight: "bold",
                        borderRadius: "4px",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Customer story">
                    <Chip
                      icon={<ImportContactsIcon style={{ color: "#FFFFFF" }} />}
                      label={eventTypeCounts["Customer Story"][index]}
                      size="small"
                      style={{
                        backgroundColor: "#F4B400",
                        color: "#FFFFFF",
                        margin: "4px",
                        fontWeight: "bold",
                        borderRadius: "4px",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Hybrid event">
                    <Chip
                      icon={<AllInclusiveIcon style={{ color: "#FFFFFF" }} />}
                      label={eventTypeCounts["Hybrid Event"][index]}
                      size="small"
                      style={{
                        backgroundColor: "#0F9D58",
                        color: "#FFFFFF",
                        margin: "4px",
                        fontWeight: "bold",
                        borderRadius: "4px",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Physical event">
                    <Chip
                      icon={<EventIcon style={{ color: "#FFFFFF" }} />}
                      label={eventTypeCounts["Physical Event"][index]}
                      size="small"
                      style={{
                        backgroundColor: "#AB47BC",
                        color: "#FFFFFF",
                        margin: "4px",
                        fontWeight: "bold",
                        borderRadius: "4px",
                      }}
                    />
                  </Tooltip>
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
