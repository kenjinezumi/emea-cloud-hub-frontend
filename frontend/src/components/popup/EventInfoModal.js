import React, { useContext, useState } from "react";
import dayjs from "dayjs";
import GlobalContext from "../../context/GlobalContext";
import Draggable from 'react-draggable';
import {
  Button,
  Typography,
  Paper,
  IconButton,
  Divider,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import LabelIcon from "@mui/icons-material/Label";
import PeopleIcon from "@mui/icons-material/People";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ShareIcon from "@mui/icons-material/Share";
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import LanguageIcon from '@mui/icons-material/Language';

export default function EventInfoPopup() {
  const navigate = useNavigate();
  const { formData, selectedEvent, setShowInfoEventModal, updateFormData } = useContext(GlobalContext);
  const [currentSection, setCurrentSection] = useState('About');

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
    console.log(selectedEvent.isDraft)
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
    'About': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body1" display="flex" alignItems="center">
          <EventIcon style={{ marginRight: "5px", color: '#757575' }} />
          {dayjs(selectedEvent.startDate).format("dddd, MMMM D, YYYY h:mm A")}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <InfoIcon style={{ marginRight: "5px", color: '#757575' }} />
          Description:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.description}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <LabelIcon style={{ marginRight: "5px", color: '#757575' }} />
          Organised by:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
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
                }}
              />
            );
          })}
        </Typography>
        <Stack direction="row" spacing={1}>
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
    'Location': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2" display="flex" alignItems="center">
          <TravelExploreIcon style={{ marginRight: "5px", color: '#757575' }} />
          Region:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {Array.isArray(selectedEvent.region) ? selectedEvent.region.join(', ') : selectedEvent.region || 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <MyLocationIcon style={{ marginRight: "5px", color: '#757575' }} />
          Sub-region:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.subRegion ? selectedEvent.subRegion.join(', ') : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <LocationOnIcon style={{ marginRight: "5px", color: '#757575' }} />
          Country:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.country ? selectedEvent.country.join(', ') : 'N/A'}
        </Typography>
      </Stack>
    ),
    'Extra Details': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2" display="flex" alignItems="center">
          <GroupIcon style={{ marginRight: "5px", color: '#757575' }} />
          Activity Owner:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.activityOwner && selectedEvent.activityOwner.length > 0
            ? selectedEvent.activityOwner.map((owner, index) => (
                <Chip
                  key={index}
                  label={owner}
                  sx={{ marginLeft: "5px", backgroundColor: getRandomColor(), color: 'white' }}
                />
              ))
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <PeopleIcon style={{ marginRight: "5px", color: '#757575' }} />
          Speakers:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.speakers && selectedEvent.speakers.length > 0
            ? selectedEvent.speakers.join(', ')
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <DescriptionIcon style={{ marginRight: "5px", color: '#757575' }} />
          Event Series:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.eventSeries || 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <LanguageIcon style={{ marginRight: "5px", color: '#757575' }} />
          Email Language:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.emailLanguage || 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <DescriptionIcon style={{ marginRight: "5px", color: '#757575' }} />
          Customer Use:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.customerUse || 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <DescriptionIcon style={{ marginRight: "5px", color: '#757575' }} />
          OKR:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.okr && selectedEvent.okr.length > 0
            ? selectedEvent.okr.join(', ')
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <DescriptionIcon style={{ marginRight: "5px", color: '#757575' }} />
          GEP:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.gep && selectedEvent.gep.length > 0
            ? selectedEvent.gep.join(', ')
            : 'N/A'}
        </Typography>
      </Stack>
    ),
    'Audience': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2" display="flex" alignItems="center">
          <PeopleIcon style={{ marginRight: "5px", color: '#757575' }} />
          Audience Persona:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.audiencePersona && selectedEvent.audiencePersona.length > 0
            ? selectedEvent.audiencePersona.join(', ')
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <PeopleIcon style={{ marginRight: "5px", color: '#757575' }} />
          Audience Seniority:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.audienceSeniority && selectedEvent.audienceSeniority.length > 0
            ? selectedEvent.audienceSeniority.join(', ')
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <PeopleIcon style={{ marginRight: "5px", color: '#757575' }} />
          Account Sectors:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.accountSectors
            ? Object.entries(selectedEvent.accountSectors).map(([key, value]) => (value ? key : null)).filter(Boolean).join(', ')
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <PeopleIcon style={{ marginRight: "5px", color: '#757575' }} />
          Account Segments:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.accountSegments
            ? Object.entries(selectedEvent.accountSegments).map(([key, value]) => (value ? key : null)).filter(Boolean).join(', ')
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <PeopleIcon style={{ marginRight: "5px", color: '#757575' }} />
          Max Event Capacity:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.maxEventCapacity || 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <PeopleIcon style={{ marginRight: "5px", color: '#757575' }} />
          People Meeting Criteria:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.peopleMeetingCriteria || 'N/A'}
        </Typography>
      </Stack>
    ),
    'Links': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2" display="flex" alignItems="center">
          <LinkIcon style={{ marginRight: "5px", color: '#757575' }} />
          Landing Page Link:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.landingPageLinks && selectedEvent.landingPageLinks.length > 0
            ? selectedEvent.landingPageLinks.map((link, index) => (
                <div key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4285F4' }}
                  >
                    {link}
                  </a>
                </div>
              ))
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <LinkIcon style={{ marginRight: "5px", color: '#757575' }} />
          Sales Kit Link:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.salesKitLinks && selectedEvent.salesKitLinks.length > 0
            ? selectedEvent.salesKitLinks.map((link, index) => (
                <div key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4285F4' }}
                  >
                    {link}
                  </a>
                </div>
              ))
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <LinkIcon style={{ marginRight: "5px", color: '#757575' }} />
          Hailo Link:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.hailoLinks && selectedEvent.hailoLinks.length > 0
            ? selectedEvent.hailoLinks.map((link, index) => (
                <div key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4285F4' }}
                  >
                    {link}
                  </a>
                </div>
              ))
            : 'N/A'}
        </Typography>
        <Typography variant="body2" display="flex" alignItems="center">
          <LinkIcon style={{ marginRight: "5px", color: '#757575' }} />
          Other Documents Link:
        </Typography>
        <Typography variant="body2" sx={{ marginLeft: '30px' }}>
          {selectedEvent.otherDocumentsLinks && selectedEvent.otherDocumentsLinks.length > 0
            ? selectedEvent.otherDocumentsLinks.map((link, index) => (
                <div key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4285F4' }}
                  >
                    {link}
                  </a>
                </div>
              ))
            : 'N/A'}
        </Typography>
      </Stack>
    ),
  };

  return (
    <Draggable handle=".handle">
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
          zIndex: 6000,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
          borderRadius: "7px",
          bgcolor: 'background.paper'
        }}
      >
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Stack direction="row" spacing={1} sx={{ p: 2, alignItems: "center" }} className="handle">
          <Typography variant="h6" component="div">
            {selectedEvent.emoji}
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {selectedEvent.title}
          </Typography>
          {selectedEvent.isDraft && (
            <Chip label="Draft" color="warning" size="small" sx={{ marginRight: 4 }} />
          )}

        </Stack>
        <Divider />
        <Breadcrumbs aria-label="breadcrumb" sx={{ p: 2 }}>
          {Object.keys(sections).map((section) => (
            <Link
              key={section}
              color={currentSection === section ? "text.primary" : "inherit"}
              onClick={() => setCurrentSection(section)}
              sx={{ cursor: "pointer", fontWeight: currentSection === section ? 'bold' : 'normal' }}
            >
              {section}
            </Link>
          ))}
        </Breadcrumbs>
        <Divider />
        {sections[currentSection]}
        <Divider />
        <Stack
          direction="row"
          spacing={1}
          sx={{ p: 2, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShareEvent}
          >
            Share Event
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditEvent}
          >
            Edit Event
          </Button>
        </Stack>
      </Paper>
    </Draggable>
  );
}
