import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";

import { Button, TextField, Typography, Grid, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import { sendDataToAPI } from "../../api/pushData"; // Adjust the path as per your project structure
import LinkIcon from "@mui/icons-material/Link";
import { blue } from "@mui/material/colors";

export default function LinksForm() {
  const { formData, updateFormData } = useContext(GlobalContext);

  const [landingPageLink, setLandingPageLink] = useState(
    formData.landingPageLink || ""
  );
  const [salesKitLink, setSalesKitLink] = useState(formData.salesKitLink || "");
  const [hailoLink, setHailoLink] = useState(formData.hailoLink || "");
  const [otherDocumentsLink, setOtherDocumentsLink] = useState(
    formData.otherDocumentsLink || ""
  );
  const navigate = useNavigate();

  const handleFinalSave = async () => {
  // Merge current form data with previous form data
  const FinalFormData = {
    ...formData,
    landingPageLink,
    salesKitLink,
    hailoLink,
    otherDocumentsLink,
  };

  console.log(formData);
  console.log(FinalFormData);

  try {
    const response = await sendDataToAPI(FinalFormData);

    if (response && !response.error) {
      setSnackbarMessage("Event successfully saved. Redirecting you to the main page...");
      setSnackbarOpen(true);
      setIsError(false);
      setTimeout(() => navigate("/"), 3000);
    } else {
      setSnackbarMessage("Error saving event. Please check the logs.");
      setSnackbarOpen(true);
      setIsError(true);
      console.error("Error sending data:", response);
    }
  } catch (error) {
    setSnackbarMessage("Error saving event. Please check the logs.");
    setSnackbarOpen(true);
    setIsError(true);
    console.error("Error sending data:", error);
  }
};


  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handlePrevious = () => {
    navigate("/audience"); // Adjust according to your route
  };

  // Render the form
  return (
    <div className="h-screen flex flex-col">
      <CalendarHeaderForm />
      <div className="form-container">
        <div className="event-form">
          <Typography
            variant="h4"
            className="form-title"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <LinkIcon
              style={{ marginRight: "10px", color: blue[500], height: "40px" }}
            />
            <span className="mr-1 text-xl text-black  cursor-pointer">
              Links
            </span>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Link to landing page</Typography>

              <TextField
                label=""
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
                label=""
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
                label=""
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
                label=""
                value={otherDocumentsLink}
                onChange={(e) => setOtherDocumentsLink(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
          <div style={{ marginTop: "20px", float: "right" }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              style={{
                backgroundColor: "white",
                color: "#202124", // Google's typical text color
                border: "1px solid #dadce0", // Google's border color
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                float: "left", // Changed to 'left' to separate it from the 'Next' button
                margin: "10px",
              }}
            >
              Previous
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handleFinalSave}
              style={{
                backgroundColor: "#4285F4",
                color: "white",
                float: "right",
                margin: "10px",
              }}
            >
              Save
            </Button>
          </div>
        </div>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          ContentProps={{
            style: {
              backgroundColor: isError ? "red" : "green",
            },
          }}
        />
      </div>
    </div>
  );
}
