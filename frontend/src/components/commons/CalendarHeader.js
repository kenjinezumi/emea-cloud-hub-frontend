import dayjs from 'dayjs';
import React, { useContext, useState, useEffect } from 'react';
import logo from '../../assets/logo/logo.png';
import MenuIcon from '@mui/icons-material/Menu';
import beta from '../../assets/svg/beta.svg';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { Select, MenuItem, Typography, Input, Tooltip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';
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
  
  const [view, setView] = useState(currentView || 'month');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [user, setUser] = useState(null);  // State to store user data
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    setView(currentView);
  }, [currentView]);

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

  function handlePrev() {
    let newDaySelected;
    switch (view) {
      case 'day':
        newDaySelected = daySelected.subtract(1, 'day');
        setDaySelected(newDaySelected);
        setMonthIndex(newDaySelected.month());
        break;
      case 'week':
        newDaySelected = daySelected.subtract(1, 'week');
        setDaySelected(newDaySelected);
        setMonthIndex(newDaySelected.month());
        break;
      case 'month':
        if (monthIndex === 0) {
          const newDate = daySelected.subtract(1, 'year').month(11); // December of the previous year
          setDaySelected(newDate);
          setMonthIndex(11);
        } else {
          const newDate = daySelected.subtract(1, 'month');
          setDaySelected(newDate);
          setMonthIndex(monthIndex - 1);
        }
        break;
      case 'year':
        newDaySelected = daySelected.subtract(1, 'year');
        setDaySelected(newDaySelected);
        setMonthIndex(newDaySelected.month());
        break;
      default:
        break;
    }
  }

  function handleNext() {
    let newDaySelected;
    switch (view) {
      case 'day':
        newDaySelected = daySelected.add(1, 'day');
        setDaySelected(newDaySelected);
        setMonthIndex(newDaySelected.month());
        break;
      case 'week':
        newDaySelected = daySelected.add(1, 'week');
        setDaySelected(newDaySelected);
        setMonthIndex(newDaySelected.month());
        break;
      case 'month':
        if (monthIndex === 11) {
          const newDate = daySelected.add(1, 'year').month(0); // January of the next year
          setDaySelected(newDate);
          setMonthIndex(0);
        } else {
          const newDate = daySelected.add(1, 'month');
          setDaySelected(newDate);
          setMonthIndex(monthIndex + 1);
        }
        break;
      case 'year':
        newDaySelected = daySelected.add(1, 'year');
        setDaySelected(newDaySelected);
        setMonthIndex(newDaySelected.month());
        break;
      default:
        break;
    }
  }

  function handleReset() {
    const today = dayjs();
    setDaySelected(today);
    setMonthIndex(today.month());
  }

  const handleViewChange = (event) => {
    const selectedView = event.target.value;
    setCurrentView(selectedView);
    setView(selectedView);
    setMonthIndex(daySelected.month());
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
          className="text-xl text-black cursor-pointer overflow-hidden whitespace-nowrap"
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
        <IconButton onClick={handlePrev}>
          <span className="material-icons-outlined text-gray-600">chevron_left</span>
        </IconButton>
        <IconButton onClick={handleNext}>
          <span className="material-icons-outlined text-gray-600">chevron_right</span>
        </IconButton>
        <Typography variant="h6" className="text-lg font-semibold">
          {daySelected.format('MMMM YYYY')}
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

        {/* Display user profile picture with tooltip */}
        {user && (
          <Tooltip
            title={
              <div>
                <Typography variant="body2">
                  {`${user.name.givenName} ${user.name.familyName}`}
                </Typography>
                <Typography variant="caption">{user.emails[0].value}</Typography>
              </div>
            }
            arrow
          >
            <IconButton>
              <Avatar
                src={user.photos[0].value}
                alt={`${user.name.givenName} ${user.name.familyName}`}
                sx={{ width: 40, height: 40 }}
              />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
