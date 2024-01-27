import React, { useContext, useEffect } from "react";
import dayjs from "dayjs";
import MonthView from "./MonthView";
import { createYearData } from '../../util';
import GlobalContext from '../../context/GlobalContext';
import { Grid, Typography } from '@mui/material';
import '../styles/Yearview.css'
import { useLocation } from 'react-router-dom';


export default function YearView() {
  const { daySelected,setShowEventModal, setDaySelected} = useContext(GlobalContext);
  const year = daySelected.year();
  const yearData = createYearData(year);
  const handleAddEvent = (monthIndex) => {
    const selectedMonth = dayjs(new Date(year, monthIndex));
    setDaySelected(selectedMonth);
    setShowEventModal(true);
  };

  const location = useLocation(); // useLocation hook

  useEffect(() => {
   
    setShowEventModal(false);
  
}, [location]);

  return (
      <div style={{ padding: 16, marginLeft: '40px', width:'90%', align:'center'}} >
          <Typography variant="h6" align="center" gutterBottom style={{ marginBottom:'20px'}}>
              Year Overview - {year}
          </Typography>
          <Grid container spacing={8}> {/* Increase spacing */}
              {yearData.map((month, index) => (
                  <Grid key={index} item xs={12} sm={6} md={4}>
 <div   
              onClick={() => handleAddEvent(index)} // Add event handler
              style={{ cursor: 'pointer' }} // Make it look clickable
            >                      <Typography  align="center" style={{ marginBottom: 4 }}>
                          {dayjs(new Date(year, index)).format("MMMM")}
                      </Typography>
                      <div style={{ padding: 2}}> {/* Additional styling */}
                          <MonthView 
                          month={month} 
                          daySelected={daySelected} 
                          isYearView={true} />
                      </div>
                      </div>
                  </Grid>
              ))}
          </Grid>
      </div>
  );
}
