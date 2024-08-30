import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import GlobalContext from '../context/GlobalContext';
import { getMonth } from '../util';
import { IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function SmallCalendar() {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(dayjs().month());
  const [currentMonth, setCurrentMonth] = useState(getMonth());

  const {
    monthIndex,
    setSmallCalendarMonth,
    setDaySelected,
    daySelected,
  } = useContext(GlobalContext);

  useEffect(() => {
    setCurrentMonth(getMonth(currentMonthIdx));
  }, [currentMonthIdx]);

  useEffect(() => {
    setCurrentMonthIdx(monthIndex);
  }, [monthIndex]);

  function handlePrevMonth() {
    setCurrentMonthIdx(currentMonthIdx - 1);
  }

  function handleNextMonth() {
    setCurrentMonthIdx(currentMonthIdx + 1);
  }

  function getDayClass(day) {
    const format = 'DD-MM-YY';
    const nowDay = dayjs().format(format);
    const currDay = day.format(format);
    const slcDay = daySelected && daySelected.format(format);

    if (nowDay === currDay && currDay === slcDay) {
      // Both current day and selected day
      return 'bg-blue-500 rounded-full text-white font-bold';
    } else if (nowDay === currDay) {
      // Only current day
      return 'bg-blue-500 rounded-full text-white';
    } else if (currDay === slcDay) {
      // Only selected day
      return 'bg-blue-100 rounded-full text-blue-600 font-bold';
    } else {
      return '';
    }
  }

  return (
    <div className="mt-9">
      <header className="flex justify-between items-center">
        <p className="text-black ml-2 text-sm">
          {dayjs(new Date(dayjs().year(), currentMonthIdx)).format('MMMM YYYY')}
        </p>
        <div>
          <IconButton size="small" onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </div>
      </header>
      <div className="grid grid-cols-7 grid-rows-6 mt-4">
        {currentMonth[0].map((day, i) => (
          <span key={i} className="text-sm py-1 text-center">
            {day.format('dd').charAt(0)}
          </span>
        ))}
        {currentMonth.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((day, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSmallCalendarMonth(currentMonthIdx);
                  setDaySelected(day);
                }}
                className={`py-1 w-full ${getDayClass(day)}`}
              >
                <span className="text-sm">{day.format('D')}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
