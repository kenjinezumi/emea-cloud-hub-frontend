import React, { useState, useContext, useEffect } from "react";
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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LinkIcon from "@mui/icons-material/Link";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import "../styles/Forms.css";

// Helper function to validate URLs
const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

const formatLabel = (key) => {
  return key
    .replace("Links", " Links")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

export default function LinksForm() {
  const { formData, selectedEvent, updateFormData } = useContext(GlobalContext);
  const [links, setLinks] = useState({
    landingPageLinks:
      Array.isArray(formData?.landingPageLinks) && formData.landingPageLinks.length > 0
        ? formData.landingPageLinks.filter((link) => link) // Filter out empty links
        : Array.isArray(selectedEvent?.landingPageLinks) && selectedEvent.landingPageLinks.length > 0
        ? selectedEvent.landingPageLinks.filter((link) => link) // Filter out empty links
        : [],
    salesKitLinks:
      Array.isArray(formData?.salesKitLinks) && formData.salesKitLinks.length > 0
        ? formData.salesKitLinks.filter((link) => link)
        : Array.isArray(selectedEvent?.salesKitLinks) && selectedEvent.salesKitLinks.length > 0
        ? selectedEvent.salesKitLinks.filter((link) => link)
        : [],
    hailoLinks:
      Array.isArray(formData?.hailoLinks) && formData.hailoLinks.length > 0
        ? formData.hailoLinks.filter((link) => link)
        : Array.isArray(selectedEvent?.hailoLinks) && selectedEvent.hailoLinks.length > 0
        ? selectedEvent.hailoLinks.filter((link) => link)
        : [],
    otherDocumentsLinks:
      Array.isArray(formData?.otherDocumentsLinks) && formData.otherDocumentsLinks.length > 0
        ? formData.otherDocumentsLinks.filter((link) => link)
        : Array.isArray(selectedEvent?.otherDocumentsLinks) && selectedEvent.otherDocumentsLinks.length > 0
        ? selectedEvent.otherDocumentsLinks.filter((link) => link)
        : [],
  });
  
  

  // Initialize `newLink` for inputs
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
  const saveAndNavigate = useFormNavigation();
  useEffect(() => {
    const currentFormData = { ...formData, ...links };

    if (JSON.stringify(formData) !== JSON.stringify(currentFormData)) {
      updateFormData(currentFormData);
    }
  }, [links, formData, updateFormData]);
  

  const handleLinkChange = (type, value) => {
    setNewLink({ ...newLink, [type]: value });
  };

  // Function to handle adding a new link or multiple pasted links
  const handleAddLink = (type, value) => {
    const linkArray = value.split(/[ ,;\n]+/).filter(Boolean); // Split pasted links
    const validLinks = linkArray.filter((link) => isValidUrl(link));
    const invalidLinks = linkArray.filter((link) => !isValidUrl(link));

    if (validLinks.length > 0) {
      setLinks({
        ...links,
        [`${type}Links`]: [...links[`${type}Links`], ...validLinks],
      });
      setNewLink({ ...newLink, [type]: "" }); // Clear the input field after adding
    }

    if (invalidLinks.length > 0) {
      setSnackbarMessage(`Invalid URLs: ${invalidLinks.join(", ")}`);
      setIsError(true);
      setSnackbarOpen(true);
    }
  };

  // Handler for deleting a link
  const handleDeleteLink = (type, linkToDelete) => {
    setLinks({
      ...links,
      [`${type}Links`]: links[`${type}Links`].filter(
        (link) => link !== linkToDelete
      ),
    });
  };

  // Function to handle the "Enter" key or pasting links
  const handleKeyPress = (type, event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddLink(type, newLink[type]);
    }
  };

  const handlePrevious = () => {
    const currentFormData = {
      ...links,
    };
    saveAndNavigate(currentFormData, "/audience");
  };

  const handleSave = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handlePaste = (type, event) => {
    const pastedData = event.clipboardData.getData('text');
    const linkArray = pastedData.split(/[ ,;\n]+/).filter(Boolean);
    const validLinks = linkArray.filter((link) => isValidUrl(link));
    const invalidLinks = linkArray.filter((link) => !isValidUrl(link));
  
    if (validLinks.length > 0) {
      setLinks({
        ...links,
        [`${type}Links`]: [...links[`${type}Links`], ...validLinks],
      });
      setNewLink({ ...newLink, [type]: "" }); // Clear the input field after adding
    }
  
    if (invalidLinks.length > 0) {
      setSnackbarMessage(`Invalid URLs: ${invalidLinks.join(", ")}`);
      setIsError(true);
      setSnackbarOpen(true);
    }
  
    event.preventDefault(); // Prevent the default paste behavior
  };

  
  const handleSaveAndPublish = async () => {
    const requiredFields = {
      organisedBy: formData.organisedBy,
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      eventId: formData.eventId,
      eventType: formData.eventType,
      region: formData.region,
      subRegion: formData.subRegion,
      country: formData.country,
      // city: formData.city,
      // isApprovedForCustomerUse: formData.isApprovedForCustomerUse,
      gep: formData.gep,
      audiencePersona: formData.audiencePersona,
      audienceSeniority: formData.audienceSeniority,
      accountSegments: formData.accountSegments,
      accountCategory: formData.accountCategory,
      accountType: formData.accountType,
      productAlignment: formData.productAlignment,
      aiVsCore: formData.aiVsCore,
      industry: formData.industry,
      accountSectors: formData.accountSectors,
      program: formData.program
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key] || requiredFields[key].length === 0
    );

    if (missingFields.length > 0) {
      setSnackbarMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      setIsError(true);
      setSnackbarOpen(true);
      return;
    }
    const newFormData = {
      ...formData,
      ...links,
      isDraft: false,
      isPublished: true,
    };

    updateFormData(newFormData);
    try {
      const response = await sendDataToAPI(newFormData);
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
      saveAndNavigate({}, "/");
    }
  };

  const handleSaveAsDraft = async () => {
    const newFormData = {
      ...formData,
      ...links,
      isDraft: true,
      isPublished: false,
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
            <span className="mr-1 text-xl text-black cursor-pointer">
              Links
            </span>
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(links).map(([key, value]) => (
              <Grid item xs={12} key={key}>
                <Typography variant="subtitle1">
                  {(() => {
                    switch (key) {
                      case "hailoLinks":
                        return "Hailo";
                      case "landingPageLinks":
                        return "Landing Page";
                      case "salesKitLinks":
                        return "Sales Kit";
                      case "otherDocumentsLinks":
                        return "Other Documents";
                      default:
                        return key
                          .replace("Links", "")
                          .replace(/([A-Z])/g, " $1")
                          .trim();
                    }
                  })()}
                </Typography>

                <TextField
                  fullWidth
                  variant="outlined"
                  value={newLink[key.replace("Links", "")]}
                  onChange={(e) =>
                    handleLinkChange(key.replace("Links", ""), e.target.value)
                  }
                  onKeyDown={(e) => handleKeyPress(key.replace("Links", ""), e)}
                  onPaste={(e) => handlePaste(key.replace("Links", ""), e)} // Handle paste
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            handleAddLink(
                              key.replace("Links", ""),
                              newLink[key.replace("Links", "")]
                            )
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
            {/* <Button
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
            </Button> */}
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
              Publish
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
          In case you added email invite copy, users will be able to invite customers with that copy.
          <br/><br/>
          Please make sure your information is accurate
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Exit
          </Button>
          <Button onClick={handleSaveAndPublish} color="primary" autoFocus>
            Save and Publish
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
