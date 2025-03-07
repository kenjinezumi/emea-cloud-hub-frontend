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
  const [anchorEl, setAnchorEl] = useState(null); // State for managing the popover anchor
  const navigate = useNavigate();

  // -------------------------------------
  //  Helper: Send GA event if gtag exists
  // -------------------------------------
  const sendGAEvent = (eventName, params = {}) => {
    if (window && window.gtag) {
      window.gtag("event", eventName, params);
    }
  };

  // -------------------------------------
  //  On mount: Fetch user data from localStorage
  // -------------------------------------
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // -------------------------------------
  //  Keep local 'view' in sync with the context
  // -------------------------------------
  useEffect(() => {
    setView(currentView);
  }, [currentView]);

  // -------------------------------------
  //  Fetch events from API
  // -------------------------------------
  const fetchData = async () => {
    try {
      const eventData = await getEventData("eventDataQuery");
      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  // -------------------------------------
  //  Toggling the search input icon
  // -------------------------------------
  const handleSearchIconClick = () => {
    sendGAEvent("toggle_search_input", {
      event_category: "CalendarHeader",
      event_label: showSearchInput ? "Hide" : "Show",
    });
    setShowSearchInput(!showSearchInput);
  };

  // -------------------------------------
  //  Handle search input change
  // -------------------------------------
  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  // -------------------------------------
  //  Handle search submission
  // -------------------------------------
  const handleSearchSubmit = async () => {
    sendGAEvent("search_submit", {
      event_category: "CalendarHeader",
      search_query: searchText || "(none)",
    });
    await fetchData();
    if (searchText) {
      handleSearchAction(searchText);
    }
  };

  // -------------------------------------
  //  Perform the actual search action
  // -------------------------------------
  const handleSearchAction = (text) => {
    sendGAEvent("search_action", {
      event_category: "CalendarHeader",
      search_query: text,
    });
    setSearchText(text);
    setCurrentView("list"); // Switch to list view after searching
  };

  // -------------------------------------
  //  Navigation: Previous
  // -------------------------------------
  function handlePrev() {
    sendGAEvent("nav_prev", {
      event_category: "CalendarNav",
      current_view: view,
    });

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

  // -------------------------------------
  //  Navigation: Next
  // -------------------------------------
  function handleNext() {
    sendGAEvent("nav_next", {
      event_category: "CalendarNav",
      current_view: view,
    });

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

  // -------------------------------------
  //  Reset: "Today" button
  // -------------------------------------
  function handleReset() {
    sendGAEvent("reset_to_today", {
      event_category: "CalendarNav",
    });

    const today = dayjs();
    setDaySelected(today);
    setMonthIndex(today.month());
  }

  // -------------------------------------
  //  Dropdown view change
  // -------------------------------------
  const handleViewChange = (event) => {
    const selectedView = event.target.value;
    sendGAEvent("view_change", {
      event_category: "CalendarNav",
      selected_view: selectedView,
    });

    setCurrentView(selectedView);
    setView(selectedView);
    setMonthIndex(daySelected.month());
  };

  // -------------------------------------
  //  Toggle sidebar
  // -------------------------------------
  const handleToggleSidebar = () => {
    sendGAEvent("toggle_sidebar", {
      event_category: "CalendarHeader",
    });
    toggleSidebar();
  };

  // -------------------------------------
  //  Navigate to Home
  // -------------------------------------
  const navigateToHome = () => {
    sendGAEvent("navigate_home", {
      event_category: "CalendarHeader",
    });
    window.location.href = "/";
  };

  // -------------------------------------
  //  Profile popover open
  // -------------------------------------
  const handleProfileClick = (event) => {
    sendGAEvent("open_profile_popover", {
      event_category: "Profile",
    });
    setAnchorEl(event.currentTarget);
  };

  // -------------------------------------
  //  Profile popover close
  // -------------------------------------
  const handlePopoverClose = () => {
    sendGAEvent("close_profile_popover", {
      event_category: "Profile",
    });
    setAnchorEl(null);
  };

  // -------------------------------------
  //  Clear cache
  // -------------------------------------
  const handleClearCache = () => {
    sendGAEvent("clear_cache", {
      event_category: "Profile",
    });
    localStorage.removeItem("persistedFilters");
  };

  // -------------------------------------
  //  Logout
  // -------------------------------------
  const handleLogout = () => {
    sendGAEvent("logout", {
      event_category: "Profile",
    });
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  // -------------------------------------
  //  External links: Feedback, TVC, Playbook
  // -------------------------------------
  const handleOpenFeedback = () => {
    sendGAEvent("click_feedback_link", {
      event_category: "Profile",
      link_url: "https://feedback-link.com",
    });
    window.open("https://feedback-link.com", "_blank");
  };

  const handleOpenTVC = () => {
    sendGAEvent("click_tvc_link", {
      event_category: "Profile",
      link_url: "https://tvcaccess-link.com",
    });
    window.open("https://tvcaccess-link.com", "_blank");
  };

  const handleOpenPlaybook = () => {
    sendGAEvent("click_playbook_link", {
      event_category: "Profile",
      link_url: "http://go/playbook",
    });
    window.open("http://go/playbook", "_blank");
  };

  // -------------------------------------
  //  Popover state
  // -------------------------------------
  const open = Boolean(anchorEl);
  const id = open ? "profile-popover" : undefined;

  // -------------------------------------
  //  Render
  // -------------------------------------
  return (
    <header className="flex items-center justify-between border-b border-gray-300 bg-white px-4 py-2">
      <div className="flex items-center space-x-4 overflow-hidden">
        {/* Toggle Sidebar (CTA) */}
        <IconButton onClick={handleToggleSidebar}>
          <MenuIcon />
        </IconButton>

        {/* Logo + Title (CTA) */}
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

        {/* "Today" Button (CTA) */}
        <button onClick={handleReset} className="border rounded py-2 px-4 mr-2">
          Today
        </button>

        {/* Previous (CTA) */}
        <IconButton onClick={handlePrev}>
          <span className="material-icons-outlined text-gray-600">
            chevron_left
          </span>
        </IconButton>

        {/* Next (CTA) */}
        <IconButton onClick={handleNext}>
          <span className="material-icons-outlined text-gray-600">
            chevron_right
          </span>
        </IconButton>

        {/* Current Month/Year Display */}
        <Typography variant="h6" className="text-lg font-semibold">
          {daySelected.format("MMMM YYYY")}
        </Typography>
      </div>

      <div className="flex items-center space-x-4">
        {/* Show or hide search input */}
        {showSearchInput && (
          <Input
            placeholder="Search events..."
            value={searchText}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
            sx={{ width: 200 }}
          />
        )}

        {/* Search Icon (CTA) */}
        <IconButton onClick={handleSearchIconClick}>
          <SearchIcon />
        </IconButton>

        {/* Dropdown View Selector (CTA) */}
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
          <MenuItem value="extract">Export data</MenuItem>

        </Select>

        {/* User Profile & Popover */}
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
                  {/* Fallback: First letter of first name if no photo */}
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

                <Box style={{ marginTop: "10px" }}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleOpenFeedback}
                    sx={{ justifyContent: "space-between", width: "100%" }}
                  >
                    Got Feedback?
                    <span className="material-icons">chevron_right</span>
                  </Button>

                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleOpenTVC}
                    sx={{ justifyContent: "space-between", width: "100%" }}
                  >
                    TVC Access
                    <span className="material-icons">chevron_right</span>
                  </Button>

                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleOpenPlaybook}
                    sx={{ justifyContent: "space-between", width: "100%" }}
                  >
                    Playboook &amp; Enablement
                    <span className="material-icons">chevron_right</span>
                  </Button>
                </Box>

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
              </div>
            </Popover>
          </>
        )}
      </div>
    </header>
  );
}
