import React, { useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import logo from "../../assets/logo/logo.png";
import MenuIcon from "@mui/icons-material/Menu";
import beta from "../../assets/svg/beta.svg";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {
  Select,
  MenuItem,
  Typography,
  Input,
  Tooltip,
  Avatar,
  Popover,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import versionInfo from "../../version.json";
import { getEventData } from "../../api/getEventData";
import { blue } from "@mui/material/colors";

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

  const [view, setView] = useState(currentView || "month");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [user, setUser] = useState(null); // State to store user data
  const [anchorEl, setAnchorEl] = useState(null); // State for managing popover anchor
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    setView(currentView);
  }, [currentView]);

  const fetchData = async () => {
    try {
      const eventData = await getEventData("eventDataQuery");
      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching event data:", error);
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
    setCurrentView("list");
  };

  function updateSelectedDate(newDate) {
    setDaySelected(newDate);
    setMonthIndex(newDate.month());
  }

  function handlePrev() {
    let newDaySelected;
    switch (view) {
      case "day":
        newDaySelected = daySelected.subtract(1, "day");
        break;
      case "week":
        newDaySelected = daySelected.subtract(1, "week");
        break;
      case "month":
        newDaySelected =
          monthIndex === 0
            ? daySelected.subtract(1, "year").month(11)
            : daySelected.subtract(1, "month");
        break;
      case "year":
        newDaySelected = daySelected.subtract(1, "year");
        break;
      default:
        return;
    }
    setDaySelected(newDaySelected);
    setMonthIndex(newDaySelected.month());
  }

  function handleNext() {
    let newDaySelected;
    switch (view) {
      case "day":
        newDaySelected = daySelected.add(1, "day");
        break;
      case "week":
        newDaySelected = daySelected.add(1, "week");
        break;
      case "month":
        newDaySelected =
          monthIndex === 11
            ? daySelected.add(1, "year").month(0)
            : daySelected.add(1, "month");
        break;
      case "year":
        newDaySelected = daySelected.add(1, "year");
        break;
      default:
        return;
    }

    setDaySelected(newDaySelected);
    setMonthIndex(newDaySelected.month());
  }

  const handleYearChange = (newYear) => {
    setDaySelected(daySelected.year(newYear));
  };

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
    window.location.href = "/";
  };

  // Handle opening and closing of the profile popover
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // "Clear the cache" button
  const handleClearCache = () => {
    localStorage.removeItem("persistedFilters");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const open = Boolean(anchorEl);
  const id = open ? "profile-popover" : undefined;

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
          style={{ maxWidth: "200px", textOverflow: "ellipsis" }}
          onClick={navigateToHome}
        >
          One Cloud
        </h1>
        <img src={beta} alt="beta" className="w-8 h-8" />

        <button onClick={handleReset} className="border rounded py-2 px-4 mr-2">
          Today
        </button>
        <IconButton onClick={handlePrev}>
          <span className="material-icons-outlined text-gray-600">
            chevron_left
          </span>
        </IconButton>
        <IconButton onClick={handleNext}>
          <span className="material-icons-outlined text-gray-600">
            chevron_right
          </span>
        </IconButton>
        <Typography variant="h6" className="text-lg font-semibold">
          {daySelected.format("MMMM YYYY")}
        </Typography>
      </div>

      <div className="flex items-center space-x-4">
        {showSearchInput && (
          <Input
            placeholder="Search events..."
            value={searchText}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
            sx={{ width: 200 }}
          />
        )}

        <IconButton onClick={handleSearchIconClick}>
          <SearchIcon />
        </IconButton>

        <Select
          value={currentView}
          onChange={handleViewChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="week">Week</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
          <MenuItem value="list">List</MenuItem>
        </Select>

        {/* Display user profile picture with tooltip and popover */}
        {user && (
          <>
            <Tooltip
              title={
                <div>
                  <Typography variant="body2">
                    {`${user.name.givenName} ${user.name.familyName}`}
                  </Typography>
                  <Typography variant="caption">
                    {user.emails[0].value}
                  </Typography>
                </div>
              }
              arrow
            >
              <IconButton onClick={handleProfileClick}>
                <Avatar
                  src={
                    user.photos && user.photos.length > 0
                      ? user.photos[0].value
                      : null
                  }
                  alt={`${user.name.givenName} ${user.name.familyName}`}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: blue[500],
                    color: "white",
                  }}
                >
                  {/* Fallback: First letter of first name */}
                  {!user.photos || user.photos.length === 0
                    ? user.name.givenName[0]
                    : null}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <div style={{ padding: "10px", minWidth: "200px" }}>
                <Typography variant="body2">
                  {`${user.name.givenName} ${user.name.familyName}`}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user.emails[0].value}
                </Typography>

                {/* Feedback and TVC Access buttons */}
                <Box style={{ marginTop: "10px" }}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() =>
                      window.open("https://feedback-link.com", "_blank")
                    }
                    sx={{
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    Got Feedback?
                    <span className="material-icons">chevron_right</span>
                  </Button>

                  <Button
                    variant="text"
                    color="primary"
                    onClick={() =>
                      window.open("https://tvcaccess-link.com", "_blank")
                    }
                    sx={{
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    TVC Access
                    <span className="material-icons">chevron_right</span>
                  </Button>

                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => window.open("http://go/playbook", "_blank")}
                    sx={{
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    Playboook &amp; Enablement
                    <span className="material-icons">chevron_right</span>
                  </Button>
                </Box>

                {/* Our new "Clear the cache" button, followed by Logout */}
                <div style={{ marginTop: "10px" }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleClearCache}
                    sx={{ marginRight: 1 }}
                  >
                    Clear the cache
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>

                {/* <div style={{ marginTop: "10px" }}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => {
                      handlePopoverClose();
                      navigate("/data-extract");
                    }}
                    sx={{
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    Data Extract
                    <span className="material-icons">chevron_right</span>
                  </Button>
                </div> */}
              </div>
            </Popover>
          </>
        )}
      </div>
    </header>
  );
}
