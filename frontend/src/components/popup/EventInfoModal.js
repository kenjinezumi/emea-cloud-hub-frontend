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

export default function EventInfoPopup() {
  const navigate = useNavigate();
  const { selectedEvent, setShowInfoEventModal } = useContext(GlobalContext);
  const [currentSection, setCurrentSection] = useState('About');

  const handleClose = () => {
    setShowInfoEventModal(false); // Close the pop-up by setting showEventInfoModal to false
  };

  if (!selectedEvent) {
    return null; // Don't render the pop-up if no event is selected
  }

  const handleShareEvent = () => {
    if (selectedEvent && selectedEvent.eventId) {
      navigate(`/event/${selectedEvent.eventId}`);
    }
  };

  const handleEditEvent = () => {
    console.log("Whats going on")
    if (selectedEvent) {

      console.log(`Selected event is: ${selectedEvent.startDate}`);
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
        <Typography variant="body1">
          {dayjs(selectedEvent.startDate).format("dddd, MMMM D, YYYY h:mm A")}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label="Online Event" color="primary" size="small" />
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
        <Typography variant="body2">
          <TravelExploreIcon style={{ marginRight: "5px", color: '#757575' }} />
          {selectedEvent.region}
          <MyLocationIcon style={{ marginRight: "5px", marginLeft: "40px", color: '#757575' }} />
          {selectedEvent.subRegion.toString()}
        </Typography>
        <Typography variant="body2">
          <LocationOnIcon style={{ marginRight: "5px", color: '#757575' }} />
          {selectedEvent.country.toString()}
        </Typography>
      </Stack>
    ),
    'Extra Details': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2">
          <LabelIcon style={{ marginRight: "5px", color: '#757575' }} />
          Organised by:
          {selectedEvent.organisedBy.map((organiser, index) => (
            <Chip
              key={index}
              label={cleanOrganiserName(organiser)}
              component="a"
              href={`https://moma.corp.google.com/person/${encodeURIComponent(cleanOrganiserName(organiser))}`}
              clickable
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                marginLeft: "5px",
                backgroundColor: getRandomColor(),
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </Typography>
        <Typography variant="body2">
          <DescriptionIcon style={{ marginRight: "5px", color: '#757575' }} />
          Description: {selectedEvent.description}
        </Typography>
      </Stack>
    ),
    'Audience': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2">
          <PeopleIcon style={{ marginRight: "10px", color: '#757575' }} />
          Max event capacity: {selectedEvent.maxEventCapacity}
        </Typography>
      </Stack>
    ),
    'Links': (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="body2">
          <LinkIcon style={{ marginRight: "5px", color: '#757575' }} />
          <a
            href={selectedEvent.landingPageLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {selectedEvent.landingPageLink}
          </a>
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
          <Typography variant="h6" component="div" >
            {selectedEvent.emoji}
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {selectedEvent.title}
          </Typography>
        </Stack>
        <Divider />
        <Breadcrumbs aria-label="breadcrumb" sx={{ p: 2 }}>
          {Object.keys(sections).map((section) => (
            <Link
              key={section}
              color={currentSection === section ? "text.primary" : "inherit"}
              onClick={() => setCurrentSection(section)}
              sx={{ cursor: "pointer" }}
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
