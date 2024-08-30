import dayjs from 'dayjs';
import React, { useContext, useState } from 'react';
import logo from '../../assets/logo/logo.png';
import MenuIcon from '@mui/icons-material/Menu';
import beta from '../../assets/svg/beta.svg';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { Select, MenuItem, Button, Typography, Input } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';
import ThemePopup from '../popup/Themepopup';
import versionInfo from '../../version.json';
import { getEventData } from '../../api/getEventData';

export default function CalendarHeader() {
  const {
    monthIndex,
    setMonthIndex,
    daySelected,
    setDaySelected,
    toggleSidebar,
    setCurrentView,
    setEvents,
    currentView,
    searchText,
    setSearchText,
  } = useContext(GlobalContext);
  
  const [view, setView] = useState('month');
  const [isThemePopupOpen, setIsThemePopupOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const eventData = await getEventData('eventDataQuery');
      setEvents(eventData);
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const handleSearchIconClick = () => {
    setShowSearchInput(!showSearchInput);
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleSearchSubmit = async () => {
    await fetchData();

    if (searchText) {
      handleSearchAction(searchText);
    }
  };

  const handleSearchAction = (text) => {
    setSearchText(text);
    setCurrentView('list');
  };

  function handlePrevMonth() {
    if (monthIndex === 0) {
      setDaySelected(daySelected.subtract(1, 'year').month(11));
      setMonthIndex(11);
    } else {
      setDaySelected(daySelected.subtract(1, 'month'));
      setMonthIndex(monthIndex - 1);
    }
  }

  function handleNextMonth() {
    if (monthIndex === 11) {
      setDaySelected(daySelected.add(1, 'year').month(0));
      setMonthIndex(0);
    } else {
      setDaySelected(daySelected.add(1, 'month'));
      setMonthIndex(monthIndex + 1);
    }
  }

  function handleReset() {
    const today = dayjs();
    setMonthIndex(today.month());
    setDaySelected(today);
  }

  const handleViewChange = (event) => {
    const selectedView = event.target.value;
    setCurrentView(selectedView);
    setView(selectedView);
  };

  const navigateToHome = () => {
    window.location.href = '/';
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-300 bg-white px-4 py-2">
      <div className="flex items-center space-x-4 overflow-hidden">
        <IconButton onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
        <img
          src={logo}
          alt="calendar"
          className="w-8 h-8 cursor-pointer"
          onClick={navigateToHome}
        />
        <h1
          className="text-xl text-black  cursor-pointer overflow-hidden whitespace-nowrap"
          style={{ maxWidth: '200px', textOverflow: 'ellipsis' }}
          onClick={navigateToHome}
        >
          EMEA Cloud Hub
        </h1>
        <img src={beta} alt="beta" className="w-8 h-8" />
        <span className="text-xs text-gray-500">V. {versionInfo.version}</span>

        <button onClick={handleReset} className="border rounded py-2 px-4 mr-2">
          Today
        </button>
        <IconButton onClick={handlePrevMonth}>
          <span className="material-icons-outlined text-gray-600">chevron_left</span>
        </IconButton>
        <IconButton onClick={handleNextMonth}>
          <span className="material-icons-outlined text-gray-600">chevron_right</span>
        </IconButton>
        <Typography variant="h6" className="text-lg font-semibold">
          {dayjs(new Date(dayjs().year(), monthIndex)).format('MMMM YYYY')}
        </Typography>
      </div>

      <div className="flex items-center space-x-4">
        <Select
          value={currentView}
          onChange={handleViewChange}
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="week">Week</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
          <MenuItem value="list">List</MenuItem>
        </Select>

        {showSearchInput && (
          <Input
            placeholder="Search events..."
            value={searchText}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
            sx={{ width: 200 }}
          />
        )}

        <IconButton onClick={handleSearchIconClick}>
          <SearchIcon />
        </IconButton>
      </div>
    </header>
  );
}
