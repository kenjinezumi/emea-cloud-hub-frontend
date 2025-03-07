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
import EventFormEmailInvitation from "./components/forms/EventFormEmailInvitation";
import AuthSuccess from './components/forms/AuthSuccess';
import DataExtractView from "./components/calendar/ExportView";

function App() {
  const { sidebarOpen, currentView, monthIndex, showEventModal, setCurrentView } = useContext(GlobalContext);
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const { daySelected, setIsAuthenticated } = useContext(GlobalContext);  // Ensure you have access to setIsAuthenticated
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState(null);  // State to store user location

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
        return <MonthView month={currentMonth} />;
      case 'year':
        return <YearView />;
      case 'list':
        return <ListView />;
      default:
        return <MonthView month={currentMonth} />;
    }
  }

  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setUserLocation({ latitude, longitude });
  //         console.log(latitude, longitude)
  //       },
  //       (error) => {
  //         console.error("Error getting location:", error);
  //       }
  //     );
  //   } else {
  //     console.error("Geolocation is not supported by this browser.");
  //   }
  // }, []);

  

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Protected Routes */}
        {/* <Route element={<PrivateRoute />}> */}
          <Route path="/" element={<RenderCalendarView />} />
          <Route path="/create-event" element={<EventForm />} />
          <Route path="/location" element={<EventFormLocation />} />
          <Route path="/extra" element={<EventFormExtra />} />
          <Route path="/email-invitation" element={<EventFormEmailInvitation />} />
          <Route path="/audience" element={<EventFormAudience />} />
          <Route path="/links" element={<EventFormLinks />} />
          <Route path="/event/:eventId" element={<EventSharePage />} />
          <Route path="/data-extract" element={<DataExtractView />} />

        {/* </Route> */}
        {/* Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
