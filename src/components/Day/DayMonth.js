import React from 'react';
import dayjs from 'dayjs';

export default function Day({ day, events, setDaySelected, setShowEventModal, isYearView }) {
  const maxEventsToShow = 3; // Define the maximum number of events to show
  const dayEvents = events.filter(evt => dayjs(evt.startDate).isSame(day, 'day'));
  const hasEvents = dayEvents.length > 0;

  const handleDayClick = () => {
    if (!isYearView) {
      setDaySelected(day);
      setShowEventModal(true);
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
    <div className="flex flex-col" style={{ border: isYearView ? 'none' : '1px solid #d1d5db', minHeight: '20px' }} onClick={handleDayClick}>
      <header className="flex flex-col items-center" style={isYearView ? dayNumberCircleStyle : dayNumberStyle}>
        <p className="text-sm">{day.format("DD")}</p>
      </header>
      {!isYearView && (
        <div className="flex-1 flex flex-col">
          {dayEvents.slice(0, maxEventsToShow).map((evt, idx) => (
            <div key={idx} className="p-1 mb-1 text-gray-600 text-sm rounded truncate" style={{ backgroundColor: "#f0f0f0" }}>
              {evt.title}
            </div>
          ))}
          {dayEvents.length > maxEventsToShow && (
            <div className="text-sm p-1 cursor-pointer">
              {`+${dayEvents.length - maxEventsToShow} more`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
