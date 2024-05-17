import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { blue } from '@mui/material/colors';
import GlobalContext from "../../context/GlobalContext"; // Import GlobalContext

const NavigationSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, updateFormData } = useContext(GlobalContext); // Get form data and update function from context

  const navigateTo = (path, currentFormData) => {
    updateFormData({ ...formData, ...currentFormData }); // Save current form data to global context
    console.log("Initial form data:", JSON.stringify(formData, null, 2));

    navigate(path);
  };

  const handleCancel = () => {
    const userConfirmed = window.confirm('Are you sure you want to leave this page?');
    if (userConfirmed) {
      window.location.href = '/';
    }
    navigate('/');
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-60 bg-white shadow-md p-4">
      <div className="text-lg mb-2">Sections</div>{' '}
      <button
        onClick={() => navigateTo('/create-event', { /* add current form data here */ })}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/create-event') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
          <CalendarMonthIcon style={{ color: blue[500] }} />
        </span>{' '}
        <span>About</span>
      </button>
      <button
        onClick={() => navigateTo('/location', { /* add current form data here */ })}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/location') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
          <LocationOnIcon style={{ color: blue[500] }} />
        </span>
        <span>Location</span>
      </button>
      <button
        onClick={() => navigateTo('/extra', { /* add current form data here */ })}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/extra') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
          <InfoIcon style={{ color: blue[500] }} />
        </span>
        <span>Extra details</span>
      </button>
      <button
        onClick={() => navigateTo('/audience', { /* add current form data here */ })}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/audience') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
          <PeopleIcon style={{ color: blue[500] }} />
        </span>
        <span>Audience</span>
      </button>
      <button
        onClick={() => navigateTo('/links', { /* add current form data here */ })}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/links') ? 'text-black' : 'text-gray-400'}`}
      >
        <span className="mr-2">
          <LinkIcon style={{ color: blue[500] }} />
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

export default NavigationSidebar;
