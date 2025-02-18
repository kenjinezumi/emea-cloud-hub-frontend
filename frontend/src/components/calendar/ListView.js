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

// ICONS for alignment with Day.jsx coloring logic
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import ArticleIcon from "@mui/icons-material/Article";

// ---------------------------------------------------------------------------
// Same subregion logic as before
// ---------------------------------------------------------------------------
const REGION_SUBREGION_MAP = {
  EMEA: [
    "Alps", "Benelux", "CEE", "France", "Germany", "Iberia",
    "Israel", "Italy", "MEA", "Nordics", "UK/IE",
  ],
  JAPAC: [
    "AuNZ", "Greater China", "India", "Japan", "Korea", "SEA",
  ],
  LATAM: [
    "Brazil", "MCO", "Mexico",
  ],
};

function getDisplayedSubregions(event) {
  const { region = [], subRegion = [] } = event;
  if (!Array.isArray(region) || region.length === 0) return "No region";

  const displayPieces = [];

  region.forEach((r) => {
    const standardSubs = REGION_SUBREGION_MAP[r] || [];
    const subRegionForThisRegion = subRegion.filter((sr) =>
      standardSubs.includes(sr)
    );

    if (subRegionForThisRegion.length === 0) return;

    if (
      subRegionForThisRegion.length === standardSubs.length &&
      standardSubs.length > 0
    ) {
      displayPieces.push(`All ${r}`);
    } else {
      displayPieces.push(`${r}: ${subRegionForThisRegion.join(", ")}`);
    }
  });

  if (displayPieces.length === 0) {
    return "No subregions selected";
  }

  return displayPieces.join(" | ");
}

// ---------------------------------------------------------------------------
// Draft status logic
// ---------------------------------------------------------------------------
function getDraftStatus(event) {
  if (event.isDraft) {
    return "Draft";
  }
  // Check if there is at least one invite (Gmail or Salesloft)
  const hasInvites = event.languagesAndTemplates?.some((lt) =>
    ["Gmail", "Salesloft"].includes(lt.platform)
  );
  if (hasInvites) {
    return "Invite available";
  }
  return "Finalized";
}

// ---------------------------------------------------------------------------
// Newly created check
// ---------------------------------------------------------------------------
function isNewlyCreated(event) {
  const createdValue = event?.entryCreatedDate?.value;
  if (!createdValue) return false;

  const createdAt = dayjs(createdValue);
  if (!createdAt.isValid()) return false;

  return dayjs().diff(createdAt, "day") <= 14;
}

