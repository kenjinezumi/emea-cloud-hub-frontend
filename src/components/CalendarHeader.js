import dayjs from "dayjs";
import React, { useContext, useState } from "react";
import logo from "../assets/svg/logo.svg";
import hamburger from "../assets/svg/hamburger.svg";
import beta from "../assets/svg/beta.svg";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { Select, MenuItem } from "@mui/material";
import ThemePopup from "./Themepopup"; // Import the popup component
import GlobalContext from "../context/GlobalContext";
export default function CalendarHeader() {
  const {
    monthIndex,
    setMonthIndex,
    daySelected,
    setDaySelected,
    toggleSidebar,
    setCurrentView,
  } = useContext(GlobalContext);
  const [view, setView] = useState("day"); // State to manage the selected view
  // const [isThemePopupOpen, setIsThemePopupOpen] = useState(false); // State for popup visibility

  function handlePrevMonth() {
    if (monthIndex === 0) {
      setDaySelected(daySelected.subtract(1, "year").month(11));
      setMonthIndex(11);
    } else {
      setDaySelected(daySelected.subtract(1, "month"));
      setMonthIndex(monthIndex - 1);
    }
  }

  function handleNextMonth() {
    if (monthIndex === 11) {
      setDaySelected(daySelected.add(1, "year").month(0));
      setMonthIndex(0);
    } else {
      setDaySelected(daySelected.add(1, "month"));
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
  // const toggleThemePopup = () => {
  //   setIsThemePopupOpen(!isThemePopupOpen);
  // };

  return (
    <header className="px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        {" "}
        {/* Group left items together */}
        <img
          src={hamburger}
          alt="hamburger"
          className="mr-2 w-12 h-12"
          onClick={toggleSidebar}
        />
        <img src={logo} alt="calendar" className="mr-2 w-12 h-12" />
        <h1 className="mr-10 text-xl text-gray-500 fond-bold">Calendar</h1>
        <img src={beta} alt="beta" className="mr-2 w-12 h-12" />
        <button onClick={handleReset} className="border rounded py-2 px-4 mr-5">
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
        <h2 className="ml-4 text-xl text-gray-500 font-bold">
          {dayjs(new Date(dayjs().year(), monthIndex)).format("MMMM YYYY")}
        </h2>
      </div>

      <div className="flex items-center">
        <Select
          value={view}
          onChange={handleViewChange}
          label="View"
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          sx={{ width: "100px" }} // Adjust the width as needed
          className="mr-2"
        >
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="week">Week</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
          <MenuItem value="list">List</MenuItem>
        </Select>
        <IconButton className="mr-2">
          <SearchIcon />
        </IconButton>
        {/* <IconButton onClick={toggleThemePopup} className="mr-2">
          <SettingsIcon />
        </IconButton> */}
        {/* {isThemePopupOpen && (
        <ThemePopup onClose={toggleThemePopup} />
      )} */}
      </div>
    </header>
  );
}
