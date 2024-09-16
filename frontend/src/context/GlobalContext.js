import React, { useState, createContext } from 'react';
import { initialFormData } from './InitialState';

const GlobalContext = createContext({
  isDraft: true,
  monthIndex: 0,
  setMonthIndex: (index) => {},
  smallCalendarMonth: 0,
  setSmallCalendarMonth: (index) => {},
  daySelected: null,
  setDaySelected: (day) => {},
  showEventModal: false,
  setShowEventModal: () => {},
  showEventListModal: false,
  setShowEventListModal: () => {},
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
  filters: {
    regions: [],
    eventType: [],
    okr: [],
    audienceSeniority: [],
    isDraft: [] // Add isDraft filter to initial context
  },
  updateFilters: () => {},
  showEventInfoModal: false,
  setShowInfoEventModal: () => {},
  setSearchText: () => {},
  searchText: null,
  resetFormData: () => {},
  isAuthenticated: false,
});

export const GlobalProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('month');
  const [monthIndex, setMonthIndex] = useState(0);
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(0);
  const [daySelected, setDaySelected] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventListModal, setShowEventListModal] = useState(false);
  const [showEventInfoModal, setShowInfoEventModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [isDraft, setIsDraft] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const [savedEvents, setSavedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [labels, setLabels] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    subRegions: [],
    eventType: [],
    gep: [],
    buyerSegmentRollup: [],
    accountSectors: [],
    accountSegments: [],
    productFamily: [],
    industry: [],
    isPartneredEvent: [],
    isDraft: []
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [formData, setFormData] = useState(initialFormData);
  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
  };
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };
  const resetFormData = () => {
    setFormData(initialFormData);
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
        showEventListModal,
        setShowEventListModal,
        showEventInfoModal,
        setShowInfoEventModal,
        selectedEvents,
        setSelectedEvents,
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
        searchText,
        setSearchText,
        eventDetails,
        setEventDetails,
        resetFormData,
        isAuthenticated, 
        setIsAuthenticated,

      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
