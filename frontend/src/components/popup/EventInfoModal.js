import React, { useContext, useState, useRef } from "react";
import dayjs from "dayjs";
import GlobalContext from "../../context/GlobalContext";
import Draggable from "react-draggable";
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
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import LabelIcon from "@mui/icons-material/Label";
import PeopleIcon from "@mui/icons-material/People";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public"; // Added for world icon
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import { red, blue } from "@mui/material/colors";

export default function EventInfoPopup({ event, close }) {
  const navigate = useNavigate();
  const { formData, selectedEvent, setShowInfoEventModal, updateFormData } =
    useContext(GlobalContext);
  const [currentSection, setCurrentSection] = useState("Overview");
  const [selectedLanguage, setSelectedLanguage] = useState(
    event &&
      event.languagesAndTemplates &&
      event.languagesAndTemplates.length > 0
      ? event.languagesAndTemplates[0].language
      : ""
  );
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLanguageClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setAnchorEl(null); // Close the menu
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const languagesAndTemplates = selectedEvent?.languagesAndTemplates || [];
  const nodeRef = useRef(null);

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
  };

  const handleEditEvent = () => {
    if (selectedEvent) {
      updateFormData({ ...formData, ...selectedEvent });
      navigate("/create-event");
    }
  };

  const handleGmailInvite = async () => {
    try {
      const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

      // Fetch the access token from localStorage
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("Access token not found. Please log in again.");
        alert("Access token not found. Please log in again.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.emails?.[0]?.value;

      if (!email || !selectedLanguage) {
        console.error(
          "No email or selected language found. Aborting draft creation."
        );
        alert("No email or template selected.");
        return;
      }

      // Define the template based on the selected language
      const template = languagesAndTemplates.find(
        (item) => item.language === selectedLanguage
      )?.template;

      const subjectLine = languagesAndTemplates.find(
        (item) => item.language === selectedLanguage
      )?.subjectLine;

      if (!template) {
        console.error("No template found for the selected language.");
        alert("No template found for the selected language.");
        return;
      }
      if (!subjectLine) {
        console.error("No subject linefound for the selected language.");
        alert("No subject line found for the selected language.");
        return;
      }

      // Prepare the email details to send to the backend
      const emailDetails = {
        to: email,
        subject: subjectLine,
        body: template,
      };

      console.log(
        "Sending request to create Gmail draft with email details:",
        emailDetails
      );

      // Send request to backend to create the Gmail draft
      const response = await fetch(`${apiUrl}send-gmail-invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${accessToken}`, // Include the access token
        },
        body: JSON.stringify(emailDetails),
      });

      console.log("Response from server:", response);

      if (!response.ok) {
        console.error(
          "Failed to create draft. Response status:",
          response.status
        );
        throw new Error(`Failed to create Gmail draft: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Draft created successfully. Server response:", data);

      if (data.success) {
        console.log("Redirecting to Gmail drafts at:", data.draftUrl);
        window.open(data.draftUrl, "_blank");
      } else {
        console.error("Error creating draft email. Server response:", data);
        alert("Error creating draft email.");
      }
    } catch (error) {
      console.error("Error creating Gmail draft:", error);
      alert("Failed to create Gmail draft. Please try again.");
    }
  };

  const formatListWithSpaces = (list) => {
    if (!list) return "";
    if (typeof list === "string") return list.replace(/,/g, ", ");
    if (!Array.isArray(list)) return "";
    return list.map((item) => item.replace(/,/g, ", ")).join(", ");
  };

  const googleColors = [
    "rgba(66, 133, 244, 0.6)", // Google Blue
    "rgba(234, 67, 53, 0.6)", // Google Red
    "rgba(251, 188, 5, 0.6)", // Google Yellow
    "rgba(52, 168, 83, 0.6)", // Google Green
    "rgba(255, 112, 67, 0.6)", // Deep Orange
    "rgba(156, 39, 176, 0.6)", // Purple
    "rgba(0, 172, 193, 0.6)", // Cyan
    "rgba(255, 235, 59, 0.6)", // Yellow
    "rgba(121, 85, 72, 0.6)", // Brown
  ];

  const getRandomColor = () => {
    const index = Math.floor(Math.random() * googleColors.length);
    return googleColors[index];
  };

  const sections = {
    Overview: (
      <Stack spacing={2} sx={{ pt: 2, pb: 2 }}>
        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{
            pl: 2,
            pr: 2,
            color: "#5f6368",
            mt: 1,
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          <InfoIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          {selectedEvent.description || "No description available."}
        </Typography>

        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{
            pl: 2,
            pr: 2,
            color: "#5f6368",
            mt: 1,
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          <PeopleIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Registrations: {selectedEvent.registeredCount || 0}
        </Typography>

        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{
            pl: 2,
            pr: 2,
            color: "#5f6368",
            mt: 1,
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          <LinkIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          <Typography
            variant="body2"
            sx={{ display: "inline", marginRight: "5px" }}
          >
            Landing Page:
          </Typography>
          {selectedEvent.landingPageLinks &&
          selectedEvent.landingPageLinks.length > 0
            ? selectedEvent.landingPageLinks.map((link, index) => (
                <MuiLink
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#1a73e8",
                    marginLeft: "5px",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {link}
                </MuiLink>
              ))
            : "No landing page"}
        </Typography>

        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{
            pl: 2,
            pr: 2,
            color: "#5f6368",
            mt: 1,
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Organized by:
          <Stack
            direction="row"
            spacing={1}
            sx={{ pl: 4, pr: 2, flexWrap: "wrap" }}
          >
            {selectedEvent.organisedBy.map((organiser, index) => (
              <Chip
                key={index}
                label={organiser}
                component="a"
                href={`https://moma.corp.google.com/person/${encodeURIComponent(
                  organiser
                )}`}
                clickable
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  margin: "5px",
                  backgroundColor: getRandomColor(),
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  cursor: "pointer",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              />
            ))}
          </Stack>
        </Typography>

        <Stack direction="row" spacing={1} sx={{ pl: 2, pr: 2, mt: 1 }}>
          <Chip label={selectedEvent.eventType} color="primary" size="small" />
          {selectedEvent.isHighPriority && (
            <Tooltip title="High Priority">
              <WhatshotIcon style={{ color: red[500] }} />
            </Tooltip>
          )}
          {selectedEvent.isDirectPartner && (
            <Chip label="Direct Partner" color="secondary" size="small" />
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
        </Stack>
      </Stack>
    ),
    Details: (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* Audience Seniority */}
        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
        >
          <PeopleIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Buyer Segment Rollup:
          <Typography
            variant="body2"
            sx={{
              marginLeft: "5px",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {selectedEvent.audienceSeniority &&
            selectedEvent.audienceSeniority.length > 0
              ? selectedEvent.audienceSeniority.join(", ")
              : "N/A"}
          </Typography>
        </Typography>

        {/* Audience Persona */}
        <Typography
          variant="body2"
          display="flex"
          sx={{ whiteSpace: "normal" }}
        >
          <PeopleIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Buyer Segment:{" "}
          {selectedEvent.audiencePersona &&
          selectedEvent.audiencePersona.length > 0
            ? selectedEvent.audiencePersona.join(", ")
            : "N/A"}
        </Typography>

        {/* Industry */}
        <Typography
          variant="body2"
          display="flex"
          sx={{ whiteSpace: "normal" }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Industry:
          <Typography
            variant="body2"
            sx={{ marginLeft: "5px", whiteSpace: "normal" }}
          >
            {selectedEvent.industry && selectedEvent.industry.length > 0
              ? selectedEvent.industry.join(", ")
              : "N/A"}
          </Typography>
        </Typography>

        {/* Account Sectors */}
        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Account Sectors:
          <Typography
            variant="body2"
            sx={{
              marginLeft: "5px",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {`Commercial: ${
              selectedEvent.accountSectors?.commercial ? "Yes" : "No"
            }, Public: ${selectedEvent.accountSectors?.public ? "Yes" : "No"}`}
          </Typography>
        </Typography>

        {/* Account Category */}
        <Typography
          variant="body2"
          display="flex"
          sx={{ whiteSpace: "normal" }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Account Category:{" "}
          <Typography
            variant="body2"
            sx={{ marginLeft: "5px", whiteSpace: "normal" }}
          >
            {selectedEvent.accountCategory &&
            Object.keys(selectedEvent.accountCategory).length > 0
              ? Object.entries(selectedEvent.accountCategory)
                  .map(
                    ([category, details]) =>
                      `${category}: ${details.percentage}%`
                  )
                  .join(", ")
              : "N/A"}
          </Typography>
        </Typography>

        {/* Account Segments */}
        <Typography
          variant="body2"
          display="flex"
          sx={{ whiteSpace: "normal" }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Account Segments:{" "}
          <Typography
            variant="body2"
            sx={{ marginLeft: "5px", whiteSpace: "normal" }}
          >
            {selectedEvent.accountSegments &&
            Object.keys(selectedEvent.accountSegments).length > 0
              ? Object.entries(selectedEvent.accountSegments)
                  .map(
                    ([segment, details]) => `${segment}: ${details.percentage}%`
                  )
                  .join(", ")
              : "N/A"}
          </Typography>
        </Typography>

        {/* Account Type */}
        <Typography
          variant="body2"
          display="flex"
          sx={{ whiteSpace: "normal" }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Greenfield Status:{" "}
          <Typography
            variant="body2"
            sx={{ marginLeft: "5px", whiteSpace: "normal" }}
          >
            {selectedEvent.accountType &&
            Object.keys(selectedEvent.accountType).length > 0
              ? Object.entries(selectedEvent.accountType)
                  .map(([type, details]) => `${type}: ${details.percentage}%`)
                  .join(", ")
              : "N/A"}
          </Typography>
        </Typography>

        {/* Product Alignment */}
        <Typography
          variant="body2"
          display="flex"
          sx={{ whiteSpace: "normal" }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Product Family:{" "}
          <Typography
            variant="body2"
            sx={{ marginLeft: "5px", whiteSpace: "normal" }}
          >
            {selectedEvent.productAlignment &&
            Object.keys(selectedEvent.productAlignment).length > 0
              ? Object.entries(selectedEvent.productAlignment)
                  .map(
                    ([product, details]) => `${product}: ${details.percentage}%`
                  )
                  .join(", ")
              : "N/A"}
          </Typography>
        </Typography>

        {/* AI vs Core */}
        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
        >
          <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          AI vs Core:
          <Typography
            variant="body2"
            sx={{
              marginLeft: "5px",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {selectedEvent.aiVsCore || "N/A"}
          </Typography>
        </Typography>

        {/* OKR Information */}
        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
        >
          <InfoIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          OKR:
          <Typography
            variant="body2"
            sx={{
              marginLeft: "5px",
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {selectedEvent.okr && selectedEvent.okr.length > 0
              ? selectedEvent.okr
                  .map((okrItem) => `${okrItem.type}: ${okrItem.percentage}%`)
                  .join(", ")
              : "N/A"}
          </Typography>
        </Typography>

        {/* Event Series and Customer Use */}
        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
        >
          <InfoIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Part of an event series? {selectedEvent.eventSeries ? "Yes" : "No"}
        </Typography>

        <Typography
          variant="body2"
          display="flex"
          alignItems="center"
          sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
        >
          <CheckCircleIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
          Approved for customer use? {selectedEvent.customerUse ? "Yes" : "No"}
        </Typography>
      </Stack>
    ),
    Links: (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* Landing Page Links */}
        <Typography
  variant="body2"
  display="flex"
  sx={{ whiteSpace: "normal" }}
>
  <LinkIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
  Landing Page Links:{" "}
  <Typography
    variant="body2"
    sx={{ marginLeft: "5px", whiteSpace: "normal" }}
  >
    {selectedEvent.landingPageLinks && selectedEvent.landingPageLinks.length > 0
      ? selectedEvent.landingPageLinks.map((link, index) => (
          <MuiLink
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#4285F4", // Keeps the blue color for the hyperlink
              marginLeft: index > 0 ? "5px" : "0px", // Adds space between links
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            {link}
          </MuiLink>
        ))
      : "N/A"}
  </Typography>
</Typography>


<Typography
  variant="body2"
  display="flex"
  sx={{ whiteSpace: "normal" }}
>
  <LinkIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
  Sales Kit Links:{" "}
  <Typography
    variant="body2"
    sx={{ marginLeft: "5px", whiteSpace: "normal" }}
  >
    {selectedEvent.salesKitLinks && selectedEvent.salesKitLinks.length > 0
      ? selectedEvent.salesKitLinks
          .map((link) => (
            <MuiLink
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#4285F4", // Keeping the blue color for links
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {link}
            </MuiLink>
          ))
          .reduce((prev, curr) => [prev, ", ", curr]) // Adding commas between links
      : "N/A"}
  </Typography>
</Typography>


<Typography
  variant="body2"
  display="flex"
  sx={{ whiteSpace: "normal" }}
>
  <LinkIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
  Hailo Links:{" "}
  <Typography
    variant="body2"
    sx={{ marginLeft: "5px", whiteSpace: "normal" }}
  >
    {selectedEvent.hailoLinks && selectedEvent.hailoLinks.length > 0
      ? selectedEvent.hailoLinks
          .map((link) => (
            <MuiLink
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#4285F4", // Keeping the blue color for links
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {link}
            </MuiLink>
          ))
          .reduce((prev, curr) => [prev, ", ", curr]) // Adding commas between links
      : "N/A"}
  </Typography>
</Typography>

<Typography
  variant="body2"
  display="flex"
  sx={{ whiteSpace: "normal" }}
>
  <DescriptionIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
  Other Documents:{" "}
  <Typography
    variant="body2"
    sx={{ marginLeft: "5px", whiteSpace: "normal" }}
  >
    {selectedEvent.otherDocumentsLinks && selectedEvent.otherDocumentsLinks.length > 0
      ? selectedEvent.otherDocumentsLinks
          .map((link) => (
            <MuiLink
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#4285F4", // Keeping the blue color for links
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              {link}
            </MuiLink>
          ))
          .reduce((prev, curr) => [prev, ", ", curr]) // Adding commas between links
      : "N/A"}
  </Typography>
</Typography>

      </Stack>
    ),
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20"
      style={{ zIndex: 5000 }}
    >
      <Draggable handle=".drag-handle" nodeRef={nodeRef}>
        <div ref={nodeRef}>
          <Paper
            sx={{
              minWidth: 600,
              maxWidth: 600,
              maxHeight: "70vh",
              overflowY: "auto",
              overflowX: "hidden",
              zIndex: 6000,
              boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
              borderRadius: "8px",
              bgcolor: "background.paper",
              paddingBottom: "16px",
              position: "relative",
            }}
          >
            <AppBar
              position="sticky"
              sx={{
                bgcolor: "#f5f5f5",
                color: "#5f6368",
                boxShadow: "none",
                borderBottom: "1px solid #e0e0e0",
                top: 0,
                zIndex: 10,
              }}
              className="drag-handle"
            >
              <Toolbar variant="dense" sx={{ minHeight: "36px" }}>
                <IconButton size="small" color="inherit" onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                p: 2,
                alignItems: "center",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="h6" component="div">
                {selectedEvent.emoji}
              </Typography>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  fontSize: "1.2rem",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {selectedEvent.title}
              </Typography>
              {selectedEvent.isDraft && (
                <Chip
                  label="Draft"
                  color="warning"
                  size="small"
                  sx={{ marginRight: 4 }}
                />
              )}
              <IconButton onClick={handleShareEvent} size="small">
                <ShareIcon />
              </IconButton>
              <IconButton onClick={handleEditEvent} size="small">
                <EditIcon />
              </IconButton>
            </Stack>

            {/* Date Range with High Priority Indicator */}
            <Typography
              variant="body1"
              display="flex"
              alignItems="center"
              sx={{
                pl: 2,
                pr: 2,
                mt: 2,
                color: "#5f6368",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              <EventIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
              {dayjs(selectedEvent.startDate).format(
                "dddd, MMMM D, YYYY h:mm A"
              )}{" "}
              -{" "}
              {dayjs(selectedEvent.endDate).format("dddd, MMMM D, YYYY h:mm A")}
            </Typography>

            {/* Region and Location Details */}
            <Typography
              variant="body2"
              display="flex"
              alignItems="center"
              sx={{
                pl: 2,
                pr: 2,
                mt: 1,
                color: "#5f6368",
                wordBreak: "break-word",
                whiteSpace: "normal",
              }}
            >
              <PublicIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
              {formatListWithSpaces(selectedEvent.region)},{" "}
              {formatListWithSpaces(selectedEvent.subregion)},{" "}
              {formatListWithSpaces(selectedEvent.country)}
            </Typography>

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Buttons for Sections */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 2, justifyContent: "flex-start" }}
            >
              {Object.keys(sections).map((section) => (
                <Button
                  key={section}
                  variant={
                    currentSection === section ? "contained" : "outlined"
                  }
                  onClick={() => setCurrentSection(section)}
                  sx={{
                    fontWeight: currentSection === section ? "bold" : "normal",
                    borderRadius: "20px",
                    backgroundColor:
                      currentSection === section
                        ? "rgba(52, 103, 210, 0.8)"
                        : "white",
                    color: currentSection === section ? "white" : "#757575",
                    "&:hover": {
                      backgroundColor:
                        currentSection === section
                          ? "rgba(41, 98, 187, 0.9)"
                          : "#f1f1f1",
                    },
                  }}
                >
                  {section}
                </Button>
              ))}
            </Stack>
            <Divider sx={{ width: "100%" }} />
            {sections[currentSection]}

            {/* Add Buttons to Bottom */}
            <Divider sx={{ width: "100%", my: 1 }} />

            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 2, justifyContent: "flex-end" }}
              alignItems="center"
            >
              <div>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {selectedLanguage && (
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Selected Language: {selectedLanguage}
                    </Typography>
                  )}

                  <Tooltip title="Select Language">
                    <IconButton onClick={handleLanguageClick}>
                      <LanguageIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  disablePortal
                  transformOrigin={{
                    vertical: "center",
                    horizontal: "center",
                  }}
                  PaperProps={{
                    sx: {
                      zIndex: 10000,
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
                      borderRadius: "8px",
                      bgcolor: "background.paper",
                      minWidth: 600,
                      paddingBottom: "16px",
                    },
                  }}
                  MenuListProps={{
                    sx: {
                      maxHeight: "100vh",
                      overflowY: "auto",
                    },
                  }}
                >
                  {languagesAndTemplates.map((item) => (
                    <MenuItem
                      key={item.language}
                      selected={item.language === selectedLanguage}
                      onClick={() => handleLanguageSelect(item.language)}
                    >
                      {item.language}
                    </MenuItem>
                  ))}
                </Menu>
              </div>

              <Button
                variant="contained"
                style={{
                  backgroundColor: blue[500],
                  color: "white",
                  boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                  margin: "10px",
                }}
                onClick={handleGmailInvite} // Add the handler here
              >
                Gmail Invite
              </Button>

              <Button
                variant="contained"
                style={{
                  backgroundColor: blue[500],
                  color: "white",
                  boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                  margin: "10px",
                }}
              >
                Salesloft Invite
              </Button>
            </Stack>
          </Paper>
        </div>
      </Draggable>
    </div>
  );
}
