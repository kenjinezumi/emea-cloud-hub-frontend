import React, { useState, createContext } from "react";

const GlobalContext = createContext({
  monthIndex: 0,
  setMonthIndex: (index) => {},
  smallCalendarMonth: 0,
  setSmallCalendarMonth: (index) => {},
  daySelected: null,
  setDaySelected: (day) => {},
  showEventModal: false,
  setShowEventModal: () => {},
  dispatchCalEvent: ({ type, payload }) => {},
  savedEvents: [],
  selectedEvent: null,
  setSelectedEvent: () => {},
  setLabels: () => {},
  labels: [],
  updateLabel: () => {},
  filteredEvents: [],
  sidebarOpen: true,
  toggleSidebar: () => {},
  currentView: () => {},
  setCurrentView: () => {},
  filters: [], // Add filters to the initial context
  updateFilters: () => {}, // Function to update filters
});

export const GlobalProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('month'); // Default to 'month'
  const [monthIndex, setMonthIndex] = useState(0);
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(0);
  const [daySelected, setDaySelected] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [savedEvents, setSavedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [labels, setLabels] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState([]); // State to manage filters



  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const [formData, setFormData] = useState({});
  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
  };
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <GlobalContext.Provider
    value={{
      monthIndex,
      setMonthIndex,
      smallCalendarMonth,
      setSmallCalendarMonth,
      daySelected,
      setDaySelected,
      showEventModal,
      setShowEventModal,
      savedEvents,
      selectedEvent,
      setSelectedEvent,
      setLabels,
      labels,
      filteredEvents,
      sidebarOpen,
      toggleSidebar,
      currentView, 
      setCurrentView,
      formData, 
      updateFormData,
      filters,
      updateFilters,
      
    }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
