// DataExtractView.js
import React, { useEffect, useState, useContext, useCallback } from "react";
import dayjs from "dayjs";
import Papa from "papaparse";
import { Paper, Box, Button, CircularProgress, Typography, TextField } from "@mui/material";
import GlobalContext from "../../context/GlobalContext"; // to get filters
import { getEventData } from "../../api/getEventData";

// GA4 HELPER (optional)
const sendGAEvent = (eventName, params = {}) => {
  if (window && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export default function DataExtractView() {
  const { filters } = useContext(GlobalContext);

  // local states
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // optional: date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 1. Fetch events once
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const data = await getEventData("eventDataQuery");
        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching events for DataExtract:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // 2. Apply advanced filters (mirroring MonthView) + date range
  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) {
      setFilteredEvents([]);
      return;
    }

    const advancedFilterCheck = (event) => {
      try {
        // Safely default each array to [] if missing
        const {
          regions = [],
          subRegions = [],
          countries = [],
          gep = [],
          programName = [],
          activityType = [],
          accountSectors = [],
          accountSegments = [],
          buyerSegmentRollup = [],
          productFamily = [],
          industry = [],
          partnerEvent = [],
          draftStatus = [],
          newlyCreated = [],
          partyType = [],
          organisedBy = [],
        } = filters;

        const anyFilterChecked =
          [
            ...regions,
            ...subRegions,
            ...countries,
            ...gep,
            ...programName,
            ...activityType,
            ...accountSectors,
            ...accountSegments,
            ...buyerSegmentRollup,
            ...productFamily,
            ...industry,
            ...partnerEvent,
            ...draftStatus,
            ...newlyCreated,
            ...partyType,
          ].some((f) => f.checked) || organisedBy.length > 0;

        if (!anyFilterChecked) {
          return true; // pass everything if no filters are active
        }

        // Then replicate the same checks from MonthView
        // e.g. region, subRegion, etc.

        const regionMatch =
          !regions.some((r) => r.checked) ||
          regions.some((r) => r.checked && event.region?.includes(r.label));

        const subRegionMatch =
          !subRegions.some((s) => s.checked) ||
          subRegions.some((s) => s.checked && event.subRegion?.includes(s.label));

        const countryMatch =
          !countries.some((c) => c.checked) ||
          countries.some((c) => c.checked && event.country?.includes(c.label));

        const gepMatch =
          !gep.some((g) => g.checked) ||
          gep.some((g) => g.checked && event.gep?.includes(g.label));

        const programMatch =
          !programName.some((p) => p.checked) ||
          programName.some(
            (p) =>
              p.checked &&
              event.programName?.some((evName) =>
                evName.toLowerCase().includes(p.label.toLowerCase())
              )
          );

        const activityMatch =
          !activityType.some((a) => a.checked) ||
          activityType.some(
            (a) =>
              a.checked &&
              event.eventType?.toLowerCase() === a.label.toLowerCase()
          );

        const accountSectorMatch =
          !accountSectors.some((s) => s.checked) ||
          accountSectors.some((s) => {
            if (!s.checked) return false;
            const map = { "Public Sector": "public", Commercial: "commercial" };
            const key = map[s.label] || null;
            return key ? event.accountSectors?.[key] === true : false;
          });

        const accountSegmentMatch =
          !accountSegments.some((seg) => seg.checked) ||
          accountSegments.some((seg) => {
            if (!seg.checked) return false;
            const eSeg = event.accountSegments?.[seg.label];
            return eSeg?.selected && parseFloat(eSeg.percentage) > 0;
          });

        const buyerSegmentRollupMatch =
          !buyerSegmentRollup.some((b) => b.checked) ||
          buyerSegmentRollup.some(
            (b) => b.checked && event.audienceSeniority?.includes(b.label)
          );

        const productFamilyMatch =
          !productFamily.some((pf) => pf.checked) ||
          productFamily.some((pf) => {
            if (!pf.checked) return false;
            const alignment = event.productAlignment?.[pf.label];
            return alignment?.selected && parseFloat(alignment.percentage) > 0;
          });

        const industryMatch =
          !industry.some((ind) => ind.checked) ||
          industry.some((ind) => ind.checked && event.industry?.includes(ind.label));

        const partnerCheckVals = partnerEvent
          .filter((pt) => pt.checked)
          .map((pt) => pt.value);
        const partnerMatch =
          partnerCheckVals.length === 0 ||
          partnerCheckVals.includes(event.isPartneredEvent);

        const draftCheckVals = draftStatus
          .filter((ds) => ds.checked)
          .map((ds) => ds.value);
        const draftMatch =
          draftCheckVals.length === 0 ||
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
            return statuses.some((st) => draftCheckVals.includes(st));
          })();

        const newlyCreatedFilters = newlyCreated.filter((nc) => nc.checked);
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

        const organiserFilterActive = organisedBy.length > 0;
        const organisedByMatch =
          !organiserFilterActive ||
          organisedBy.some((org) => event.organisedBy?.includes(org));

        const partyTypeChecked = partyType
          .filter((p) => p.checked)
          .map((p) => p.label);
        const partyTypeMatch =
          partyTypeChecked.length === 0 ||
          partyTypeChecked.includes(event.partyType);

        return (
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
          organisedByMatch &&
          partyTypeMatch
        );
      } catch (err) {
        console.error("Error applying advanced filters on event:", event, err);
        return false;
      }
    };

    // 1) advanced checks
    let result = events.filter((evt) => advancedFilterCheck(evt));

    // 2) date range
    result = result.filter((evt) => {
      const evtStart = dayjs(evt.startDate);
      const evtEnd = dayjs(evt.endDate);

      // If user set a start date, exclude events that end before that
      if (startDate && evtEnd.isBefore(dayjs(startDate).startOf("day"))) {
        return false;
      }
      // If user set an end date, exclude events that start after that
      if (endDate && evtStart.isAfter(dayjs(endDate).endOf("day"))) {
        return false;
      }
      return true;
    });

    // 3) sort by startDate ascending
    result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    setFilteredEvents(result);
  }, [events, filters, startDate, endDate]);

  // -----------------------
  // CSV export
  // -----------------------
  const handleExportCSV = useCallback(() => {
    sendGAEvent("export_csv_click", {
      event_category: "DataExtract",
      count: filteredEvents.length,
    });

    if (!filteredEvents.length) {
      alert("No events to export!");
      return;
    }

    // Full set of columns in CSV:
    const exportData = filteredEvents.map((evt) => ({
      tacticId: evt.tacticId || "",
      title: evt.title || "",
      description: evt.description || "",
      organisedBy: (evt.organisedBy || []).join(", "),
      startDate: evt.startDate || "",
      endDate: evt.endDate || "",
      eventType: evt.eventType || "",
      region: (evt.region || []).join(", "),
      subRegion: (evt.subRegion || []).join(", "),
      country: (evt.country || []).join(", "),
      isEventSeries: evt.isEventSeries ? "Yes" : "No",
      audienceSeniority: (evt.audienceSeniority || []).join(", "),
      accountSectors: accountSectorsToString(evt.accountSectors),
      accountSegments: accountSegmentsToString(evt.accountSegments),
      landingPageLinks: (evt.landingPageLinks || []).join(", "),
      salesKitLinks: (evt.salesKitLinks || []).join(", "),
      isPublished: evt.isPublished ? "Yes" : "No",
      isPartneredEvent: evt.isPartneredEvent ? "Yes" : "No",
      productFamily: productFamilyToString(evt.productAlignment),
      aiVsCore: evt.aiVsCore || "",
      industry: (evt.industry || []).join(", "),
      city: (evt.city || []).join(", "),
    }));

    const csvString = Papa.unparse(exportData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", "filtered_events.csv");
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
  }, [filteredEvents]);

  // Helpers
  const accountSectorsToString = (acct) => {
    if (!acct) return "";
    const sectors = [];
    if (acct.commercial) sectors.push("Commercial");
    if (acct.public) sectors.push("Public Sector");
    return sectors.join(", ");
  };

  const accountSegmentsToString = (acctSegs) => {
    if (!acctSegs) return "";
    const selectedNames = [];
    for (const segName in acctSegs) {
      if (acctSegs[segName]?.selected) {
        selectedNames.push(segName);
      }
    }
    return selectedNames.join(", ");
  };

  const productFamilyToString = (alignment) => {
    if (!alignment) return "";
    const selectedFamilies = [];
    for (const fam in alignment) {
      if (alignment[fam].selected) {
        selectedFamilies.push(fam);
      }
    }
    return selectedFamilies.join(", ");
  };

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <Paper sx={{ margin: 2, padding: 2, flexGrow: 1, overflow: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Data Extract View
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* A) Date Range Inputs */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => {
                sendGAEvent("date_range_change", {
                  event_category: "DataExtract",
                  field: "start_date",
                  new_value: e.target.value,
                });
                setStartDate(e.target.value);
              }}
              sx={{ width: 200 }}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => {
                sendGAEvent("date_range_change", {
                  event_category: "DataExtract",
                  field: "end_date",
                  new_value: e.target.value,
                });
                setEndDate(e.target.value);
              }}
              sx={{ width: 200 }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                sendGAEvent("clear_dates_click", {
                  event_category: "DataExtract",
                });
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear Dates
            </Button>
          </Box>

          {/* B) CSV Export */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Found <strong>{filteredEvents.length}</strong> events matching filters.
            </Typography>
            <Button variant="contained" onClick={handleExportCSV} sx={{ mt: 1 }}>
              Export as CSV
            </Button>
          </Box>

          {/* 
            C) TABLE PREVIEW 
            Now, we only display these columns in the UI:
            Tactic ID, Title, Description, Organised By,
            Start Date, End Date, Event Type,
            Region, Subregion, Country, Is Published?
          */}
          <Box
            sx={{
              maxHeight: 400,
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: 1,
              padding: 1,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #aaa" }}>
                  <th style={{ textAlign: "left", padding: "4px" }}>Tactic ID</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Title</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Description</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Organised By</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Start Date</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>End Date</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Event Type</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Region</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Subregion</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Country</th>
                  <th style={{ textAlign: "left", padding: "4px" }}>Is Published?</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => (
                  <tr key={evt.eventId} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "4px" }}>{evt.tacticId || ""}</td>
                    <td style={{ padding: "4px" }}>{evt.title || ""}</td>
                    <td style={{ padding: "4px" }}>{evt.description || ""}</td>
                    <td style={{ padding: "4px" }}>
                      {(evt.organisedBy || []).join(", ")}
                    </td>
                    <td style={{ padding: "4px" }}>
                      {evt.startDate
                        ? dayjs(evt.startDate).format("YYYY-MM-DD HH:mm")
                        : ""}
                    </td>
                    <td style={{ padding: "4px" }}>
                      {evt.endDate
                        ? dayjs(evt.endDate).format("YYYY-MM-DD HH:mm")
                        : ""}
                    </td>
                    <td style={{ padding: "4px" }}>{evt.eventType || ""}</td>
                    <td style={{ padding: "4px" }}>
                      {(evt.region || []).join(", ")}
                    </td>
                    <td style={{ padding: "4px" }}>
                      {(evt.subRegion || []).join(", ")}
                    </td>
                    <td style={{ padding: "4px" }}>
                      {(evt.country || []).join(", ")}
                    </td>
                    <td style={{ padding: "4px" }}>
                      {evt.isPublished ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </>
      )}
    </Paper>
  );
}
