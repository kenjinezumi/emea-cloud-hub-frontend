import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import GlobalContext from '../context/GlobalContext';
import { getMonth } from '../util';
import { IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function SmallCalendar() {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(getMonth(currentMonthIdx, currentYear));

  const {
    monthIndex,
    setSmallCalendarMonth,
    setDaySelected,
    daySelected,
  } = useContext(GlobalContext);

  useEffect(() => {
    // Update currentMonth when currentMonthIdx or currentYear changes
    setCurrentMonth(getMonth(currentMonthIdx, currentYear));
  }, [currentMonthIdx, currentYear]);

  useEffect(() => {
    if (daySelected) {
      setCurrentMonthIdx(daySelected.month());
      setCurrentYear(daySelected.year());
    }
  }, [daySelected]);

  function handlePrevMonth() {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11); // December of the previous year
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIdx(currentMonthIdx - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0); // January of the next year
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIdx(currentMonthIdx + 1);
    }
  }

  function getDayClass(day) {
    const format = 'DD-MM-YY';
    const nowDay = dayjs().format(format);
    const currDay = day.format(format);
    const slcDay = daySelected && daySelected.format(format);

    if (nowDay === currDay && currDay === slcDay) {
      return 'bg-blue-500 rounded-full text-white font-bold';
    } else if (nowDay === currDay) {
      return 'bg-blue-500 rounded-full text-white';
    } else if (currDay === slcDay) {
      return 'bg-blue-100 rounded-full text-blue-600 font-bold';
    } else {
      return '';
    }
  }

  return (
    <div className="mt-9">
      <header className="flex justify-between items-center">
        <p className="text-black ml-2 text-sm">
          {dayjs(new Date(currentYear, currentMonthIdx)).format('MMMM YYYY')}
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
          const clickedDay = day.clone(); // Clone the day to avoid mutations
          setSmallCalendarMonth(clickedDay.month());
          setDaySelected(clickedDay); // Ensure the correct year is passed
        }}
        className={`py-1 w-full ${getDayClass(day)}`}
      >
        <span className="text-sm">{day.format("D")}</span>
      </button>
    ))}
  </React.Fragment>
))}


      </div>
    </div>
  );
}
