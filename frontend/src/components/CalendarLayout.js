import React, {useState, useContext, useEffect} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {getMonth} from '../util';
import CalendarHeader from './commons/CalendarHeader';
import Sidebar from './Sidebar';
import MonthView from './calendar/MonthView';
import DayView from './calendar/DayView';
import YearView from './calendar/YearView';
import ListView from './calendar/ListView';
import WeekView from './calendar/WeekView';
import EventModal from './popup/EventModal';

import GlobalContext from '../context/GlobalContext';

export default function RenderCalendarView() {
  const {sidebarOpen, currentView, monthIndex, showEventModal} = useContext(GlobalContext);
  const [currenMonth, setCurrentMonth] = useState(getMonth());
  // const { theme } = useTheme();

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  function renderCalendarView() {
    switch (currentView) {
      case 'day':
        return <DayView />;
      case 'week':
        return <WeekView />;
      case 'month':
        return <MonthView month={currenMonth} />;
      case 'year':
        return <YearView />;
      case 'list':
        return <ListView />;
      default:
        return <MonthView month={currenMonth} />;
    }
  }

  return (

    <div className="h-screen flex flex-col">
      {showEventModal && <EventModal />}

      <CalendarHeader />
      {sidebarOpen && <Sidebar />}

      <div className="flex flex-1">
        <Sidebar />

        {renderCalendarView()}


      </div>
    </div>

  );
}


