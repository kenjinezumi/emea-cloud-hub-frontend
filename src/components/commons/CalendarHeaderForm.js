import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/svg/logo.svg";
import beta from "../../assets/svg/beta.svg";
import { ReactComponent as LocationLogo } from "../../assets/svg/location.svg";
import { ReactComponent as InformationLogo } from "../../assets/svg/information.svg";
import {ReactComponent as UsersLogo} from '../../assets/svg/users.svg';
import {ReactComponent as LinksLogo} from '../../assets/svg/links.svg';
import { useLocation } from "react-router-dom";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { blue } from "@mui/material/colors";


const NavigationSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (path) => {
    navigate(path);
  };

  const handleCancel = () => {
    // Navigate to the main calendar view
    navigate("/");
  };

  // Function to check if the current path matches the button's path
  const isCurrentPath = (path) => location.pathname === path;



  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-60 bg-white shadow-md p-4">
      <div className="text-lg font-semibold mb-2">Sections</div>{" "}
      <button
        onClick={() => navigateTo("/create-event")}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/create-event') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
        <CalendarMonthIcon
                    style={{color: blue[500] }}
                  />
        </span>{" "}
        <span>About</span>
      </button>
      <button
        onClick={() => navigateTo("/location")}
        className={`block w-full text-left p-2 rounded flex items-center ${
          isCurrentPath('/location') ? 'text-black' : 'text-gray-400'
        }`}      >
        <span className="mr-2">
        <LocationOnIcon
                    style={{color: blue[500] }}
                  />        </span>
        <span>Location</span>
      </button>
      <button
        onClick={() => navigateTo("/extra")}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/extra') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
        <InfoIcon
                    style={{color: blue[500] }}
                  />        </span>
        <span>Extra details</span>
      </button>

      <button
        onClick={() => navigateTo("/audience")}
        className={`block w-full text-left p-2 rounded flex items-center ${
          isCurrentPath('/audience')  ? 'text-black' : 'text-gray-400'
        }`}
      >
        <span className="mr-2">
        <PeopleIcon
                    style={{color: blue[500] }}
                  />        </span>
        <span>Audience</span>
      </button>

      <button
        onClick={() => navigateTo("/links")}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/links') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
        <LinkIcon
                    style={{color: blue[500] }}
                  />        </span>
        <span>Links</span>
      </button>

     
      <hr className="my-4" />
      <button
        onClick={handleCancel}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded text-red-500"
      >
        Cancel
      </button>
    </div>
  );
};

export default function CalendarHeaderForm() {
  const navigate = useNavigate();
  const navigateToHome = () => {
    // Redirect to the home page
    const userConfirmed = window.confirm("Are you sure you want to leave this page?");

    // If the user clicks "OK", redirect to the home page
    if (userConfirmed) {
      window.location.href = '/';
    }  };

  return (
    <>
      <NavigationSidebar />
      <header className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="calendar" className="mr-2 w-12 h-12" />
          <h1 className="mr-1 text-xl text-black  cursor-pointer" onClick={navigateToHome}>
          EMEA Cloud Hub
        </h1>  
          <img src={beta} alt="beta" className="mr-2 w-12 h-12" />
        </div>
      </header>
    </>
  );
}
