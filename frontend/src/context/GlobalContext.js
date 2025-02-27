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
    subRegions: [],
    eventType: [],
    gep: [],
    productName:[],
    buyerSegmentRollup: [],
    accountSectors: [],
    accountSegments: [],
    productFamily: [],
    industry: [],
    activityType: [],
    partyType: [],
    isPartneredEvent: '',
    isNewlyCreated: [
      { label: 'Yes', value: true, checked: false },
      { label: 'No', value: false, checked: false },
    ],  
    isDraft: [
      { label: 'Yes', value: true, checked: false },
      { label: 'No', value: false, checked: false },
    ],  },
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); 


  const [savedEvents, setSavedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [labels, setLabels] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    regions: [],
    subRegions: [],
    countries: [],
    eventType: [],
    gep: [],
    productName: [],
    buyerSegmentRollup: [],
    accountSectors: [],
    accountSegments: [],
    productFamily: [],
    activityType: [],
    partyType: [],
    industry: [],
    isPartneredEvent: [
      { label: 'Yes', value: true, checked: false },
      { label: 'No', value: false, checked: false },
    ], 
    isDraft: [
      { label: 'Yes', value: true, checked: false },
      { label: 'No', value: false, checked: false },
    ],  
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [formData, setFormData] = useState(initialFormData);
  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
  };
  const updateFilters = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
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
        user, 
        setUser

      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
