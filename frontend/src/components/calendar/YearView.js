import React, { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import MonthView from "./MonthView";
import { createYearData } from "../../util";
import GlobalContext from "../../context/GlobalContext";
import { Grid, Typography, Paper, Box, Chip, Tooltip } from "@mui/material"; 
import "../styles/Yearview.css";
import { useLocation } from "react-router-dom";

import { getDummyEventData } from "../../api/getDummyData"; 

import CameraIndoorIcon from "@mui/icons-material/CameraIndoor";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import CampaignIcon from "@mui/icons-material/Campaign";
import LaptopIcon from "@mui/icons-material/Laptop";

export default function YearView() {
  const { daySelected, setShowEventModal, setDaySelected } =
    useContext(GlobalContext);
  const [events, setEvents] = useState([]); // Use useState to initialize events as an empty array

  const year = daySelected.year();
  const yearData = createYearData(year);
  const handleAddEvent = (monthIndex) => {
    const selectedMonth = dayjs(new Date(year, monthIndex));
    setDaySelected(selectedMonth);
    setShowEventModal(true);
  };

  const fetchData = async () => {
    try {
      const eventData = await getDummyEventData();
      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  const eventTypeCounts = {
    "Online Event": Array(12).fill(0), // Initialize counts for each month with 0
    "Blog Post": Array(12).fill(0),
    "Customer Story": Array(12).fill(0),
    "Hybrid Event": Array(12).fill(0),
    "Physical Event": Array(12).fill(0),
  };

  useEffect(() => {
    fetchData(); // Fetch event data when the component mounts
  }, []); // Empty dependency array to run this effect once

  events.forEach((event) => {
    const eventDate = dayjs(event.startDate);
    const monthIndex = eventDate.month();
    const eventType = event.eventType;

    if (eventTypeCounts[eventType]) {
      eventTypeCounts[eventType][monthIndex]++;
    }
  });

  const location = useLocation(); // useLocation hook

  useEffect(() => {
    setShowEventModal(false);
  }, [location]);

  return (
    <div
      style={{ padding: 16, marginLeft: "40px", width: "90%", align: "center" }}
    >
      <Typography
        variant="h6"
        align="center"
        gutterBottom
        style={{ marginBottom: "20px" }}
      >
        Year Overview - {year}
      </Typography>
      <Grid container spacing={8}>
        {yearData.map((month, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <Paper className="month-container">
              {" "}
              {/* Add styling using Paper */}
              <div
                onClick={() => handleAddEvent(index)}
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
                  <Tooltip title="Online event">
                    <Chip
                      icon={<CameraIndoorIcon />}
                      label={eventTypeCounts["Online Event"][index]}
                      variant="outlined"
                      size="small"
                      style={{ margin: "4px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Blog post">
                    <Chip
                      icon={<LaptopIcon />}
                      label={eventTypeCounts["Blog Post"][index]}
                      variant="outlined"
                      size="small"
                      style={{ margin: "4px" }}
                    />
                  </Tooltip>

                  <Tooltip title="Customer story">
                    <Chip
                      icon={<CampaignIcon />}
                      label={eventTypeCounts["Customer Story"][index]}
                      variant="outlined"
                      size="small"
                      style={{ margin: "4px" }}
                    />
                  </Tooltip>

                  <Tooltip title="Hybrid event">
                    <Chip
                      icon={<EmojiPeopleIcon />}
                      label={eventTypeCounts["Hybrid Event"][index]}
                      variant="outlined"
                      size="small"
                      style={{ margin: "4px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Physical event">
                    <Chip
                      icon={<MeetingRoomIcon />}
                      label={eventTypeCounts["Physical Event"][index]}
                      variant="outlined"
                      size="small"
                      style={{ margin: "4px" }}
                    />
                  </Tooltip>
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
    </div>
  );
}
