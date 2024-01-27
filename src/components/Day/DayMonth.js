import React, { useContext, useState } from 'react';
import dayjs from 'dayjs';
import { Link } from '@mui/material';
import GlobalContext from "../../context/GlobalContext";
import EventInfoPopup from '../popup/EventInfoModal'; // Import the EventInfoPopup component

export default function Day({ day, events, isYearView }) {
  const maxEventsToShow = 3;
  const dayEvents = events.filter(evt => dayjs(evt.startDate).isSame(day, 'day'));
  const hasEvents = dayEvents.length > 0;

  const {
    setDaySelected,
    setShowEventModal,
    setCurrentView,
    setSelectedEvent,
    showEventInfoModal,
    setShowInfoEventModal
  } = useContext(GlobalContext);

  const [showAddEventModal, setShowAddEventModal] = useState(false); // Local state for Add Event modal

  const handleDayClick = () => {
    console.log('I am in')
    if (!isYearView) {
      setDaySelected(day);
      setSelectedEvent(null);

      const dayEvents = events.filter(evt => dayjs(evt.startDate).isSame(day, 'day'));

      if (dayEvents.length > 0) {
        setShowEventModal(false);

        setShowInfoEventModal(true);
      } else {
        setShowEventModal(true);
      }

      // Toggle the EventInfoModal based on showEventInfoModal value
      if (showEventInfoModal && dayEvents.length > 0) {
        setShowInfoEventModal(true);
      } else {
        setShowInfoEventModal(false);
      }
    }
  };

  const handleSeeMoreClick = (e) => {
    e.stopPropagation();
    setDaySelected(day);
    setCurrentView('day');
  };

  const handleEventClick = (evt) => {
    if (!isYearView) {
      setSelectedEvent(evt);
      setShowInfoEventModal(true);
      setShowAddEventModal(false);
    }
  };

  const dayNumberStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '25px',
  };

  const dayNumberCircleStyle = {
    ...dayNumberStyle,
    backgroundColor: hasEvents ? 'green' : 'transparent',
    color: hasEvents ? 'white' : 'inherit',
    borderRadius: '50%',
    width: '25px',
  };

  return (
    <div className="flex flex-col" style={{ border: isYearView ? 'none' : '0.5px solid #d1d5db', minHeight: '25px' }} >
      <header className="flex flex-col items-center" style={isYearView ? dayNumberCircleStyle : dayNumberStyle}>
        <p className="text-sm" style={{ pointerEvents: 'auto' }} onClick={handleDayClick}>{day.format("DD")}</p>
      </header>
      {!isYearView && (
        <div className="flex-1 flex flex-col">
       
       {dayEvents.length > 0 ? (
  <div>
    {dayEvents.slice(0, maxEventsToShow).map((evt, idx) => (
      <div
        key={idx}
        className="p-1 mb-1 text-gray-600 text-sm rounded truncate cursor-pointer"
        style={{ backgroundColor: "#f0f0f0", pointerEvents: 'auto' }}
        onClick={() => handleEventClick(evt)}
      >
        {evt.title}
      </div>
    ))}
  </div>
) : (
  <div
    className="p-1 mb-1 text-gray-600 text-sm rounded truncate cursor-pointer"
    style={{ backgroundColor: "#f0f0f0", pointerEvents: 'auto' }}
    onClick={handleDayClick} 
  >
    No Events
  </div>
)}


          {dayEvents.length >= maxEventsToShow && (
            <Link onClick={handleSeeMoreClick} className="text-xs cursor-pointer">
              See more
            </Link>
          )}
        </div>
      )}

      {/* Conditionally render the EventInfoPopup */}
      {showEventInfoModal && <EventInfoPopup />}
    </div>
  );
}
