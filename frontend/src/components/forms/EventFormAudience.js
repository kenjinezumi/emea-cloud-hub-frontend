import React, { useContext, useEffect, useState } from "react";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import Snackbar from "@mui/material/Snackbar";
import {
  Button,
  FormControl,
  FormControlLabel,
  Chip,
  Select,
  MenuItem,
  Typography,
  Grid,
  Checkbox,
  FormGroup,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import GlobalContext from "../../context/GlobalContext";
import {
  audienceRoles,
  audienceSeniorityOptions,
} from "../filters/FiltersData";
import PeopleIcon from "@mui/icons-material/People";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData"; // Ensure the correct path

export default function AudiencePersonaForm() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);

  const [maxEventCapacityError, setMaxEventCapacityError] = useState("");
  const [peopleMeetingCriteriaError, setPeopleMeetingCriteriaError] =
    useState("");
  const [isFormValid, setIsFormValid] = useState(true);
  const [audiencePersona, setAudiencePersona] = useState(
    selectedEvent
      ? selectedEvent.audiencePersona
      : formData.audiencePersona || []
  );
  const [audienceSeniority, setAudienceSeniority] = useState(
    selectedEvent
      ? selectedEvent.audienceSeniority
      : formData.audienceSeniority || []
  );
  const [accountSectors, setAccountSectors] = useState({
    commercial: selectedEvent ? selectedEvent.accountSectors.commercial : false,
    public: selectedEvent ? selectedEvent.accountSectors.public : false,
  });

  const [accountSegments, setAccountSegments] = useState(
    selectedEvent
      ? selectedEvent.accountSegments
      : formData.accountSegments || {
          enterprise: false,
          corporate: false,
          smb: false,
        }
  );
  const [maxEventCapacity, setMaxEventCapacity] = useState(
    selectedEvent
      ? selectedEvent.maxEventCapacity
      : formData.maxEventCapacity || ""
  );
  const [peopleMeetingCriteria, setPeopleMeetingCriteria] = useState(
    selectedEvent
      ? selectedEvent.peopleMeetingCriteria
      : formData.peopleMeetingCriteria || ""
  );
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleAudiencePersonaDelete = (personaToDelete) => () => {
    setAudiencePersona((currentPersonas) =>
      currentPersonas.filter((persona) => persona !== personaToDelete)
    );
  };

  const handleAudienceSeniorityDelete = (seniorityToDelete) => () => {
    setAudienceSeniority((currentSeniorities) =>
      currentSeniorities.filter((seniority) => seniority !== seniorityToDelete)
    );
  };

  const handleMaxEventCapacityChange = (e) => {
    const value = e.target.value;
    if (!value || /^\d+$/.test(value)) {
      setMaxEventCapacity(value);
      setMaxEventCapacityError("");
    } else {
      setMaxEventCapacityError("Please enter a valid number");
    }
  };

  const handlePeopleMeetingCriteriaChange = (e) => {
    const value = e.target.value;
    if (!value || /^\d+$/.test(value)) {
      setPeopleMeetingCriteria(value);
      setPeopleMeetingCriteriaError("");
    } else {
      setPeopleMeetingCriteriaError("Please enter a valid number");
    }
  };

  const handleCheckboxChange = (event) => {
    setAccountSegments({
      ...accountSegments,
      [event.target.name]: event.target.checked,
    });
  };

  const handleCheckboxChangeAccountSectors = (event) => {
    const { name, checked } = event.target;
    setAccountSectors((prevSectors) => ({
      ...prevSectors,
      [name]: checked,
    }));
  };

  const handleNext = () => {
    // Retrieve previous form data
    const isAudiencePersonaValid = audiencePersona.length > 0;
    const isAudienceSeniorityValid = audienceSeniority.length > 0;
    const isAccountSectorsValid = Object.values(accountSectors).some(
      (value) => value
    );
    const isMaxEventCapacityValid = maxEventCapacity.trim() !== "";
    const isAccountSegmentsSelected = Object.values(accountSegments).some(
      Boolean
    );

    const formIsValid =
      isAudiencePersonaValid &&
      isAudienceSeniorityValid &&
      isAccountSectorsValid &&
      isMaxEventCapacityValid &&
      isAccountSegmentsSelected;

    setIsFormValid(formIsValid); // Update form validity state

    if (!formIsValid) {
      // If the form is not valid, stop the function execution
      return;
    }

    // Combine current form data with previous form data
    const currentFormData = {
      audiencePersona,
      audienceSeniority,
      accountSectors,
      accountSegments,
      maxEventCapacity,
      peopleMeetingCriteria,
    };

    updateFormData({ ...formData, ...currentFormData });

    // Navigate to the next screen
    navigate("/links"); // Adjust according to your route
  };

  const handlePrevious = () => {
    navigate("/extra"); // Adjust according to your route
  };

  const handleSaveAsDraft = async () => {
    const isDraft = formData.isDraft !== undefined ? formData.isDraft : true;

    const draftData = {
      audiencePersona,
      audienceSeniority,
      accountSectors,
      accountSegments,
      maxEventCapacity,
      peopleMeetingCriteria,
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

  const handleAudienceSeniorityChange = (event) => {
    setAudienceSeniority(event.target.value);
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
            <PeopleIcon
              style={{ marginRight: "10px", color: blue[500], height: "40px" }}
            />
            <span className="mr-1 text-xl text-black cursor-pointer">
              Audience
            </span>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Audience persona</Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={audiencePersona}
                  onChange={(e) => setAudiencePersona(e.target.value)}
                  renderValue={(selected) => (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                    >
                      {selected.map((persona) => (
                        <Chip
                          key={persona}
                          label={persona}
                          onDelete={handleAudiencePersonaDelete(persona)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </div>
                  )}
                >
                  {audienceRoles.map((role, idx) => (
                    <MenuItem key={idx} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Audience Seniority</Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={audienceSeniority}
                  onChange={(e) => setAudienceSeniority(e.target.value)}
                  renderValue={(selected) => (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                    >
                      {selected.map((seniority) => (
                        <Chip
                          key={seniority}
                          label={seniority}
                          onDelete={handleAudienceSeniorityDelete(seniority)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </div>
                  )}
                >
                  {audienceSeniorityOptions.map((option, idx) => (
                    <MenuItem key={idx} value={option.label}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Account Sectors</Typography>
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={accountSectors.commercial}
                        onChange={handleCheckboxChangeAccountSectors}
                        name="commercial"
                      />
                    }
                    label="Commercial Sector"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={accountSectors.public}
                        onChange={handleCheckboxChangeAccountSectors}
                        name="public"
                      />
                    }
                    label="Public Sector"
                  />
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Account segments</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accountSegments.enterprise}
                      onChange={handleCheckboxChange}
                      name="enterprise"
                    />
                  }
                  label="Enterprise"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accountSegments.corporate}
                      onChange={handleCheckboxChange}
                      name="corporate"
                    />
                  }
                  label="Corporate"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accountSegments.smb}
                      onChange={handleCheckboxChange}
                      name="smb"
                    />
                  }
                  label="SMB"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Maximum event capacity
              </Typography>
              <TextField
                type="number"
                value={maxEventCapacity}
                onChange={handleMaxEventCapacityChange}
                error={!!maxEventCapacityError}
                helperText={maxEventCapacityError}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                People meeting the audience criteria
              </Typography>
              <TextField
                type="number"
                value={0}
                onChange={handlePeopleMeetingCriteriaChange}
                error={!!peopleMeetingCriteriaError}
                helperText={peopleMeetingCriteriaError}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
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
                float: "left",
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
