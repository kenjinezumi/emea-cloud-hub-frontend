import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import { v4 as uuidv4 } from "uuid";

import { getEventData } from "../../api/getEventData";
import {
  Button,
  TextField,
  FormControlLabel,
  Typography,
  Grid,
  Switch,
  FormGroup,
  Snackbar,
} from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import IconButton from "@mui/material/IconButton";

import "../styles/Forms.css";
import EmojiPicker from "emoji-picker-react";
import { FormControl, Select, MenuItem } from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
  DatePicker,
} from "@mui/x-date-pickers";

import Chip from "@mui/material/Chip";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { eventTypeOptions } from "../filters/FiltersData";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WhatshotIcon from "@mui/icons-material/Whatshot";

import { red } from "@mui/material/colors";
import { blue } from "@mui/material/colors";
const labelsClasses = ["indigo", "gray", "green", "blue", "red", "purple"];

const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const alpha = 0.3; // Set the opacity
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function EventForm() {
  const [colorMap, setColorMap] = useState({}); // New state to store colors
  const [organisedByOptions, setOrganisedByOptions] = useState([]); // State to store dropdown options
  const [marketingProgramOptions, setMarketingProgramOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const {
    daySelected,
    dispatchCalEvent,
    selectedEvent,
    updateFormData,
    formData,
  } = useContext(GlobalContext);

  const [eventType, setEventType] = useState(
    formData.eventType || eventTypeOptions[0].label
  );
  const [title, setTitle] = useState(
    selectedEvent ? selectedEvent.title : formData.title || ""
  );

  const [description, setDescription] = useState(
    selectedEvent ? selectedEvent.description : formData.description || ""
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedEvent
      ? selectedEvent.label
      : formData.selectedLabel || labelsClasses[0]
  );
  const [emoji, setEmoji] = useState(
    selectedEvent ? selectedEvent.emoji : formData.emoji || ""
  );
  const [isClient, setIsClient] = useState(
    selectedEvent ? selectedEvent.isClient : false
  );

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [organisedBy, setOrganisedBy] = useState(
    selectedEvent ? selectedEvent.organisedBy : formData.organisedBy || []
  );

  const [dropdownValue2] = useState(formData.dropdownValue2 || "");
  const [marketingActivityType, setMarketingActivityType] = useState(
    formData.marketingActivityType || ""
  );
  const [isHighPriority, setIsHighPriority] = useState(
    selectedEvent
      ? selectedEvent.isHighPriority
      : formData.isHighPriority || false
  );
  const [startDate, setStartDate] = useState(
    selectedEvent ? selectedEvent.startDate : formData.startDate || new Date()
  );
  const [endDate, setEndDate] = useState(
    selectedEvent ? selectedEvent.endDate : formData.endDate || new Date()
  );
  const [marketingProgramInstanceId, setMarketingProgramInstanceId] = useState(
    selectedEvent
      ? selectedEvent.marketingProgramInstanceId
      : formData.marketingProgramInstanceId || ""
  );
  const [isFormValid, setIsFormValid] = useState(true);
  const navigate = useNavigate();

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };

  useEffect(() => {
    if (formData.eventType) {
      setEventType(formData.eventType);
    }
  }, [formData.eventType]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {}, [startDate, endDate]);
  const handleOrganisedByChange = (event) => {
    const value = event.target.value;
    // Allow multiple selection and deletion
    setOrganisedBy(
      // On autofill, we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleOrganisedByDelete = (organiserToDelete) => () => {
    setOrganisedBy((currentOrganisers) =>
      currentOrganisers.filter((organiser) => organiser !== organiserToDelete)
    );
  };

  useEffect(() => {
    const fetchMarketingProgramOptions = async () => {
      try {
        const response = await getEventData("marketingProgramQuery");
        if (response && Array.isArray(response)) {
          const options = response.map((row) => row.Sandbox_Program_Id);
          const sortedOptions = options.sort(); // Sort the options alphabetically
          setMarketingProgramOptions(sortedOptions);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Error fetching marketing program options:", error);
      }
    };

    fetchMarketingProgramOptions();
  }, []);

  useEffect(() => {
    // Prepopulate marketing program instance ID if available in formData
    if (formData.marketingProgramInstanceId) {
      setMarketingProgramInstanceId(formData.marketingProgramInstanceId);
    }
  }, [formData.marketingProgramInstanceId]);

  useEffect(() => {
    const fetchOrganisedByOptions = async () => {
      try {
        const response = await getEventData("organisedByOptionsQuery");
        if (response && Array.isArray(response)) {
          const options = response.map((row) => row.title).sort();
          setOrganisedByOptions(options);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Error fetching organisedBy options:", error);
      }
    };

    fetchOrganisedByOptions();
  }, []);

  const handleNext = () => {
    const eventId = uuidv4(); // Generate a unique event ID

    // Save current form state to cache
    const isTitleValid = title.trim() !== "";
    const isorganisedByValid = organisedBy.length > 0; // Check if the array is not empty
    const isEventTypeValid = eventType.trim() !== "";
    const isDescriptionValid = description.trim() !== "";
    const isMarketingProgramInstanceIdValid =
      marketingProgramInstanceId.trim() !== "";

    const formIsValid =
      isTitleValid &&
      // isorganisedByValid &&
      isEventTypeValid &&
      isDescriptionValid &&
      isMarketingProgramInstanceIdValid;

    setIsFormValid(formIsValid);

    if (!formIsValid) {
      // Prevent navigation if form is invalid
      return;
    }

    const newFormData = {
      eventId,
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
      eventType,
    };

    updateFormData(newFormData); // Update the global form data

    navigate("/location");
  };

  const onEmojiClick = (emojiData, event) => {
    setEmoji(emojiData.emoji); // emojiData.emoji should be the emoji character
    setIsEmojiPickerOpen(false);
  };

  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen((prev) => !prev); // This ensures it toggles based on the previous state
  };

  const handleSaveAsDraft = () => {
    const draftData = {
      title,
      description,
      organisedBy,
      eventType,
      startDate,
      endDate,
      marketingProgramInstanceId,
      isHighPriority,
      emoji,
    };

    setSnackbarMessage("Draft saved successfully!");
    setSnackbarOpen(true);
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
            style={{ marginBottom: "15px" }}
          >
            <Grid item>
              <Typography variant="h4">
                <span style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ marginRight: "10px", fontSize: "1.5rem" }}>
                    {emoji}
                  </span>
                  <TextField
                    id="standard-basic"
                    variant="standard"
                    fullWidth
                    placeholder="Enter activity name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <IconButton onClick={toggleEmojiPicker}>
                    <EmojiEmotionsIcon />
                  </IconButton>
                </span>
              </Typography>
              {isEmojiPickerOpen && <EmojiPicker onEmojiClick={onEmojiClick} />}
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
                    onChange={handleOrganisedByChange}
                    renderValue={(selected) => (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "5px",
                        }}
                      >
                        {selected.map((organiser) => (
                          <Chip
                            key={organiser}
                            label={organiser}
                            onDelete={handleOrganisedByDelete(organiser)}
                            onMouseDown={(event) => event.stopPropagation()}
                            style={{ margin: "2px" }}
                          />
                        ))}
                      </div>
                    )}
                  >
                    {organisedByOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
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
                    {eventTypeOptions.map((option) => (
                      <MenuItem key={option.label} value={option.label}>
                        {option.label}
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
                      <WhatshotIcon style={{ color: red[500] }} />
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
                      label="Event start date"
                      inputFormat="MM/dd/yyyy"
                      defaultValue={new Date()}
                      value={new Date(startDate)}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  ) : (
                    <DateTimePicker
                      label="Event start date"
                      inputFormat="MM/dd/yyyy hh:mm a"
                      value={new Date(startDate)}
                      onChange={handleStartDateChange}
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
                      label="Event end date"
                      inputFormat="MM/dd/yyyy hh:mm a"
                      value={new Date(endDate)}
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
                Marketing program instance ID
              </Typography>
              <TextField
                label=""
                value={marketingProgramInstanceId}
                onChange={(e) => setMarketingProgramInstanceId(e.target.value)}
                variant="outlined"
                fullWidth
                margin="dense"
              />
            </Grid>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
            />

            {!isFormValid && (
              <Typography color="error" style={{ marginBottom: "10px" }}>
                Please fill in all required fields.
              </Typography>
            )}
            <div style={{ marginTop: "20px", float: "right" }}>
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
                  backgroundColor: blue[500], // using MUI's blue color
                  color: "white",
                  float: "left", // Align it to the left of the Next button
                  margin: "10px",
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
}
