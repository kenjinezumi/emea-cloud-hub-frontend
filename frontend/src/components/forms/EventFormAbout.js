import React, { useEffect, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  TextField,
  FormControlLabel,
  Typography,
  Grid,
  Switch,
  FormGroup,
  Snackbar,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputLabel,
} from "@mui/material";
import {
  LocalizationProvider,
  DateTimePicker,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { red, blue } from "@mui/material/colors";
import EmojiPicker from "emoji-picker-react";
import { getEventData } from "../../api/getEventData";
import { sendDataToAPI } from "../../api/pushData";
import GlobalContext from "../../context/GlobalContext";
import { eventTypeOptions } from "../filters/FiltersData";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import "../styles/Forms.css"; // If you still use any styles from this file

const labelsClasses = ["indigo", "gray", "green", "blue", "red", "purple"];

const EventForm = () => {
  const { formData, selectedEvent, updateFormData } = useContext(GlobalContext);
  const [colorMap, setColorMap] = useState({});
  const [organisedByOptions, setOrganisedByOptions] = useState([]);
  const [marketingProgramOptions, setMarketingProgramOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
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
    selectedEvent ? selectedEvent.label : formData.selectedLabel || labelsClasses[0]
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
    selectedEvent ? selectedEvent.isHighPriority : formData.isHighPriority || false
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
  const [userTimezone, setUserTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ); // Retrieve user's timezone
  const saveAndNavigate = useFormNavigation();

  const handleStartDateChange = (newDate) => setStartDate(newDate);
  const handleEndDateChange = (newDate) => setEndDate(newDate);

  useEffect(() => {
    if (formData.eventType) setEventType(formData.eventType);
  }, [formData.eventType]);

  useEffect(() => setIsClient(true), []);

  const handleOrganisedByChange = (event) => {
    const value = event.target.value;
    setOrganisedBy(typeof value === "string" ? value.split(",") : value);
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
          setMarketingProgramOptions(
            response.map((row) => row.Sandbox_Program_Id).sort()
          );
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
    if (formData.marketingProgramInstanceId) {
      setMarketingProgramInstanceId(formData.marketingProgramInstanceId);
    }
  }, [formData.marketingProgramInstanceId]);

  useEffect(() => {
    const fetchOrganisedByOptions = async () => {
      try {
        const response = await getEventData("organisedByOptionsQuery");
        if (response && Array.isArray(response)) {
          setOrganisedByOptions(response.map((row) => row.title).sort());
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
    const existingEventId = selectedEvent ? selectedEvent.eventId : formData.eventId;
    const eventId = existingEventId || uuidv4();

    const isTitleValid = title.trim() !== "";
    const isEventTypeValid = eventType.trim() !== "";
    const isDescriptionValid = description.trim() !== "";
    const isMarketingProgramInstanceIdValid =
      marketingProgramInstanceId.trim() !== "";

    const formIsValid =
      isTitleValid &&
      isEventTypeValid &&
      isDescriptionValid &&
      isMarketingProgramInstanceIdValid;

    setIsFormValid(formIsValid);

    if (!formIsValid) return;

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
      userTimezone, // Store the timezone
    };

    saveAndNavigate(newFormData, "/location");
  };

  const onEmojiClick = (emojiData, event) => {
    setEmoji(emojiData.emoji);
    setIsEmojiPickerOpen(false);
  };

  const toggleEmojiPicker = () => setIsEmojiPickerOpen((prev) => !prev);

  const handleSaveAsDraft = async () => {
    const existingEventId = selectedEvent ? selectedEvent.eventId : formData.eventId;
    const eventId = existingEventId || uuidv4();
    const isDraft = true;
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
      isDraft,
      userTimezone, // Store the timezone
    };

    updateFormData(newFormData);

    try {
      const response = await sendDataToAPI(newFormData);
      if (response.success) {
        updateFormData(newFormData);
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
      style={{ overscrollBehavior: "contain" }} // Prevent bounce at top/bottom of the container
    >
      <CalendarHeaderForm />

      <div className="form-container" style={{ overscrollBehavior: "contain" }}>
        <div className="event-form">
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ display: "flex", alignItems: "center", fontSize: '1.5rem' }}>
                <span>{emoji}</span>
                <TextField
                  variant="standard"
                  fullWidth
                  placeholder="Enter activity name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ ml: 2, flexGrow: 1 }}
                />
                <IconButton onClick={toggleEmojiPicker} sx={{ ml: 1 }}>
                  <EmojiEmotionsIcon />
                </IconButton>
              </Typography>
              {isEmojiPickerOpen && <EmojiPicker onEmojiClick={onEmojiClick} />}
            </Grid>

            <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
              {selectedEvent ? (
                <Typography variant="subtitle1">Edit Activity</Typography>
              ) : (
                <Typography variant="subtitle1">New Activity</Typography>
              )}
            </Grid>
          </Grid>

          <form noValidate>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Organised by</Typography>
                <FormControl fullWidth>
                  <InputLabel id="organised-by-label">Organised by</InputLabel>
                  <Select
                    labelId="organised-by-label"
                    id="organised-by-select"
                    multiple
                    value={organisedBy}
                    onChange={handleOrganisedByChange}
                    renderValue={(selected) => (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
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

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Activity type</Typography>
                <FormControl fullWidth>
                  <Select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
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

            <Grid item xs={12} sx={{ mb: 3 }}>
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
                    <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
                      <WhatshotIcon sx={{ color: red[500], mr: 1 }} />
                      High priority status
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  {eventType === "Blog Post" ? (
                    <DatePicker
                      label={`Event start date (${userTimezone})`}
                      inputFormat="MM/dd/yyyy"
                      value={new Date(startDate)}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  ) : (
                    <DateTimePicker
                      label={`Event start date (${userTimezone})`}
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

              {eventType !== "Blog Post" && (
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label={`Event end date (${userTimezone})`}
                      inputFormat="MM/dd/yyyy hh:mm a"
                      value={new Date(endDate)}
                      onChange={handleEndDateChange}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Description</Typography>
              <TextField
                label="Internal description (for internal use only)"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                fullWidth
                margin="dense"
                inputProps={{ maxLength: 400 }}
                helperText={`${description.length}/400`}
              />
            </Grid>

            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Marketing program instance ID</Typography>
              <TextField
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
              <Typography color="error" sx={{ mb: 2 }}>
                Please fill in all required fields.
              </Typography>
            )}

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button
                variant="contained"
                onClick={handleSaveAsDraft}
                sx={{
                  backgroundColor: blue[500],
                  color: "white",
                  marginRight: 2,
                  "&:hover": {
                    backgroundColor: blue[700],
                  },
                }}
              >
                Save as Draft
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  backgroundColor: blue[500],
                  color: "white",
                  "&:hover": {
                    backgroundColor: blue[700],
                  },
                }}
              >
                Next
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
