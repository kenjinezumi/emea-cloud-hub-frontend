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
} from "@mui/material";
import { useLocation } from "react-router-dom";

import GlobalContext from "../../context/GlobalContext";
import { getEventData } from "../../api/getEventData";
import EventInfoPopup from "../popup/EventInfoModal";

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
  // 1) Fetch events whenever location changes (same as your original code)
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
  // 2) Apply advanced filters (same logic as in Month/Day/Year views) AND
  //    also filter by searchText in one pass (or two passes).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If we have no events yet, skip
    if (!events || !Array.isArray(events)) {
      setFilteredEvents([]);
      return;
    }

    // (A) Check if no advanced filters are checked
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

    // (B) Convert search text to lowercase for case-insensitive matching
    const lowercasedSearchText = (searchText || "").toLowerCase();

    // (C) Single pass filter
    let final = events.filter((event) => {
      try {
        // 1) If advanced filters are not set, everything passes them
        //    Otherwise, do each advanced filter check:
        if (anyFilterChecked) {
          // 1.a) Region
          const regionMatch =
            !filters.regions.some((r) => r.checked) ||
            filters.regions.some(
              (r) => r.checked && event.region?.includes(r.label)
            );

          // 1.b) Sub-region
          const subRegionMatch =
            !filters.subRegions.some((s) => s.checked) ||
            filters.subRegions.some(
              (s) => s.checked && event.subRegion?.includes(s.label)
            );

          // 1.c) Countries
          const countryMatch =
            !filters.countries.some((c) => c.checked) ||
            filters.countries.some(
              (c) => c.checked && event.country?.includes(c.label)
            );

          // 1.d) GEP
          const gepMatch =
            !filters.gep.some((g) => g.checked) ||
            filters.gep.some(
              (g) => g.checked && event.gep?.includes(g.label)
            );

          // 1.e) Program
          const programMatch =
            !filters.programName.some((p) => p.checked) ||
            filters.programName.some(
              (p) =>
                p.checked &&
                event.programName?.some((evName) =>
                  evName.toLowerCase().includes(p.label.toLowerCase())
                )
            );

          // 1.f) Activity Type
          const activityMatch =
            !filters.activityType.some((a) => a.checked) ||
            filters.activityType.some(
              (a) =>
                a.checked &&
                event.eventType?.toLowerCase() === a.label.toLowerCase()
            );

          // 1.g) Account Sectors
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

          // 1.h) Account Segments
          const accountSegmentMatch =
            !filters.accountSegments.some((seg) => seg.checked) ||
            filters.accountSegments.some((seg) => {
              if (!seg.checked) return false;
              const eSeg = event.accountSegments?.[seg.label];
              return eSeg?.selected && parseFloat(eSeg.percentage) > 0;
            });

          // 1.i) Buyer Segment
          const buyerSegmentRollupMatch =
            !filters.buyerSegmentRollup.some((b) => b.checked) ||
            filters.buyerSegmentRollup.some(
              (b) =>
                b.checked && event.audienceSeniority?.includes(b.label)
            );

          // 1.j) Product Family
          const productFamilyMatch =
            !filters.productFamily.some((pf) => pf.checked) ||
            filters.productFamily.some((pf) => {
              if (!pf.checked) return false;
              const alignment = event.productAlignment?.[pf.label];
              return alignment?.selected && parseFloat(alignment.percentage) > 0;
            });

          // 1.k) Industry
          const industryMatch =
            !filters.industry.some((ind) => ind.checked) ||
            filters.industry.some(
              (ind) => ind.checked && event.industry?.includes(ind.label)
            );

          // 1.l) Partner Event
          const partnerCheckedValues = filters.partnerEvent
            .filter((pt) => pt.checked)
            .map((pt) => pt.value); 
          const partnerMatch =
            partnerCheckedValues.length === 0 ||
            partnerCheckedValues.includes(event.isPartneredEvent);

          // 1.m) Draft Status
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
                // If not draft, check invites
                const hasInvites = event.languagesAndTemplates?.some((lt) =>
                  ["Gmail", "Salesloft"].includes(lt.platform)
                );
                if (hasInvites) statuses.push("Invite available");
              }
              return statuses.some((st) => draftCheckedValues.includes(st));
            })();

          // 1.n) Newly Created (last 14 days)
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

          // 1.o) OrganisedBy (multi-select)
          const organiserActive =
            filters.organisedBy && filters.organisedBy.length > 0;
          const organiserMatch =
            !organiserActive ||
            filters.organisedBy.some((org) => event.organisedBy?.includes(org));

          // If any advanced filter fails, skip
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
        } // End if (anyFilterChecked)

        // 2) Now handle the user’s search text (title/description)
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

        // If it passed all checks, keep it
        return true;
      } catch (error) {
        console.error("Error filtering event:", event, error);
        return false;
      }
    });

    // (D) Sort the final results by startDate
    final.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // (E) Store
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
  // Dynamic border color (unchanged from your code)
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
                      <Typography variant="h6">
                        {event.title} {event.emoji}
                      </Typography>
                    }
                    secondary={
                      `Start date: ${dayjs(event.startDate).format(
                        "dddd, MMMM D, YYYY"
                      )}\nCountries: ${event.country?.join(", ")}`
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
