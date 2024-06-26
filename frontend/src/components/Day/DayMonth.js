import React, { useContext, useState, useEffect } from "react";
import dayjs from "dayjs";
import { Link } from "@mui/material";
import GlobalContext from "../../context/GlobalContext";
import EventInfoPopup from "../popup/EventInfoModal";
import EventListPopup from "../popup/EventListModal"; // Import the EventInfoPopup component

import { useLocation } from "react-router-dom";

export default function Day({ day, events, isYearView }) {
  const maxEventsToShow = 3;
  const dayEvents = events.filter((evt) =>
    dayjs(evt.startDate).isSame(day, "day")
  );
  const hasEvents = dayEvents.length > 0;
  const location = useLocation();
  const PopupState = {
    NONE: "NONE",
    EVENT_INFO: "EVENT_INFO",
    EVENT_LIST: "EVENT_LIST",
  };

  const [activePopup, setActivePopup] = useState(PopupState.NONE);

  const {
    setDaySelected,
    setShowEventModal,
    showEventModal,
    setCurrentView,
    selectedEvent,
    setSelectedEvent,
    showEventInfoModal,
    setShowInfoEventModal,
    showEventListModal,
    setShowEventListModal,
    selectedEvents,
    setSelectedEvents,
  } = useContext(GlobalContext);

  const [showAddEventModal, setShowAddEventModal] = useState(false); // Local state for Add Event modal

  useEffect(() => {
    setShowEventModal(false);
    setShowInfoEventModal(false);
    setShowEventListModal(false);
  }, [location]);

  const handleDayClick = (e) => {
    setDaySelected(day); // Always set the selected day

    if (isYearView) {
      e.preventDefault(); // Prevent the default action
      e.stopPropagation(); // Stop the event from propagating

      setShowInfoEventModal(false);

      setSelectedEvents(dayEvents); // Assuming this sets the events for the list popup
      setActivePopup(PopupState.EVENT_LIST);
      setShowEventListModal(true);
      setShowEventModal(false);
    } else {
      setSelectedEvent(null);
      setShowEventModal(true);
    }
  };

  const handleEventsClick = (e) => {
    setDaySelected(day); // Always set the selected day

    if (isYearView) {
      e.preventDefault(); // Prevent the default action
      e.stopPropagation(); // Stop the event from propagating

      setShowInfoEventModal(false);
      setSelectedEvents(dayEvents);
      setShowEventListModal(true);
    }else {
      setSelectedEvent(null);
      setShowEventModal(true);
    }
  };

  const handleSeeMoreClick = (e) => {
    e.stopPropagation();
    setDaySelected(day);
    setCurrentView("day");
  };

  const handleEventClick = (evt) => {
    if (!isYearView) {
      setSelectedEvent(evt);
      setShowInfoEventModal(true);
      setShowAddEventModal(false);
    }
  };

  const dayNumberStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "25px",
  };

  const dayNumberCircleStyle = {
    ...dayNumberStyle,
    backgroundColor: hasEvents ? "green" : "transparent",
    color: hasEvents ? "white" : "inherit",
    borderRadius: "50%",
    width: "25px",
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
          {day.format("DD")}
        </p>
      </header>
      {!isYearView && (
        <div className="flex-1 flex flex-col" >
          {dayEvents.length > 0 ? (
            <div>
              {dayEvents.slice(0, maxEventsToShow).map((evt, idx) => (
                <div
                  key={idx}
                  className="p-1 mb-1 text-gray-600 text-sm rounded truncate cursor-pointer"
                  style={{
                    backgroundColor: "#fff", // White background
                    pointerEvents: "auto",
                    fontSize: "0.875rem", // 14px
                    borderLeft: "4px solid #1a73e8", // Blue left border for event type indication
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
                    margin: "4px 0", // Slightly more space between events
                    marginLeft: "4px",
                    transition: "background-color 0.2s, box-shadow 0.2s", // Smooth transitions for hover effects
                  }}
                  onClick={() => handleEventClick(evt)}
                >
                  {evt.title}
                </div>
              ))}
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

      <div>
        {activePopup === PopupState.EVENT_INFO && (
          <EventInfoPopup
            event={selectedEvent}
            onClose={() => setActivePopup(PopupState.NONE)}
          />
        )}
        
        {activePopup === PopupState.EVENT_LIST && (
          <EventListPopup
            events={selectedEvents}
            onClose={() => setActivePopup(PopupState.NONE)}
          />
        )}
      </div>
    </div>
  );
}
