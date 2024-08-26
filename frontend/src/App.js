// src/App.js
import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import EventSharePage from "./components/forms/EventSharePage";
import NotFoundPage from "./components/error/NotFoundPage";
import GlobalContext from "./context/GlobalContext";
import RenderCalendarView from "./components/CalendarLayout";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/forms/Login";

function App() {
  const { sidebarOpen, currentView, monthIndex, showEventModal, setCurrentView } = useContext(GlobalContext);
  const [currenMonth, setCurrentMonth] = useState(getMonth());
  const { daySelected } = useContext(GlobalContext);
  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = (text) => {
    setSearchText(text);
    setCurrentView('list'); // Switch to list view when search is submitted
  };

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  function renderCalendarView() {
    switch (currentView) {
      case 'day':
        return <DayView day={daySelected} />;
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
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<RenderCalendarView />} />
          <Route path="/create-event" element={<EventForm />} />
          <Route path="/location" element={<EventFormLocation />} />
          <Route path="/extra" element={<EventFormExtra />} />
          <Route path="/audience" element={<EventFormAudience />} />
          <Route path="/links" element={<EventFormLinks />} />
          <Route path="/event/:eventId" element={<EventSharePage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
