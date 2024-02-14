import React, { useState, useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import { getMonth } from "./util";
import CalendarHeader from "./components/commons/CalendarHeader";
import Sidebar from "./components/Sidebar";
import MonthView from "./components/calendar/MonthView";
import DayView from "./components/calendar/DayView";
import YearView from "./components/calendar/YearView";
import ListView from "./components/calendar/ListView";
import WeekView from "./components/calendar/WeekView";
import EventModal from "./components/EventModal";
import EventForm from "./components/forms/EventFormAbout"; 
import EventFormLocation from "./components/forms/EventFormLocation"; 
import EventFormExtra from "./components/forms/EventFormExtra";
import EventFormAudience from "./components/forms/EventFormAudience";
import EventFormLinks from "./components/forms/EventFormLinks";
// import { ThemeProvider, useTheme } from './ThemeContext';
// import './Theme.css'; 
import GlobalContext from "./context/GlobalContext";

  const { sidebarOpen, currentView, monthIndex, showEventModal } = useContext(GlobalContext);
  const [currenMonth, setCurrentMonth] = useState(getMonth());
  // const { theme } = useTheme();

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  export default function renderCalendarView() {
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





