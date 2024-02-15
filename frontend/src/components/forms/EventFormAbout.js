import React, {useEffect, useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';
import CalendarHeaderForm from '../commons/CalendarHeaderForm';
import {v4 as uuidv4} from 'uuid';

// API calls
import {queryBigQuery} from '../../api/getData'; // Assuming you have a function for fetching data
import {
  Button,
  TextField,
  FormControlLabel,
  Typography,
  Grid,
  Switch,
  FormGroup,
} from '@mui/material';
import '../styles/Forms.css';
import EmojiPicker from 'emoji-picker-react';
import {FormControl, InputLabel, Select, MenuItem} from '@mui/material';
import {
  LocalizationProvider,
  DateTimePicker,
  DatePicker,
} from '@mui/x-date-pickers';

import Chip from '@mui/material/Chip';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';

import {eventTypeOptions} from '../filters/FiltersData';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import {red} from '@mui/material/colors';
import {blue} from '@mui/material/colors';
const labelsClasses = ['indigo', 'gray', 'green', 'blue', 'red', 'purple'];

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

  const {
    daySelected,
    dispatchCalEvent,
    selectedEvent,
    updateFormData,
    formData,
  } = useContext(GlobalContext);

  const [eventType, setEventType] = useState(
      formData.eventType || eventTypeOptions[0].label,
  );
  const [title, setTitle] = useState(
    selectedEvent ? selectedEvent.title : formData.title || '',
  );

  const [description, setDescription] = useState(
    selectedEvent ? selectedEvent.description : formData.description || '',
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedEvent ?
      selectedEvent.label :
      formData.selectedLabel || labelsClasses[0],
  );
  const [emoji, setEmoji] = useState(
    selectedEvent ?
    selectedEvent.emoji :
    formData.emoji || '');
  const [isClient, setIsClient] = useState(selectedEvent ? selectedEvent.isClient : false);

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const [organisedBy, setOrganisedBy] = useState(
    selectedEvent ?
    selectedEvent.organisedBy :
    formData.organisedBy || []);

  const [dropdownValue2] = useState(formData.dropdownValue2 || '');
  const [marketingActivityType, setMarketingActivityType] = useState(
      formData.marketingActivityType || '',
  );
  const [isHighPriority, setIsHighPriority] = useState(
    selectedEvent ? selectedEvent.isHighPriority :
    formData.isHighPriority || false,
  );
  const [startDate, setStartDate] = useState(
    selectedEvent ? selectedEvent.startDate : formData.startDate || new Date(),
  );
  const [endDate, setEndDate] = useState(
    selectedEvent ? selectedEvent.endDate : formData.endDate || new Date(),
  );
  const [marketingProgramInstanceId, setMarketingProgramInstanceId] = useState(
    selectedEvent ? selectedEvent.marketingProgramInstanceId :
    formData.marketingProgramInstanceId || '',
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
    const newOrganisedBy = event.target.value;
    const newColorMap = {...colorMap};

    newOrganisedBy.forEach((option) => {
      if (!colorMap[option]) {
        newColorMap[option] = getRandomColor();
      }
    });

    setOrganisedBy(newOrganisedBy);
    setColorMap(newColorMap); // Update the color map
  };

  useEffect(() => {
    const fetchMarketingProgramOptions = async () => {
      try {
        const response = await queryBigQuery('marketingProgramQuery');
        if (response && Array.isArray(response)) {
          const options = response.map((row) => row.Sandbox_Program_Id);
          const sortedOptions = options.sort(); // Sort the options alphabetically
          setMarketingProgramOptions(sortedOptions);
        } else {
          console.error('Invalid response format:', response);
        }
      } catch (error) {
        console.error('Error fetching marketing program options:', error);
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
        const response = await queryBigQuery('organisedByOptionsQuery');
        if (response && Array.isArray(response)) {
          const options = response.map((row) => row.organisedBy);
          setOrganisedByOptions(options);
        } else {
          console.error('Invalid response format:', response);
        }
      } catch (error) {
        console.error('Error fetching organisedBy options:', error);
      }
    };
  
    fetchOrganisedByOptions();
  }, []);

  const handleNext = () => {
    const eventId = uuidv4(); // Generate a unique event ID


    // Save current form state to cache
    const isTitleValid = title.trim() !== '';
    const isorganisedByValid = organisedBy.length > 0; // Check if the array is not empty
    const isEventTypeValid = eventType.trim() !== '';
    const isDescriptionValid = description.trim() !== '';
    const isMarketingProgramInstanceIdValid =
      marketingProgramInstanceId.trim() !== '';

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

    navigate('/location');
  };

  const onEmojiClick = (emojiData, event) => {
    setEmoji(emojiData.emoji); // emojiData.emoji should be the emoji character
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
            style={{marginBottom: '15px'}}
          >
            <Grid item>
              <Typography variant="h4">
                <span style={{display: 'flex', alignItems: 'center'}}>
                  <CalendarMonthIcon
                    style={{marginRight: '10px', color: blue[500]}}
                  />
                  <span className="mr-1 text-xl text-black  cursor-pointer">
                    Activity{' '}
                  </span>

                  <span style={{fontSize: '1.5rem', marginLeft: '10px'}}>
                    {emoji}
                  </span>
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
              style={{marginBottom: '20px'}}
            >
              <Grid item xs={30}>
                <Typography variant="subtitle1" style={{marginBottom: '4px'}}>
                  Name
                </Typography>

                <TextField
                  label=""
                  variant="outlined"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <Typography variant="subtitle1" style={{marginBottom: '4px'}}>
                  Emoji
                </Typography>
                <Button onClick={toggleEmojiPicker}>
                  {'Choose emoji '}
                  {emoji && (
                    <span style={{fontSize: '1.5rem', marginLeft: '10px'}}>
                      {emoji}
                    </span>
                  )}
                </Button>
                {isClient && isEmojiPickerOpen && (
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                )}{' '}
              </Grid>
            </Grid>

            {/* Dropdown 1 */}
            <Grid
              container
              spacing={2}
              alignItems="center"
              style={{marginBottom: '20px'}}
            >
              <Grid item xs={6}>
                <Typography variant="subtitle1" style={{marginBottom: '4px'}}>
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
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
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
                    {/* Populate dropdown options */}
                    {organisedByOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle1" style={{marginBottom: '4px'}}>
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
            <Grid item xs={6} style={{marginBottom: '20px'}}>
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
                      style={{display: 'flex', alignItems: 'center'}}
                    >
                      <WhatshotIcon style={{color: red[500]}} />
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
              style={{marginBottom: '20px'}}
            >
              {/* Event Start Date */}
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  {eventType === 'Blog Post' ? (
                    <DatePicker
                      label="Event Start Date"
                      inputFormat="MM/dd/yyyy"
                      defaultValue={new Date()}
                      value={startDate}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  ) : (
                    <DateTimePicker
                      label="Event Start Date"
                      inputFormat="MM/dd/yyyy hh:mm a"
                      value={startDate}
                      onChange={handleStartDateChange}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  )}
                </LocalizationProvider>
              </Grid>

              {/* Event End Date - Conditionally Rendered */}
              {eventType !== 'Blog Post' && (
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

            <Grid item xs={12} style={{marginBottom: '20px'}}>
              <Typography variant="subtitle1" style={{marginBottom: '4px'}}>
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
                inputProps={{maxLength: 400}}
                helperText={`${description.length}/400`}
              />
            </Grid>

            <Grid item xs={12} style={{marginBottom: '20px'}}>
              <Typography variant="subtitle1" style={{marginBottom: '4px'}}>
                Marketing Program Instance ID
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

            {!isFormValid && (
              <Typography color="error" style={{marginBottom: '10px'}}>
                Please fill in all required fields.
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleNext}
              style={{
                backgroundColor: '#4285F4',
                color: 'white',
                float: 'right',
                margin: '10px',
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
