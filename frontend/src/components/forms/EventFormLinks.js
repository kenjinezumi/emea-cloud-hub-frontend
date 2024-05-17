import React, { useState, useContext } from "react";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Snackbar,
  Chip,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LinkIcon from "@mui/icons-material/Link";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData"; // Ensure the correct path

const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

export default function LinksForm() {
  const { formData, selectedEvent, updateFormData } = useContext(GlobalContext);

  // Initialize state with default values or empty arrays if undefined
  const [links, setLinks] = useState({
    LandingPageLinks:
      selectedEvent?.landingPageLinks || formData?.landingPageLinks || [],
    SalesKitLinks:
      selectedEvent?.salesKitLinks || formData?.salesKitLinks || [],
    HailoLinks: selectedEvent?.hailoLinks || formData?.hailoLinks || [],
    OtherDocumentsLinks:
      selectedEvent?.otherDocumentsLinks || formData?.otherDocumentsLinks || [],
  });

  const [newLink, setNewLink] = useState({
    landingPage: "",
    salesKit: "",
    hailo: "",
    otherDocuments: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLinkChange = (type, value) => {
    setNewLink({ ...newLink, [type]: value });
  };

  const handleAddLink = (type) => {
    if (newLink[type] && isValidUrl(newLink[type])) {
      setLinks({
        ...links,
        [`${type}Links`]: [...links[`${type}Links`], newLink[type]],
      });
      setNewLink({ ...newLink, [type]: "" });
    } else {
      setSnackbarMessage("Invalid URL. Please enter a valid URL.");
      setSnackbarOpen(true);
      // setIsError(true);
    }
  };

  const handleDeleteLink = (type, linkToDelete) => {
    setLinks({
      ...links,
      [`${type}Links`]: links[`${type}Links`].filter(
        (link) => link !== linkToDelete
      ),
    });
  };

  const handlePrevious = () => {
    navigate("/audience"); // Adjust according to your route
  };

  const handleSave = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSaveAndPublish = async () => {
    const newFormData = { 
      ...formData, 
      ...links, 
      approved_for_customer_use: true,
      isDraft: false 
    };

    updateFormData(newFormData);

    try {
      const response = await sendDataToAPI(newFormData, "publish");
      if (response.success) {
        setSnackbarMessage("Details saved and published successfully!");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to save and publish.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving and publishing.");
      setSnackbarOpen(true);
    } finally {
      setDialogOpen(false);
      navigate("/"); // Navigate to the home page after saving
    }
  };

  const handleSaveAsDraft = async () => {
    const newFormData = {
      ...formData,
      ...links,
      isDraft: true,
    };

    updateFormData(newFormData);

    try {
      const response = await sendDataToAPI(newFormData, "draft");
      if (response.success) {
        setSnackbarMessage("Draft saved successfully!");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to save draft.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the draft.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
            Links
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(links).map(([key, value], index) => (
              <Grid item xs={12} key={key}>
                <Typography variant="subtitle1">
                  {key.replace("Links", "").replace(/([A-Z])/g, " $1")}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={newLink[key.replace("Links", "")]}
                  onChange={(e) =>
                    handleLinkChange(key.replace("Links", ""), e.target.value)
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            handleAddLink(key.replace("Links", ""))
                          }
                          edge="end"
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                />
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                    marginTop: "10px",
                  }}
                >
                  {value.map((link, linkIndex) => (
                    <Chip
                      key={linkIndex}
                      label={link}
                      onDelete={() =>
                        handleDeleteLink(key.replace("Links", ""), link)
                      }
                      color="primary"
                    />
                  ))}
                </div>
              </Grid>
            ))}
          </Grid>
          <div style={{ marginTop: "20px", float: "right" }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              style={{
                backgroundColor: "white",
                color: "#202124",
                border: "1px solid #dadce0",
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                float: "left",
                margin: "10px",
              }}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAsDraft}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "left",
                margin: "10px",
              }}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              style={{
                backgroundColor: blue[500],
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
            style: { backgroundColor: isError ? "red" : "green" },
          }}
        />
      </div>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Save and Publish"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The details you are saving need to be accurate because we are going
            to save it for customers. Are you sure you want to save and publish?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveAndPublish} color="primary" autoFocus>
            Save and Publish
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
