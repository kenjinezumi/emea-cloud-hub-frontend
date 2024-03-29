import React, { useContext } from "react";
import dayjs from "dayjs";
import GlobalContext from "../../context/GlobalContext";
import {
  Button,
  Typography,
  Paper,
  IconButton,
  Divider,
  Chip,
  Avatar,
  Stack,
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

  const handleClose = () => {
    setShowInfoEventModal(false); // Close the pop-up by setting showEventInfoModal to false
  };

  if (!selectedEvent) {
    return null; // Don't render the pop-up if no event is selected
  }


 

  const handleShareEvent = () => {
    console.log('wtf');
    console.log(selectedEvent.eventId)
    if (selectedEvent && selectedEvent.eventId) {
      console.log('hi')
      navigate(`/event/${selectedEvent.eventId}`);
    }
  };
  

  const handleEditEvent = () => {
    if (selectedEvent) {
      // Pass the selected event data to the EventForm component and navigate to it
      selectedEvent.startDate = null;
      selectedEvent.endDate = null;
      navigate("/create-event");
    }
  };

  const isEventNew = (dateStart, dateEnd, step) => {
    if (dayjs(dateEnd) - dayjs(dateStart) <= step) {
      return true;
    } else {
      return false;
    }
  };
  isEventNew();

  return (
    <Paper
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        minWidth: 500,
        zIndex: 6000,
      }}
    >
      <IconButton
        onClick={handleClose}
        size="small"
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <Stack direction="row" spacing={1} sx={{ p: 2, alignItems: "center" }}>
        {/* Render the emoji if available */}
        <Avatar>{selectedEvent.emoji}</Avatar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {selectedEvent.title}
        </Typography>
      </Stack>
      <Divider />
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* Rest of the event details */}
        <Typography variant="body1">
          {dayjs(selectedEvent.startDate).format("dddd, MMMM D, YYYY h:mm A")}
        </Typography>
        {/* Map chips for event properties like high priority etc. */}
        <Stack direction="row" spacing={1}>
          <Chip label="Online Event" color="primary" size="small" />
          {selectedEvent.isHighPriority && (
            <Chip label="High Priority" color="error" size="small" />
          )}
          {dayjs().diff(dayjs(selectedEvent.publishedDate), "day", true) <=
            7 && (
            <Chip
              label="Newly published"
              color="success"
              variant="outlined"
              size="small"
            />
          )}

          {dayjs().diff(dayjs(selectedEvent.publishedDate), "day", true) > 7 &&
            dayjs().diff(dayjs(selectedEvent.lastEditedDate), "day", true) <=
              7 && (
              <Chip
                label="Newly published"
                color="success"
                variant="outlined"
                size="small"
              />
            )}
        </Stack>
        {/* Add other event details with Typography */}
        <Typography variant="body2">
          <TravelExploreIcon style={{ marginRight: "5px" }} />
          {selectedEvent.region}
          <MyLocationIcon style={{ marginRight: "5px", marginLeft: "40px" }} />
          {selectedEvent.subRegion.toString()}
        </Typography>
        <Typography variant="body2">
          <LocationOnIcon style={{ marginRight: "5px" }} />
          {selectedEvent.country.toString()}
        </Typography>
        <Typography variant="body2">
          <LinkIcon style={{ marginRight: "5px" }} />
          <a
            href={selectedEvent.landingPageLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {selectedEvent.landingPageLink}
          </a>
        </Typography>
        <Typography variant="body2">
          <PeopleIcon style={{ marginRight: "10px" }} />
          Max event capacity: {selectedEvent.maxEventCapacity}
        </Typography>
        <Typography variant="body2">
          <LabelIcon style={{ marginRight: "5px" }} />
          Organised by: {selectedEvent.organisedBy}
        </Typography>
        <Typography variant="body2">
          <DescriptionIcon style={{ marginRight: "5px" }} />
          Description: {selectedEvent.description}
        </Typography>
      </Stack>
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
  );
}
