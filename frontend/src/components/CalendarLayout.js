// RenderCalendarView.js
import React, { useState, useContext, useEffect } from "react";
import { getMonth } from "../util";
import CalendarHeader from "./commons/CalendarHeader";
import Sidebar from "./Sidebar";
import MonthView from "./calendar/MonthView";
import DayView from "./calendar/DayView";
import YearView from "./calendar/YearView";
import ListView from "./calendar/ListView";
import WeekView from "./calendar/WeekView";
import EventModal from "./popup/EventModal";
import GlobalContext from "../context/GlobalContext";

// 1) Import your new DataExtractView
import DataExtractView from "./calendar/ExportView";

export default function RenderCalendarView() {
  const { sidebarOpen, currentView, monthIndex, showEventModal } = useContext(GlobalContext);
  const [currentMonth, setCurrentMonth] = useState(getMonth());

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  // 2) Add a case for "extract"
  function renderCalendarView() {
    switch (currentView) {
      case "day":
        return <DayView />;
      case "week":
        return <WeekView />;
      case "month":
        return <MonthView month={currentMonth} />;
      case "year":
        return <YearView />;
      case "list":
        return <ListView />;
      case "extract":
        return <DataExtractView />;
      default:
        return <MonthView month={currentMonth} />;
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
