import React, { useContext,useEffect, useState } from "react";
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
  FormGroup,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import {ReactComponent as InformationLogo} from '../../assets/svg/information.svg';

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
  const navigate = useNavigate();
  const { formData, updateFormData } = useContext(GlobalContext);


  const handlePrevious = () => {
    navigate("/location"); 

  };
  const [previousFormData, setPreviousFormData] = useState({});

  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      setPreviousFormData(JSON.parse(savedData));
    }
  }, []);

  const handleNext = () => {
    const formIsValid = activityOwner.length > 0 && speakers.length > 0 && eventSeries && emailLanguage && emailText && customerUse && okr.length > 0 && gep.length > 0 && activityType;

    setIsFormValid(formIsValid); 

    if (!formIsValid) {
      return;
    }

    const currentFormData = {
      activityOwner, speakers, eventSeries, emailLanguage, emailText, customerUse, okr, gep, activityType
    };
    updateFormData({ ...formData, ...currentFormData });

    navigate("/audience"); 

  };

  // You can define more handlers as needed

  return (
    <div className="form-container">
      <div className="event-form scrollable-form">
      <Typography variant="h4" className="form-title" style={{ display: 'flex', alignItems: 'center', marginBottom:'40px' }}>
          {/* Uncomment and adjust the following line after importing your SVG */}
          <InformationLogo style={{ marginRight: '8px', width:'40px', height:'40px' }} />
          Extra Details
        </Typography>
        <Grid container spacing={2}>
          {/* Activity Owners Dropdown */}
          <Grid item xs={12}>
            <FormControl fullWidth>
            <Typography variant="subtitle1">Activity owner(s)</Typography>

            <Select
              multiple
              value={activityOwner}
              onChange={(e) => setActivityOwner(e.target.value)}
              renderValue={(selected) => selected.join(', ')}
            >
                {/* Populate with activity owners */}
                <MenuItem value="owner1">Owner 1</MenuItem>
                <MenuItem value="owner2">Owner 2</MenuItem>
                {/* Add more options as needed */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
            <Typography variant="subtitle1">Speakers</Typography>
               <Select
              multiple
              value={speakers}
              onChange={(e) => setSpeakers(e.target.value)}
              renderValue={(selected) => selected.join(', ')}
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
              <Typography variant="subtitle1">
                Does your event belong to a series?
              </Typography>
              <RadioGroup
                value={eventSeries}
                onChange={(e) => setEventSeries(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Exclude those who have already attended" />
                <Grid item xs={12} />
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
                ))}{" "}
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
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <Grid item xs={12} />
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
              renderValue={(selected) => selected.join(', ')}
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
              renderValue={(selected) => selected.join(', ')}
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
              <Typography variant="subtitle1">
                Direct partner activity flag?
              </Typography>
              <RadioGroup
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <Grid item xs={12} />
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
              color: "#202124", // Google's typical text color
              border: "1px solid #dadce0", // Google's border color
              boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
              float: "left", // Changed to 'left' to separate it from the 'Next' button
              margin: "10px",
            }}          >
            Previous
          </Button>
          <Button variant="contained" onClick={handleNext}   style={{ backgroundColor: '#4285F4', color: 'white', float: 'right', margin: '10px' }}
>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
