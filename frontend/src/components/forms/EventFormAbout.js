import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Box } from "@mui/system";
import debounce from "lodash.debounce";
import geminiLogo from "../popup/logo/gemini.png";
import ReactMarkdown from "react-markdown";
import LoadingDots from "./GeminiAnimation";
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
import { fetchGeminiResponse } from "../../api/geminiApi";

/** 
 * If the Activity Type is one of these, 
 * then "Party Type" is required.
 */
const REQUIRES_PARTY_TYPE = ["Online Event", "Physical Event", "Hybrid Event"];

/**
 * Helper to validate "Organised By" is an LDAP (no "@" allowed).
 */
const isValidLdap = (ldapString) => {
  // Must not be empty or contain '@'
  if (!ldapString.trim()) return false;
  return !ldapString.includes("@");
};

export default function EventForm() {
  const { formData, selectedEvent, updateFormData } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  // For "Organised By" (LDAP)
  const [organisedByOptions, setOrganisedByOptions] = useState([]);
  const [newOrganiser, setNewOrganiser] = useState("");

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isError, setIsError] = useState(false); // NEW: track if it's an error

  // Pull eventType from formData if it matches one of the eventTypeOptions
  const [eventType, setEventType] = useState(
    eventTypeOptions.some((option) => option.label === formData.eventType)
      ? formData.eventType
      : ""
  );

  // Title & Description fields
  const [title, setTitle] = useState(
    formData?.title || selectedEvent?.title || ""
  );
  const [description, setDescription] = useState(
    formData?.description || selectedEvent?.description || ""
  );

  // Emoji
  const [emoji, setEmoji] = useState(
    formData?.emoji || selectedEvent?.emoji || ""
  );
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // "Organised By" (LDAP)
  const [organisedBy, setOrganisedBy] = useState(
    formData?.organisedBy || selectedEvent?.organisedBy || []
  );

  // Additional fields
  const [marketingActivityType, setMarketingActivityType] = useState(
    formData?.marketingActivityType || ""
  );
  const [isHighPriority, setIsHighPriority] = useState(
    formData?.isHighPriority || selectedEvent?.isHighPriority || false
  );
  const [isEventSeries, setIsEventSeries] = useState(
    formData?.isEventSeries || selectedEvent?.isEventSeries || false
  );

  // Speakers
  const [speakers, setSpeakers] = useState(
    formData?.speakers || selectedEvent?.speakers || []
  );
  const [newSpeaker, setNewSpeaker] = useState("");

  // Dates
  const today = new Date();
  const [startDate, setStartDate] = useState(
    formData?.startDate
      ? new Date(formData.startDate)
      : selectedEvent?.startDate
      ? new Date(selectedEvent.startDate)
      : today
  );
  const [endDate, setEndDate] = useState(
    formData?.endDate
      ? new Date(formData.endDate)
      : selectedEvent?.endDate
      ? new Date(selectedEvent.endDate)
      : today
  );

  const [marketingProgramInstanceId, setMarketingProgramInstanceId] = useState(
    formData?.marketingProgramInstanceId ||
      selectedEvent?.marketingProgramInstanceId ||
      ""
  );

  // Party type + error
  const [partyType, setPartyType] = useState(formData?.partyType || "");
  const [isPartyTypeError, setIsPartyTypeError] = useState(false);

  // isPublished toggle
  const [isPublished, setIsPublished] = useState(
    formData?.isPublished || false
  );

  // Validation
  const [isFormValid, setIsFormValid] = useState(true);
  const [isTitleError, setIsTitleError] = useState(false);
  const [isDescriptionError, setIsDescriptionError] = useState(false);
  const [isStartDateError, setIsStartDateError] = useState(false);
  const [isEndDateError, setIsEndDateError] = useState(false);
  const [isOrganisedByError, setIsOrganisedByError] = useState(false);
  const [isEventTypeError, setIsEventTypeError] = useState(false);

  // Additional date/time checks
  const [hasStartDateChanged, setHasStartDateChanged] = useState(false);
  const [hasEndDateChanged, setHasEndDateChanged] = useState(false);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const saveAndNavigate = useFormNavigation();

  // Check endDate logic
  const isEndDateValid = useMemo(() => !!endDate, [endDate]);
  const isEndDateLater = useMemo(
    () => isEndDateValid && new Date(endDate) > new Date(startDate),
    [endDate, startDate, isEndDateValid]
  );

  // Gemini (AI) dialog states
  const [geminiDialogOpen, setGeminiDialogOpen] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatLog, setChatLog] = useState([]);

  // ---------------
  // Data fetching
  // ---------------
  useEffect(() => {
    const fetchMarketingProgramOptions = async () => {
      try {
        const resp = await getEventData("marketingProgramQuery");
        // ...
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
        }
      } catch (error) {
        console.error("Error fetching organisedBy options:", error);
      }
    };
    fetchOrganisedByOptions();
  }, []);

  // Email validator for Speakers
  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // ---------------
  // Date changes
  // ---------------
  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    setHasStartDateChanged(true);
  };
  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    setHasEndDateChanged(true);
  };

  // ---------------
  // Speakers
  // ---------------
  const handleAddSpeaker = () => {
    const trimmedSpeaker = newSpeaker.trim();
    if (isValidEmail(trimmedSpeaker) && !speakers.includes(trimmedSpeaker)) {
      setSpeakers([...speakers, trimmedSpeaker]);
      setNewSpeaker("");
    } else {
      setSnackbarMessage("Invalid or duplicate email address.");
      setIsError(true);
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
      setIsError(true);
      setSnackbarOpen(true);
    }
  };

  // ---------------
  // Organized by (LDAP)
  // ---------------
  const handleAddOrganiser = () => {
    const trimmedOrganiser = newOrganiser.trim();
    if (isValidLdap(trimmedOrganiser) && !organisedBy.includes(trimmedOrganiser)) {
      setOrganisedBy([...organisedBy, trimmedOrganiser]);
      setNewOrganiser("");
    } else if (!isValidLdap(trimmedOrganiser)) {
      setSnackbarMessage("Invalid LDAP. (No '@' allowed)");
      setIsError(true);
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage("Organiser already added.");
      setIsError(true);
      setSnackbarOpen(true);
    }
  };

  const handlePasteOrganisers = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("Text");
    const pastedItems = pastedText.split(/[ ,;\n]+/).filter(Boolean);

    const validLdaps = pastedItems.filter(
      (item) => isValidLdap(item) && !organisedBy.includes(item)
    );
    const invalidLdaps = pastedItems.filter(
      (item) => !isValidLdap(item) || organisedBy.includes(item)
    );

    if (validLdaps.length > 0) {
      setOrganisedBy([...organisedBy, ...validLdaps]);
    }
    if (invalidLdaps.length > 0) {
      setSnackbarMessage(`Invalid or duplicate: ${invalidLdaps.join(", ")}`);
      setIsError(true);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteOrganiser = (ldapToDelete) => {
    setOrganisedBy(organisedBy.filter((org) => org !== ldapToDelete));
  };

  // ---------------
  // Merge formData
  // ---------------
  useEffect(() => {
    const eventId = selectedEvent?.eventId || formData.eventId || uuidv4();

    const newFormData = {
      ...formData,
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
      partyType,
      isPublished,
      userTimezone,
      speakers,
    };

    updateFormData(newFormData);
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
    partyType,
    isPublished,
    speakers,
    userTimezone,
    formData,
    selectedEvent?.eventId,
    updateFormData,
  ]);

  // ---------------
  // Gemini logic
  // ---------------
  const handleGeminiDialogOpen = () => setGeminiDialogOpen(true);
  const handleGeminiDialogClose = () => {
    setGeminiDialogOpen(false);
    setGeminiPrompt("");
    setChatLog([]);
  };

  const handleGeminiSubmit = async () => {
    if (!geminiPrompt.trim()) return;

    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { sender: "user", text: geminiPrompt },
    ]);
    setIsStreaming(true);

    try {
      const response = await fetchGeminiResponse(geminiPrompt, chatLog);
      let responseString = "";
      for await (const chunk of response) {
        responseString += chunk;
      }

      try {
        const parsedResponse = JSON.parse(responseString);
        let accumulatedResponse = "";
        parsedResponse.forEach((item) => {
          item.candidates.forEach((candidate) => {
            candidate.content.parts.forEach((part) => {
              accumulatedResponse += part.text;
            });
          });
        });

        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { sender: "gemini", text: accumulatedResponse },
        ]);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { sender: "gemini", text: "Error: Unable to parse response" },
        ]);
      }
      setIsStreaming(false);
    } catch (error) {
      setIsStreaming(false);
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { sender: "gemini", text: "Error: Unable to fetch response" },
      ]);
      console.error("Error handling streaming response:", error);
    }

    setGeminiPrompt("");
  };

  const handleGeminiSubmitDebounced = useCallback(
    debounce(handleGeminiSubmit, 300),
    [geminiPrompt]
  );

  // ---------------
  // Emoji logic
  // ---------------
  const toggleEmojiPicker = () => setIsEmojiPickerOpen((prev) => !prev);
  const onEmojiClick = (emojiData, event) => {
    setEmoji(emojiData.emoji);
    setIsEmojiPickerOpen(false);
  };

  // ---------------
  // Date helper
  // ---------------
  const isDefaultDate = (date) => date && date.getTime() === 0;

  // ---------------
  // Next button
  // ---------------
  const handleNext = async () => {
    setLoading(true);

    const existingEventId = selectedEvent
      ? selectedEvent.eventId
      : formData.eventId;
    const eventId = existingEventId || uuidv4();

    // Basic validations
    const isTitleValid = title.trim() !== "";
    const isDescriptionValid = description.trim() !== "";
    const isStartDateValid = !!startDate;
    const isOrganisedByValid = organisedBy.length > 0; // must have at least 1
    const isEventTypeValid = eventType.trim() !== "";
    const isEventIdValid = !!eventId;

    // Party Type if event type is in REQUIRES_PARTY_TYPE
    const shouldShowPartyType = REQUIRES_PARTY_TYPE.includes(eventType);
    const isPartyTypeValid = !shouldShowPartyType || partyType.trim() !== "";
    setIsPartyTypeError(shouldShowPartyType && !isPartyTypeValid);

    // End date logic
    const endDateValid = !!endDate;
    const endDateLater = endDateValid && new Date(endDate) > new Date(startDate);

    setIsTitleError(!isTitleValid);
    setIsDescriptionError(!isDescriptionValid);
    setIsStartDateError(!isStartDateValid);
    setIsEndDateError(!(endDateValid && endDateLater));
    setIsOrganisedByError(!isOrganisedByValid);
    setIsEventTypeError(!isEventTypeValid);

    let formIsValid =
      isTitleValid &&
      isDescriptionValid &&
      isStartDateValid &&
      endDateValid &&
      endDateLater &&
      isOrganisedByValid &&
      isEventTypeValid &&
      isEventIdValid &&
      isPartyTypeValid;

    setIsFormValid(formIsValid);

    if (!formIsValid) {
      if (!isStartDateValid) {
        setSnackbarMessage("Start date cannot be empty.");
      } else if (!endDateValid) {
        setSnackbarMessage("End date cannot be empty.");
      } else if (!endDateLater) {
        setSnackbarMessage("End date must be later than the start date.");
      } else {
        setSnackbarMessage("Please fill in all required fields.");
      }
      setIsError(true);
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // Build final data
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
      partyType,
      userTimezone,
      speakers,
      isDraft: !isPublished,
      isPublished: isPublished,
    };
    const updatedFormData = {
      ...formData,
      ...draftData,
    };

    try {
      const response = await sendDataToAPI(updatedFormData);
      if (response.success) {
        setSnackbarMessage(
          isPublished
            ? "Event published successfully!"
            : "Draft saved successfully!"
        );
        setIsError(false);
        setSnackbarOpen(true);
        setTimeout(() => {
          saveAndNavigate(updatedFormData, "/location");
          setLoading(false);
        }, 1500);
      } else {
        setSnackbarMessage("Failed to save or publish event.");
        setIsError(true);
        setSnackbarOpen(true);
        setLoading(false);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the event.");
      setIsError(true);
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  // ---------------
  // Close snackbar
  // ---------------
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

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
                  placeholder="Enter activity name *"
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
            {/* Organised By (LDAP) */}
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Organised by (LDAP) *
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter LDAP and press Enter, or paste multiple"
                value={newOrganiser}
                error={isOrganisedByError}
                onChange={(e) => setNewOrganiser(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOrganiser();
                  }
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
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {organisedBy.map((ldap, index) => (
                  <Chip
                    key={index}
                    label={ldap}
                    onDelete={() => handleDeleteOrganiser(ldap)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>

            {/* Activity Type */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Activity type *
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

              {/* Party Type if necessary */}
              {REQUIRES_PARTY_TYPE.includes(eventType) && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    1st vs 3rd Party *
                  </Typography>
                  <FormControl fullWidth error={isPartyTypeError}>
                    <Select
                      value={partyType}
                      onChange={(e) => setPartyType(e.target.value)}
                    >
                      <MenuItem value="1st Party (Google Owned)">1st Party</MenuItem>
                      <MenuItem value="3rd Party">3rd Party</MenuItem>
                    </Select>
                    {isPartyTypeError && (
                      <Typography variant="body2" color="error">
                        Party Type is required
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {/* High Priority */}
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

            {/* Event Series */}
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

            {/* Dates */}
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
                          error={isStartDateError}
                          helperText={
                            isStartDateError ? "Start date is required" : ""
                          }
                        />
                      )}
                    />
                  ) : (
                    <DateTimePicker
                      label={`Event start date (${userTimezone}) *`}
                      inputFormat="MM/dd/yyyy hh:mm a"
                      value={startDate}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={isStartDateError}
                          helperText={
                            isStartDateError
                              ? "Start date cannot be empty."
                              : ""
                          }
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
                      label={`Event end date (${userTimezone}) *`}
                      inputFormat="MM/dd/yyyy hh:mm a"
                      value={endDate}
                      onChange={handleEndDateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={isEndDateError}
                          helperText={
                            !isEndDateValid
                              ? "End date cannot be empty."
                              : !isEndDateLater
                              ? "End date must be later than start date."
                              : ""
                          }
                          FormHelperTextProps={{
                            sx: {
                              color: "red",
                              margin: 0,
                              position: "absolute",
                              bottom: "-20px",
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
              )}
            </Grid>

            {/* Description with Gemini */}
            <Grid item xs={12} sx={{ mb: 5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1">Description *</Typography>
                <Tooltip title="Generate description with Gemini" arrow>
                  <IconButton
                    onClick={handleGeminiDialogOpen}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ fontStyle: "italic", mr: 1 }}>
                        Generate with Gemini
                      </Typography>
                      <img
                        src={geminiLogo}
                        alt="Gemini Logo"
                        style={{ width: 24, height: 24 }}
                      />
                    </Box>
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                label="Internal description (for internal use only)"
                multiline
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
                fullWidth
                margin="dense"
                error={isDescriptionError}
                helperText={isDescriptionError ? "Description is required" : ""}
                inputProps={{ maxLength: 400 }}
              />
            </Grid>

            {/* Gemini Dialog */}
            <Dialog
              open={geminiDialogOpen}
              onClose={handleGeminiDialogClose}
              maxWidth="md"
              fullWidth
              PaperProps={{
                style: {
                  borderRadius: "12px",
                  padding: "20px",
                },
              }}
            >
              <DialogTitle>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                >
                  Generate Description with Gemini
                </Typography>
              </DialogTitle>
              <DialogContent
                sx={{
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    mb: 2,
                    backgroundColor: "#e8f0fe",
                    p: 2,
                    borderRadius: "8px",
                    overflowY: "auto",
                    maxHeight: "300px",
                  }}
                >
                  {isStreaming ? (
                    <LoadingDots />
                  ) : chatLog.length > 0 ? (
                    chatLog.map((entry, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography
                          variant="body2"
                          color={
                            entry.sender === "user" ? "textPrimary" : "primary"
                          }
                          sx={{
                            fontWeight:
                              entry.sender === "user" ? "bold" : "normal",
                          }}
                        >
                          {entry.sender === "user" ? "You: " : "Gemini: "}
                        </Typography>
                        <Box sx={{ ml: 2 }}>
                          <ReactMarkdown>{entry.text}</ReactMarkdown>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Your AI-generated description will appear here.
                    </Typography>
                  )}
                </Box>
                <Box
                  sx={{
                    mt: 2,
                    backgroundColor: "#f4f4f8",
                    p: 2,
                    borderRadius: "8px",
                  }}
                >
                  <TextField
                    label="Ask Gemini"
                    fullWidth
                    multiline
                    placeholder="Describe what you need help with..."
                    value={geminiPrompt}
                    onChange={(e) => setGeminiPrompt(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      style: {
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        boxShadow: "none",
                      },
                    }}
                    sx={{
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        padding: "10px",
                      },
                    }}
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ justifyContent: "center", mt: 1 }}>
                <Button
                  onClick={handleGeminiDialogClose}
                  variant="outlined"
                  sx={{ borderRadius: "20px" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGeminiSubmit}
                  color="primary"
                  variant="contained"
                  sx={{ borderRadius: "20px" }}
                  disabled={isStreaming}
                >
                  {isStreaming ? "Generating..." : "Generate"}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Speakers */}
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
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSpeaker();
                  }
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
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {speakers.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleDeleteSpeaker(email)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>

            {/* Tactic ID */}
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Tactic ID
              </Typography>
              <TextField
                value={marketingProgramInstanceId}
                onChange={(e) => setMarketingProgramInstanceId(e.target.value)}
                variant="outlined"
                fullWidth
                margin="dense"
              />
            </Grid>

            {/* isPublished Switch */}
            <Grid item xs={12} sx={{ mb: 3 }}>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      name="isPublished"
                      color="primary"
                    />
                  }
                  label={
                    <Typography
                      variant="subtitle1"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      Publish this event?
                    </Typography>
                  }
                />
              </FormGroup>
            </Grid>

            {/* Global SnackBar */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              message={snackbarMessage}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              ContentProps={{
                sx: {
                  backgroundColor: isError ? red[600] : "green",
                  color: "#fff",
                },
              }}
            />

            {/* Validation error at the bottom */}
            {!isFormValid && (
              <Typography color="error" sx={{ mb: 2 }}>
                Please fill in all required fields.
              </Typography>
            )}

            {/* Next button with spinner overlay */}
            <Box sx={{ mt: 3, textAlign: "right", position: "relative" }}>
              {loading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    zIndex: 1,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  backgroundColor: blue[500],
                  color: "white",
                  "&:hover": { backgroundColor: blue[700] },
                }}
                disabled={loading}
              >
                Next
              </Button>
            </Box>
          </form>
        </div>
      </div>
    </div>
  );
}
