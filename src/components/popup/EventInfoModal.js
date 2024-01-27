import React, { useContext } from 'react';
import GlobalContext from '../../context/GlobalContext';

export default function EventInfoPopup() {
    const { showEventInfoModal, setShowInfoEventModal } = useContext(GlobalContext);

  console.log('there we is')
  const { selectedEvent, setSelectedEvent } = useContext(GlobalContext);

  const handleClose = () => {
    setSelectedEvent(null); // Close the pop-up by setting selectedEvent to null
  };

  if (!selectedEvent) {
    return null; // Don't render the pop-up if no event is selected
  }

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center" style={{ zIndex: 6000 }}>
    <div className="bg-white rounded-lg shadow-md w-1/4">
      <header className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <span className="text-gray-600 font-semibold">{selectedEvent.title} checkme</span>
       
      </header>
      <div className="text-gray-700 text-sm mb-2 p-3">
      {selectedEvent.description}      </div>
      <footer className="flex justify-end border-t p-3">
      </footer>
    </div>
    </div>
  );
}
