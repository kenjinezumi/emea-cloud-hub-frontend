import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import {
  languageOptions,
  okrOptions,
  gepOptions,
} from "../filters/FiltersData";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";

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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import { ReactComponent as InformationLogo } from "../../assets/svg/information.svg";

export default function ExtraDetailsForm() {
  const { formData, updateFormData } = useContext(GlobalContext);

  const [isFormValid, setIsFormValid] = useState(true);
  const [activityOwner, setActivityOwner] = useState(
    formData.activityOwner || []
  );
  const [speakers, setSpeakers] = useState(formData.speakers || []);
  const [eventSeries, setEventSeries] = useState(formData.eventSeries || "no");
  const [emailLanguage, setEmailLanguage] = useState(
    formData.emailLanguage || "English"
  );
  const [emailText, setEmailText] = useState(formData.emailText || "");
  const [customerUse, setCustomerUse] = useState(formData.customerUse || "no");
  const [okr, setOkr] = useState(formData.okr || []);
  const [gep, setGep] = useState(formData.gep || []);
  const [activityType, setActivityType] = useState(
    formData.activityType || "direct"
  );
  const [languagesAndTemplates, setLanguagesAndTemplates] = useState(
    formData.languagesAndTemplates || [{ language: "English", template: "" }]
  );
  const navigate = useNavigate();

  const handlePrevious = () => {
    navigate("/location");
  };

  const handleNext = () => {
    // Validate only the mandatory fields
    const formIsValid =
      customerUse && okr.length > 0 && gep.length > 0 && activityType;

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
    setLanguagesAndTemplates([
      ...languagesAndTemplates,
      { language: "English", template: "" },
    ]);
  };

  const handleRemoveLanguageAndTemplate = (index) => {
    const updatedItems = languagesAndTemplates.filter(
      (_, idx) => idx !== index
    );
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
              marginBottom: "40px",
            }}
          >
            <InformationLogo
              style={{ marginRight: "8px", width: "40px", height: "40px" }}
            />
            Extra Details
          </Typography>
          <Grid container spacing={2}>
            {/* Dynamically rendered Email Language and Template Inputs */}
            {languagesAndTemplates.map((item, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                style={{ marginTop: "20px", marginLeft: "1px" }}
              >
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Typography variant="subtitle1">Email Language</Typography>
                    <Select
                      value={item.language}
                      onChange={(e) =>
                        handleLanguageChange(e.target.value, index)
                      }
                    >
                      {languageOptions.map((language, idx) => (
                        <MenuItem key={idx} value={language}>
                          {language}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Email Template</Typography>
                  <TextField
                    label="Email Text"
                    multiline
                    rows={4}
                    value={item.template}
                    onChange={(e) =>
                      handleTemplateChange(e.target.value, index)
                    }
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
                        color: "#d32f2f", // Reddish color for the text
                        borderColor: "#d32f2f", // Reddish color for the border
                        marginTop: "1px",
                        textTransform: "none", // Avoid uppercase text
                      }}
                    >
                      Remove
                    </Button>
                  </Grid>
                )}
              </Grid>
            ))}

            {/* Add Button */}
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleAddLanguageAndTemplate}>
                Add
              </Button>
            </Grid>

            {/* Approve for Customer Use Radio Buttons */}
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
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
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
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Direct/Partner Activity Button */}
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
