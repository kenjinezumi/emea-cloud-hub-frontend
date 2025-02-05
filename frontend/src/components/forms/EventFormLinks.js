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
  CircularProgress,
  Box,
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
  const { formData, selectedEvent, updateFormData, setCurrentView } =
    useContext(GlobalContext);

  // Our "links" state:
  const [links, setLinks] = useState({
    landingPageLinks:
      Array.isArray(formData?.landingPageLinks) && formData.landingPageLinks.length > 0
        ? formData.landingPageLinks.filter((link) => link)
        : Array.isArray(selectedEvent?.landingPageLinks) && selectedEvent.landingPageLinks.length > 0
        ? selectedEvent.landingPageLinks.filter((link) => link)
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

  // For collecting new link values before adding them
  const [newLink, setNewLink] = useState({
    landingPage: "",
    salesKit: "",
    hailo: "",
    otherDocuments: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const saveAndNavigate = useFormNavigation();

  // Save updated links to formData context
  useEffect(() => {
    const currentFormData = { ...formData, ...links };
    if (JSON.stringify(formData) !== JSON.stringify(currentFormData)) {
      updateFormData(currentFormData);
    }
  }, [links, formData, updateFormData]);

  // Link input changes
  const handleLinkChange = (type, value) => {
    setNewLink({ ...newLink, [type]: value });
  };

  // Split multi-line or multi-delimited text into separate links
  const handleAddLink = (type, value) => {
    const linkArray = value.split(/[ ,;\n]+/).filter(Boolean);
    const validLinks = linkArray.filter((link) => isValidUrl(link));
    const invalidLinks = linkArray.filter((link) => !isValidUrl(link));

    if (validLinks.length > 0) {
      setLinks({
        ...links,
        [`${type}Links`]: [...links[`${type}Links`], ...validLinks],
      });
      setNewLink({ ...newLink, [type]: "" }); // Clear input
    }

    if (invalidLinks.length > 0) {
      setSnackbarMessage(`Invalid URLs: ${invalidLinks.join(", ")}`);
      setIsError(true);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteLink = (type, linkToDelete) => {
    setLinks({
      ...links,
      [`${type}Links`]: links[`${type}Links`].filter((link) => link !== linkToDelete),
    });
  };

  const handleKeyPress = (type, event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddLink(type, newLink[type]);
    }
  };

  const handlePaste = (type, event) => {
    const pastedData = event.clipboardData.getData("text");
    const linkArray = pastedData.split(/[ ,;\n]+/).filter(Boolean);
    const validLinks = linkArray.filter((link) => isValidUrl(link));
    const invalidLinks = linkArray.filter((link) => !isValidUrl(link));

    if (validLinks.length > 0) {
      setLinks({
        ...links,
        [`${type}Links`]: [...links[`${type}Links`], ...validLinks],
      });
      setNewLink({ ...newLink, [type]: "" }); // Clear
    }

    if (invalidLinks.length > 0) {
      setSnackbarMessage(`Invalid URLs: ${invalidLinks.join(", ")}`);
      setIsError(true);
      setSnackbarOpen(true);
    }
    event.preventDefault(); // Prevent default paste
  };

  // “Previous” button
  const handlePrevious = () => {
    saveAndNavigate(links, "/audience");
  };

  // “Save” -> opens confirmation dialog for Publish
  const handleSave = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // “Save and Publish”
  const handleSaveAndPublish = async () => {
    setLoading(true);

    // Minimal checks for required fields
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
    };

    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key] || requiredFields[key].length === 0
    );
    if (missingFields.length > 0) {
      setSnackbarMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      setLoading(false);
      setIsError(true);
      setSnackbarOpen(true);
      return;
    }

    // Mark it as published
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
        setIsError(false);
        setLoading(false);
        setSnackbarOpen(true);
        setCurrentView("month");
        saveAndNavigate({}, "/");
      } else {
        setSnackbarMessage("Failed to save and publish.");
        setLoading(false);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving and publishing.");
      setLoading(false);
      setSnackbarOpen(true);
    } finally {
      setDialogOpen(false);
      setLoading(false);
    }
  };

  // NEW: “Save as Draft” logic
  const handleSaveAsDraft = async () => {
    setLoading(true);

    // We can do the same minimal checks or skip them for a draft.
    // The user wants the same logic as “publish,” but isDraft=true, isPublished=false.
    // So we’ll skip the missing fields check if we prefer. Or replicate it:

    // Let's replicate the missing fields check:
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
    };

    // If you want to skip the required fields for draft, remove the lines below
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key] || requiredFields[key].length === 0
    );
    if (missingFields.length > 0) {
      setSnackbarMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      setLoading(false);
      setIsError(true);
      setSnackbarOpen(true);
      return;
    }

    // Build final form data with draft set
    const draftData = {
      ...formData,
      ...links,
      isDraft: true,
      isPublished: false,
    };
    updateFormData(draftData);

    try {
      const response = await sendDataToAPI(draftData);
      if (response.success) {
        setSnackbarMessage("Details saved as draft successfully!");
        setIsError(false);
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to save as draft.");
        setIsError(true);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving as draft.");
      setIsError(true);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
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
                    // Customize labels for each link key
                    switch (key) {
                      case "hailoLinks":
                        return "Haiilo";
                      case "landingPageLinks":
                        return "Landing Page";
                      case "salesKitLinks":
                        return "Sales Kit";
                      case "otherDocumentsLinks":
                        return "Other Documents";
                      default:
                        return formatLabel(key);
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
                  onPaste={(e) => handlePaste(key.replace("Links", ""), e)}
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
            {/* PREVIOUS BUTTON */}
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

            {/* NEW: SAVE AS DRAFT BUTTON */}
            <Button
              variant="contained"
              onClick={handleSaveAsDraft}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "left",
                margin: "10px",
              }}
              disabled={loading}
            >
              Save as Draft
            </Button>

            {/* PUBLISH BUTTON */}
            <Button
              variant="contained"
              onClick={handleSave}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "right",
                margin: "10px",
              }}
              disabled={loading}
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

      {/* Publish Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Save and Publish"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            In case you added email invite copy, users will be able to invite
            customers with that copy.
            <br />
            <br />
            Please make sure your information is accurate
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Exit
          </Button>

          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
                zIndex: 1,
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleSaveAndPublish}
            sx={{
              backgroundColor: blue[500],
              color: "white",
              margin: "10px",
              "&:hover": {
                backgroundColor: blue[700],
              },
            }}
            disabled={loading}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
