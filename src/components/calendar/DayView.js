import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import { Typography, Paper } from "@mui/material";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import { getDummyEventData } from "../../api/getDummyData";
import EventInfoPopup from "../popup/EventInfoModal"; // Import the EventInfoPopup component

export default function DayView() {
  const { daySelected } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const [eventGroups, setEventGroups] = useState([]);
  const location = useLocation();
  const { setShowEventModal, showEventModal} = useContext(GlobalContext);
  const {
    setDaySelected,
    showEventInfoModal,
    setSelectedEvent,
    setShowInfoEventModal,
  } = useContext(GlobalContext);


  const { filters } = useContext(GlobalContext);
  const [filteredEvents, setFilteredEvents] = useState([]);
  useEffect(() => {
    const applyFilters = (events, filters) => {
      return events.filter(event => {
        const regionMatch = filters.regions.some(region => region.checked && event.region.includes(region.label));
        const eventTypeMatch = filters.eventType.some(type => type.checked && event.eventType === type.label);
        const okrMatch = filters.okr.some(okr => okr.checked && event.okr.includes(okr.label));
        const audienceSeniorityMatch = filters.audienceSeniority.some(seniority => seniority.checked && event.audienceSeniority.includes(seniority.label));
  
        return regionMatch && eventTypeMatch && okrMatch && audienceSeniorityMatch;
      });
    };
  
    setFilteredEvents(applyFilters(events, filters));
  }, [events, filters]);
  

  const handleEventClick = (eventData) => {
    setSelectedEvent(eventData);
    setShowInfoEventModal(true);
  };

  const handleAddEvent = () => {
    setShowEventModal(true);
  };
  useEffect(() => {
   
    setShowEventModal(false);
  
}, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getDummyEventData();
        console.log("Fetched events:", eventData); // Debug: Check the fetched data
        setEvents(eventData);
        setEventGroups(calculateOverlapGroups(eventData));
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };
    fetchData();
  }, [location, daySelected]);

  useEffect(() => {
    setEventGroups(calculateOverlapGroups(events));
  }, [events]);

  const hourHeight = 90; // Height of one hour slot in pixels
  const startHour = 0; // Define startHour here
  const endHour = 24; // Define endHour here

  const calculateOverlapGroups = (events) => {
    let eventGroups = [];
    events.forEach((event) => {
      let added = false;
      for (let group of eventGroups) {
        if (isOverlapping(event, group)) {
          group.push(event);
          added = true;
          break;
        }
      }
      if (!added) {
        eventGroups.push([event]);
      }
    });
    return eventGroups;
  };

  const isOverlapping = (event, group) => {
    return group.some(groupEvent => {
      return dayjs(event.startDate).isBefore(groupEvent.endDate) &&
             dayjs(groupEvent.startDate).isBefore(event.endDate);
    });
  };

  const calculateEventBlockStyles = (event) => {
    const eventStart = dayjs(event.startDate);
    const eventEnd = dayjs(event.endDate);

    const minutesFromMidnight = eventStart.diff(daySelected.startOf("day"), "minutes");
    const durationInMinutes = eventEnd.diff(eventStart, "minutes");

    const top = (minutesFromMidnight / 60) * hourHeight;
    const height = (durationInMinutes / 60) * hourHeight;

    const group = eventGroups.find(g => g.includes(event));
    const width = group ? 100 / group.length : 100;
    const index = group ? group.indexOf(event) : 0;
    const left = width * index;

    return { top, height, left, width };
  };

  console.log(showEventModal)
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
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          setShowEventModal(true);
        }}
      ></div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* Time Column */}
        {/* ... Time column code ... */}
 {/* Time Column */}
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
        {/* Event Column */}
        <div style={{ flex: 3, position: "relative" }}>
          {/* Hour and half-hour tickers */}
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
              }} onClick={() => handleAddEvent()}
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

                    
                  }}onClick={() => handleAddEvent()}
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
                    cursor: "pointer",

                  }}onClick={() => handleAddEvent()}
                />
              )}
            </div>
          ))}

          {/* Event rendering */}
          {events.map((event) => {
            if (dayjs(event.startDate).isSame(daySelected, "day")) {
              const { top, height, left, width } = calculateEventBlockStyles(event);
              return (
                <div
                  key={event.eventId}
                  style={{
                    position: "absolute",
                    top: `${top}px`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}px`,
                    backgroundColor: "#fff", // White background for the event block
                    borderLeft: "4px solid #1a73e8", // Blue left border for event type indication
                    boxShadow: "2 3px 3px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
                    margin: "4px 0", // Slightly more space between events
                    marginLeft: "4px", // Left margin to align with the grid
                    padding: "10px",
                    boxSizing: "border-box",
                    zIndex: 1000,
                    transition: "background-color 0.2s, box-shadow 0.2s", // Smooth transitions for hover effects
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    handleEventClick(event);
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
      {showEventInfoModal && <EventInfoPopup />}

    </Paper>
  );
}
