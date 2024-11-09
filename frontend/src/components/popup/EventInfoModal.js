import React, { useEffect, useContext, useState, useRef } from "react";
import dayjs from "dayjs";
import GlobalContext from "../../context/GlobalContext";
import { createSalesLoftEmailTemplate } from "../../api/salesloft";
import { styled } from "@mui/system";
import { tooltipClasses } from "@mui/material/Tooltip";
import { duplicateEvent } from "../../api/duplicateData";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { shareToGoogleCalendar } from "../../api/shareCalendar";
import Draggable from "react-draggable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  regionsData,
  subregionsData,
  countriesData,
} from "../filters/FiltersData";
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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import LabelIcon from "@mui/icons-material/Label";
import PeopleIcon from "@mui/icons-material/People";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public";
import DescriptionIcon from "@mui/icons-material/Description";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { red, blue } from "@mui/material/colors";
import salesloftLogo from "./logo/salesloft.png";
import linkedInLogo from "./logo/linkedin.png";
import { refreshAccessToken } from "../../api/refreshToken";

export default function EventInfoPopup({ event, close }) {
  const navigate = useNavigate();
  const { formData, selectedEvent, setShowInfoEventModal, updateFormData } =
    useContext(GlobalContext);
  const [currentSection, setCurrentSection] = useState("Overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const languagesAndTemplates = selectedEvent?.languagesAndTemplates || [];
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [linkedInDialogOpen, setLinkedInDialogOpen] = useState(false);

  const [calendarConfirmationDialogOpen, setCalendarConfirmationDialogOpen] =
    useState(false); // State for confirmation dialog

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    selectedEvent?.languagesAndTemplates?.length > 0
      ? selectedEvent.languagesAndTemplates[0].language
      : ""
  );
  const hasLanguagesAndTemplates = languagesAndTemplates.length > 0;

  const handleCalendarConfirmation = async () => {
    const accessToken = localStorage.getItem("accessToken"); // Ensure token is available
    if (!accessToken) {
      setSnackbarMessage("Please log in to connect with Google Calendar.");
      setSnackbarOpen(true);
      return;
    }

    // Check if start or end date is missing time

    try {
      const eventData = {
        title: selectedEvent.title,
        location: selectedEvent.locationVenue || "", // Provide fallback if no location
        description: selectedEvent.description,
        startDate: selectedEvent.startDate,
        endDate: selectedEvent.endDate,
      };

      const response = await shareToGoogleCalendar(eventData, accessToken);

      if (response.success) {
        setSnackbarMessage("Event successfully added to Google Calendar!");
      } else {
        setSnackbarMessage(
          "Failed to add event to Google Calendar. Try again."
        );
      }
    } catch (error) {
      console.error("Error sharing event to Google Calendar:", error);
      setSnackbarMessage("Error occurred. Please try again.");
    } finally {
      setCalendarConfirmationDialogOpen(false);
      setSnackbarOpen(true);
    }
  };
  useEffect(() => {
    // Pre-select English by default if available
    const englishTemplate = languagesAndTemplates.find(
      (item) => item.language === "English"
    );
    if (englishTemplate) {
      setSelectedLanguage("English");
    } else if (languagesAndTemplates.length > 0) {
      setSelectedLanguage(languagesAndTemplates[0].language);
    }
  }, [languagesAndTemplates]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleLanguageDialogClose = () => {
    setLanguageDialogOpen(false);
  };
  const handleLanguageClick = () => {
    setLanguageDialogOpen(true);
  };
  const handleLanguageSelect = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

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

  //Salesloft!!
  const handleSalesLoftInvite = () => {
    const salesLoftTemplate = languagesAndTemplates.find(
      (item) =>
        item.platform === "Salesloft" && item.language === selectedLanguage
    );

    if (!salesLoftTemplate) {
      setSnackbarMessage("SalesLoft template not provided.");
      setSnackbarOpen(true);
      return;
    }

    if (!salesLoftTemplate.subjectLine) {
      setSnackbarMessage("SalesLoft subject line not provided.");
      setSnackbarOpen(true);
      return;
    }

    setDialogOpen(true);
  };

  const handleSalesLoftConfirmation = async () => {
    const accessTokenSalesloft = process.env.REACT_APP_SALESLOFT_API_TOKEN;

    try {
      const salesLoftTemplate = languagesAndTemplates.find(
        (item) =>
          item.platform === "Salesloft" && item.language === selectedLanguage
      );

      if (!salesLoftTemplate) {
        throw new Error("SalesLoft template not found.");
      }

      const result = await createSalesLoftEmailTemplate(
        accessTokenSalesloft,
        salesLoftTemplate
      );
      if (result.success) {
        setSnackbarMessage("SalesLoft email template created successfully!");
      } else {
        setSnackbarMessage(
          "Failed to create SalesLoft template. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating SalesLoft email template:", error);
      setSnackbarMessage(
        `Failed to create SalesLoft template: ${error.message}`
      );
    } finally {
      setDialogOpen(false);
      setSnackbarOpen(true);
    }
  };

  const getRegionLabel = (selectedEvent) => {
    const { region, subRegion, country } = selectedEvent;

    // Check if region and subRegion are both selected
    if (!region || !subRegion) return null;

    const selectedRegionData = regionsData.find((r) => r.region === region);

    // Check if all subregions are selected within the region
    if (
      selectedRegionData &&
      selectedRegionData.subregions.every((sub) => subRegion.includes(sub))
    ) {
      return `All ${region}`;
    }

    // Check if all countries are selected within each selected subregion
    const selectedSubregions = subRegion
      .map((sub) => subregionsData.find((s) => s.subregion === sub))
      .filter(Boolean);

    const allCountriesSelected = selectedSubregions.every((subregionData) =>
      subregionData.countries.every((countryCode) =>
        country.includes(countryCode)
      )
    );

    if (
      allCountriesSelected &&
      selectedSubregions.length === selectedRegionData.subregions.length
    ) {
      return `All ${region}`;
    }

    // Default to listing subregions and countries if not all are selected
    return [
      formatListWithSpaces(region),
      formatListWithSpaces(subRegion),
      formatListWithSpaces(country),
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleGmailInvite = async () => {
    try {
      const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
  
      // Check if access token is missing
      if (!accessToken) {
        sessionStorage.clear();
        localStorage.clear();
        setSnackbarMessage("Gmail token missing. Redirecting to login...");
        setSnackbarOpen(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }
  
      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.emails?.[0]?.value;
  
      if (!email || !selectedLanguage) {
        console.error("No email or selected language found. Aborting draft creation.");
        alert("No email or template selected.");
        return;
      }
  
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
        console.error("No subject line found for the selected language.");
        alert("No subject line found for the selected language.");
        return;
      }
  
      const emailDetails = {
        to: email,
        subject: subjectLine,
        body: template,
        accessToken: accessToken,
      };
  
      console.log("Sending request to create Gmail draft with email details:", emailDetails);
  
      let response = await fetch(`${apiUrl}send-gmail-invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(emailDetails),
      });
  
      console.log("Response from server:", response);
  
      if (!response.ok) {
        // Check if the error indicates an expired token or credential issue
        const responseText = await response.text();
        if (response.status === 401 || response.status === 500 ||responseText.includes('Invalid Credentials') || responseText.includes('TokenExpired')) {
          console.warn("Access token expired or invalid. Attempting to refresh...");
  
          if (refreshToken) {
            const tokenData = await refreshAccessToken(refreshToken);
  
            if (tokenData.accessToken) {
              // Store the new access token
              accessToken = tokenData.accessToken;
              sessionStorage.setItem("accessToken", accessToken);
              localStorage.setItem("accessToken", accessToken);
  
              console.log("Token refreshed successfully. Retrying request...");
  
              // Retry the request with the new access token
              emailDetails.accessToken = accessToken;
              response = await fetch(`${apiUrl}send-gmail-invite`, {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "text/plain",
                },
                body: JSON.stringify(emailDetails),
              });
  
              if (!response.ok) {
                console.error("Retry failed to create draft. Response status:", response.status);
                throw new Error(`Failed to create Gmail draft after token refresh: ${response.statusText}`);
              }
            } else {
              console.error("Failed to refresh token. Redirecting to login...");
              sessionStorage.clear();
              localStorage.clear();
              setSnackbarMessage("Gmail token could not be refreshed. Redirecting to login...");
              setSnackbarOpen(true);
              setTimeout(() => {
                window.location.href = "/login";
              }, 2000);
              return;
            }
          } else {
            console.error("No refresh token available. Redirecting to login...");
            sessionStorage.clear();
            localStorage.clear();
            setSnackbarMessage("Gmail token expired. Redirecting to login...");
            setSnackbarOpen(true);
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            return;
          }
        } else {
          console.error("Failed to create draft. Response status:", response.status);
          throw new Error(`Failed to create Gmail draft: ${response.statusText}`);
        }
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
  console.log("languagesAndTemplates:", languagesAndTemplates);

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
  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip
      {...props}
      classes={{ popper: className }}
      PopperProps={{
        disablePortal: true, // Disable portal to respect parent z-index
      }}
    />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#1a73e8",
      color: "white",
      fontSize: "14px",
      borderRadius: "4px",
      padding: "8px 12px",
      zIndex: 20000,
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: "#1a73e8",
    },
    [`& .${tooltipClasses.popper}`]: {
      zIndex: 20000,
    },
  });
  const handleDuplicateEvent = () => {
    setConfirmationDialogOpen(true);
  };

  const confirmDuplicateEvent = async () => {
    if (selectedEvent) {
      try {
        await duplicateEvent(selectedEvent.eventId, selectedEvent);
        setSnackbarMessage("Event duplicated successfully!");
        setInfoDialogOpen(true);
      } catch (error) {
        console.error("Failed to duplicate event:", error);
        setSnackbarMessage("Failed to duplicate event. Please try again.");
      } finally {
        setConfirmationDialogOpen(false); // Close confirmation dialog after approval
        setSnackbarOpen(true); // Open snackbar to show the message
      }
    }
  };

  const handleConfirmationDialogClose = () => {
    setConfirmationDialogOpen(false);
  };
  const sections = {
    Overview: (
      <Stack spacing={2} sx={{ pt: 2, pb: 2 }}>
        {selectedEvent.description && (
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
            {selectedEvent.description}
          </Typography>
        )}

        {selectedEvent.landingPageLinks?.length > 0 && (
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
            {selectedEvent.landingPageLinks.map((link, index) => (
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
            ))}
          </Typography>
        )}

        {selectedEvent.organisedBy?.length > 0 && (
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
              sx={{ pl: 2, pr: 2, flexWrap: "wrap" }}
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
                    margin: "5px 0 5px 10px",
                    backgroundColor: "#4285F4",
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
        )}

        {selectedEvent.speakers?.length > 0 && (
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
            Speakers:
            <Stack
              direction="row"
              spacing={1}
              sx={{ pl: 2, pr: 2, flexWrap: "wrap" }}
            >
              {selectedEvent.speakers.map((speaker, index) => (
                <Chip
                  key={index}
                  label={speaker}
                  component="a"
                  href={`mailto:${speaker}`}
                  clickable
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    margin: "5px 0 5px 10px",
                    backgroundColor: "#4285F4",
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
        )}

        <Stack direction="row" spacing={1} sx={{ pl: 2, pr: 2, mt: 1 }}>
          {selectedEvent.eventType && (
            <Chip
              label={selectedEvent.eventType}
              color="primary"
              size="small"
            />
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

          {selectedEvent.isHighPriority && (
            <Chip
              label="High Priority"
              icon={<WhatshotIcon style={{ color: red[500] }} />}
              sx={{ backgroundColor: red[50], color: red[500] }}
              size="small"
            />
          )}
        </Stack>
      </Stack>
    ),

    Details: (
      <Stack spacing={2} sx={{ p: 3 }}>
        {selectedEvent.audienceSeniority?.length > 0 && (
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
              {selectedEvent.audienceSeniority.join(", ")}
            </Typography>
          </Typography>
        )}

        {selectedEvent.audiencePersona?.length > 0 && (
          <Typography
            variant="body2"
            display="flex"
            sx={{ whiteSpace: "normal" }}
          >
            <PeopleIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
            Buyer Segment: {selectedEvent.audiencePersona.join(", ") || "N/A"}
          </Typography>
        )}

        {selectedEvent.industry?.length > 0 && (
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
              {selectedEvent.industry.join(", ")}
            </Typography>
          </Typography>
        )}

        {selectedEvent.accountSectors &&
          (selectedEvent.accountSectors.commercial ||
            selectedEvent.accountSectors.public) && (
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
                  selectedEvent.accountSectors.commercial ? "Yes" : "No"
                }, Public: ${
                  selectedEvent.accountSectors.public ? "Yes" : "No"
                }`}
              </Typography>
            </Typography>
          )}

        {selectedEvent.accountCategory &&
          Object.values(selectedEvent.accountCategory).some(
            (category) => category.selected
          ) && (
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
                {Object.entries(selectedEvent.accountCategory)
                  .filter(([_, details]) => details.selected)
                  .map(
                    ([category, details]) =>
                      `${category}: ${details.percentage}%`
                  )
                  .join(", ")}
              </Typography>
            </Typography>
          )}

        {selectedEvent.accountSegments &&
          Object.values(selectedEvent.accountSegments).some(
            (seg) => seg.selected
          ) && (
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
                {Object.entries(selectedEvent.accountSegments)
                  .map(
                    ([segment, details]) => `${segment}: ${details.percentage}%`
                  )
                  .join(", ")}
              </Typography>
            </Typography>
          )}

        {selectedEvent.accountType &&
          Object.values(selectedEvent.accountType).some(
            (type) => type.selected
          ) && (
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
                {Object.entries(selectedEvent.accountType)
                  .map(([type, details]) => `${type}: ${details.percentage}%`)
                  .join(", ")}
              </Typography>
            </Typography>
          )}

        {selectedEvent.productAlignment &&
          Object.values(selectedEvent.productAlignment).some(
            (product) => product.selected
          ) && (
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
                {Object.entries(selectedEvent.productAlignment)
                  .map(
                    ([product, details]) => `${product}: ${details.percentage}%`
                  )
                  .join(", ")}
              </Typography>
            </Typography>
          )}

        {selectedEvent.aiVsCore && (
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
              {selectedEvent.aiVsCore}
            </Typography>
          </Typography>
        )}

        {selectedEvent.okr?.length > 0 &&
          selectedEvent.okr.some((okr) => okr.percentage !== "") && (
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
                {selectedEvent.okr
                  .map((okrItem) => `${okrItem.type}: ${okrItem.percentage}%`)
                  .join(", ")}
              </Typography>
            </Typography>
          )}

        {selectedEvent.eventSeries !== undefined && (
          <Typography
            variant="body2"
            display="flex"
            alignItems="center"
            sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
          >
            <InfoIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
            Part of an event series? {selectedEvent.eventSeries ? "Yes" : "No"}
          </Typography>
        )}

        {selectedEvent.customerUse !== undefined && (
          <Typography
            variant="body2"
            display="flex"
            alignItems="center"
            sx={{ wordBreak: "break-word", whiteSpace: "normal" }}
          >
            <CheckCircleIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
            Approved for customer use?{" "}
            {selectedEvent.customerUse ? "Yes" : "No"}
          </Typography>
        )}
      </Stack>
    ),

    Links: (
      <Stack spacing={2} sx={{ p: 3 }}>
        {selectedEvent.landingPageLinks?.length > 0 && (
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
              {selectedEvent.landingPageLinks.map((link, index) => (
                <MuiLink
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#4285F4",
                    marginLeft: index > 0 ? "5px" : "0px",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {link}
                </MuiLink>
              ))}
            </Typography>
          </Typography>
        )}

        {selectedEvent.salesKitLinks?.length > 0 && (
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
              {selectedEvent.salesKitLinks
                .map((link) => (
                  <MuiLink
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#4285F4",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {link}
                  </MuiLink>
                ))
                .reduce((prev, curr) => [prev, ", ", curr])}
            </Typography>
          </Typography>
        )}

        {selectedEvent.hailoLinks?.length > 0 && (
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
              {selectedEvent.hailoLinks
                .map((link) => (
                  <MuiLink
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#4285F4",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {link}
                  </MuiLink>
                ))
                .reduce((prev, curr) => [prev, ", ", curr])}
            </Typography>
          </Typography>
        )}

        {selectedEvent.otherDocumentsLinks?.length > 0 && (
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
              {selectedEvent.otherDocumentsLinks
                .map((link) => (
                  <MuiLink
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#4285F4",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {link}
                  </MuiLink>
                ))
                .reduce((prev, curr) => [prev, ", ", curr])}
            </Typography>
          </Typography>
        )}
      </Stack>
    ),
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20"
      style={{ zIndex: 15000 }}
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
              <CustomTooltip title="Share Event" arrow>
                <IconButton onClick={handleShareEvent} size="small">
                  <ShareIcon />
                </IconButton>
              </CustomTooltip>

              <CustomTooltip title="Edit Event" arrow>
                <IconButton onClick={handleEditEvent} size="small">
                  <EditIcon />
                </IconButton>
              </CustomTooltip>

              <CustomTooltip title="Duplicate Event" arrow>
                <IconButton onClick={handleDuplicateEvent} size="small">
                  <ContentCopyIcon />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title="Add to Google Calendar" arrow>
                <IconButton
                  onClick={() => {
                    const { startDate, endDate } = selectedEvent;

                    // Check if start or end date is missing time
                    if (!startDate.includes("T") || !endDate.includes("T")) {
                      setSnackbarMessage(
                        "Please add a start and end time before proceeding."
                      );
                      setSnackbarOpen(true);
                    } else {
                      setCalendarConfirmationDialogOpen(true);
                    }
                  }}
                  size="small"
                >
                  <EventIcon />
                </IconButton>
              </CustomTooltip>
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

            {[
              selectedEvent.region,
              selectedEvent.subRegion,
              selectedEvent.country,
              selectedEvent.city,
              selectedEvent.locationVenue,
            ]
              .flat()
              .filter(Boolean).length > 0 && (
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
                {getRegionLabel(selectedEvent) ||
                  [
                    formatListWithSpaces(selectedEvent.region),
                    formatListWithSpaces(selectedEvent.subRegion),
                    formatListWithSpaces(selectedEvent.country),
                    selectedEvent.city,
                    selectedEvent.locationVenue,
                  ]
                    .filter(Boolean)
                    .join(", ")}
              </Typography>
            )}

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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 2,
              }}
            >
              <CustomTooltip
                title={
                  selectedEvent.hailoLinks &&
                  selectedEvent.hailoLinks.length > 0
                    ? "View Hailo Links on LinkedIn"
                    : "No Hailo link provided"
                }
                arrow
                sx={{
                  zIndex: 120000,
                }}
              >
                <span>
                  {" "}
                  {/* Wrap IconButton in a span to ensure tooltip shows on disabled buttons */}
                  <IconButton
                    onClick={() =>
                      selectedEvent.hailoLinks &&
                      selectedEvent.hailoLinks.length > 0
                        ? setLinkedInDialogOpen(true)
                        : null
                    }
                    size="small"
                    disabled={
                      !selectedEvent.hailoLinks ||
                      selectedEvent.hailoLinks.length === 0
                    }
                    sx={{
                      opacity:
                        selectedEvent.hailoLinks &&
                        selectedEvent.hailoLinks.length > 0
                          ? 1
                          : 0.5,
                    }}
                  >
                    <img
                      src={linkedInLogo}
                      alt="LinkedIn Logo"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </IconButton>
                </span>
              </CustomTooltip>

              <Stack
                direction="row"
                spacing={1}
                sx={{ p: 2, justifyContent: "flex-end" }}
                alignItems="center"
              >
                <div>
                  {hasLanguagesAndTemplates ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        Language: {selectedLanguage}
                      </Typography>

                      <CustomTooltip title="Select Language">
                        <IconButton onClick={handleLanguageClick}>
                          <LanguageIcon />
                        </IconButton>
                      </CustomTooltip>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No languages provided
                    </Typography>
                  )}

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
                  sx={{
                    backgroundColor: hasLanguagesAndTemplates
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(200, 200, 200, 0.5)",
                    color: hasLanguagesAndTemplates ? "#5f6368" : "#bdbdbd",
                    boxShadow: hasLanguagesAndTemplates
                      ? "0 1px 2px 0 rgba(60,64,67,0.302)"
                      : "none",
                    margin: "10px",
                    "&:hover": {
                      backgroundColor: hasLanguagesAndTemplates
                        ? "rgba(66, 133, 244, 0.1)"
                        : "rgba(200, 200, 200, 0.5)",
                      borderColor: hasLanguagesAndTemplates
                        ? blue[500]
                        : "none",
                    },
                  }}
                  disabled={!hasLanguagesAndTemplates} // Disable button if no templates
                  startIcon={
                    <img
                      src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
                      alt="Gmail Logo"
                      style={{
                        width: "24px",
                        height: "24px",
                        marginRight: "8px",
                      }}
                    />
                  }
                  onClick={handleGmailInvite}
                >
                  Gmail Invite
                </Button>

                {/* <Button
                variant="contained"
                sx={{
                  backgroundColor: hasLanguagesAndTemplates
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(200, 200, 200, 0.5)",
                  color: hasLanguagesAndTemplates ? "#5f6368" : "#bdbdbd",
                  boxShadow: hasLanguagesAndTemplates
                    ? "0 1px 2px 0 rgba(60,64,67,0.302)"
                    : "none",
                  margin: "10px",
                  "&:hover": {
                    backgroundColor: hasLanguagesAndTemplates
                      ? "rgba(66, 133, 244, 0.1)"
                      : "rgba(200, 200, 200, 0.5)",
                    borderColor: hasLanguagesAndTemplates ? blue[500] : "none",
                  },
                }}
                disabled={!hasLanguagesAndTemplates} // Disable button if no templates
                startIcon={
                  <img
                    src={salesloftLogo}
                    alt="SalesLoft Logo"
                    style={{
                      width: "24px",
                      height: "24px",
                      marginRight: "8px",
                    }}
                  />
                }
                onClick={handleSalesLoftInvite}
              >
                SalesLoft Invite
              </Button> */}
              </Stack>
            </Box>
          </Paper>
        </div>
      </Draggable>
      <Dialog
        open={calendarConfirmationDialogOpen}
        onClose={() => setCalendarConfirmationDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 100000000 }}
      >
        <DialogTitle>Confirm Google Calendar Event</DialogTitle>
        <DialogContent>
          Are you sure you want to add this event to your Google Calendar?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCalendarConfirmationDialogOpen(false)}
            color="secondary"
          >
            No
          </Button>
          <Button onClick={handleCalendarConfirmation} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        sx={{ zIndex: 10000 }}
      >
        <DialogTitle>Confirm SalesLoft Invite</DialogTitle>
        <DialogContent>
          Are you sure you want to create a SalesLoft cadence?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="secondary">
            No
          </Button>
          <Button onClick={handleSalesLoftConfirmation} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {/* Language Dialog */}
      <Dialog
        open={languageDialogOpen}
        onClose={handleLanguageDialogClose}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 100000000 }}
      >
        <DialogTitle>Select Language</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedLanguage}
              onChange={(event) => setSelectedLanguage(event.target.value)} // Update the selectedLanguage state
            >
              {languagesAndTemplates.length > 0 ? (
                languagesAndTemplates.map((item) => (
                  <FormControlLabel
                    key={`${item.platform}-${item.language}`} // Ensure unique keys
                    value={item.language} // Radio button's value
                    control={<Radio />} // Radio button component
                    label={`${item.platform} - ${item.language}`} // Label for each option
                  />
                ))
              ) : (
                <Typography>No languages available</Typography>
              )}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLanguageDialogClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleLanguageDialogClose}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={linkedInDialogOpen}
        onClose={() => setLinkedInDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 100000000 }}
      >
        <DialogTitle>Hailo Links</DialogTitle>
        <DialogContent>
          {selectedEvent.hailoLinks?.length > 0 ? (
            selectedEvent.hailoLinks.map((link, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  component="a"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#1a73e8", // Google blue
                    textDecoration: "underline",
                    maxWidth: "85%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link}
                </Typography>
                <IconButton
                  onClick={() => window.open(link, "_blank")}
                  size="small"
                  sx={{ color: "#1a73e8" }} // Google blue
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography>No Hailo links available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setLinkedInDialogOpen(false)}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmationDialogOpen}
        onClose={handleConfirmationDialogClose}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 100000000 }}
      >
        <DialogTitle>Confirm Duplication</DialogTitle>
        <DialogContent>
          Are you sure you want to duplicate this event?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmationDialogOpen(false)}
            color="secondary"
          >
            No
          </Button>
          <Button onClick={confirmDuplicateEvent} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
}
