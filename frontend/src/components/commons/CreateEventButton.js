// src/components/CreateEventButton.js
import React, { useContext } from 'react';
import plusImg from '../../assets/svg/addbutton.svg';
import GlobalContext from '../../context/GlobalContext';
import { useNavigate } from 'react-router-dom';

export default function CreateEventButton() {
  const { resetFormData } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    resetFormData();
    navigate('/create-event');
  };

  return (
    <button
      style={{ width: '190px', minWidth: '70px' }}
      onClick={handleButtonClick}
      className="border p-2 rounded-full flex items-center shadow-md bg-white hover:bg-blue-100 bg-opacity-50 hover:bg-opacity-50 transition-colors duration-150 ease-in-out"
    >
      <svg width="42" height="42" viewBox="0 0 36 36">
        <path fill="#34A853" d="M16 16v14h4V20z"></path>
        <path fill="#4285F4" d="M30 16H20l-4 4h14z"></path>
        <path fill="#FBBC05" d="M6 16v4h10l4-4z"></path>
        <path fill="#EA4335" d="M20 16V6h-4v14z"></path>
        <path fill="none" d="M0 0h36v36H0z"></path>
      </svg>
      <span className="pl-3 pr-7">Add event</span>
    </button>
  );
}
