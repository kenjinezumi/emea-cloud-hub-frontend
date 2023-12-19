import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";

import {
  Button,
  TextField,
  FormControlLabel,
  Typography,
  Grid,
  Switch,
  FormGroup,
} from "@mui/material";
import "../styles/Forms.css";
import EmojiPicker from "emoji-picker-react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
  DatePicker,
} from "@mui/x-date-pickers";
import Chip from "@mui/material/Chip";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ReactComponent as FireLogo } from "../../assets/svg/fire.svg";
import { eventTypeOptions } from "../filters/FiltersData";
const labelsClasses = ["indigo", "gray", "green", "blue", "red", "purple"];

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const alpha = 0.3; // Set the opacity
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function EventForm() {
  const [eventType, setEventType] = useState("");
  const [colorMap, setColorMap] = useState({}); // New state to store colors

  const { daySelected, dispatchCalEvent, selectedEvent, updateFormData } =
    useContext(GlobalContext);
  const [title, setTitle] = useState(selectedEvent ? selectedEvent.title : "");
  const [description, setDescription] = useState(
    selectedEvent ? selectedEvent.description : ""
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedEvent
      ? labelsClasses.find((lbl) => lbl === selectedEvent.label)
      : labelsClasses[0]
  );
  const [emoji, setEmoji] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [organisedBy, setOrganisedBy] = useState([]);
  const [dropdownValue2, setDropdownValue2] = useState("");
  const [marketingActivityType, setMarketingActivityType] = useState("");
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [marketingProgramInstanceId, setMarketingProgramInstanceId] =
    useState("");
  const [isFormValid, setIsFormValid] = useState(true); // State to track form validity

  const navigate = useNavigate();

  const handleOrganisedByChange = (event) => {
    const newOrganisedBy = event.target.value;
    const newColorMap = { ...colorMap };

    newOrganisedBy.forEach((option) => {
      if (!colorMap[option]) {
        newColorMap[option] = getRandomColor();
      }
    });

    setOrganisedBy(newOrganisedBy);
    setColorMap(newColorMap); // Update the color map
  };

  const handleNext = () => {
    // Save current form state to cache
    const isTitleValid = title.trim() !== "";
    const isorganisedByValid = organisedBy.length > 0; // Check if the array is not empty
    const isEventTypeValid = eventType.trim() !== "";
    const isDescriptionValid = description.trim() !== "";
    const isMarketingProgramInstanceIdValid =
      marketingProgramInstanceId.trim() !== "";

    const formIsValid =
      isTitleValid &&
      isorganisedByValid &&
      isEventTypeValid &&
      isDescriptionValid &&
      isMarketingProgramInstanceIdValid;

    setIsFormValid(formIsValid);

    if (!formIsValid) {
      // Prevent navigation if form is invalid
      return;
    }

    const newFormData = {
      title,
      description,
      emoji,
      organisedBy,
      dropdownValue2,
      marketingActivityType,
      isHighPriority,
      startDate,
      endDate,
      marketingProgramInstanceId,
    };

    updateFormData(newFormData); // Update the global form data

    navigate("/location");
  };

  const onEmojiClick = (event, emojiObject) => {
    console.log("Emoji Object:", emojiObject);
    setEmoji(emojiObject.emoji);
    setIsEmojiPickerOpen(false);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  return (
    <div className="h-screen flex flex-col">
        <CalendarHeaderForm />

    <div className="form-container">

      <div className="event-form">
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          style={{ marginBottom: "40px" }}
        >
          <Grid item>
            <Typography variant="h4">
              <span style={{ display: "flex", alignItems: "center" }}>
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: "10px" }}
                >
                  <path
                    opacity="0.15"
                    d="M4 19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V11H4V19Z"
                    fill="#001A72"
                  />
                  <path
                    d="M15 3V7M9 3V7M4 11H20M20 11V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V11Z"
                    stroke="#001A72"
                  />
                </svg>
                Activity
              </span>
            </Typography>
          </Grid>
          <Grid item>
            {selectedEvent ? (
              <Typography variant="subtitle1">Edit Activity</Typography>
            ) : (
              <Typography variant="subtitle1">New Activity</Typography>
            )}
          </Grid>
        </Grid>

        <form noValidate>
          <Grid
            container
            spacing={2}
            alignItems="center"
            style={{ marginBottom: "20px" }}
          >
            <Grid item xs={2}>
              <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                Emoji
              </Typography>

              <Button onClick={toggleEmojiPicker}>Choose Emoji</Button>
              {emoji && (
                <span style={{ fontSize: "1.5rem", marginLeft: "10px" }}>
                  {emoji}
                </span>
              )}
              {isEmojiPickerOpen && <EmojiPicker onEmojiClick={onEmojiClick} />}
            </Grid>
            <Grid item xs={10}>
              <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                Name
              </Typography>

              <TextField
                label="Event Name"
                variant="outlined"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Dropdown 1 */}
          <Grid
            container
            spacing={2}
            alignItems="center"
            style={{ marginBottom: "20px" }}
          >
            <Grid item xs={6}>
              <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                Organised by
              </Typography>

              <FormControl fullWidth>
                <Select
                  labelId="organised-by-label"
                  id="organised-by-select"
                  multiple
                  value={organisedBy}
                  onChange={handleOrganisedByChange} // Use the new change handler
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={value}
                          style={{
                            margin: 2,
                            backgroundColor: colorMap[value],
                          }}
                        />
                      ))}
                    </div>
                  )}
                >
                  <MenuItem value="Option1">Option 1</MenuItem>
                  <MenuItem value="Option2">Option 2</MenuItem>
                  {/* ... other options */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                Activity type
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  label="Event Type"
                >
                  {eventTypeOptions.map((type, idx) => (
                    <MenuItem key={idx} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid item xs={6} style={{ marginBottom: "20px" }}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    checked={isHighPriority}
                    onChange={() => setIsHighPriority(!isHighPriority)}
                    name="highPriority"
                    color="primary"
                  />
                }
                label={
                  <Typography
                    variant="subtitle1"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <FireLogo
                      style={{
                        width: "30px",
                        height: "30px",
                        marginRight: "8px",
                      }}
                    />
                    High priority status
                  </Typography>
                }
              />
            </FormGroup>
          </Grid>
          <Grid
            container
            spacing={2}
            alignItems="center"
            style={{ marginBottom: "20px" }}
          >
            {/* Event Start Date */}
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {eventType === "Blog Post" ? (
                  <DatePicker
                    label="Event Start Date"
                    inputFormat="MM/dd/yyyy"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                ) : (
                  <DateTimePicker
                    label="Event Start Date"
                    inputFormat="MM/dd/yyyy hh:mm a"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                )}
              </LocalizationProvider>
            </Grid>

            {/* Event End Date - Conditionally Rendered */}
            {eventType !== "Blog Post" && (
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Event End Date"
                    inputFormat="MM/dd/yyyy"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            )}
          </Grid>

          <Grid item xs={12} style={{ marginBottom: "20px" }}>
            <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
              Description
            </Typography>
            <TextField
              label="Internal description (for internal use only)"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              fullWidth
              margin="dense" // Reduced margin
              inputProps={{ maxLength: 400 }}
              helperText={`${description.length}/400`}
            />
          </Grid>

          <Grid item xs={12} style={{ marginBottom: "20px" }}>
            <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
              Marketing Program Instance ID
            </Typography>
            <TextField
              label="Marketing Program Instance ID"
              value={marketingProgramInstanceId}
              onChange={(e) => setMarketingProgramInstanceId(e.target.value)}
              variant="outlined"
              fullWidth
              // Try adjusting or removing this margin
              margin="dense" // Changed from 'normal' to 'dense' for less space
            />
          </Grid>

          {!isFormValid && (
            <Typography color="error" style={{ marginBottom: "10px" }}>
              Please fill in all required fields.
            </Typography>
          )}

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
        </form>
      </div>
    </div>
    </div>
  );
}
