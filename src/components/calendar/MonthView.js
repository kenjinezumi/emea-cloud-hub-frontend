import Day from "../Day";
import React, { useContext, useEffect } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { useLocation } from 'react-router-dom';


export default function MonthView({ month, isYearView = false }) {
  const numRows = Math.ceil(month.length / 7);
  const gridClass = isYearView ? 'year-grid' : 'flex-1 grid grid-cols-7 grid-rows-5';
  const { showEventModal, daySelected, setShowEventModal, setDaySelected } = useContext(GlobalContext);

  const location = useLocation(); // useLocation hook
  
  useEffect(() => {
   
      setShowEventModal(false);
    
  }, [location]);
  return (
    <div className={gridClass}>
      {month.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, idx) => (
            <Day day={day} key={idx} rowIdx={i} isYearView={isYearView} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}