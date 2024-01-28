import React, { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import GlobalContext from "../../context/GlobalContext";
import { Paper, Typography, Grid, Box } from "@mui/material";
import { getDummyEventData } from "../../api/getDummyData";
dayjs.extend(utc);

export default function WeekView() {
  const {
    setShowEventModal,
    setDaySelected,
    daySelected,
    showEventInfoModal,
    setSelectedEvent,
    setShowInfoEventModal,
  } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);

  const handleEventClick = (eventData, e) => {
    console.log('WE ARE IN')
    e.stopPropagation(); // Stop event from bubbling up
    setSelectedEvent(eventData);
    setShowInfoEventModal(true);
  };

  useEffect(() => {
    async function fetchEvents() {
      try {
        const eventData = await getDummyEventData();
        console.log("Fetched Events:", eventData);
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    fetchEvents();
  }, [daySelected]);

  const startOfWeek = dayjs(daySelected).startOf("week");
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, "day")
  );
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const calculateEventBlockStyles = (event, overlappingEvents) => {
    const eventStart = dayjs.utc(event.startDate).local();
    const eventEnd = dayjs.utc(event.endDate).local();

    const minutesFromMidnight = eventStart.diff(daySelected.startOf("day"), "minutes");
    const durationInMinutes = eventEnd.diff(eventStart, "minutes");

    const top = (minutesFromMidnight / 60) * 60;
    const height = (durationInMinutes / 60) * 60;

    const width = 100 / overlappingEvents;
    const positionIndex = events.findIndex((e) => e.eventId === event.eventId);
    const left = (positionIndex % overlappingEvents) * width;

    return { top, height, left, width };
  };

  const handleAddEvent = (day, hour) => {
    setDaySelected(day.hour(hour));
    setShowEventModal(true);
  };

  const getOverlappingEventsCount = (day, hour) => {
    return events.filter((event) => {
      const eventStart = dayjs.utc(event.startDate).local();
      const eventEnd = dayjs.utc(event.endDate).local();
      return (
        eventStart.isSame(day, "day") &&
        eventStart.hour() <= hour &&
        eventEnd.hour() >= hour
      );
    }).length;
  };

  return (
    <Paper sx={{ width: "80%", overflowY: "auto", padding: 2, border: "none" }}>
      <Grid container>
        {/* Hours Column */}
        <Grid item xs={1} sx={{ display: "flex", flexDirection: "column", borderRight: 1, borderColor: "divider" }}>
          {hoursOfDay.map(hour => (
            <div key={hour} style={{ minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="caption" sx={{ color: "grey.500" }}>
                {dayjs().hour(hour).format("h A")}
              </Typography>
            </div>
          ))}
        </Grid>
  
        {/* Event Grid */}
        <Grid item xs={11}>
          <Grid container>
            {/* Days of the week header */}
            {daysOfWeek.map(day => (
              <Grid item xs key={day.format("DDMMYYYY")}>
                <Typography align="center" variant="subtitle1" sx={{ marginBottom: "10px", borderBottom: 1, borderColor: "divider" }}>
                  {day.format("dddd, D")}
                </Typography>
              </Grid>
            ))}
  
            {/* Events grid */}
            {hoursOfDay.map(hour => (
              <Grid container key={hour} sx={{ minHeight: "60px", borderBottom: 1, borderColor: "divider" }}>
                {daysOfWeek.map(day => (
                  <Grid item xs key={day.format("DDMMYYYY") + hour} sx={{ borderRight: 1, borderColor: "divider" }}>
                    <div style={{ display: "flex", flexDirection: "column", minHeight: "60px", position: "relative" }}>
                      {events
                        .filter(event => dayjs.utc(event.startDate).local().isSame(day, "day") && dayjs.utc(event.startDate).local().hour() === hour)
                        .map(event => {
                          const overlappingEvents = getOverlappingEventsCount(day, hour);
                          const { top, height, left, width } = calculateEventBlockStyles(event, overlappingEvents);
                           
                          return (
                            <div
                              key={event.eventId}
                              style={{
                                position: "absolute",
                                top: `${top}px`,
                                left: `${left}%`,
                                width: `${width}%`,
                                height: `${height}px`,
                                backgroundColor: "blue", // For visibility
                                color: "white",
                                padding: "4px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                                zIndex: 1000,
                                boxSizing: "border-box",


                              }}
                              onClick={(e) => {
                                // e.stopPropagation();
                                handleEventClick(event, e);
                              }}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                    </div>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
                      }  