import React, { useState, useContext,useEffect } from "react";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";

import { Button, TextField, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import {ReactComponent as LinksLogo} from '../../assets/svg/links.svg';
import { sendDataToAPI } from '../../api/pushData'; // Adjust the path as per your project structure

export default function LinksForm() {
  const [landingPageLink, setLandingPageLink] = useState('');
  const [salesKitLink, setSalesKitLink] = useState('');
  const [hailoLink, setHailoLink] = useState('');
  const [otherDocumentsLink, setOtherDocumentsLink] = useState('');
  const navigate = useNavigate();

  const { formData, updateFormData } = useContext(GlobalContext);



  const handleFinalSave = () => {
    // Merge current form data with previous form data
    const FinalFormData = {
      ...formData,
      landingPageLink,
      salesKitLink,
      hailoLink,
      otherDocumentsLink
    };
    sendDataToAPI(FinalFormData)
      .then(response => {
        console.log('Data sent successfully:', response);
        // Clear the cache if needed, navigate to a success page, etc.
        localStorage.removeItem("formData");
        // navigate('/success'); // Navigate to success page or next route
      })
      .catch(error => {
        console.error('Error sending data:', error);
      });
  };

  const handlePrevious = () => {
    navigate('/audience'); // Adjust according to your route
  };

  // Render the form
  return (
    <div className="h-screen flex flex-col">
    <CalendarHeaderForm />
    <div className="form-container">
        <div className="event-form"> 
        <Typography variant="h4" className="form-title" style={{ display: 'flex', alignItems: 'center', marginBottom:'40px' }}>
      <LinksLogo style={{ marginRight: '8px', width:'40px', height:'40px' }} />

      Links
      </Typography>      
      <Grid container spacing={2}>
        <Grid item xs={12}>
        <Typography variant="subtitle1">Link to landing page</Typography>

          <TextField
            label="Link to Landing Page"
            value={landingPageLink}
            onChange={(e) => setLandingPageLink(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
        <Typography variant="subtitle1">Sales kit link</Typography>

          <TextField
            label="Sales Kit Link"
            value={salesKitLink}
            onChange={(e) => setSalesKitLink(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
        <Typography variant="subtitle1">Hailo link</Typography>

          <TextField
            label="Hailo Link"
            value={hailoLink}
            onChange={(e) => setHailoLink(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
        <Typography variant="subtitle1">Other documents</Typography>

          <TextField
            label="Other Documents Link"
            value={otherDocumentsLink}
            onChange={(e) => setOtherDocumentsLink(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        </Grid>
      </Grid>
      <div style={{ marginTop: '20px', float: 'right' }}>
        <Button variant="outlined" onClick={handlePrevious} style={{
              backgroundColor: "white",
              color: "#202124", // Google's typical text color
              border: "1px solid #dadce0", // Google's border color
              boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
              float: "left", // Changed to 'left' to separate it from the 'Next' button
              margin: "10px",
            }}>
          Previous
        </Button>
        <Button color="primary" variant="contained" onClick={handleFinalSave}   style={{ backgroundColor: '#4285F4', color: 'white', float: 'right', margin: '10px' }}
>
          Save
        </Button>
      </div>
      </div>
    </div>
    </div>
  );
}
