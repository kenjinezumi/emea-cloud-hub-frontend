import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import dayjs from "dayjs";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import GlobalContext from "../../context/GlobalContext";
import { getEventData } from "../../api/getEventData";
import EventInfoPopup from "../popup/EventInfoModal";

// Import your data arrays
import { regionsData } from "../filters/FiltersData"; // or wherever your `regionsData` is
// For eventType color logic
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import ArticleIcon from "@mui/icons-material/Article";

/** Determine how the subregions should be displayed for each event */
function getDisplayedSubregions(event) {
  let { region = [], subRegion = [] } = event;

  // Deduplicate to avoid repeated "EMEA EMEA"
  const dedupRegion = [...new Set(region)];
  const dedupSubRegion = [...new Set(subRegion)];

  if (dedupRegion.length === 0) return "No region";

  const displayPieces = [];

  dedupRegion.forEach((r) => {
    // Look up this region in regionsData
    const regionObj = regionsData.find((rd) => rd.region === r);

    // If we have no info for this region (e.g. NORTHAM), just display the region name
    if (!regionObj) {
      displayPieces.push(r);
      return;
    }

    // Otherwise gather its known subregions
    const knownSubs = regionObj.subregions || [];
    // Filter out subregions that belong to *this* region
    const relevantSubs = dedupSubRegion.filter((sr) => knownSubs.includes(sr));

    // If no relevant subregions chosen, skip
    if (relevantSubs.length === 0) return;

    // If user selected "all" subregions for that region, display "All EMEA" etc.
    if (relevantSubs.length === knownSubs.length && knownSubs.length > 0) {
      displayPieces.push(`All ${r}`);
    } else {
      displayPieces.push(`${r}: ${relevantSubs.join(", ")}`);
    }
  });

  if (displayPieces.length === 0) return "No subregions selected";
  return displayPieces.join(" | ");
}

/** Return draft status text: "Draft", "Invite available", "Finalized" */
function getDraftStatus(event) {
  if (event.isDraft) return "Draft";

  // If at least one invite exists (Gmail or SalesLoft) => "Invite available"
  const hasInvites = event.languagesAndTemplates?.some((lt) =>
    ["Gmail", "Salesloft"].includes(lt.platform)
  );
  return hasInvites ? "Invite available" : "Finalized";
}

/** Check if event was created in the last 14 days */
function isNewlyCreated(event) {
  const createdValue = event?.entryCreatedDate?.value;
  if (!createdValue) return false;
  const createdAt = dayjs(createdValue);
  return createdAt.isValid() && dayjs().diff(createdAt, "day") <= 14;
}

/** For coloring chips based on event type. Add the new 'Prospecting Sprint'. */
function getEventStyleAndIcon(eventType) {
  switch (eventType) {
    case "Online Event":
      return {
        backgroundColor: "#e3f2fd",
        color: "#1a73e8",
        icon: <LanguageIcon fontSize="small" style={{ marginRight: 5 }} />,
      };
    case "Physical Event":
      return {
        backgroundColor: "#fce4ec",
        color: "#d32f2f",
        icon: <LocationOnIcon fontSize="small" style={{ marginRight: 5 }} />,
      };
    case "Hybrid Event":
      return {
        backgroundColor: "#f3e5f5",
        color: "#6a1b9a",
        icon: <EventIcon fontSize="small" style={{ marginRight: 5 }} />,
      };
    case "Prospecting Sprint":
      return {
        backgroundColor: "#fffde7",
        color: "#ff9800",
        icon: <EventIcon fontSize="small" style={{ marginRight: 5 }} />,
      };
    case "Customer Story":
      return {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        icon: <EventIcon fontSize="small" style={{ marginRight: 5 }} />,
      };
    case "Blog Post":
      return {
        backgroundColor: "#fffde7",
        color: "#f57f17",
        icon: <ArticleIcon fontSize="small" style={{ marginRight: 5 }} />,
      };
    default:
      return {
        backgroundColor: "#e3f2fd",
        color: "#1a73e8",
        icon: <EventIcon fontSize="small" style={{ marginRight: 5 }} />,
      };
  }
}

