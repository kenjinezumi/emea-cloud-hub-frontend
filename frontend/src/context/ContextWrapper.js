import React, {
  useState,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
} from 'react';
import GlobalContext from './GlobalContext';
import dayjs from 'dayjs';

function savedEventsReducer(state, {type, payload}) {
  switch (type) {
    case 'push':
      return [...state, payload];
    case 'update':
      return state.map((evt) =>
        evt.id === payload.id ? payload : evt,
      );
    case 'delete':
      return state.filter((evt) => evt.id !== payload.id);
    default:
      throw new Error();
  }
}
function initEvents() {
  const storageEvents = localStorage.getItem('savedEvents');
  const parsedEvents = storageEvents ? JSON.parse(storageEvents) : [];
  return parsedEvents;
}

export default function ContextWrapper(props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [monthIndex, setMonthIndex] = useState(dayjs().month());
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(null);
  const [daySelected, setDaySelected] = useState(dayjs());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventListModal, setShowEventListModal] = useState(false);
  const [showEventInfoModal, setShowInfoEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const [labels, setLabels] = useState([]);
  const [filters, setFilters] = useState([]); // State for filters
  const [searchText, setSearchText] = useState(''); // Add searchText state

  const [savedEvents, dispatchCalEvent] = useReducer(
      savedEventsReducer,
      [],
      initEvents,
  );
  const [formData, setFormData] = useState({});
  const updateFormData = (newData) => {
    setFormData({...formData, ...newData});
  };
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, [setFilters]);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredEvents = useMemo(() => {
    return savedEvents.filter((evt) =>
      labels
          .filter((lbl) => lbl.checked)
          .map((lbl) => lbl.label)
          .includes(evt.label),
    );
  }, [savedEvents, labels]);

  useEffect(() => {
    localStorage.setItem('savedEvents', JSON.stringify(savedEvents));
  }, [savedEvents]);

  useEffect(() => {
    setLabels((prevLabels) => {
      return [...new Set(savedEvents.map((evt) => evt.label))].map(
          (label) => {
            const currentLabel = prevLabels.find(
                (lbl) => lbl.label === label,
            );
            return {
              label,
              checked: currentLabel ? currentLabel.checked : true,
            };
          },
      );
    });
  }, [savedEvents]);

  useEffect(() => {
    if (smallCalendarMonth !== null) {
      setMonthIndex(smallCalendarMonth);
    }
  }, [smallCalendarMonth]);

  useEffect(() => {
    if (!showEventModal) {
      setSelectedEvent(null);
    }
  }, [showEventModal]);

  useEffect(() => {
    if (!showEventListModal) {
      setSelectedEvents(null);
    }
  }, [showEventListModal]);


  useEffect(() => {
    if (!showEventInfoModal) {
      setSelectedEvent(null);
    }
  }, [showEventInfoModal]);

  function updateLabel(label) {
    setLabels(
        labels.map((lbl) => (lbl.label === label.label ? label : lbl)),
    );
  }

  const [currentView, setCurrentView] = useState('month'); // Default to month view


  return (
    <GlobalContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
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
        setShowInfoEventModal,
        showEventInfoModal,
        dispatchCalEvent,
        selectedEvent,
        setSelectedEvent,
        selectedEvents, 
        setSelectedEvents,
        savedEvents,
        setLabels,
        labels,
        updateLabel,
        filteredEvents,
        currentView,
        setCurrentView,
        formData,
        updateFormData,
        filters,
        updateFilters,
        searchText,
        setSearchText,

      }}
    >

      {props.children}
    </GlobalContext.Provider>
  );
}
