import CreateEventButton from './commons/CreateEventButton';
import SmallCalendar from './SmallCalendar';
import Labels from './Labels';
import GlobalContext from '../context/GlobalContext';
import React, {useContext} from 'react';


export default function Sidebar() {
  const {isSidebarOpen, currentView} = useContext(GlobalContext);

  if (!isSidebarOpen) {
    return null; 
  }
  return (
    <aside className="p-3 bg-white" style={{width: '15%', maxWidth:'40vh',  maxHeight: '100vh', 
    overflowY: 'auto'}}>
      <CreateEventButton />
      <SmallCalendar />
      {<Labels />}
    </aside>
  );
}
