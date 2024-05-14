import React, {useState, useContext} from 'react';
import GlobalContext from '../../context/GlobalContext';
import CalendarHeaderForm from '../commons/CalendarHeaderForm';
import dayjs from 'dayjs';
import {Button, TextField, Typography, Grid, Snackbar, Chip, InputAdornment, IconButton } from '@mui/material';
import {useNavigate} from 'react-router-dom';
import '../styles/Forms.css';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import {sendDataToAPI} from '../../api/pushData'; // Adjust the path as per your project structure
import LinkIcon from '@mui/icons-material/Link';
import {blue} from '@mui/material/colors';

const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

export default function LinksForm() {
  const { formData, selectedEvent, updateFormData } = useContext(GlobalContext);
  const [links, setLinks] = useState({
    LandingPageLinks: selectedEvent?.landingPageLinks || formData?.landingPageLinks || [],
    SalesKitLinks: selectedEvent?.salesKitLinks || formData?.salesKitLinks || [],
    HailoLinks: selectedEvent?.hailoLinks || formData?.hailoLinks || [],
    OtherDocumentsLinks: selectedEvent?.otherDocumentsLinks || formData?.otherDocumentsLinks || [],
  });
  const [newLink, setNewLink] = useState({ landingPage: '', salesKit: '', hailo: '', otherDocuments: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleLinkChange = (type, value) => {
    setNewLink({ ...newLink, [type]: value });
  };

  const handleAddLink = (type) => {
    if (newLink[type] && isValidUrl(newLink[type])) {
      setLinks({
        ...links,
        [`${type}Links`]: [...links[`${type}Links`], newLink[type]]
      });
      setNewLink({ ...newLink, [type]: '' });
    } else {
      setSnackbarMessage('Invalid URL. Please enter a valid URL.');
      setSnackbarOpen(true);
      setIsError(true);
    }
  };

  const handleDeleteLink = (type, linkToDelete) => {
    setLinks({
      ...links,
      [`${type}Links`]: links[`${type}Links`].filter(link => link !== linkToDelete)
    });
  };

  const handlePrevious = () => {
    navigate('/audience'); // Adjust according to your route
  };

  const handleFinalSave = () => {
    if (!Object.values(links).every(category => category.length > 0)) {
      setSnackbarMessage('Please add at least one link in each category.');
      setSnackbarOpen(true);
      setIsError(true);
      return;
    }
    updateFormData({ ...formData, ...links });
    navigate('/'); // Navigate to the home page after saving
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const fieldNames = {
    landingPage: 'Landing Page',
    salesKit: 'Sales Kit',
    socialPromotion: 'Social Promotion',
    otherDocuments: 'Other Documents'
  };



  return (
    <div className="h-screen flex flex-col">
      <CalendarHeaderForm />
      <div className="form-container">
        <div className="event-form">
          <Typography variant="h4" className="form-title" style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <LinkIcon style={{ marginRight: '10px', color: blue[500], height: '40px' }} />
            Links
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(links).map(([key, value], index) => (
              <Grid item xs={12} key={key}>
                <Typography variant="subtitle1">{key.replace('Links', '').replace(/([A-Z])/g, ' $1')}</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={newLink[key.replace('Links', '')]}
                  onChange={(e) => handleLinkChange(key.replace('Links', ''), e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleAddLink(key.replace('Links', ''))} edge="end">
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  margin="normal"
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                  {value.map((link, linkIndex) => (
                    <Chip
                      key={linkIndex}
                      label={link}
                      onDelete={() => handleDeleteLink(key.replace('Links', ''), link)}
                      color="primary"
                    />
                  ))}
                </div>
              </Grid>
            ))}
          </Grid>
          <div style={{ marginTop: '20px', float: 'right' }}>
            <Button variant="outlined" onClick={handlePrevious} style={{ backgroundColor: 'white', color: '#202124', border: '1px solid #dadce0', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.302)', float: 'left', margin: '10px' }}>
              Previous
            </Button>
            <Button variant="contained" onClick={handleFinalSave} style={{ backgroundColor: '#4285F4', color: 'white', float: 'right', margin: '10px' }}>
              Save
            </Button>
          </div>
        </div>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} message={snackbarMessage} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} ContentProps={{ style: { backgroundColor: isError ? 'red' : 'green' } }} />
      </div>
    </div>
  );
}