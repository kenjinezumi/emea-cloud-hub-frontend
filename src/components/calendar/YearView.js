import React, { useContext } from "react";
import dayjs from "dayjs";
import MonthView from "./MonthView";
import { createYearData } from '../../util';
import GlobalContext from '../../context/GlobalContext';
import { Grid, Typography } from '@mui/material';
import '../styles/Yearview.css'

export default function YearView() {
  const { daySelected } = useContext(GlobalContext);
  const year = daySelected.year();
  const yearData = createYearData(year);

  return (
      <div style={{ padding: 16, marginLeft: '40px', width:'80%', align:'center'}} >
          <Typography variant="h4" align="center" gutterBottom>
              Year Overview - {year}
          </Typography>
          <Grid container spacing={8}> {/* Increase spacing */}
              {yearData.map((month, index) => (
                  <Grid key={index} item xs={12} sm={6} md={4}>
                      {/* Month name */}
                      <Typography variant="h6" align="center" style={{ marginBottom: 8 }}>
                          {dayjs(new Date(year, index)).format("MMMM")}
                      </Typography>
                      <div style={{ padding: 8}}> {/* Additional styling */}
                          <MonthView month={month} daySelected={daySelected} isYearView={true} />
                      </div>
                  </Grid>
              ))}
          </Grid>
      </div>
  );
}
