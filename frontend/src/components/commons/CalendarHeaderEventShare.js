import React from 'react';
import {useNavigate} from 'react-router-dom';
import logo from '../../assets/logo/logo.png';
import beta from '../../assets/svg/beta.svg';
import {useLocation} from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {blue} from '@mui/material/colors';

const NavigationSidebar = () => {
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-60 bg-white shadow-md p-4">
      <div className="text-lg mb-2">Sections</div>{' '}
      <button
        onClick={() => scrollToSection('about-section')}
        className="block w-full text-left p-2 rounded flex items-center"
      >
        <span className="mr-2">
          <CalendarMonthIcon style={{ color: blue[500] }} />
        </span>
        <span>About</span>
      </button>
      <button
        onClick={() => scrollToSection('location-section')}
        className="block w-full text-left p-2 rounded flex items-center"
      >
        <span className="mr-2">
          <LocationOnIcon style={{ color: blue[500] }} />
        </span>
        <span>Location</span>
      </button>
      <button
        onClick={() => scrollToSection('extra-details-section')}
        className="block w-full text-left p-2 rounded flex items-center"
      >
        <span className="mr-2">
          <InfoIcon style={{ color: blue[500] }} />
        </span>
        <span>Extra Details</span>
      </button>
      <button
        onClick={() => scrollToSection('audience-section')}
        className="block w-full text-left p-2 rounded flex items-center"
      >
        <span className="mr-2">
          <EmailIcon style={{ color: blue[500] }} />
        </span>
        <span>Email Invitation</span>
      </button>
      <button
        onClick={() => scrollToSection('email-invitation')}
        className="block w-full text-left p-2 rounded flex items-center"
      >
        <span className="mr-2">
          <PeopleIcon style={{ color: blue[500] }} />
        </span>
        <span>Audience</span>
      </button>
      <button
        onClick={() => scrollToSection('links-section')}
        className="block w-full text-left p-2 rounded flex items-center"
      >
        <span className="mr-2">
          <LinkIcon style={{ color: blue[500] }} />
        </span>
        <span>Links</span>
      </button>
      <hr className="my-4" />
     
    </div>
  );
};



export default function CalendarHeaderEventShare() {
  const navigate = useNavigate();
  const navigateToHome = () => {
    // Redirect to the home page
    const userConfirmed = window.confirm('Are you sure you want to leave this page?');

    // If the user clicks "OK", redirect to the home page
    if (userConfirmed) {
      window.location.href = '/';
    }
  };

  return (
    <>
          <NavigationSidebar />

      <header className="fixed px-4 py-2 flex items-center justify-between bg-white" style={{width: '100%', marginBottom: '100px'}}>
        <div className="flex items-center">
          <img src={logo} alt="calendar" className="mr-2 w-8 h-8 cursor-pointer" onClick={navigateToHome}/>
          <h1 className="mr-1 text-xl text-black  cursor-pointer" onClick={navigateToHome}>
          EMEA Cloud Hub
          </h1>
          <img src={beta} alt="beta" className="mr-2 w-12 h-12" />
        </div>
      </header>
    </>
  );
}