// ---------------------------------------------------------------------------
// Color & Icon Logic Mirroring "Day.jsx"
// ---------------------------------------------------------------------------
function getEventStyleAndIcon(eventType) {
  switch (eventType) {
    case "Online Event":
      return {
        backgroundColor: "#e3f2fd",
        color: "#1a73e8",
        icon: <LanguageIcon fontSize="small" style={{ marginRight: "5px" }} />,
      };
    case "Physical Event":
      return {
        backgroundColor: "#fce4ec",
        color: "#d32f2f",
        icon: <LocationOnIcon fontSize="small" style={{ marginRight: "5px" }} />,
      };
    case "Hybrid Event":
      return {
        backgroundColor: "#f3e5f5",
        color: "#6a1b9a",
        icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />,
      };
    case "Customer Story":
      return {
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
        icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />,
      };
    case "Blog Post":
      return {
        backgroundColor: "#fffde7",
        color: "#f57f17",
        icon: <ArticleIcon fontSize="small" style={{ marginRight: "5px" }} />,
      };
    default:
      return {
        backgroundColor: "#e3f2fd",
        color: "#1a73e8",
        icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />,
      };
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
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
  // Fetch all events when location changes
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
  // Filter events based on advanced filters + search text
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) {
      setFilteredEvents([]);
      return;
    }

    const anyFilterChecked =
      [
        ...filters.regions,
        ...filters.subRegions,
        ...filters.countries,
        ...filters.gep,
        ...filters.programName,
        ...filters.activityType,
        ...filters.accountSectors,
        ...filters.accountSegments,
        ...filters.buyerSegmentRollup,
        ...filters.productFamily,
        ...filters.industry,
        ...filters.partnerEvent,
        ...filters.draftStatus,
        ...filters.newlyCreated,
      ].some((f) => f.checked) ||
      (filters.organisedBy && filters.organisedBy.length > 0);

    const lowercasedSearchText = (searchText || "").toLowerCase();

    // Single pass filter
    const final = events.filter((event) => {
      try {
        // If no advanced filters are checked, skip advanced check
        if (anyFilterChecked) {
          // Region
          const regionMatch =
            !filters.regions.some((r) => r.checked) ||
            filters.regions.some((r) => r.checked && event.region?.includes(r.label));

          // Sub-region
          const subRegionMatch =
            !filters.subRegions.some((s) => s.checked) ||
            filters.subRegions.some((s) => s.checked && event.subRegion?.includes(s.label));

          // Countries
          const countryMatch =
            !filters.countries.some((c) => c.checked) ||
            filters.countries.some((c) => c.checked && event.country?.includes(c.label));

          // GEP
          const gepMatch =
            !filters.gep.some((g) => g.checked) ||
            filters.gep.some((g) => g.checked && event.gep?.includes(g.label));

          // Program
          const programMatch =
            !filters.programName.some((p) => p.checked) ||
            filters.programName.some(
              (p) =>
                p.checked &&
                event.programName?.some((evName) =>
                  evName.toLowerCase().includes(p.label.toLowerCase())
                )
            );

          // Activity type
          const activityMatch =
            !filters.activityType.some((a) => a.checked) ||
            filters.activityType.some(
              (a) => a.checked && event.eventType?.toLowerCase() === a.label.toLowerCase()
            );

          // Account Sectors
          const accountSectorMatch =
            !filters.accountSectors.some((s) => s.checked) ||
            filters.accountSectors.some((s) => {
              if (!s.checked) return false;
              const labelKeyMap = {
                "Public Sector": "public",
                Commercial: "commercial",
              };
              const key = labelKeyMap[s.label];
              return key ? event.accountSectors?.[key] === true : false;
            });

          // Account Segments
          const accountSegmentMatch =
            !filters.accountSegments.some((seg) => seg.checked) ||
            filters.accountSegments.some((seg) => {
              if (!seg.checked) return false;
              const eSeg = event.accountSegments?.[seg.label];
              return eSeg?.selected && parseFloat(eSeg.percentage) > 0;
            });

          // Buyer Segment Rollup
          const buyerSegmentRollupMatch =
            !filters.buyerSegmentRollup.some((b) => b.checked) ||
            filters.buyerSegmentRollup.some(
              (b) => b.checked && event.audienceSeniority?.includes(b.label)
            );

          // Product Family
          const productFamilyMatch =
            !filters.productFamily.some((pf) => pf.checked) ||
            filters.productFamily.some((pf) => {
              if (!pf.checked) return false;
              const alignment = event.productAlignment?.[pf.label];
              return alignment?.selected && parseFloat(alignment.percentage) > 0;
            });

          // Industry
          const industryMatch =
            !filters.industry.some((ind) => ind.checked) ||
            filters.industry.some(
              (ind) => ind.checked && event.industry?.includes(ind.label)
            );

          // Partner Event
          const partnerCheckedValues = filters.partnerEvent
            .filter((pt) => pt.checked)
            .map((pt) => pt.value);
          const partnerMatch =
            partnerCheckedValues.length === 0 ||
            partnerCheckedValues.includes(event.isPartneredEvent);

          // Draft Status
          const draftCheckedValues = filters.draftStatus
            .filter((ds) => ds.checked)
            .map((ds) => ds.value);
          const draftMatch =
            draftCheckedValues.length === 0 ||
            (() => {
              const statuses = [];
              if (event.isDraft) {
                statuses.push("Draft");
              } else {
                statuses.push("Finalized");
                const hasInvites = event.languagesAndTemplates?.some((lt) =>
                  ["Gmail", "Salesloft"].includes(lt.platform)
                );
                if (hasInvites) statuses.push("Invite available");
              }
              return statuses.some((st) => draftCheckedValues.includes(st));
            })();

          // Newly Created
          const newlyCreatedFilters = filters.newlyCreated.filter((nc) => nc.checked);
          const newlyCreatedMatch =
            newlyCreatedFilters.length === 0 ||
            newlyCreatedFilters.some((nc) => {
              const createdAt = event.entryCreatedDate?.value
                ? dayjs(event.entryCreatedDate.value)
                : null;
              if (!createdAt || !createdAt.isValid()) {
                return nc.value === false;
              }
              const isWithin14Days = dayjs().diff(createdAt, "day") <= 14;
              return nc.value === isWithin14Days;
            });

          // OrganisedBy
          const organiserActive = filters.organisedBy && filters.organisedBy.length > 0;
          const organiserMatch =
            !organiserActive ||
            filters.organisedBy.some((org) => event.organisedBy?.includes(org));

          if (
            !(
              regionMatch &&
              subRegionMatch &&
              countryMatch &&
              gepMatch &&
              programMatch &&
              activityMatch &&
              accountSectorMatch &&
              accountSegmentMatch &&
              buyerSegmentRollupMatch &&
              productFamilyMatch &&
              industryMatch &&
              partnerMatch &&
              draftMatch &&
              newlyCreatedMatch &&
              organiserMatch
            )
          ) {
            return false;
          }
        }

        // Search text check (title/description)
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
      } catch (error) {
        console.error("Error filtering event:", event, error);
        return false;
      }
    });

    // Sort the final list by startDate ascending
    final.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    setFilteredEvents(final);
  }, [events, filters, searchText]);

  // -------------------------------------------------------------------------
  // Event click -> show info popup
  // -------------------------------------------------------------------------
  const handleEventClick = useCallback(
    (eventData) => {
      setSelectedEvent(eventData);
      setShowInfoEventModal(true);
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

  // -------------------------------------------------------------------------
  // For left border color behind entire ListItem
  // -------------------------------------------------------------------------
  const getBorderColor = (eventType) => {
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
      default:
        return "#e3f2fd";
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Paper sx={{ margin: 2, padding: 2, width: "90%", overflowY: "auto" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <List>
            {filteredEvents.map((event, index) => {
              const borderColor = getBorderColor(event.eventType);

              return (
                <ListItem
                  key={index}
                  divider
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
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
                        {/* Date line */}
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Start Date:{" "}
                          {dayjs(event.startDate).format("dddd, MMMM D, YYYY")}
                        </Typography>

                        {/* Chips row */}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {/* Subregions chip */}
                          <Chip
                            label={getDisplayedSubregions(event)}
                            color="primary"
                            variant="outlined"
                          />

                          {/* EventType chip with color logic from Day.jsx */}
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
                                  // Some small styling to match chips
                                  border: `1px solid ${color}`,
                                }}
                              />
                            );
                          })()}

                          {/* OrganisedBy */}
                          {(event.organisedBy || []).map((org) => (
                            <Chip
                              key={org}
                              label={`Organised by: ${org}`}
                              color="success"
                              variant="outlined"
                            />
                          ))}

                          {/* Draft status */}
                          <Chip
                            label={getDraftStatus(event)}
                            color="info"
                            variant="outlined"
                          />

                          {/* Newly Created */}
                          {isNewlyCreated(event) && (
                            <Chip
                              label="Newly Created"
                              color="warning"
                              variant="outlined"
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
