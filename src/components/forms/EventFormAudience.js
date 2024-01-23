import React, { useContext, useEffect, useState } from "react";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";

import {
  Button,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  InputLabel,
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
import { ReactComponent as UsersLogo } from "../../assets/svg/users.svg";
import GlobalContext from "../../context/GlobalContext";
import {
  audienceRoles,
  audienceSeniorityOptions,
} from "../filters/FiltersData";
import PeopleIcon from "@mui/icons-material/People";
import { blue } from "@mui/material/colors";

export default function AudiencePersonaForm() {
  const { formData, updateFormData } = useContext(GlobalContext);

  const [maxEventCapacityError, setMaxEventCapacityError] = useState("");
  const [peopleMeetingCriteriaError, setPeopleMeetingCriteriaError] =
    useState("");
  const [isFormValid, setIsFormValid] = useState(true);
  const [audiencePersona, setAudiencePersona] = useState(
    formData.audiencePersona || []
  );
  const [audienceSeniority, setAudienceSeniority] = useState(
    formData.audienceSeniority || []
  );
  const [accountSectors, setAccountSectors] = useState(
    formData.accountSectors || ""
  );
  const [accountSegments, setAccountSegments] = useState(
    formData.accountSegments || {
      enterprise: false,
      corporate: false,
      smb: false,
    }
  );
  const [maxEventCapacity, setMaxEventCapacity] = useState(
    formData.maxEventCapacity || ""
  );
  const [peopleMeetingCriteria, setPeopleMeetingCriteria] = useState(
    formData.peopleMeetingCriteria || ""
  );
  const navigate = useNavigate();

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
  const audiencePersonaOptions = audienceRoles.map((role) => (
    <MenuItem key={role} value={role}>
      {role}
    </MenuItem>
  ));

  const handleNext = () => {
    // Retrieve previous form data
    const isAudiencePersonaValid = audiencePersona.length > 0;
    const isAudienceSeniorityValid = audienceSeniority.length > 0;
    const isAccountSectorsValid = accountSectors.trim() !== "";
    const isMaxEventCapacityValid = maxEventCapacity.trim() !== "";
    const isPeopleMeetingCriteriaValid = peopleMeetingCriteria.trim() !== "";
    const isAccountSegmentsSelected =
      Object.values(accountSegments).some(Boolean);

    const formIsValid =
      isAudiencePersonaValid &&
      isAudienceSeniorityValid &&
      isAccountSectorsValid &&
      isMaxEventCapacityValid &&
      isPeopleMeetingCriteriaValid &&
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

    // Save combined data to localStorage

    // Navigate to the next screen, passing combined data if using React Router state
    // navigate("/links", { state: combinedData });
    navigate("/links"); // Adjust according to your route
  };

  const handlePrevious = () => {
    navigate("/extra"); // Adjust according to your route
  };

  // Render your form
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
            <span className="mr-1 text-xl text-black  cursor-pointer">
              Audience
            </span>
          </Typography>
          <Grid container spacing={2}>
            {/* Multiple Select for Audience Persona */}
            <Grid item xs={12}>
              <Typography variant="subtitle1">Audience persona</Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={audiencePersona}
                  onChange={(e) => setAudiencePersona(e.target.value)}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {audiencePersonaOptions}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1">Audience seniority</Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={audienceSeniority}
                  onChange={(e) => setAudienceSeniority(e.target.value)}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {audienceSeniorityOptions.map((seniority) => (
                    <MenuItem key={seniority} value={seniority}>
                      {seniority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Radio Buttons for Account Sectors */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">Account sectors</Typography>
                <RadioGroup
                  value={accountSectors}
                  onChange={(e) => setAccountSectors(e.target.value)}
                >
                  <FormControlLabel
                    value="commercial sector"
                    control={<Radio />}
                    label="Commercial sector"
                  />
                  <Grid item xs={12} />
                  <FormControlLabel
                    value="public sector"
                    control={<Radio />}
                    label="Public sector"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Checkboxes for Account Segments */}
            <Grid item xs={12}>
              <Typography variant="subtitle1">Account segments</Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accountSegments.segment1}
                      onChange={handleCheckboxChange}
                      name="enterprise"
                    />
                  }
                  label="Enterprise"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accountSegments.segment2}
                      onChange={handleCheckboxChange}
                      name="corporate"
                    />
                  }
                  label="Corporate"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accountSegments.segment3}
                      onChange={handleCheckboxChange}
                      name="smb"
                    />
                  }
                  label="SMB"
                />
              </FormGroup>
            </Grid>

            {/* Integer Input for Maximum Event Capacity */}
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

            {/* Integer Input for People Meeting the Audience Criteria */}
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                People meeting the audience criteria
              </Typography>
              <TextField
                type="number"
                value={peopleMeetingCriteria}
                onChange={handlePeopleMeetingCriteriaChange}
                error={!!peopleMeetingCriteriaError}
                helperText={peopleMeetingCriteriaError}
                fullWidth
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
              variant="contained"
              onClick={handleNext}
              style={{
                backgroundColor: "#4285F4",
                color: "white",
                float: "right",
                margin: "10px",
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
