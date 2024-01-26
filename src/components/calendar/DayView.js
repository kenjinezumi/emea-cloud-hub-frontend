import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import { Typography, Paper } from "@mui/material";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import { getDummyEventData } from "../../api/getDummyData";

export default function DayView() {
  const { daySelected } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getDummyEventData();
        console.log("Fetched events:", eventData); // Debug: Check the fetched data
        setEvents(eventData);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };
    fetchData();
  }, [location, daySelected]);

  const hourHeight = 90; // Height of one hour slot in pixels
  const startHour = 0; // Define startHour here
  const endHour = 24; // Define endHour here

  const calculateEventBlockStyles = (start, end) => {
    const eventStart = dayjs(start);
    const eventEnd = dayjs(end);

    // Calculate the difference in minutes between event start and midnight
    const minutesFromMidnight = eventStart.diff(
      daySelected.startOf("day"),
      "minutes"
    );

    // Calculate the duration of the event in minutes
    const durationInMinutes = eventEnd.diff(eventStart, "minutes");

    // Calculate the top position based on minutes from midnight
    const top = (minutesFromMidnight / 60) * hourHeight + 0;

    // Calculate the height of the event block based on its duration
    const height = (durationInMinutes / 60) * hourHeight;

    return { top, height };
  };

  return (
    <Paper
      sx={{
        width: "100%",
        maxHeight: "100vh",
        overflowY: "auto",
        position: "relative",
        padding: "50px 0",
      }}
    >
      <Typography
        variant="h6"
        align="center"
        gutterBottom
        marginBottom={"20px"}
        marginTop={"0px"}
      >
        {daySelected.format("dddd, MMMM D, YYYY")}
      </Typography>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div
          style={{
            flex: "0 0 auto",
            marginRight: "10px",
            fontWeight: "400",
            textAlign: "right",
            marginLeft: "10px",

            paddingRight: "10px",
            borderRight: "1px solid #ddd",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            color: "rgba(0, 0, 0, 0.6)",
          }}
        >
          {Array.from(
            { length: endHour - startHour },
            (_, i) => i + startHour
          ).map((hour) => (
            <div
              key={hour}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                height: `${hourHeight}px`,
                fontSize: "12px",
              }}
            >
              {dayjs().hour(hour).minute(0).format("HH:mm")}
            </div>
          ))}
        </div>

        <div style={{ flex: 3 }}>
          <div style={{ position: "relative" }}>
            {Array.from(
              { length: (endHour - startHour) * 4 },
              (_, i) => i + startHour * 4
            ).map((quarter) => (
              <div
                key={quarter}
                style={{
                  height: `${hourHeight / 4}px`,
                  borderTop: `1px solid ${
                    quarter % 4 === 0
                      ? "rgba(0, 0, 0, 0.2)"
                      : "rgba(0, 0, 0, 0.1)"
                  }`,
                  position: "relative",
                }}
              >
                {/* Show a small tick for quarters and a bigger tick for half-hours */}
                {quarter % 4 === 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "0",
                      transform: "translateY(-50%)",
                      width: "1px",
                      height: "5px",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "0",
                      transform: "translateY(-50%)",
                      width: "1px",
                      height: "3px",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                    }}
                  />
                )}
              </div>
            ))}
            {events.map((event) => {
              if (dayjs(event.startDate).isSame(daySelected, "day")) {
                const { top, height } = calculateEventBlockStyles(
                  event.startDate,
                  event.endDate
                );
                return (
                  <div
                    key={event.eventId}
                    style={{
                      position: "absolute",
                      top: `${top}px`,
                      left: "20px",
                      right: "20px",
                      height: `${height}px`,
                      backgroundColor: "#f0f0f0",
                      borderLeft: "4px solid #3174ad",
                      padding: "10px",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      zIndex: 1000, // Ensure the event is above the quarter-hour slots
                    }}
                  >
                    <Typography variant="body1">{event.title}</Typography>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </Paper>
  );
}
