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
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-lg shadow-md w-1/4">
        <header className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Add Event</span>
          <button onClick={() => setShowEventModal(false)}>
            <span className="material-icons-outlined text-gray-600 hover:text-gray-800">close</span>
          </button>
        </header>
        <div className="text-gray-700 text-sm mb-2 p-3">
          Do you want to add an event?
        </div>
        <footer className="flex justify-end border-t p-3">
          <button
            onClick={handleAddEventClick}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white"
          >
            Add
          </button>
        </footer>
      </div>
    </div>
  );
}
