import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { Link, Typography, Box } from "@mui/material";
import GlobalContext from "../../context/GlobalContext";
import EventInfoPopup from "../popup/EventInfoModal";
import EventListPopup from "../popup/EventListModal";
import { useLocation } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArticleIcon from "@mui/icons-material/Article";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Day({ day, events, isYearView, month }) {
  const maxEventsToShow = 3;
  const [hoveredEvent, setHoveredEvent] = useState(null);  
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }); 

  const dayEvents = useMemo(() => {
    return events.filter((evt) => {
      // Conditional check based on year view
      if (isYearView) {
        // In year view, access `day.date` which is a `dayjs` object
        return (
          dayjs(evt.startDate).isBefore(day.date.endOf("day")) &&
          dayjs(evt.endDate).isAfter(day.date.startOf("day"))
        );
      } else {
        // Not in year view, `day` is a `dayjs` object directly
        return (
          dayjs(evt.startDate).isBefore(day.endOf("day")) &&
          dayjs(evt.endDate).isAfter(day.startOf("day"))
        );
      }
    });
  }, [events, day, isYearView]);
  

  const hasEvents = dayEvents.length > 0;

const isCurrentMonth = isYearView
    ? day.date.month() === month // In year view, compare day.date.month() to the month prop
    : day.month() === month; // Not in year view, compare directly with day.month()


  const location = useLocation();
  const PopupState = {
    NONE: "NONE",
    EVENT_INFO: "EVENT_INFO",
    EVENT_LIST: "EVENT_LIST",
  };

  const [activePopup, setActivePopup] = useState(PopupState.NONE);

  // Get necessary context variables including selectedEvent and selectedEvents
  const {
    setDaySelected,
    setShowEventModal,
    setCurrentView,
    setSelectedEvent,
    setShowInfoEventModal,
    setShowEventListModal,
    setSelectedEvents,
    selectedEvent,   // Add selectedEvent from context
    selectedEvents,  // Add selectedEvents from context
  } = useContext(GlobalContext);

  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
    setShowEventListModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal, setShowEventListModal]);

  // Memoized event handlers to prevent re-creation on each render
  const handleDayClick = useCallback(
    (e) => {
      if (isYearView) {
        setDaySelected(day.date); 
      } else {
        setDaySelected(day);
      }
      if (isYearView) {
        e.preventDefault();
        e.stopPropagation();
        setShowInfoEventModal(false);
        setSelectedEvents(dayEvents);
        setActivePopup(PopupState.EVENT_LIST);
        setShowEventListModal(true);
        setShowEventModal(false);
      } else {
        setSelectedEvent(null);
        setShowEventModal(true);
      }
    },
    [day, isYearView, dayEvents, setDaySelected, setSelectedEvents, setActivePopup, setShowEventListModal, setShowEventModal, setSelectedEvent, setShowInfoEventModal]
  );

  const handleEventsClick = useCallback(
    (e) => {
      setDaySelected(day);

      if (isYearView) {
        e.preventDefault();
        e.stopPropagation();
        setShowInfoEventModal(false);
        setSelectedEvents(dayEvents);
        setShowEventListModal(true);
      } else {
        setSelectedEvent(null);
        setShowEventModal(true);
      }
    },
    [day, isYearView, dayEvents, setDaySelected, setSelectedEvents, setShowInfoEventModal, setShowEventListModal, setShowEventModal, setSelectedEvent]
  );

  const handleSeeMoreClick = useCallback(
    (e) => {
      e.stopPropagation();
      setDaySelected(day);
      setCurrentView("day");
    },
    [day, setDaySelected, setCurrentView]
  );

  const handleEventClick = useCallback(
    (evt) => {
      if (!isYearView) {
        setSelectedEvent(evt);
        setShowInfoEventModal(true);
      }
    },
    [isYearView, setSelectedEvent, setShowInfoEventModal]
  );

  const getEventStyleAndIcon = (eventType) => {
    switch (eventType) {
      case "Online Event":
        return {
          backgroundColor: "#e3f2fd",
          color: "#1a73e8",
          icon: <LanguageIcon fontSize="small" style={{ marginRight: "5px" }} />,
        };
      case "Physical Event":
        return {
          backgroundColor: "#fce4ec",
          color: "#d32f2f",
          icon: <LocationOnIcon fontSize="small" style={{ marginRight: "5px" }} />,
        };
      case "Hybrid Event":
        return {
          backgroundColor: "#f3e5f5",
          color: "#6a1b9a",
          icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />,
        };
      case "Customer Story":
        return {
          backgroundColor: "#e8f5e9",
          color: "#2e7d32",
          icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />,
        };
      case "Blog Post":
        return {
          backgroundColor: "#fffde7",
          color: "#f57f17",
          icon: <ArticleIcon fontSize="small" style={{ marginRight: "5px" }} />,
        };
      default:
        return {
          backgroundColor: "#e3f2fd",
          color: "#1a73e8",
          icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />,
        };
    }
  };

  const dayNumberStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "25px",
    color: isYearView && !isCurrentMonth ? "#a9a9a9" : "#000000", // Gray non-current month days in YearView
    backgroundColor: "transparent", // No background color by default
  };
  
  const dayNumberCircleStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "25px",
    width: "25px",
    borderRadius: "50%",
    backgroundColor: isCurrentMonth && hasEvents ? "#4285F4" : "transparent", // Blue circle for current month with events
    color: isCurrentMonth && hasEvents ? "white" : isYearView && !isCurrentMonth ? "#a9a9a9" : "#000000", // White for current month with events, gray for non-current month
  };
  

  const renderPopup = useMemo(() => {
    switch (activePopup) {
      case PopupState.EVENT_INFO:
        return (
          <EventInfoPopup
            event={selectedEvent}
            onClose={() => setActivePopup(PopupState.NONE)}
          />
        );
      case PopupState.EVENT_LIST:
        return (
          <EventListPopup
            events={selectedEvents}
            onClose={() => setActivePopup(PopupState.NONE)}
          />
        );
      default:
        return null;
    }
  }, [activePopup, selectedEvent, selectedEvents, setActivePopup]);

  const handleMouseEnter = (e, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredEvent(event);
    setTooltipPosition({
      x: e.clientX + 10,  // Adjust tooltip position
      y: e.clientY + 10,
    });
  };

  // Tooltip mouse move handler
  const handleMouseMove = (e) => {
    setTooltipPosition({
      x: e.clientX + 10,
      y: e.clientY + 10,
    });
  };

  // Tooltip mouse leave handler
  const handleMouseLeave = () => {
    setHoveredEvent(null);
  };

  return (
    <div
      className="flex flex-col"
      style={{
        border: isYearView ? "none" : "0.5px solid #d1d5db",
        minHeight: "25px",
      }}
    >
      <header
        className="flex flex-col items-center"
        style={isYearView ? dayNumberCircleStyle : dayNumberStyle}
      >
        <p
          className="text-sm cursor-pointer"
          style={{ pointerEvents: "auto" }}
          onClick={handleDayClick}
        >
{isYearView 
            ? day.date.format("DD") // In year view, use day.date.format()
            : day.format("DD")}        </p>
      </header>
      {!isYearView && (
        <div className="flex-1 flex flex-col">
          {dayEvents.length > 0 ? (
            <div>
              {dayEvents.slice(0, maxEventsToShow).map((evt, idx) => {
                const { backgroundColor, color, icon } = getEventStyleAndIcon(evt.eventType);
                return (
                  <div
                    key={idx}
                    className="p-1 mb-1 text-gray-800 text-sm rounded-md truncate cursor-pointer"
                    style={{
                      backgroundColor: backgroundColor,
                      color: color,
                      pointerEvents: "auto",
                      fontSize: "0.875rem",
                      borderLeft: `2px solid ${color}`,
                      margin: "4px 0",
                      marginLeft: "4px",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      transition: "background-color 0.2s, box-shadow 0.2s",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                    onClick={() => handleEventClick(evt)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#c5e1f9";
                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                      handleMouseEnter(e, evt);
                    }}
                    onMouseMove={(e) => {
                      handleMouseMove(e);  
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = backgroundColor;
                      e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                      handleMouseLeave();
                    }}
                  >
                    {icon}
                    {evt.title}
                  </div>
                );
              })}
              {hoveredEvent && (
  <Box
    sx={{
      position: "fixed",
      top: `${tooltipPosition.y}px`,
      left: `${tooltipPosition.x}px`,
      backgroundColor: "#fff",
      padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      borderRadius: "8px",
      zIndex: 1000,
      pointerEvents: "none",
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
      {hoveredEvent.title}
    </Typography>
    <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
      {/* Conditionally render the date or show "Missing or invalid date" with one warning icon */}
      {hoveredEvent.startDate && hoveredEvent.endDate && dayjs(hoveredEvent.startDate).diff(dayjs(hoveredEvent.endDate), 'minutes') !== 0 ? (
        `${dayjs(hoveredEvent.startDate).format("MMM D, h:mm A")} - ${dayjs(hoveredEvent.endDate).format("MMM D, h:mm A")}`
      ) : (
        <>
          <ErrorOutlineIcon sx={{ fontSize: "16px", color: "#d32f2f", marginRight: "4px" }} />
          Missing or invalid date
        </>
      )}
    </Typography>
  </Box>
)}
              
            </div>
          ) : (
            <div
              className="p-1 mb-1 text-gray-600 text-sm rounded truncate cursor-pointer w-full h-full"
              style={{ pointerEvents: "auto" }}
              onClick={handleDayClick}
            ></div>
          )}

          {dayEvents.length >= maxEventsToShow && (
            <div className="flex items-center">
              <Link
                onClick={handleSeeMoreClick}
                className="text-xs text-sm cursor-pointer w-1/2 text-left"
                style={{ fontSize: "12px" }}
              >
                See more
              </Link>
              <div
                className="p-1 mb-1 text-gray-600 text-sm rounded truncate cursor-pointer w-1/2"
                style={{ pointerEvents: "auto" }}
                onClick={handleDayClick}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Conditionally render the EventInfoPopup */}
      <div>{renderPopup}</div>
    </div>
  );
}
