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

// A helper map of region -> subregions used by your code
// (Adjust these if your real data differs)
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
  GLOBAL: [
    "Alps", "Benelux", "CEE", "France", "Germany", "Iberia",
    "Israel", "Italy", "MEA", "Nordics", "UK/IE",
  ],
};

// Utility to figure out if an event’s subRegions cover *all* subregions in that region
function getDisplayedSubregions(event) {
  const { region = [], subRegion = [] } = event;
  if (!Array.isArray(region) || region.length === 0) return "No region";

  // We'll build strings like "All EMEA" or "EMEA: Alps, CEE" etc.
  const displayPieces = [];

  region.forEach((r) => {
    const standardSubs = REGION_SUBREGION_MAP[r] || [];
    // Filter the event’s subRegion to only the ones belonging to region `r`.
    const subRegionForThisRegion = subRegion.filter((sr) =>
      standardSubs.includes(sr)
    );

    // If the event doesn't have any subregion from region r, skip
    if (subRegionForThisRegion.length === 0) return;

    // If the event covers *all* subregions for `r`, display "All EMEA" etc.
    if (
      subRegionForThisRegion.length === standardSubs.length &&
      standardSubs.length > 0
    ) {
      displayPieces.push(`All ${r}`);
    } else {
      // Partial coverage -> show them individually
      displayPieces.push(`${r}: ${subRegionForThisRegion.join(", ")}`);
    }
  });

  if (displayPieces.length === 0) {
    return "No subregions selected";
  }

  // Join them with a separator if the event has multiple regions
  return displayPieces.join(" | ");
}

// Utility to determine the event's "draft status" chip
function getDraftStatus(event) {
  if (event.isDraft) {
    return "Draft";
  }
  // Check if there is at least one invite on "Gmail" or "Salesloft"
  const hasInvites = event.languagesAndTemplates?.some((lt) =>
    ["Gmail", "Salesloft"].includes(lt.platform)
  );
  if (hasInvites) {
    return "Invite available";
  }
  return "Finalized";
}

// Utility to check if event is newly created (within last 14 days)
function isNewlyCreated(event) {
  const createdValue = event?.entryCreatedDate?.value;
  if (!createdValue) return false;

  const createdAt = dayjs(createdValue);
  if (!createdAt.isValid()) return false;

  return dayjs().diff(createdAt, "day") <= 14;
}

export default function ListView() {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 1) Fetch events on location change
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 2) Apply advanced filters + search text
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If no events yet, skip
    if (!events || !Array.isArray(events)) {
      setFilteredEvents([]);
      return;
    }

    // (A) Check if any advanced filter is actually checked
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

    // (B) Lowercase the search text for case-insensitive matching
    const lowercasedSearchText = (searchText || "").toLowerCase();

    // (C) Single pass filter
    const final = events.filter((event) => {
      try {
        // 1) If advanced filters are not set, everything passes
        //    Otherwise, do the advanced filter checks:
        if (anyFilterChecked) {
          // Region
          const regionMatch =
            !filters.regions.some((r) => r.checked) ||
            filters.regions.some(
              (r) => r.checked && event.region?.includes(r.label)
            );

          // Sub-region
          const subRegionMatch =
            !filters.subRegions.some((s) => s.checked) ||
            filters.subRegions.some(
              (s) => s.checked && event.subRegion?.includes(s.label)
            );

          // Countries
          const countryMatch =
            !filters.countries.some((c) => c.checked) ||
            filters.countries.some(
              (c) => c.checked && event.country?.includes(c.label)
            );

          // GEP
          const gepMatch =
            !filters.gep.some((g) => g.checked) ||
            filters.gep.some(
              (g) => g.checked && event.gep?.includes(g.label)
            );

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

          // Activity Type
          const activityMatch =
            !filters.activityType.some((a) => a.checked) ||
            filters.activityType.some(
              (a) =>
                a.checked &&
                event.eventType?.toLowerCase() === a.label.toLowerCase()
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

          // Buyer Segment
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
              // Build the event’s *effective* status
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
          const newlyCreatedFilters = filters.newlyCreated.filter(
            (nc) => nc.checked
          );
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
          const organiserActive =
            filters.organisedBy && filters.organisedBy.length > 0;
          const organiserMatch =
            !organiserActive ||
            filters.organisedBy.some((org) => event.organisedBy?.includes(org));

          // If ANY advanced filter fails, exclude this event
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

        // 2) Check the user’s search text (title/description)
        if (lowercasedSearchText) {
          const title = event.title?.toLowerCase() || "";
          const description = event.description?.toLowerCase() || "";
          const matchesText =
            title.includes(lowercasedSearchText) ||
            description.includes(lowercasedSearchText);
          if (!matchesText) {
            return false;
          }
        }

        return true; // Passed all checks
      } catch (error) {
        console.error("Error filtering event:", event, error);
        return false;
      }
    });

    // (D) Sort final results by startDate ascending
    final.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // (E) Set the filtered array
    setFilteredEvents(final);
  }, [events, filters, searchText]);

  // ---------------------------------------------------------------------------
  // Handle event click -> show info modal
  // ---------------------------------------------------------------------------
  const handleEventClick = useCallback(
    (eventData) => {
      setSelectedEvent(eventData);
      setShowInfoEventModal(true);
    },
    [setSelectedEvent, setShowInfoEventModal]
  );

  // ---------------------------------------------------------------------------
  // Dynamically color the left border
  // ---------------------------------------------------------------------------
  const getBorderColor = (eventType) => {
    switch (eventType) {
      case "Online Event":
        return "#4285F4";
      case "Physical Event":
        return "#DB4437";
      case "Hybrid Event":
        return "#0F9D58";
      case "Customer Story":
        return "#F4B400";
      case "Blog Post":
        return "#AB47BC";
      default:
        return "#e3f2fd";
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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
                          {/* Subregions */}
                          <Chip
                            label={getDisplayedSubregions(event)}
                            color="primary"
                            variant="outlined"
                          />

                          {/* Activity Type / eventType */}
                          {event.eventType && (
                            <Chip
                              label={event.eventType}
                              color="secondary"
                              variant="outlined"
                            />
                          )}

                          {/* Organised By => possibly multiple */}
                          {(event.organisedBy || []).map((org) => (
                            <Chip
                              key={org}
                              label={`Organised by: ${org}`}
                              color="success"
                              variant="outlined"
                            />
                          ))}

                          {/* Draft Status */}
                          <Chip
                            label={getDraftStatus(event)}
                            color="info"
                            variant="outlined"
                          />

                          {/* Newly Created? */}
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
