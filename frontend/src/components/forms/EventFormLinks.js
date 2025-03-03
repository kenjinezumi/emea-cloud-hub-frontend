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
  Switch,
  FormControlLabel,
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

// Nicely format the link section labels if needed
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

  // Our "links" state (arrays of strings)
  const [links, setLinks] = useState({
    landingPageLinks:
      Array.isArray(formData?.landingPageLinks) &&
      formData.landingPageLinks.length > 0
        ? formData.landingPageLinks.filter(Boolean)
        : Array.isArray(selectedEvent?.landingPageLinks) &&
          selectedEvent.landingPageLinks.length > 0
        ? selectedEvent.landingPageLinks.filter(Boolean)
        : [],
    salesKitLinks:
      Array.isArray(formData?.salesKitLinks) &&
      formData.salesKitLinks.length > 0
        ? formData.salesKitLinks.filter(Boolean)
        : Array.isArray(selectedEvent?.salesKitLinks) &&
          selectedEvent.salesKitLinks.length > 0
        ? selectedEvent.salesKitLinks.filter(Boolean)
        : [],
    hailoLinks:
      Array.isArray(formData?.hailoLinks) && formData.hailoLinks.length > 0
        ? formData.hailoLinks.filter(Boolean)
        : Array.isArray(selectedEvent?.hailoLinks) &&
          selectedEvent.hailoLinks.length > 0
        ? selectedEvent.hailoLinks.filter(Boolean)
        : [],
    otherDocumentsLinks:
      Array.isArray(formData?.otherDocumentsLinks) &&
      formData.otherDocumentsLinks.length > 0
        ? formData.otherDocumentsLinks.filter(Boolean)
        : Array.isArray(selectedEvent?.otherDocumentsLinks) &&
          selectedEvent.otherDocumentsLinks.length > 0
        ? selectedEvent.otherDocumentsLinks.filter(Boolean)
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

  // Loading overlay & confirmation dialog
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // NEW: Toggle for publish/draft
  const [isPublished, setIsPublished] = useState(
    formData?.isPublished || false
  );

  const saveAndNavigate = useFormNavigation();

  /**
   * Keep formData updated as user modifies links
   */
  useEffect(() => {
    const currentFormData = {
      ...formData,
      landingPageLinks: links.landingPageLinks,
      salesKitLinks: links.salesKitLinks,
      hailoLinks: links.hailoLinks,
      otherDocumentsLinks: links.otherDocumentsLinks,
      isPublished, // Remember user’s toggle
    };

    if (JSON.stringify(formData) !== JSON.stringify(currentFormData)) {
      updateFormData(currentFormData);
    }
  }, [links, isPublished, formData, updateFormData]);

  // ------------------------------
  //  Link input & addition logic
  // ------------------------------
  const handleLinkChange = (type, value) => {
    setNewLink({ ...newLink, [type]: value });
  };

  // Split multi-line or multi-delimited text into separate links
  const handleAddLink = (type, value) => {
    const linkArray = value.split(/[ ,;\n]+/).filter(Boolean);
    const validLinks = linkArray.filter((link) => isValidUrl(link));
    const invalidLinks = linkArray.filter((link) => !isValidUrl(link));

    if (validLinks.length > 0) {
      setLinks((prev) => ({
        ...prev,
        [`${type}Links`]: [...prev[`${type}Links`], ...validLinks],
      }));
      setNewLink((prev) => ({ ...prev, [type]: "" })); // Clear input
    }

    if (invalidLinks.length > 0) {
      setSnackbarMessage(`Invalid URLs: ${invalidLinks.join(", ")}`);
      setIsError(true);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteLink = (type, linkToDelete) => {
    setLinks((prev) => ({
      ...prev,
      [`${type}Links`]: prev[`${type}Links`].filter(
        (link) => link !== linkToDelete
      ),
    }));
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
      setLinks((prev) => ({
        ...prev,
        [`${type}Links`]: [...prev[`${type}Links`], ...validLinks],
      }));
      setNewLink((prev) => ({ ...prev, [type]: "" }));
    }

    if (invalidLinks.length > 0) {
      setSnackbarMessage(`Invalid URLs: ${invalidLinks.join(", ")}`);
      setIsError(true);
      setSnackbarOpen(true);
    }
    event.preventDefault(); // Prevent default paste
  };

  // ------------------------------
  //   Navigation & save logic
  // ------------------------------
  const handlePrevious = () => {
    saveAndNavigate(links, "/audience");
  };

  /**
   * Single "Next" button
   * - If `isPublished` is FALSE => Save as Draft
   * - If `isPublished` is TRUE  => Open confirmation dialog -> Publish
   */
  const handleNext = () => {
    if (isPublished) {
      // Confirm before publishing
      setDialogOpen(true);
    } else {
      // Save as Draft immediately
      handleSaveDraft();
    }
  };

  /**
   * Actually saves as a draft
   */
  const handleSaveDraft = async () => {
    setLoading(true);
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
        setSnackbarMessage("Failed to save draft.");
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

  /**
   * After user confirms the dialog => Publish
   */
  const handleConfirmPublish = async () => {
    setLoading(true);

    // Minimal checks for required fields (example)
    const requiredFields = {
      organisedBy: formData.organisedBy,
      title: formData.title,
      description: formData.description,
      partyType: formData.partyType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      eventId: formData.eventId,
      eventType: formData.eventType,
      region: formData.region,
      subRegion: formData.subRegion,
      country: formData.country,
      gep: formData.gep,
      // These might also be required:
      audienceSeniority: formData.audienceSeniority,
      accountSegments: formData.accountSegments,
      accountCategory: formData.accountCategory,
      accountType: formData.accountType,
      productAlignment: formData.productAlignment,
      aiVsCore: formData.aiVsCore,
      industry: formData.industry,
      accountSectors: formData.accountSectors,
    };

    const missingFields = Object.keys(requiredFields).filter((key) => {
      const val = requiredFields[key];
      // If it's an array, check length; if not, just check truthiness
      if (Array.isArray(val)) return val.length === 0;
      return !val;
    });

    if (missingFields.length > 0) {
      setSnackbarMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      setLoading(false);
      setIsError(true);
      setSnackbarOpen(true);
      setDialogOpen(false);
      return;
    }

    // Mark it as published
    const publishedData = {
      ...formData,
      ...links,
      isDraft: false,
      isPublished: true,
    };

    updateFormData(publishedData);

    try {
      const response = await sendDataToAPI(publishedData);
      if (response.success) {
        setSnackbarMessage("Details saved and published successfully!");
        setIsError(false);
        setSnackbarOpen(true);

        // Return to calendar or next route
        setCurrentView("month");
        saveAndNavigate({}, "/");
      } else {
        setSnackbarMessage("Failed to save and publish.");
        setIsError(true);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving and publishing.");
      setIsError(true);
      setSnackbarOpen(true);
    } finally {
      setDialogOpen(false);
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
            sx={{ display: "flex", alignItems: "center", mb: 2 }}
          >
            <LinkIcon sx={{ mr: 1, color: blue[500], height: "40px" }} />
            <span>Links</span>
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(links).map(([key, value]) => {
              // key will be like "landingPageLinks"
              // value is an array of URLs
              // We'll transform key => "landingPage"
              const baseType = key.replace("Links", "");

              return (
                <Grid item xs={12} key={key}>
                  <Typography variant="subtitle1">
                    {(() => {
                      // Customize labels for each link key if needed
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
                    value={newLink[baseType]}
                    onChange={(e) => handleLinkChange(baseType, e.target.value)}
                    onKeyDown={(e) => handleKeyPress(baseType, e)}
                    onPaste={(e) => handlePaste(baseType, e)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              handleAddLink(baseType, newLink[baseType])
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

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                    {value.map((link, linkIndex) => (
                      <Chip
                        key={linkIndex}
                        label={link}
                        onDelete={() => handleDeleteLink(baseType, link)}
                        color="primary"
                      />
                    ))}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Publish Toggle */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  name="isPublished"
                  color="primary"
                />
              }
              label={<Typography>Publish this event?</Typography>}
            />
          </Grid>

          {/* Bottom Buttons */}
          <Box sx={{ mt: 3, position: "relative", textAlign: "right" }}>
            {/* Previous */}
            <Button
              variant="outlined"
              onClick={handlePrevious}
              sx={{
                backgroundColor: "white",
                color: "#202124",
                border: "1px solid #dadce0",
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                float: "left",
                m: 1,
              }}
            >
              Previous
            </Button>

            {/* Loading Overlay */}
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

            {/* Next Button */}
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                backgroundColor: blue[500],
                color: "white",
                m: 1,
                "&:hover": { backgroundColor: blue[700] },
              }}
              disabled={loading}
            >
              Next
            </Button>
          </Box>
        </div>
      </div>

      {/* Snackbar for errors or success */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            backgroundColor: isError ? "red" : "green",
            color: "white",
          },
        }}
      />

      {/* Confirmation Dialog for Publishing */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="publish-confirm-title"
        aria-describedby="publish-confirm-description"
      >
        <DialogTitle id="publish-confirm-title">Confirm Save and Publish</DialogTitle>
        <DialogContent>
          <DialogContentText id="publish-confirm-description">
            In case you added email invite copy, users will be able to invite
            customers with that copy. 
            <br />
            <br />
            Please make sure your information is accurate before publishing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Exit
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPublish}
            sx={{
              backgroundColor: blue[500],
              color: "white",
              m: 1,
              "&:hover": {
                backgroundColor: blue[700],
              },
            }}
            disabled={loading}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
