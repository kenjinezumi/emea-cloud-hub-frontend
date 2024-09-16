import CreateEventButton from './commons/CreateEventButton';
import SmallCalendar from './SmallCalendar';
import Labels from './Labels';
import GlobalContext from '../context/GlobalContext';
import React, {useContext} from 'react';


export default function Sidebar() {
  const {isSidebarOpen, currentView} = useContext(GlobalContext);

  if (!isSidebarOpen) {
    return null; // or return some minimized version of the sidebar
  }
  return (
    <aside className="p-3 bg-white" style={{width: '15%', maxWidth:'40vh',  maxHeight: '100vh', // or another fixed value like '500px'
    overflowY: 'auto'}}>
      <CreateEventButton />
      <SmallCalendar />
      {currentView !== 'list' && <Labels />}
    </aside>
  );
}
