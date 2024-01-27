import React, { useContext, useState } from 'react';
import dayjs from 'dayjs';
import { Link } from '@mui/material';
import GlobalContext from "../../context/GlobalContext";
import EventInfoPopup from '../popup/EventInfoModal'; // Import the EventInfoPopup component

export default function Day({ day, events, isYearView }) {
  const maxEventsToShow = 3;
  const dayEvents = events.filter(evt => dayjs(evt.startDate).isSame(day, 'day'));
  const hasEvents = dayEvents.length > 0;
  console.log(useContext(GlobalContext))

  const {
    setDaySelected,
    setShowEventModal,
    setCurrentView,
    setSelectedEvent,
    showEventInfoModal, // This should match the name in your context
    setShowInfoEventModal, // This should match the name in your context
    
  } = useContext(GlobalContext);


  const handleDayClick = () => {
    if (!isYearView) {
      setDaySelected(day);
      setSelectedEvent(null);

      const dayEvents = events.filter(evt => dayjs(evt.startDate).isSame(day, 'day'));

      if (dayEvents.length > 0) {
        console.log('IT HAS EVENTS')
        setShowEventModal(false);
        setShowInfoEventModal(true);
      } else {
        console.log('IT HAS NO EVENTS')

        setShowEventModal(true);
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
      setShowEventModal(false);
      setSelectedEvent(evt);
      setShowInfoEventModal(true);
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
    <div className="flex flex-col" style={{ border: isYearView ? 'none' : '0.5px solid #d1d5db', minHeight: '25px' }} onClick={handleDayClick}>
      <header className="flex flex-col items-center" style={isYearView ? dayNumberCircleStyle : dayNumberStyle}>
        <p className="text-sm">{day.format("DD")}</p>
      </header>
      {!isYearView && (
        <div className="flex-1 flex flex-col">
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
          {dayEvents.length >= maxEventsToShow && (
            <Link onClick={handleSeeMoreClick} className="text-xs cursor-pointer">
              See more
            </Link>
          )}
        </div>
      )}
      
      {/* Conditionally render the EventInfoPopup */}
      {hasEvents && <EventInfoPopup />}
    </div>
  );
}
