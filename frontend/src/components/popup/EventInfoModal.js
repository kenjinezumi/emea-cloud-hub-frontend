import React, { useContext, useState } from "react";
import dayjs from "dayjs";
import GlobalContext from "../../context/GlobalContext";
import Draggable from 'react-draggable';
import {
  IconButton,
  Typography,
  Paper,
  Divider,
  Chip,
  Stack,
  Button,
  Link as MuiLink,
  AppBar,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import Event from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import LabelIcon from "@mui/icons-material/Label";
import PeopleIcon from "@mui/icons-material/People";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import LanguageIcon from "@mui/icons-material/Language";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

export default function EventInfoPopup() {
  const navigate = useNavigate();
  const { formData, selectedEvent, setShowInfoEventModal, updateFormData } = useContext(GlobalContext);
  const [currentSection, setCurrentSection] = useState('Overview');

  const handleClose = () => {
    setShowInfoEventModal(false);
  };

  if (!selectedEvent) {
    return null;
  }

  const handleShareEvent = () => {
    if (selectedEvent && selectedEvent.eventId) {
      navigate(`/event/${selectedEvent.eventId}`);
    }
    console.log(selectedEvent.isDraft);
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      updateFormData({ ...formData, ...selectedEvent });
      navigate("/create-event");
    }
  };

  const cleanOrganiserName = (name) => {
    let cleanedName = name.replace(/[()]/g, '').trim();
    const uniqueParts = new Set(cleanedName.split(/\s+/));
    return Array.from(uniqueParts).join(' ');
  };

  const googleColors = [
    'rgba(66, 133, 244, 0.6)', // Google Blue 
    'rgba(234, 67, 53, 0.6)',  // Google Red 
    'rgba(251, 188, 5, 0.6)',  // Google Yellow
    'rgba(52, 168, 83, 0.6)',  // Google Green 
    'rgba(255, 112, 67, 0.6)', // Deep Orange 
    'rgba(156, 39, 176, 0.6)', // Purple 
    'rgba(0, 172, 193, 0.6)',  // Cyan
    'rgba(255, 235, 59, 0.6)', // Yellow
    'rgba(121, 85, 72, 0.6)',  // Brown
  ];

  const getRandomColor = () => {
    const index = Math.floor(Math.random() * googleColors.length);
    return googleColors[index];
  };

  const sections = {
    'Overview': (
      <Stack spacing={2} sx={{ pt: 2, pb: 2 }}>
        {/* Description */}
        <Typography 
          variant="body2" 
          display="flex" 
          alignItems="center" 
          sx={{ pl: 2, pr: 2, color: '#5f6368', mt: 1, wordBreak: 'break-word', whiteSpace: 'normal' }}
        >
          <InfoIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          {selectedEvent.description}
        </Typography>
        
        {/* Number of Registered Attendees */}
        <Typography 
          variant="body2" 
          display="flex" 
          alignItems="center" 
          sx={{ pl: 2, pr: 2, color: '#5f6368', mt: 1, wordBreak: 'break-word', whiteSpace: 'normal' }}
        >
          <PersonIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          Number of Registered: {selectedEvent.registeredCount || 0}
        </Typography>

        {/* Landing Page Link */}
        <Typography 
          variant="body2" 
          display="flex" 
          alignItems="center" 
          sx={{ pl: 2, pr: 2, color: '#5f6368', mt: 1, wordBreak: 'break-word', whiteSpace: 'normal' }}
        >
          <LinkIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          {selectedEvent.landingPageLinks && selectedEvent.landingPageLinks.length > 0
            ? selectedEvent.landingPageLinks.map((link, index) => (
                <MuiLink
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1a73e8', marginLeft: '5px', wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                  {link}
                </MuiLink>
              ))
            : 'No landing page'}
        </Typography>

        {/* Organized By */}
        <Typography 
          variant="body2" 
          display="flex" 
          alignItems="center" 
          sx={{ pl: 2, pr: 2, color: '#5f6368', mt: 1, wordBreak: 'break-word', whiteSpace: 'normal' }}
        >
          <LabelIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          Organized by:
          <Stack direction="row" spacing={1} sx={{ pl: 4, pr: 2, flexWrap: 'wrap' }}>
          {selectedEvent.organisedBy.map((organiser, index) => {
            const cleanedName = cleanOrganiserName(organiser);
            return (
              <Chip
                key={index}
                label={cleanedName}
                component="a"
                href={`https://moma.corp.google.com/person/${encodeURIComponent(cleanedName)}`}
                clickable
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  margin: "5px",
                  backgroundColor: getRandomColor(),
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  wordBreak: 'break-word', // Ensure text wrapping
                  whiteSpace: 'normal' // Ensure text wrapping
                }}
              />
            );
          })}
        </Stack>
        </Typography>
        

        {/* Event Type and Priority Chips */}
        <Stack direction="row" spacing={1} sx={{ pl: 2, pr: 2, mt: 1 }}>
          <Chip label={selectedEvent.eventType} color="primary" size="small" />
          {selectedEvent.isHighPriority && (
            <Chip label="High Priority" color="error" size="small" />
          )}
          {dayjs().diff(dayjs(selectedEvent.publishedDate), "day", true) <= 7 && (
            <Chip
              label="Newly published"
              color="success"
              variant="outlined"
              size="small"
            />
          )}
        </Stack>
      </Stack>
    ),
    'Details': (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* Details Section */}
        <Typography variant="body2" display="flex" alignItems="center" sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          <TravelExploreIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          Region:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {Array.isArray(selectedEvent.region) ? selectedEvent.region.join(', ') : selectedEvent.region || 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center" sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          <MyLocationIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          Sub-region:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {selectedEvent.subRegion ? selectedEvent.subRegion.join(', ') : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center" sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          <LocationOnIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          Country:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {selectedEvent.country ? selectedEvent.country.join(', ') : 'N/A'}
        </Typography>
        {/* ...rest of the Details section remains unchanged... */}
      </Stack>
    ),
    'Links': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2" display="flex" alignItems="center" sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          <LinkIcon style={{ marginRight: "5px", color: '#1a73e8' }} />
          Landing Page Link:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {selectedEvent.landingPageLinks && selectedEvent.landingPageLinks.length > 0
            ? selectedEvent.landingPageLinks.map((link, index) => (
                <MuiLink
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4285F4', wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                  {link}
                </MuiLink>
              ))
            : 'N/A'}
        </Typography>
        {/* ...rest of the Links section remains unchanged... */}
      </Stack>
    ),
  };

  return (
    <Draggable handle=".drag-handle">
      <Paper
        sx={{
          position: "fixed",
          top: "25vh",
          left: "40vw",
          transform: "translate(-50%, -50%)",
          minWidth: 600,
          maxWidth: 600,
          maxHeight: '70vh', // Set max height to 70vh for scrollable content
          overflowY: 'auto', // Enable vertical scrolling
          overflowX: 'hidden', // Disable horizontal scrolling
          zIndex: 6000,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
          borderRadius: "8px", // Slightly larger radius for rounded corners
          bgcolor: 'background.paper',
          paddingBottom: '16px', // Extra padding at the bottom
        }}
      >
        {/* Thin Header that is draggable */}
        <AppBar position="static" sx={{ bgcolor: '#f5f5f5', color: '#5f6368', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }} className="drag-handle">
          <Toolbar variant="dense" sx={{ minHeight: '36px' }}>
            <IconButton size="small" color="inherit" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Stack direction="row" spacing={1} sx={{ p: 2, alignItems: "center", borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" component="div">
            {selectedEvent.emoji}
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: '1.2rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {selectedEvent.title}
          </Typography>
          {selectedEvent.isDraft && (
            <Chip label="Draft" color="warning" size="small" sx={{ marginRight: 4 }} />
          )}
          {/* Share, Edit, and Close buttons */}
          <IconButton onClick={handleShareEvent} size="small">
            <ShareIcon />
          </IconButton>
          <IconButton onClick={handleEditEvent} size="small">
            <EditIcon />
          </IconButton>
        </Stack>

        {/* Fixed Date Display */}
        <Typography 
          variant="body1" 
          display="flex" 
          alignItems="center" 
          sx={{ pl: 2, pr: 2, mt: 2, color: '#5f6368', wordBreak: 'break-word', whiteSpace: 'normal' }}
        >
          <Event style={{ marginRight: "5px", color: '#1a73e8' }} />
          {dayjs(selectedEvent.startDate).format("dddd, MMMM D, YYYY h:mm A")}
        </Typography>
        <Divider sx={{ width: '100%', my: 1 }} />

        {/* Buttons for Sections */}
        <Stack direction="row" spacing={1} sx={{ p: 2, justifyContent: 'flex-start' }}>
          {Object.keys(sections).map((section) => (
            <Button
              key={section}
              variant={currentSection === section ? 'contained' : 'outlined'}
              onClick={() => setCurrentSection(section)}
              sx={{
                fontWeight: currentSection === section ? 'bold' : 'normal',
                borderRadius: '20px', // Rounded style
                backgroundColor: currentSection === section ? 'rgba(52, 103, 210, 0.8)' : 'white', // Darker blue for Google-style design
                color: currentSection === section ? 'white' : '#757575',
                '&:hover': {
                  backgroundColor: currentSection === section ? 'rgba(41, 98, 187, 0.9)' : '#f1f1f1',
                },
              }}
            >
              {section}
            </Button>
          ))}
        </Stack>
        <Divider sx={{ width: '100%' }} />
        {sections[currentSection]}
        <Divider sx={{ width: '100%' }} />
      </Paper>
    </Draggable>
  );
}
