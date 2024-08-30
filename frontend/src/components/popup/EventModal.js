import React, { useContext } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { useNavigate } from 'react-router-dom';

export default function EventModal() {
  const { setShowEventModal, resetFormData } = useContext(GlobalContext);
  const navigate = useNavigate();

  const handleAddEventClick = () => {
    resetFormData(); // Reset form data
    navigate('/create-event'); // Redirect to event creation route
    setShowEventModal(false); // Close the modal
  };

  return (
    <div
      className="h-screen w-full fixed left-0 top-0 flex justify-center items-center bg-black bg-opacity-40"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-lg shadow-lg w-1/4">
        <header className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b border-gray-300">
          <span className="text-gray-700 font-medium text-lg">Add Event</span>
          <button
            onClick={() => setShowEventModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </header>
        <div className="p-4">
          <p className="text-gray-600 text-sm">
            Do you want to add an event?
          </p>
        </div>
        <footer className="flex justify-end border-t border-gray-300 p-4">
          <button
            onClick={handleAddEventClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            Add
          </button>
        </footer>
      </div>
    </div>
  );
}
