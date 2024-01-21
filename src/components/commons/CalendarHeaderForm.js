import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/svg/logo.svg";
import beta from "../../assets/svg/beta.svg";
import { ReactComponent as LocationLogo } from "../../assets/svg/location.svg";
import { ReactComponent as InformationLogo } from "../../assets/svg/information.svg";
import {ReactComponent as UsersLogo} from '../../assets/svg/users.svg';
import {ReactComponent as LinksLogo} from '../../assets/svg/links.svg';
import { useLocation } from "react-router-dom";

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
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.15"
              d="M4 19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V11H4V19Z"
              fill="#001A72"
            />
            <path
              d="M15 3V7M9 3V7M4 11H20M20 11V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V11Z"
              stroke="#001A72"
            />
          </svg>
        </span>{" "}
        <span>About</span>
      </button>
      <button
        onClick={() => navigateTo("/location")}
        className={`block w-full text-left p-2 rounded flex items-center ${
          isCurrentPath('/location') ? 'text-black' : 'text-gray-400'
        }`}      >
        <span className="mr-2">
          <LocationLogo style={{ width: "20px", height: "20px" }} />
        </span>
        <span>Location</span>
      </button>
      <button
        onClick={() => navigateTo("/extra")}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/extra') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
        <InformationLogo style={{ width: "20px", height: "20px" }} />
        </span>
        <span>Extra details</span>
      </button>

      <button
        onClick={() => navigateTo("/audience")}
        className={`block w-full text-left p-2 rounded flex items-center ${
          isCurrentPath('/audience')  ? 'text-black' : 'text-gray-400'
        }`}
      >
        <span className="mr-2">
        <UsersLogo style={{ width:'20px', height:'20px' }} />
        </span>
        <span>Audience</span>
      </button>

      <button
        onClick={() => navigateTo("/links")}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/links') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
        <LinksLogo style={{  width:'20px', height:'20px' }} />
        </span>
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

  return (
    <>
      <NavigationSidebar />
      <header className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="calendar" className="mr-2 w-12 h-12" />
          <h1 className="mr-10 text-xl text-gray-500 font-bold">
            EMEA Cloud Hub
          </h1>
          <img src={beta} alt="beta" className="mr-2 w-12 h-12" />
        </div>
      </header>
    </>
  );
}
