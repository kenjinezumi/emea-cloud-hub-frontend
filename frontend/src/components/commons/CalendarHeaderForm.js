import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { blue } from '@mui/material/colors';
import GlobalContext from "../../context/GlobalContext";

const NavigationSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, updateFormData } = useContext(GlobalContext);

  const navigateTo = (path, currentFormData) => {
    updateFormData({ ...formData, ...currentFormData });
    console.log("Initial form data:", JSON.stringify(formData, null, 2));
    navigate(path);
  };

  const handleCancel = () => {
    const userConfirmed = window.confirm('Are you sure you want to leave this page?');
    if (userConfirmed) {
      window.location.href = '/';
    }
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-60 bg-white shadow-md p-4">
      <div className="text-lg mb-2">Sections</div>
      <button
        onClick={() => navigateTo('/create-event')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/create-event') ? 'text-black' : 'text-gray-400'}`}
      >
        <CalendarMonthIcon style={{ color: blue[500] }} />
        <span className="ml-2">About</span>
      </button>
      <button
        onClick={() => navigateTo('/location')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/location') ? 'text-black' : 'text-gray-400'}`}
      >
        <LocationOnIcon style={{ color: blue[500] }} />
        <span className="ml-2">Location</span>
      </button>
      <button
        onClick={() => navigateTo('/extra')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/extra') ? 'text-black' : 'text-gray-400'}`}
      >
        <InfoIcon style={{ color: blue[500] }} />
        <span className="ml-2">Extra details</span>
      </button>
      <button
        onClick={() => navigateTo('/email-invitation')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/email-invitation') ? 'text-black' : 'text-gray-400'}`}
      >
        <EmailIcon style={{ color: blue[500] }} />
        <span className="ml-2">Email Invitation</span>
      </button>
      <button
        onClick={() => navigateTo('/links')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/links') ? 'text-black' : 'text-gray-400'}`}
      >
        <LinkIcon style={{ color: blue[500] }} />
        <span className="ml-2">Links</span>
      </button>
      <hr className="my-4" />
      <button
        onClick={handleCancel}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded text-red-500"
      >
        Exit
      </button>
    </div>
  );
};

export default NavigationSidebar;
