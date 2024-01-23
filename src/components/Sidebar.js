import CreateEventButton from "./commons/CreateEventButton";
import SmallCalendar from "./SmallCalendar";
import Labels from "./Labels";
import GlobalContext from "../context/GlobalContext";
import React, { useContext } from "react";


export default function Sidebar() {
  const { isSidebarOpen } = useContext(GlobalContext);

  if (!isSidebarOpen) {
    return null; // or return some minimized version of the sidebar
  }
  return (
    <aside className="p-3 bg-white" style={{width:'15%'}}>
      <CreateEventButton />
      <SmallCalendar />
      <Labels />
    </aside>
  );
}
