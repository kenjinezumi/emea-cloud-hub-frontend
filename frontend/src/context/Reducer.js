// src/context/GlobalContext.js
import React, { createContext, useReducer } from 'react';

const GlobalContext = createContext();

const initialState = {
  monthIndex: 0,
  smallCalendarMonth: 0,
  daySelected: null,
  showEventModal: false,
  showEventListModal: false,
  showEventInfoModal: false,
  searchText: '',
  eventDetails: null,
  savedEvents: [],
  selectedEvent: null,
  selectedEvents: [],
  labels: [],
  filteredEvents: [],
  sidebarOpen: true,
  currentView: 'month',
  formData: {},
  filters: {
    regions: [],
    eventType: [],
    okr: [],
    audienceSeniority: [],
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_MONTH_INDEX':
      return { ...state, monthIndex: action.payload };
    case 'SET_SMALL_CALENDAR_MONTH':
      return { ...state, smallCalendarMonth: action.payload };
    case 'SET_DAY_SELECTED':
      return { ...state, daySelected: action.payload };
    case 'SET_SHOW_EVENT_MODAL':
      return { ...state, showEventModal: action.payload };
    case 'SET_SHOW_EVENT_LIST_MODAL':
      return { ...state, showEventListModal: action.payload };
    case 'SET_SHOW_EVENT_INFO_MODAL':
      return { ...state, showEventInfoModal: action.payload };
    case 'SET_SEARCH_TEXT':
      return { ...state, searchText: action.payload };
    case 'SET_EVENT_DETAILS':
      return { ...state, eventDetails: action.payload };
    case 'SET_SAVED_EVENTS':
      return { ...state, savedEvents: action.payload };
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.payload };
    case 'SET_SELECTED_EVENTS':
      return { ...state, selectedEvents: action.payload };
    case 'SET_LABELS':
      return { ...state, labels: action.payload };
    case 'SET_FILTERED_EVENTS':
      return { ...state, filteredEvents: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'RESET_FORM_DATA':
      return { ...state, formData: initialState.formData };
    case 'UPDATE_FILTERS':
      return { ...state, filters: action.payload };
    default:
      return state;
  }
};

export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateFormData = (newData) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: newData });
  };

  const resetFormData = () => {
    dispatch({ type: 'RESET_FORM_DATA' });
  };

  return (
    <GlobalContext.Provider
      value={{
        ...state,
        dispatch,
        updateFormData,
        resetFormData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
