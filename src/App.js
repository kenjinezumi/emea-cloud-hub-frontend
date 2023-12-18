import React, { useState, useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import { getMonth } from "./util";

import MonthView from "./components/calendar/MonthView";
import DayView from "./components/calendar/DayView";
import YearView from "./components/calendar/YearView";
import ListView from "./components/calendar/ListView";
import WeekView from "./components/calendar/WeekView";
import EventForm from "./components/forms/EventFormAbout"; 
import EventFormLocation from "./components/forms/EventFormLocation"; 
import EventFormExtra from "./components/forms/EventFormExtra";
import EventFormAudience from "./components/forms/EventFormAudience";
import EventFormLinks from "./components/forms/EventFormLinks";
// import { ThemeProvider, useTheme } from './ThemeContext';
// import './Theme.css'; 
import GlobalContext from "./context/GlobalContext";
import RenderCalendarView from "./components/CalendarLayout";

function App() {
  const { sidebarOpen, currentView, monthIndex, showEventModal } = useContext(GlobalContext);
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
    <Router>
     
  

          <Routes>
            <Route path="/create-event" element={<EventForm />} />
            <Route path="/" element={<RenderCalendarView/>} />
            <Route path="/location" element={<EventFormLocation/>} />
            <Route path="/extra" element={<EventFormExtra/>} />
            <Route path="/audience" element={<EventFormAudience/>} />
            <Route path="/links" element={<EventFormLinks/>} />

          </Routes>
   
    </Router>
  );
}


export default App;
