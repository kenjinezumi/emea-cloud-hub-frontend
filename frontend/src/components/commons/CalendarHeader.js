import dayjs from 'dayjs';
import React, {useContext, useState} from 'react';
import logo from '../../assets/logo/logo.png';
import MenuIcon from '@mui/icons-material/Menu';
import beta from '../../assets/svg/beta.svg';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import {eventTypeOptions} from '../filters/FiltersData';
import Input from '@mui/material/Input';
import {useNavigate} from 'react-router-dom';

import {Select, MenuItem, Menu} from '@mui/material';
import GlobalContext from '../../context/GlobalContext';
import ThemePopup from '../popup/Themepopup';
import ListView from '../calendar/ListView';

import {getEventData} from '../../api/getEventData'; // Assuming this is your API call

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
    searchText, setSearchText} = useContext(GlobalContext);
  const [view, setView] = useState('month'); // State to manage the selected view
  const [isThemePopupOpen, setIsThemePopupOpen] = useState(false); // State for popup visibility
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
      // Call a function to set the search text and navigate to the list view
      handleSearchAction(searchText);
    }
  };

  // Function to trigger search action and navigate to the list view
  const handleSearchAction = (text) => {
    setSearchText(text);
    setCurrentView('list'); // Switch to list view when search is submitted
  };


  const handleColorLensClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  // Function to handle view change
  const handleViewChange = (event) => {
    const selectedView = event.target.value;
    setCurrentView(selectedView);
    setView(selectedView);
  };


  // Function to toggle theme popup
  const toggleThemePopup = () => {
    setIsThemePopupOpen(!isThemePopupOpen);
  };

  // Redirect to the home page
  const navigateToHome = () => {
    window.location.href = '/';
  };

  return (
    <header className="px-4 py-2 flex items-center justify-between border-b border-gray-300">
      <div className="flex items-center">
        {' '}
        {/* Group left items together */}
        <IconButton onClick={toggleSidebar} className="mr-2">
          <MenuIcon />
        </IconButton>
        <img src={logo} alt="calendar" className="mr-2 w-8 h-8 cursor-pointer" onClick={navigateToHome}/>
        <h1 className="mr-1 text-xl text-black  cursor-pointer" onClick={navigateToHome}>
          EMEA Cloud Hub
        </h1>
        <img src={beta} alt="beta" className="mr-4 w-12 h-12" />
        <button onClick={handleReset} className="border rounded py-2 px-4 mr-2">
          Today
        </button>
        <button onClick={handlePrevMonth}>
          <span className="material-icons-outlined cursor-pointer text-gray-600 mx-2">
            chevron_left
          </span>
        </button>
        <button onClick={handleNextMonth}>
          <span className="material-icons-outlined cursor-pointer text-gray-600 mx-2">
            chevron_right
          </span>
        </button>
        <h2 className="ml-4 text-xl text-black">
          {dayjs(new Date(dayjs().year(), monthIndex)).format('MMMM YYYY')}
        </h2>
      </div>


      <div className="flex items-center">


        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {eventTypeOptions.map((option, index) => (
            <MenuItem key={index} onClick={handleClose}>
              <span>{option}</span>
            </MenuItem>
          ))}
        </Menu>

        <Select
          value={currentView} // Use the currentView state to set the value
          onChange={handleViewChange}
          label="View"
          displayEmpty
          inputProps={{'aria-label': 'Without label'}}
          sx={{width: '100px'}} // Adjust the width as needed
          className="mr-2"
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
          />
        )}
        <IconButton onClick={handleSearchIconClick} className="mr-2">
          <SearchIcon />
        </IconButton>
        {/* { <IconButton onClick={toggleThemePopup} className="mr-2">
          <SettingsIcon />
        </IconButton> }
        {isThemePopupOpen && (
        <ThemePopup onClose={toggleThemePopup} />
      )}  */}
      </div>
    </header>
  );
}
