import React, { useEffect, useContext, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  Autocomplete,
  Select,
  MenuItem
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailIcon from "@mui/icons-material/Email";
import { blue } from "@mui/material/colors";
import { languageOptions } from "../filters/FiltersData";
import { sendDataToAPI } from "../../api/pushData";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import "../styles/Forms.css";

const platformOptions = ["Gmail", "Salesloft"];

const EventFormEmailInvitation = () => {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [languagesAndTemplates, setLanguagesAndTemplates] = useState([
    { platform: "Gmail", language: "English", template: "" }
  ]);
  const [isFormValid, setIsFormValid] = useState(true);
  const saveAndNavigate = useFormNavigation();

  useEffect(() => {
    if (selectedEvent) {
      setLanguagesAndTemplates(
        selectedEvent.languagesAndTemplates.length > 0
          ? selectedEvent.languagesAndTemplates
          : [{ platform: "Gmail", language: "English", template: "" }]
      );
    } else {
      setLanguagesAndTemplates(
        formData.languagesAndTemplates.length > 0
          ? formData.languagesAndTemplates
          : [{ platform: "Gmail", language: "English", template: "" }]
      );
    }
  }, [selectedEvent, formData]);

  const handleAddLanguageAndTemplate = () => {
    setLanguagesAndTemplates([
      ...languagesAndTemplates,
      { platform: "Gmail", language: "", template: "" }
    ]);
  };

  const handleRemoveLanguageAndTemplate = (index) => {
    if (languagesAndTemplates.length > 1) {
      const updatedItems = languagesAndTemplates.filter((_, idx) => idx !== index);
      setLanguagesAndTemplates(updatedItems);
    } else {
      setSnackbarMessage("At least one email language is required.");
      setSnackbarOpen(true);
    }
  };

  const handlePlatformChange = (value, index) => {
    const updatedItems = [...languagesAndTemplates];
    updatedItems[index].platform = value;
    setLanguagesAndTemplates(updatedItems);
  };

  const handleLanguageChange = (value, index) => {
    const updatedItems = [...languagesAndTemplates];
    updatedItems[index].language = value;
    setLanguagesAndTemplates(updatedItems);
  };

  const handleTemplateChange = (value, index) => {
    const updatedItems = [...languagesAndTemplates];
    updatedItems[index].template = value;
    setLanguagesAndTemplates(updatedItems);
  };

  const handleNext = () => {
    const formIsValid = languagesAndTemplates.every(
      (item) => item.language.trim() !== "" && item.template.trim() !== ""
    );

    setIsFormValid(formIsValid);

    if (!formIsValid) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarOpen(true);
      return;
    }

    const updatedFormData = { ...formData, languagesAndTemplates };
    updateFormData(updatedFormData);

    saveAndNavigate(updatedFormData, "/audience");
  };

  const handlePrevious = () => {
    saveAndNavigate({ languagesAndTemplates }, "/extra");
  };

  const handleSaveAsDraft = async () => {
    const updatedFormData = { 
      ...formData,
      languagesAndTemplates,
      isDraft: true, 
      approvedForCustomerUse: false, 
    };

    updateFormData(updatedFormData);

    try {
      const response = await sendDataToAPI(updatedFormData, "draft");
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

  return (
    <div
      className="h-screen flex flex-col"
      style={{ overscrollBehavior: "contain" }}
    >
      <CalendarHeaderForm />

      <div className="form-container" style={{ overscrollBehavior: "contain" }}>
        <div className="event-form">
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="h4" sx={{ display: "flex", alignItems: "center", fontSize: '1.5rem' }}>
                <EmailIcon style={{ marginRight: "10px", color: blue[500], height: "40px" }} />
                <span className="mr-1 text-xl text-black cursor-pointer">Email invitation
                </span>
              </Typography>
            </Grid>
          </Grid>

          <form noValidate>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {languagesAndTemplates.map((item, index) => (
                <Accordion key={index} sx={{ width: "100%", marginBottom: "8px" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-content-${index}`}
                    id={`panel-header-${index}`}
                  >
                    <Typography>
                      {item.language ? `Email language: ${item.language}` : "Select Language"}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Typography variant="subtitle1">Platform</Typography>
                          <Select
                            value={item.platform}
                            onChange={(e) => handlePlatformChange(e.target.value, index)}
                            fullWidth
                          >
                            {platformOptions.map((platform) => (
                              <MenuItem key={platform} value={platform}>
                                {platform}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Typography variant="subtitle1">Email language</Typography>
                          {index === 0 ? (
                            <TextField
                              value={item.language || "Select Language"}
                              fullWidth
                              InputProps={{ readOnly: true }}
                              variant="outlined"
                              style={{ backgroundColor: "#e0e0e0" }}
                            />
                          ) : (
                            <Autocomplete
                              value={item.language}
                              onChange={(event, newValue) => {
                                handleLanguageChange(newValue, index);
                              }}
                              freeSolo
                              options={languageOptions.filter(
                                (language) => !languagesAndTemplates.some((item) => item.language === language)
                              )}
                              renderInput={(params) => (
                                <TextField {...params} label="" variant="outlined" />
                              )}
                            />
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Email template</Typography>
                        <TextField
                          label="Email Text"
                          multiline
                          rows={4}
                          value={item.template}
                          onChange={(e) => handleTemplateChange(e.target.value, index)}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      {index > 0 && (
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => handleRemoveLanguageAndTemplate(index)}
                            style={{
                              color: "#d32f2f",
                              borderColor: "#d32f2f",
                              marginTop: "1px",
                              textTransform: "none",
                            }}
                          >
                            Remove
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              <Grid item xs={12}>
                <Button variant="outlined" onClick={handleAddLanguageAndTemplate}>
                  Add
                </Button>
              </Grid>
            </Grid>

            {!isFormValid && (
              <Typography color="error" sx={{ mb: 2 }}>
                Please fill in all required fields.
              </Typography>
            )}

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
            />

            {/* Button container aligned to the right */}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                sx={{
                  color: "#202124",
                  border: "1px solid #dadce0",
                  boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                  marginRight: 2,
                }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  backgroundColor: blue[500],
                  color: "white",
                  marginRight: 2,
                  "&:hover": {
                    backgroundColor: blue[700],
                  },
                }}
              >
                Next
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveAsDraft}
                sx={{
                  backgroundColor: blue[500],
                  color: "white",
                  "&:hover": {
                    backgroundColor: blue[700],
                  },
                }}
              >
                Save as Draft
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventFormEmailInvitation;
