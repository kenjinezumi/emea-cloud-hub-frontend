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
  Checkbox,
  InputAdornment,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
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
import "../styles/Forms.css";

const labelsClasses = ["indigo", "gray", "green", "blue", "red", "purple"];

const EventForm = () => {
  const { formData, selectedEvent, updateFormData } = useContext(GlobalContext);
  const [colorMap, setColorMap] = useState({});
  const [organisedByOptions, setOrganisedByOptions] = useState([]);
  const [newOrganiser, setNewOrganiser] = useState(""); // Input field for adding organisers

  const [marketingProgramOptions, setMarketingProgramOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [eventType, setEventType] = useState(formData.eventType || "");
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
  const [isEventSeries, setIsEventSeries] = useState(
    selectedEvent
      ? selectedEvent.isEventSeries
      : formData.isEventSeries || false
  );
 

  const [speakers, setSpeakers] = useState(
    selectedEvent ? selectedEvent.speakers || [] : formData.speakers || []
  );
  const [newSpeaker, setNewSpeaker] = useState("");
  const today = new Date();
  const [startDate, setStartDate] = useState(
    selectedEvent?.startDate ? new Date(selectedEvent.startDate) : today
  );
  
  const [endDate, setEndDate] = useState(
    selectedEvent?.endDate ? new Date(selectedEvent.endDate) : today
  );
  const [marketingProgramInstanceId, setMarketingProgramInstanceId] = useState(
    selectedEvent
      ? selectedEvent.marketingProgramInstanceId
      : formData.marketingProgramInstanceId || ""
  );
  const [isFormValid, setIsFormValid] = useState(true);
  const [userTimezone, setUserTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isTitleError, setIsTitleError] = useState(false);
  const [isDescriptionError, setIsDescriptionError] = useState(false);
  const [isStartDateError, setIsStartDateError] = useState(false);
  const [isEndDateError, setIsEndDateError] = useState(false);
  const [isOrganisedByError, setIsOrganisedByError] = useState(false);
  const [isEventTypeError, setIsEventTypeError] = useState(false);
  const saveAndNavigate = useFormNavigation();
  const [hasStartDateChanged, setHasStartDateChanged] = useState(false);
  const [hasEndDateChanged, setHasEndDateChanged] = useState(false);
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    setHasStartDateChanged(true); 
  };  
  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    setHasEndDateChanged(true); 
  };
  useEffect(() => {
    if (formData.eventType) setEventType(formData.eventType);
  }, [formData.eventType]);

  useEffect(() => setIsClient(true), []);

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

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleAddSpeaker = () => {
    const trimmedSpeaker = newSpeaker.trim();
    if (isValidEmail(trimmedSpeaker) && !speakers.includes(trimmedSpeaker)) {
      setSpeakers([...speakers, trimmedSpeaker]);
      setNewSpeaker("");
    } else {
      setSnackbarMessage("Invalid or duplicate email address.");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSpeaker = (emailToDelete) => {
    setSpeakers(speakers.filter((email) => email !== emailToDelete));
  };

  const handlePasteSpeakers = (e) => {
    const pastedText = e.clipboardData.getData("Text");
    const pastedEmails = pastedText
      .split(/[ ,;\n]+/)
      .filter((email) => isValidEmail(email) && !speakers.includes(email));

    if (pastedEmails.length > 0) {
      setSpeakers([...speakers, ...pastedEmails]);
      e.preventDefault();
    } else {
      setSnackbarMessage("No valid email addresses found in the pasted text.");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    const eventId = selectedEvent?.eventId || formData.eventId || uuidv4();
    const newFormData = {
      eventId,
      title,
      description,
      emoji,
      organisedBy,
      marketingActivityType,
      isHighPriority,
      isEventSeries,
      startDate,
      endDate,
      marketingProgramInstanceId,
      eventType,
      userTimezone,
      speakers,
    };
    
    updateFormData(newFormData); // This will update the global context on each change
  }, [
    title,
    description,
    emoji,
    organisedBy,
    marketingActivityType,
    isHighPriority,
    isEventSeries,
    startDate,
    endDate,
    marketingProgramInstanceId,
    eventType,
    speakers,
    userTimezone,
    updateFormData,
    formData.eventId,
    selectedEvent?.eventId,
  ]);

  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleNext = async () => {
    const existingEventId = selectedEvent
      ? selectedEvent.eventId
      : formData.eventId;
    const eventId = existingEventId || uuidv4();

    const isTitleValid = title?.trim() !== "";  
    const isDescriptionValid = description?.trim() !== "";
    const isStartDateValid = startDate && !isSameDate(startDate, today);
    const isEndDateValid = endDate && !isSameDate(endDate, today);

    
    const isOrganisedByValid = organisedBy.length > 0;
    const isEventTypeValid = eventType?.trim() !== ""; 
    const isEventIdValid = !!eventId;

    setIsTitleError(!isTitleValid);
    setIsDescriptionError(!isDescriptionValid);
    setIsStartDateError(!isStartDateValid);
    setIsEndDateError(!isEndDateValid);
    setIsOrganisedByError(!isOrganisedByValid);
    setIsEventTypeError(!isEventTypeValid);

    const formIsValid =
      isTitleValid &&
      isDescriptionValid &&
      isStartDateValid &&
      isEndDateValid &&
      isOrganisedByValid &&
      isEventTypeValid &&
      isEventIdValid;

    setIsFormValid(formIsValid);

    if (!formIsValid) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarOpen(true);
      return;
    }
    const draftData = {
      eventId,
      title,
      description,
      emoji,
      organisedBy,
      marketingActivityType,
      isHighPriority,
      isEventSeries,
      startDate,
      endDate,
      marketingProgramInstanceId,
      eventType,
      userTimezone,
      speakers,
      isDraft: true,
      isPublished: false
    };

    const updatedFormData = { ...formData, ...draftData };


    try {
          const response = await sendDataToAPI(updatedFormData);
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

    saveAndNavigate(updatedFormData, "/location");
  };

  const onEmojiClick = (emojiData, event) => {
    setEmoji(emojiData.emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleAddOrganiser = () => {
    const trimmedOrganiser = newOrganiser.trim();
    if (
      isValidEmail(trimmedOrganiser) &&
      !organisedBy.includes(trimmedOrganiser)
    ) {
      setOrganisedBy([...organisedBy, trimmedOrganiser]);
      setNewOrganiser(""); // Clear input after adding
    } else if (!isValidEmail(trimmedOrganiser)) {
      setSnackbarMessage("Invalid email format.");
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Organiser already added.");
      setSnackbarOpen(true);
    }
  };
  const handlePasteOrganisers = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("Text");

    // Split pasted text by common delimiters (comma, semicolon, or space)
    const pastedEmails = pastedText.split(/[ ,;\n]+/).filter(Boolean);

    const validEmails = pastedEmails.filter(
      (email) => isValidEmail(email) && !organisedBy.includes(email)
    );

    if (validEmails.length > 0) {
      setOrganisedBy([...organisedBy, ...validEmails]);
    } else {
      setSnackbarMessage("No valid emails found in the pasted text.");
      setSnackbarOpen(true);
    }
  };

  // Delete an organiser
  const handleDeleteOrganiser = (organiserToDelete) => {
    setOrganisedBy(
      organisedBy.filter((organiser) => organiser !== organiserToDelete)
    );
  };
  const toggleEmojiPicker = () => setIsEmojiPickerOpen((prev) => !prev);

  // const handleSaveAsDraft = async () => {
  //   const existingEventId = selectedEvent ? selectedEvent.eventId : formData.eventId;
  //   const eventId = existingEventId || uuidv4();
  //   const isDraft = true;
  //   const newFormData = {
  //     eventId,
  //     title,
  //     description,
  //     emoji,
  //     organisedBy,
  //     marketingActivityType,
  //     isHighPriority,
  //     isEventSeries,
  //     startDate,
  //     endDate,
  //     marketingProgramInstanceId,
  //     eventType,
  //     isDraft,
  //     userTimezone,
  //     speakers,
  //     isDraft: true,
  //     isPublished: false,
  //   };

  //   updateFormData(newFormData);

  //   try {
  //     const response = await sendDataToAPI(newFormData);
  //     if (response.success) {
  //       updateFormData(newFormData);
  //       setSnackbarMessage("Draft saved successfully!");
  //       setSnackbarOpen(true);
  //     } else {
  //       setSnackbarMessage("Failed to save draft.");
  //       setSnackbarOpen(true);
  //     }
  //   } catch (error) {
  //     setSnackbarMessage("An error occurred while saving the draft.");
  //     setSnackbarOpen(true);
  //   }
  // };
  const isDefaultDate = (date) => date && date.getTime() === 0;
  return (
    <div
      className="h-screen flex flex-col"
      style={{ overscrollBehavior: "contain" }}
    >
      <CalendarHeaderForm />

      <div className="form-container" style={{ overscrollBehavior: "contain" }}>
        <div className="event-form">
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.5rem",
                }}
              >
                <span>{emoji}</span>
                <TextField
                  variant="standard"
                  fullWidth
                  placeholder="Enter activity name"
                  value={title}
                  error={isTitleError}
                  helperText={isTitleError ? "Title is required" : ""}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ ml: 2, flexGrow: 1 }}
                />
                <IconButton onClick={toggleEmojiPicker} sx={{ ml: 1 }}>
                  <EmojiEmotionsIcon />
                </IconButton>
              </Typography>
              {isEmojiPickerOpen && <EmojiPicker onEmojiClick={onEmojiClick} />}
            </Grid>

            <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
              {selectedEvent ? (
                <Typography variant="subtitle1">Edit Activity</Typography>
              ) : (
                <Typography variant="subtitle1">New Activity</Typography>
              )}
            </Grid>
          </Grid>

          <form noValidate>
            {/* Organised By Section */}
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Organised by (Email addresses)
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter email and press Enter, or paste multiple emails"
                value={newOrganiser}
                error={isOrganisedByError}
                onChange={(e) => setNewOrganiser(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddOrganiser();
                }}
                onPaste={handlePasteOrganisers}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddOrganiser} edge="end">
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                margin="normal"
              />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                  marginTop: "10px",
                }}
              >
                {organisedBy.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleDeleteOrganiser(email)}
                    color="primary"
                  />
                ))}
              </div>
            </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Activity type
                </Typography>
                <FormControl fullWidth error={isEventTypeError}>
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
                  {isEventTypeError && (
                    <Typography variant="body2" color="error">
                      Event type is required
                    </Typography>
                  )}
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
                    <Typography
                      variant="subtitle1"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <WhatshotIcon sx={{ color: red[500], mr: 1 }} />
                      High priority status
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>

            {/* Checkbox for event series */}
            <Grid item xs={12} sx={{ mb: 3 }}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isEventSeries}
                      onChange={(e) => setIsEventSeries(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Is the event part of a series?"
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
                      value={isDefaultDate(startDate) ? "" : startDate}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={isStartDateError} // Highlight in red if start date is missing
                          helperText={
                            isStartDateError ? "Start date is required" : ""
                          } // Show error message
                        />
                      )}
                    />
                  ) : (
                    <DateTimePicker
                      label={`Event start date (${userTimezone})`}
                      inputFormat="MM/dd/yyyy hh:mm a"
                      value={new Date(startDate)}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={isStartDateError} // Highlight in red if start date is missing
                          helperText={
                            isStartDateError ? "Start date is required" : ""
                          } // Show error message
                        />
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
                        <TextField
                          {...params}
                          fullWidth
                          error={isEndDateError} // Highlight in red if end date is missing
                          helperText={
                            isEndDateError ? "End date is required" : ""
                          } // Show error message
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
            </Grid>

            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
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
                margin="dense"
                error={isDescriptionError} // Highlight in red if description is missing
                helperText={isDescriptionError ? "Description is required" : ""}
                inputProps={{ maxLength: 400 }}
              />
            </Grid>
            {/* Speakers Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Speakers (Email addresses)
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter email or paste a list"
                value={newSpeaker}
                onChange={(e) => setNewSpeaker(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSpeaker();
                }}
                onPaste={handlePasteSpeakers}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddSpeaker} edge="end">
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                margin="normal"
              />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                  marginTop: "10px",
                }}
              >
                {speakers.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleDeleteSpeaker(email)}
                    color="primary"
                  />
                ))}
              </div>
            </Grid>

            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Marketing program instance ID
              </Typography>
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
              {/* <Button
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
              </Button> */}
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
