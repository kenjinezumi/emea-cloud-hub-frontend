import React, { useEffect, useContext, useState, useRef } from "react";
import dayjs from "dayjs";
import GlobalContext from "../../context/GlobalContext";
import { createSalesLoftEmailTemplate } from "../../api/salesloft";
import { styled } from "@mui/system";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { duplicateEvent } from "../../api/duplicateData";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { shareToGoogleCalendar } from "../../api/shareCalendar";
import Draggable from "react-draggable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  regionsData,
  subregionsData,
} from "../filters/FiltersData";
import {
  Alert,
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

// ───────────────────────────────────────────────────────────────────────────
// 1. GA4 Helper: Send GA event if gtag exists
// ───────────────────────────────────────────────────────────────────────────
const sendGAEvent = (eventName, params = {}) => {
  if (window && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

// ───────────────────────────────────────────────────────────────────────────
// 2. Helper functions to validate templates
// ───────────────────────────────────────────────────────────────────────────
function isValidGmailTemplate(gmailTemplate) {
  if (!gmailTemplate) return false;
  if (!gmailTemplate.language) return false;
  if (!gmailTemplate.template || !gmailTemplate.template.trim()) return false;
  // if (!gmailTemplate.subjectLine || !gmailTemplate.subjectLine.trim()) return false; 
  return true;
}

function isValidSalesLoftTemplate(salesLoftTemplate) {
  if (!salesLoftTemplate) return false;
  if (!salesLoftTemplate.language) return false;
  if (!salesLoftTemplate.template || !salesLoftTemplate.template.trim()) return false;
  // if (!salesLoftTemplate.subjectLine || !salesLoftTemplate.subjectLine.trim()) return false; 
  return true;
}

// ───────────────────────────────────────────────────────────────────────────
// 3. Custom Tooltip
// ───────────────────────────────────────────────────────────────────────────
const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip
    {...props}
    classes={{ popper: className }}
    PopperProps={{
      disablePortal: true, // to respect parent z-index
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

// ───────────────────────────────────────────────────────────────────────────
// 4. EventInfoPopup Component
// ───────────────────────────────────────────────────────────────────────────
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
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const [calendarConfirmationDialogOpen, setCalendarConfirmationDialogOpen] =
    useState(false);

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    selectedEvent?.languagesAndTemplates?.length > 0
      ? selectedEvent.languagesAndTemplates[0].language
      : ""
  );
  const hasLanguagesAndTemplates = languagesAndTemplates.length > 0;

  const nodeRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Pre-select English if available
    const englishTemplate = languagesAndTemplates.find(
      (item) => item.language === "English"
    );
    if (englishTemplate) {
      setSelectedLanguage("English");
    } else if (languagesAndTemplates.length > 0) {
      setSelectedLanguage(languagesAndTemplates[0].language);
    }
  }, [languagesAndTemplates]);

  // Close on "Escape"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Validate templates
  const salesLoftTemplateForSelectedLanguage = languagesAndTemplates.find(
    (item) => item.platform === "Salesloft" && item.language === selectedLanguage
  );
  const gmailTemplateForSelectedLanguage = languagesAndTemplates.find(
    (item) => item.platform === "Gmail" && item.language === selectedLanguage
  );

  const canUseGmail = isValidGmailTemplate(gmailTemplateForSelectedLanguage);
  const canUseSalesLoft = isValidSalesLoftTemplate(
    salesLoftTemplateForSelectedLanguage
  );

  // ───────────────────────────────────────────────────────────────────────────
  // A. Close everything
  // ───────────────────────────────────────────────────────────────────────────
  const handleCloseMenu = () => setAnchorEl(null);
  const handleClose = () => {
    sendGAEvent("close_event_info", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent?.title || "(no title)",
    });
    setShowInfoEventModal(false);
  };

  if (!selectedEvent) return null;

  // ───────────────────────────────────────────────────────────────────────────
  // B. Top Buttons
  // ───────────────────────────────────────────────────────────────────────────
  const handleShareEvent = () => {
    console.log("window.gtag:", window.gtag); // TEMP debug

    sendGAEvent("share_event", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      event_id: selectedEvent.eventId,
    });
    if (selectedEvent.eventId) {
      navigate(`/event/${selectedEvent.eventId}`);
    }
  };

  const handleEditEvent = () => {
    sendGAEvent("edit_event", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      event_id: selectedEvent.eventId,
    });
    if (selectedEvent) {
      updateFormData({ ...formData, ...selectedEvent });
      navigate("/create-event");
    }
  };

  const handleDuplicateEvent = () => {
    sendGAEvent("attempt_duplicate_event", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      event_id: selectedEvent.eventId,
    });
    setConfirmationDialogOpen(true);
  };

  const confirmDuplicateEvent = async () => {
    sendGAEvent("confirm_duplicate_event", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      event_id: selectedEvent.eventId,
    });

    if (selectedEvent) {
      try {
        await duplicateEvent(selectedEvent.eventId, selectedEvent);
        setSnackbarMessage("Event duplicated successfully!");
        setInfoDialogOpen(true);
      } catch (error) {
        console.error("Failed to duplicate event:", error);
        setSnackbarMessage("Failed to duplicate event. Please try again.");
      } finally {
        setConfirmationDialogOpen(false);
        setSnackbarOpen(true);
      }
    }
  };

  const handleConfirmationDialogClose = () => {
    setConfirmationDialogOpen(false);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // C. Calendar
  // ───────────────────────────────────────────────────────────────────────────
  const handleCalendarConfirmation = async () => {
    sendGAEvent("add_to_google_calendar", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      event_id: selectedEvent.eventId,
    });

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setSnackbarMessage("Please log in to connect with Google Calendar.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const eventData = {
        title: selectedEvent.title,
        location: selectedEvent.locationVenue || "",
        description: selectedEvent.description,
        startDate: selectedEvent.startDate,
        endDate: selectedEvent.endDate,
      };

      const response = await shareToGoogleCalendar(eventData, accessToken);

      if (response.success) {
        setSnackbarMessage("Event successfully added to Google Calendar!");
      } else {
        setSnackbarMessage("Failed to add event to Google Calendar. Try again.");
      }
    } catch (error) {
      console.error("Error sharing event to Google Calendar:", error);
      setSnackbarMessage("Error occurred. Please try again.");
    } finally {
      setCalendarConfirmationDialogOpen(false);
      setSnackbarOpen(true);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // D. SalesLoft
  // ───────────────────────────────────────────────────────────────────────────
  const handleSalesLoftInvite = () => {
    sendGAEvent("salesloft_invite", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      can_use_salesloft: canUseSalesLoft,
    });

    if (!canUseSalesLoft) {
      setSnackbarMessage("No valid SalesLoft template available.");
      setSnackbarOpen(true);
      return;
    }
    setDialogOpen(true);
  };

  const handleSalesLoftConfirmation = async () => {
    sendGAEvent("confirm_salesloft_invite", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      selected_language: selectedLanguage,
    });

    try {
      const salesLoftTemplate = salesLoftTemplateForSelectedLanguage;
      if (!salesLoftTemplate) {
        throw new Error("SalesLoft template not found.");
      }
      if (!salesLoftTemplate.subjectLine || !salesLoftTemplate.template) {
        throw new Error(
          "Template data is incomplete. Missing subjectLine or template."
        );
      }
      const result = await createSalesLoftEmailTemplate({
        title: selectedEvent.title,
        subjectLine: salesLoftTemplate.subjectLine,
        template: salesLoftTemplate.template,
      });
      if (result.success) {
        setSnackbarMessage(
          "Salesloft Cadence successfully created - Search in Salesloft by event title"
        );
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(
          "Failed to create SalesLoft template. Please try again."
        );
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error("Error creating SalesLoft email template:", error);
      setSnackbarMessage(`Failed to create SalesLoft template: ${error.message}`);
      setSnackbarSeverity("error");
    } finally {
      setDialogOpen(false);
      setSnackbarOpen(true);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // E. Gmail
  // ───────────────────────────────────────────────────────────────────────────
  const handleGmailInvite = async () => {
    sendGAEvent("gmail_invite", {
      event_category: "EventInfoPopup",
      event_label: selectedEvent.title,
      can_use_gmail: canUseGmail,
      selected_language: selectedLanguage,
    });

    try {
      if (!canUseGmail) {
        setSnackbarMessage("No valid Gmail template available.");
        setSnackbarOpen(true);
        return;
      }

      const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;
      let accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

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

      const template = gmailTemplateForSelectedLanguage.template;
      const subjectLine = gmailTemplateForSelectedLanguage.subjectLine;

      if (!template) {
        console.error("No template body found for the selected language.");
        alert("No template body found for the selected language.");
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

      let response = await fetch(`${apiUrl}send-gmail-invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(emailDetails),
      });

      if (!response.ok) {
        const responseText = await response.text();
        if (
          response.status === 401 ||
          response.status === 500 ||
          responseText.includes("Invalid Credentials") ||
          responseText.includes("TokenExpired")
        ) {
          console.warn("Access token expired or invalid. Attempting to refresh...");
          if (refreshToken) {
            const tokenData = await refreshAccessToken(refreshToken);
            if (tokenData.accessToken) {
              accessToken = tokenData.accessToken;
              sessionStorage.setItem("accessToken", accessToken);
              localStorage.setItem("accessToken", accessToken);

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
                console.error(
                  "Retry failed to create draft. Response status:",
                  response.status
                );
                throw new Error(
                  `Failed to create Gmail draft after token refresh: ${response.statusText}`
                );
              }
            } else {
              console.error("Failed to refresh token. Redirecting to login...");
              sessionStorage.clear();
              localStorage.clear();
              setSnackbarMessage(
                "Gmail token could not be refreshed. Redirecting to login..."
              );
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
      if (data.success) {
        window.open(data.draftUrl, "_blank");
      } else {
        alert("Error creating draft email.");
      }
    } catch (error) {
      alert("Failed to create Gmail draft. Please try again.");
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // F. Format region and city arrays
  // ───────────────────────────────────────────────────────────────────────────
  const formatListWithSpaces = (list) => {
    if (!list) return "";
    if (typeof list === "string") return list.replace(/,/g, ", ");
    if (!Array.isArray(list)) return "";
    return list.map((item) => item.replace(/,/g, ", ")).join(", ");
  };

  const getRegionLabel = (selectedEvent) => {
    const regionList = Array.isArray(selectedEvent.region)
      ? selectedEvent.region
      : [];
    const subRegionList = Array.isArray(selectedEvent.subRegion)
      ? selectedEvent.subRegion
      : [];
    const countryList = Array.isArray(selectedEvent.country)
      ? selectedEvent.country
      : [];

    if (regionList.length === 0 || subRegionList.length === 0) {
      return null;
    }

    const mainRegion = regionList[0];
    if (!mainRegion) return null;

    const selectedRegionData = regionsData.find((r) => r.region === mainRegion);
    if (!selectedRegionData) {
      return [
        formatListWithSpaces(regionList),
        formatListWithSpaces(subRegionList),
        formatListWithSpaces(countryList),
      ]
        .filter(Boolean)
        .join(", ");
    }

    const allSubregionsSelected = selectedRegionData.subregions.every((sub) =>
      subRegionList.includes(sub)
    );

    if (allSubregionsSelected) {
      let everyCountryInAllSubs = true;
      selectedRegionData.subregions.forEach((sub) => {
        const subData = subregionsData.find((s) => s.subregion === sub);
        if (
          !subData ||
          !subData.countries.every((c) => countryList.includes(c))
        ) {
          everyCountryInAllSubs = false;
        }
      });
      if (everyCountryInAllSubs) {
        return `All ${mainRegion}`;
      }
    }

    return [
      formatListWithSpaces(regionList),
      formatListWithSpaces(subRegionList),
      formatListWithSpaces(countryList),
    ]
      .filter(Boolean)
      .join(", ");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // G. Sections Layout
  // ───────────────────────────────────────────────────────────────────────────
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
            <Chip label={selectedEvent.eventType} color="primary" size="small" />
          )}
          {selectedEvent.isDirectPartner && (
            <Chip label="Direct Partner" color="secondary" size="small" />
          )}
          {selectedEvent.entryCreatedDate?.value &&
            dayjs().diff(dayjs(selectedEvent.entryCreatedDate.value), "day") <=
              14 && (
              <Tooltip
                title={`Created on: ${dayjs(
                  selectedEvent.entryCreatedDate.value
                ).format("MMM D, YYYY h:mm A")}`}
                arrow
              >
                <Chip
                  label="Newly Created"
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </Tooltip>
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
                }, Public Sector: ${
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
                    ([category, details]) => `${category}: ${details.percentage}%`
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
          Object.values(selectedEvent.accountType).some((type) => type.selected) && (
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

        {selectedEvent.programName?.length > 0 && (
          <Typography
            variant="body2"
            display="flex"
            alignItems="center"
            sx={{
              wordBreak: "break-word",
              whiteSpace: "normal",
              flexWrap: "wrap",
            }}
          >
            <LabelIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
            Program:
            <Typography
              variant="body2"
              sx={{
                marginLeft: "5px",
                wordBreak: "break-word",
                whiteSpace: "normal",
                display: "inline",
              }}
            >
              {selectedEvent.programName.join(", ")}
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
          <Typography variant="body2" display="flex" sx={{ whiteSpace: "normal" }}>
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
          <Typography variant="body2" display="flex" sx={{ whiteSpace: "normal" }}>
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
          <Typography variant="body2" display="flex" sx={{ whiteSpace: "normal" }}>
            <LinkIcon style={{ marginRight: "5px", color: "#1a73e8" }} />
            Haiilo Links:{" "}
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
          <Typography variant="body2" display="flex" sx={{ whiteSpace: "normal" }}>
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

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────
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
            {/* Draggable AppBar */}
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
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => {
                    // GA event
                    sendGAEvent("close_popup_x_button", {
                      event_category: "EventInfoPopup",
                      event_label: selectedEvent.title,
                    });
                    handleClose();
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>

            {/* Title & Draft Label */}
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
                    sendGAEvent("try_add_to_google_calendar", {
                      event_category: "EventInfoPopup",
                      event_label: selectedEvent.title,
                    });
                    // If missing time in start/end date, show error
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

            {/* Date Range */}
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
              {dayjs(selectedEvent.startDate).format("ddd, MMM D, YYYY h:mm A")} -{" "}
              {dayjs(selectedEvent.endDate).format("ddd, MMM D, YYYY h:mm A")}
            </Typography>

            {/* Region / Subregion / Country / City / Venue */}
            {(
              Array.isArray(selectedEvent.region) && selectedEvent.region.length > 0
            ) ||
            (Array.isArray(selectedEvent.subRegion) &&
              selectedEvent.subRegion.length > 0) ||
            (Array.isArray(selectedEvent.country) &&
              selectedEvent.country.length > 0) ||
            (Array.isArray(selectedEvent.city) && selectedEvent.city.length > 0) ||
            selectedEvent.locationVenue ? (
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
                    formatListWithSpaces(selectedEvent.city),
                    selectedEvent.locationVenue,
                  ]
                    .filter(Boolean)
                    .join(", ")}
              </Typography>
            ) : null}

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Section Tabs */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 2, justifyContent: "flex-start" }}
            >
              {Object.keys(sections).map((section) => (
                <Button
                  key={section}
                  variant={currentSection === section ? "contained" : "outlined"}
                  onClick={() => {
                    sendGAEvent("switch_section_tab", {
                      event_category: "EventInfoPopup",
                      event_label: section,
                    });
                    setCurrentSection(section);
                  }}
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
            {/* Render the chosen section */}
            {sections[currentSection]}

            <Divider sx={{ width: "100%", my: 1 }} />

            {/* Bottom Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: 2,
              }}
            >
              {/* LinkedIn/Haiilo */}
              <CustomTooltip
                title={
                  selectedEvent.hailoLinks && selectedEvent.hailoLinks.length > 0
                    ? "View Haiilo Links on LinkedIn"
                    : "No Haiilo link provided"
                }
                arrow
                sx={{ zIndex: 120000 }}
              >
                <span>
                  <IconButton
                    onClick={() => {
                      sendGAEvent("open_linkedin_dialog", {
                        event_category: "EventInfoPopup",
                        event_label: selectedEvent.title,
                      });
                      if (
                        selectedEvent.hailoLinks &&
                        selectedEvent.hailoLinks.length > 0
                      ) {
                        setLinkedInDialogOpen(true);
                      }
                    }}
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
                {/* Language & Invite Buttons */}
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
                        <IconButton
                          onClick={() => {
                            sendGAEvent("open_language_dialog", {
                              event_category: "EventInfoPopup",
                              event_label: selectedEvent.title,
                            });
                            setLanguageDialogOpen(true);
                          }}
                        >
                          <LanguageIcon />
                        </IconButton>
                      </CustomTooltip>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No invite available
                    </Typography>
                  )}
                </div>

                {/* Gmail Invite Button */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: canUseGmail
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(200, 200, 200, 0.5)",
                    color: canUseGmail ? "#5f6368" : "#bdbdbd",
                    boxShadow: canUseGmail
                      ? "0 1px 2px 0 rgba(60,64,67,0.302)"
                      : "none",
                    margin: "10px",
                    "&:hover": {
                      backgroundColor: canUseGmail
                        ? "rgba(66, 133, 244, 0.1)"
                        : "rgba(200, 200, 200, 0.5)",
                      borderColor: canUseGmail ? blue[500] : "none",
                    },
                  }}
                  disabled={!canUseGmail}
                  startIcon={
                    <img
                      src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
                      alt="Gmail Logo"
                      style={{ width: "24px", height: "24px", marginRight: "8px" }}
                    />
                  }
                  onClick={handleGmailInvite}
                >
                  Gmail Invite
                </Button>

                {/* SalesLoft Invite Button */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: canUseSalesLoft
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(200, 200, 200, 0.5)",
                    color: canUseSalesLoft ? "#5f6368" : "#bdbdbd",
                    boxShadow: canUseSalesLoft
                      ? "0 1px 2px 0 rgba(60,64,67,0.302)"
                      : "none",
                    margin: "10px",
                    "&:hover": {
                      backgroundColor: canUseSalesLoft
                        ? "rgba(66, 133, 244, 0.1)"
                        : "rgba(200, 200, 200, 0.5)",
                      borderColor: canUseSalesLoft ? blue[500] : "none",
                    },
                  }}
                  disabled={!canUseSalesLoft}
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
                </Button>
              </Stack>
            </Box>
          </Paper>
        </div>
      </Draggable>

      {/* Calendar Confirmation Dialog */}
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
            onClick={() => {
              sendGAEvent("cancel_add_calendar", {
                event_category: "EventInfoPopup",
                event_label: selectedEvent.title,
              });
              setCalendarConfirmationDialogOpen(false);
            }}
            color="secondary"
          >
            No
          </Button>
          <Button
            onClick={handleCalendarConfirmation}
            color="primary"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* SalesLoft Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        sx={{ zIndex: 80000 }}
      >
        <DialogTitle>Confirm SalesLoft Invite</DialogTitle>
        <DialogContent>
          Are you sure you want to create a SalesLoft cadence?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              sendGAEvent("cancel_salesloft_invite", {
                event_category: "EventInfoPopup",
                event_label: selectedEvent.title,
              });
              setDialogOpen(false);
            }}
            color="secondary"
          >
            No
          </Button>
          <Button onClick={handleSalesLoftConfirmation} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Language Select Dialog */}
      <Dialog
        open={languageDialogOpen}
        onClose={() => {
          sendGAEvent("close_language_dialog", {
            event_category: "EventInfoPopup",
            event_label: selectedEvent.title,
          });
          setLanguageDialogOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 100000000 }}
      >
        <DialogTitle>Select Language</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedLanguage}
              onChange={(event) => setSelectedLanguage(event.target.value)}
            >
              {languagesAndTemplates.length > 0 ? (
                languagesAndTemplates.map((item, idx) => (
                  <FormControlLabel
                    key={`${item.platform}-${item.language}-${idx}`}
                    value={item.language}
                    control={<Radio />}
                    label={`${item.platform} - ${item.language}`}
                    onClick={() => {
                      sendGAEvent("select_language_option", {
                        event_category: "EventInfoPopup",
                        language: item.language,
                        platform: item.platform,
                      });
                    }}
                  />
                ))
              ) : (
                <Typography>No invite available</Typography>
              )}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              sendGAEvent("cancel_language_dialog", {
                event_category: "EventInfoPopup",
                event_label: selectedEvent.title,
              });
              setLanguageDialogOpen(false);
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              sendGAEvent("confirm_language_dialog", {
                event_category: "EventInfoPopup",
                selected_language: selectedLanguage,
              });
              setLanguageDialogOpen(false);
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* LinkedIn / Haiilo Dialog */}
      <Dialog
        open={linkedInDialogOpen}
        onClose={() => {
          sendGAEvent("close_linkedin_dialog", {
            event_category: "EventInfoPopup",
            event_label: selectedEvent.title,
          });
          setLinkedInDialogOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        sx={{ zIndex: 100000000 }}
      >
        <DialogTitle>Haiilo Links</DialogTitle>
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
                    color: "#1a73e8",
                    textDecoration: "underline",
                    maxWidth: "85%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() =>
                    sendGAEvent("click_haiilo_link", {
                      event_category: "EventInfoPopup",
                      event_label: link,
                      event_title: selectedEvent.title,
                    })
                  }
                >
                  {link}
                </Typography>
                <IconButton
                  onClick={() => {
                    sendGAEvent("open_haiilo_link", {
                      event_category: "EventInfoPopup",
                      event_label: link,
                      event_title: selectedEvent.title,
                    });
                    window.open(link, "_blank");
                  }}
                  size="small"
                  sx={{ color: "#1a73e8" }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography>No Haiilo links available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              sendGAEvent("close_linkedin_dialog", {
                event_category: "EventInfoPopup",
                event_label: selectedEvent.title,
              });
              setLinkedInDialogOpen(false);
            }}
            color="secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog for duplicating event */}
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
            onClick={() => {
              sendGAEvent("cancel_duplicate_event", {
                event_category: "EventInfoPopup",
                event_label: selectedEvent.title,
              });
              handleConfirmationDialogClose();
            }}
            color="secondary"
          >
            No
          </Button>
          <Button onClick={confirmDuplicateEvent} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