/** Provide a left border color on the entire ListItem by event type. */
function getBorderColor(eventType) {
  switch (eventType) {
    case "Online Event":
      return "#4285F4";
    case "Physical Event":
      return "#DB4437";
    case "Hybrid Event":
      return "#0F9D58";
    case "Customer Story":
      return "#2e7d32";
    case "Blog Post":
      return "#F4B400";
    case "Prospecting Sprint":
      return "#FFA726";
    default:
      return "#e3f2fd";
  }
}

export default function ListView() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    filters,
    setShowEventModal,
    setShowInfoEventModal,
    searchText,
    showEventInfoModal,
    setSelectedEvent,
  } = useContext(GlobalContext);

  const location = useLocation();

  // -------------------------------------------------------------------------
  // Fetch all events whenever route/location changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eventData = await getEventData("eventDataQuery");
        setEvents(Array.isArray(eventData) ? eventData : []);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // -------------------------------------------------------------------------
  // Filtering logic (unchanged from your original, just omitted for brevity)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) {
      setFilteredEvents([]);
      return;
    }

    // Example only: search text filter
    const lowercasedSearchText = (searchText || "").toLowerCase();

    const final = events.filter((event) => {
      // 1) Optional advanced filters
      // ...
      // 2) Simple search text match
      if (lowercasedSearchText) {
        const title = event.title?.toLowerCase() || "";
        const description = event.description?.toLowerCase() || "";
        if (
          !title.includes(lowercasedSearchText) &&
          !description.includes(lowercasedSearchText)
        ) {
          return false;
        }
      }
      return true;
    });

    // sort ascending by start date
    final.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    setFilteredEvents(final);
  }, [events, filters, searchText]);

  // -------------------------------------------------------------------------
  // Show event info modal
  // -------------------------------------------------------------------------
  const handleEventClick = useCallback(
    (eventData) => {
      setSelectedEvent(eventData);
      setShowInfoEventModal(true);
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Paper sx={{ margin: 2, padding: 2, width: "90%", overflowY: "auto" }}>
      {loading ? (
        <Box
          sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <List>
            {filteredEvents.map((event, idx) => {
              const borderColor = getBorderColor(event.eventType);

              return (
                <ListItem
                  key={idx}
                  divider
                  sx={{
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    cursor: "pointer",
                    margin: "4px 0",
                    padding: "10px",
                    borderLeft: `8px solid ${borderColor}`,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    transition: "background-color 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {event.title} {event.emoji}
                      </Typography>
                    }
                    secondary={
                      <>
                        {/* Show date */}
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Start Date:{" "}
                          {dayjs(event.startDate).format("dddd, MMMM D, YYYY")}
                        </Typography>

                        {/* Chips row */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {/* Region/Subregion */}
                          <Chip
                            label={getDisplayedSubregions(event)}
                            sx={{
                              backgroundColor: "#4285F4",
                              color: "#fff",
                              border: "1px solid rgba(255,255,255,0.3)",
                            }}
                          />

                          {/* EventType color-coded chip */}
                          {event.eventType && (() => {
                            const { backgroundColor, color, icon } =
                              getEventStyleAndIcon(event.eventType);
                            return (
                              <Chip
                                label={
                                  <Box sx={{ display: "flex", alignItems: "center" }}>
                                    {icon}
                                    {event.eventType}
                                  </Box>
                                }
                                sx={{
                                  backgroundColor,
                                  color,
                                  border: `1px solid ${color}`,
                                }}
                                size="small"
                              />
                            );
                          })()}

                          {/* OrganisedBy => same style as subregion chip */}
                          {(event.organisedBy || []).map((org) => (
                            <Chip
                              key={org}
                              label={`Organised by: ${org}`}
                              sx={{
                                backgroundColor: "#4285F4",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.3)",
                              }}
                              size="small"
                            />
                          ))}

                          {/* Draft status => match popup style */}
                          {getDraftStatus(event) === "Draft" && (
                            <Chip label="Draft" color="warning" size="small" />
                          )}
                          {getDraftStatus(event) === "Invite available" && (
                            <Chip label="Invite available" color="primary" size="small" />
                          )}
                          {getDraftStatus(event) === "Finalized" && (
                            <Chip
                              label="Finalized"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}

                          {/* Newly Created => color="success" variant="outlined" */}
                          {isNewlyCreated(event) && (
                            <Chip
                              label="Newly Created"
                              color="success"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>

          {showEventInfoModal && <EventInfoPopup />}
        </>
      )}
    </Paper>
  );
}
