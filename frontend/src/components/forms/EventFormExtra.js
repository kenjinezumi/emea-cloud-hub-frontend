import React, { useContext, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import {
  languageOptions,
  okrOptions,
  gepOptions,
} from "../filters/FiltersData";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import Snackbar from "@mui/material/Snackbar";
import {
  Button,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Chip,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "../styles/Forms.css";
import InfoIcon from "@mui/icons-material/Info";
import { blue, grey } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";

export default function ExtraDetailsForm() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isFormValid, setIsFormValid] = useState(true);
  const [activityOwner, setActivityOwner] = useState(
    selectedEvent ? selectedEvent.activityOwner : formData.activityOwner || []
  );
  const [speakers, setSpeakers] = useState(
    selectedEvent ? selectedEvent.speaker : formData.speakers || []
  );
  const [eventSeries, setEventSeries] = useState(
    selectedEvent ? selectedEvent.eventSeries : formData.eventSeries || "no"
  );
  const [emailLanguage, setEmailLanguage] = useState(
    selectedEvent
      ? selectedEvent.emailLanguage
      : formData.emailLanguage || "English"
  );
  const [emailText, setEmailText] = useState(
    selectedEvent ? selectedEvent.emailText : formData.emailText || ""
  );
  const [customerUse, setCustomerUse] = useState(
    selectedEvent ? selectedEvent.customerUse : formData.customerUse || "no"
  );
  const [okr, setOkr] = useState(
    selectedEvent ? selectedEvent.okr : formData.okr || []
  );
  const [gep, setGep] = useState(
    selectedEvent ? selectedEvent.gep : formData.gep || []
  );
  const [activityType, setActivityType] = useState(
    selectedEvent
      ? selectedEvent.activityType
      : formData.activityType || "direct"
  );
  const [languagesAndTemplates, setLanguagesAndTemplates] = useState(
    selectedEvent
      ? selectedEvent.languagesAndTemplates
      : formData.languagesAndTemplates || [
          { language: "English", template: "" },
        ]
  );

  const [okrSelections, setOkrSelections] = useState(
    okrOptions.map((option) => ({
      label: option.label,
      selected: false,
    }))
  );

  const handleToggleOkr = (label) => {
    const newOkrSelections = okrSelections.map((option) => ({
      ...option,
      selected: option.label === label ? !option.selected : option.selected,
    }));
    setOkrSelections(newOkrSelections);

    const selectedOkrs = newOkrSelections
      .filter((option) => option.selected)
      .map((option) => option.label);
    setOkr(selectedOkrs);
  };

  const saveAndNavigate = useFormNavigation();

  const handlePrevious = () => {
    saveAndNavigate(
      {
        activityOwner,
        speakers,
        eventSeries,
        emailLanguage,
        emailText,
        customerUse,
        okr,
        gep,
        activityType,
        languagesAndTemplates,
      },
      "/location"
    );
  };

  const handleOkrDelete = (okrToDelete) => (event) => {
    event.stopPropagation();
    setOkr((currentOkr) => currentOkr.filter((okr) => okr !== okrToDelete));
  };

  const handleGepDelete = (gepToDelete) => (event) => {
    event.stopPropagation();
    setGep((currentGep) => currentGep.filter((gep) => gep !== gepToDelete));
  };

  const handleNext = () => {
    const selectedOkr = okrSelections
      .filter((option) => option.selected)
      .map((option) => option.label);

    const formIsValid =
      customerUse && selectedOkr.length > 0 && gep.length > 0 && activityType;

    setIsFormValid(formIsValid);

    if (!formIsValid) {
      return;
    }

    const currentFormData = {
      activityOwner,
      speakers,
      eventSeries,
      emailLanguage,
      emailText,
      customerUse,
      okr: selectedOkr,
      gep,
      activityType,
      languagesAndTemplates,
    };

    saveAndNavigate(currentFormData, "/audience");
  };

  const handleAddLanguageAndTemplate = () => {
    setLanguagesAndTemplates([
      ...languagesAndTemplates,
      { language: "", template: "" },
    ]);
  };

  const handleRemoveLanguageAndTemplate = (index) => {
    const updatedItems = languagesAndTemplates.filter((_, idx) => idx !== index);
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

  const handleSaveAsDraft = async () => {
    const isDraft = formData.isDraft !== undefined ? formData.isDraft : true;

    const draftData = {
      activityOwner,
      speakers,
      eventSeries,
      emailLanguage,
      emailText,
      customerUse,
      okr,
      gep,
      activityType,
      languagesAndTemplates,
      isDraft,
    };

    const updatedFormData = { ...formData, ...draftData };
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

  const availableLanguages = languageOptions.filter(
    (language) => !languagesAndTemplates.some((item) => item.language === language)
  );

  return (
    <div className="h-screen flex flex-col">
      <CalendarHeaderForm />
      <div className="form-container">
        <div className="event-form scrollable-form">
          <Typography
            variant="h4"
            className="form-title"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <InfoIcon
              style={{ marginRight: "10px", color: blue[500], height: "40px" }}
            />
            <span className="mr-1 text-xl text-black cursor-pointer">
              Extra details
            </span>
          </Typography>
          <Grid container spacing={2}>
            {languagesAndTemplates.map((item, index) => (
              <Accordion key={index} style={{ width: "100%", marginBottom: "8px" }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel-content"
                  id={`panel-header-${index}`}
                >
                  <Typography>Email language: </Typography>
                  {item.language && <Typography>{item.language}</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <Typography variant="subtitle1">Email language</Typography>
                        {index === 0 ? (
                          <TextField
                            value={"English"}
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
                            options={availableLanguages}
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
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">
                  Approved for customer use?
                </Typography>
                <RadioGroup
                  value={customerUse}
                  onChange={(e) => setCustomerUse(e.target.value)}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">OKR Selection</Typography>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {okrSelections.map((option) => (
                  <Chip
                    key={option.label}
                    label={option.label}
                    onClick={() => handleToggleOkr(option.label)}
                    style={{
                      backgroundColor: option.selected ? blue[500] : grey[300],
                      color: option.selected ? "white" : "black",
                    }}
                  />
                ))}
              </div>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle1">GEP</Typography>
                <Select
                  multiple
                  value={gep}
                  onChange={(e) => setGep(e.target.value)}
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {selected.map((gepItem) => (
                        <Chip
                          key={gepItem}
                          label={gepItem}
                          onDelete={handleGepDelete(gepItem)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </div>
                  )}
                >
                  {gepOptions.map((option, idx) => (
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">
                  Direct partner activity flag?
                </Typography>
                <RadioGroup
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          {!isFormValid && (
            <Typography color="error" style={{ marginBottom: "10px" }}>
              Please fill in all required fields.
            </Typography>
          )}
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
              onClick={handleNext}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "left",
                margin: "10px",
              }}
            >
              Next
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAsDraft}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "right",
                margin: "10px",
              }}
            >
              Save as Draft
            </Button>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
