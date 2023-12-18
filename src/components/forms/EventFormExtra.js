import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import { languageOptions, okrOptions, gepOptions } from "../filters/FiltersData";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import { ReactComponent as InformationLogo } from "../../assets/svg/information.svg";

export default function ExtraDetailsForm() {
  const [isFormValid, setIsFormValid] = useState(true);
  const [activityOwner, setActivityOwner] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [eventSeries, setEventSeries] = useState("no");
  const [emailLanguage, setEmailLanguage] = useState("");
  const [emailText, setEmailText] = useState("");
  const [customerUse, setCustomerUse] = useState("no");
  const [okr, setOkr] = useState([]);
  const [gep, setGep] = useState([]);
  const [activityType, setActivityType] = useState("direct");
  const [languagesAndTemplates, setLanguagesAndTemplates] = useState([]);
  const navigate = useNavigate();
  const { formData, updateFormData } = useContext(GlobalContext);

  const handlePrevious = () => {
    navigate("/location");
  };

  const handleNext = () => {
    const formIsValid =
      speakers.length > 0 &&
      eventSeries &&
      emailLanguage &&
      emailText &&
      customerUse &&
      okr.length > 0 &&
      gep.length > 0 &&
      activityType;

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
      okr,
      gep,
      activityType,
      languagesAndTemplates,
    };
    updateFormData({ ...formData, ...currentFormData });

    navigate("/audience");
  };

  const handleAddLanguageAndTemplate = () => {
    if (emailLanguage && emailText) {
      // Create a new language and template object
      const newLanguageAndTemplate = {
        language: emailLanguage,
        template: emailText,
      };

      // Append it to the list
      setLanguagesAndTemplates([...languagesAndTemplates, newLanguageAndTemplate]);

      // Clear the input fields
      setEmailLanguage("");
      setEmailText("");
    }
  };

  return (
    <div className="form-container">
      <div className="event-form scrollable-form">
        <Typography
          variant="h4"
          className="form-title"
          style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}
        >
          <InformationLogo style={{ marginRight: "8px", width: "40px", height: "40px" }} />
          Extra Details
        </Typography>
        <Grid container spacing={2}>
          {/* Activity Owners Dropdown */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Typography variant="subtitle1">Speakers</Typography>
              <Select
                multiple
                value={speakers}
                onChange={(e) => setSpeakers(e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {/* Populate with activity owners */}
                <MenuItem value="speaker1">Speaker 1</MenuItem>
                <MenuItem value="speaker2">Speaker 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Speakers Dropdown */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle1">Does your event belong to a series?</Typography>
              <RadioGroup
                value={eventSeries}
                onChange={(e) => setEventSeries(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Exclude those who have already attended" />
                <FormControlLabel value="no" control={<Radio />} label="Invite to the next episode" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <Typography variant="subtitle1">Email language</Typography>
              <Select
                value={emailLanguage}
                onChange={(e) => setEmailLanguage(e.target.value)}
              >
                {languageOptions.map((language, idx) => (
                  <MenuItem key={idx} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Email Text Box */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">Email template</Typography>
            <TextField
              label="Email Text"
              multiline
              rows={4}
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              variant="outlined"
              fullWidth
            />
          </Grid>

           {/* Add Language and Email Template Section */}
           <Grid item xs={12}>
            <Typography variant="subtitle1">Add Language and Email Template</Typography>
            <FormControl fullWidth>
              <Select
                value={emailLanguage}
                onChange={(e) => setEmailLanguage(e.target.value)}
              >
                {languageOptions.map((language, idx) => (
                  <MenuItem key={idx} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Email Text"
              multiline
              rows={4}
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <Button variant="outlined" onClick={handleAddLanguageAndTemplate}>
              Add
            </Button>
          </Grid>

          {/* List of Selected Languages and Email Templates */}
          {languagesAndTemplates.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="subtitle1">
                Language: {item.language}
              </Typography>
              <Typography variant="subtitle1">
                Email Template: {item.template}
              </Typography>
            </Grid>
          ))}

          {/* Approve for Customer Use Radio Buttons */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle1">Approved for customer use?</Typography>
              <RadioGroup
                value={customerUse}
                onChange={(e) => setCustomerUse(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* OKR Dropdown */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Typography variant="subtitle1">OKR</Typography>
              <Select
                multiple
                value={okr}
                onChange={(e) => setOkr(e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {okrOptions.map((option, idx) => (
                  <MenuItem key={idx} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* GEP Dropdown */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Typography variant="subtitle1">GEP</Typography>
              <Select
                multiple
                value={gep}
                onChange={(e) => setGep(e.target.value)}
                renderValue={(selected) => selected.join(", ")}
              >
                {gepOptions.map((option, idx) => (
                  <MenuItem key={idx} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

         

          {/* Direct/Partner Activity Button */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle1">Direct partner activity flag?</Typography>
              <RadioGroup
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
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
            style={{ backgroundColor: "#4285F4", color: "white", float: "right", margin: "10px" }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
