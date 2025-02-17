import React, { useEffect, useState, useContext, useCallback } from "react";
import dayjs from "dayjs";
import Papa from "papaparse";
import {
  Paper,
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
} from "@mui/material";

/** 
 * Import your custom components / context
 * Adjust paths to match your folder structure.
 */
import GlobalContext from "../../context/GlobalContext";
import Sidebar from "../Sidebar";              // the same sidebar as in ListView/MonthView
import CalendarHeader from "../commons/CalendarHeader"; // your existing CalendarHeader
import { getEventData } from "../../api/getEventData";

/**
 * Applies all advanced filters from GlobalContext to an event,
 * matching the logic from your ListView or MonthView.
 */
function passesAdvancedFilters(event, filters) {
  try {
    // Check if any filter is active at all
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

    // If no filter is active, everything passes
    if (!anyFilterChecked) {
      return true;
    }

    // Start advanced checks, mirroring your existing logic:
    const regionMatch =
      !filters.regions.some((r) => r.checked) ||
      filters.regions.some((r) => r.checked && event.region?.includes(r.label));

    const subRegionMatch =
      !filters.subRegions.some((s) => s.checked) ||
      filters.subRegions.some((s) => s.checked && event.subRegion?.includes(s.label));

    const countryMatch =
      !filters.countries.some((c) => c.checked) ||
      filters.countries.some((c) => c.checked && event.country?.includes(c.label));

    const gepMatch =
      !filters.gep.some((g) => g.checked) ||
      filters.gep.some((g) => g.checked && event.gep?.includes(g.label));

    const programMatch =
      !filters.programName.some((p) => p.checked) ||
      filters.programName.some(
        (p) =>
          p.checked &&
          event.programName?.some((ev) =>
            ev.toLowerCase().includes(p.label.toLowerCase())
          )
      );

    const activityMatch =
      !filters.activityType.some((a) => a.checked) ||
      filters.activityType.some(
        (a) => a.checked && event.eventType?.toLowerCase() === a.label.toLowerCase()
      );

    // Account Sectors
    const accountSectorMatch =
      !filters.accountSectors.some((as) => as.checked) ||
      filters.accountSectors.some((as) => {
        if (!as.checked) return false;
        const map = { "Public Sector": "public", Commercial: "commercial" };
        const key = map[as.label] || null;
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
    const buyerRollupMatch =
      !filters.buyerSegmentRollup.some((b) => b.checked) ||
      filters.buyerSegmentRollup.some(
        (b) => b.checked && event.audienceSeniority?.includes(b.label)
      );

    // Product Family
    const productFamilyMatch =
      !filters.productFamily.some((pf) => pf.checked) ||
      filters.productFamily.some((pf) => {
        if (!pf.checked) return false;
        const align = event.productAlignment?.[pf.label];
        return align?.selected && parseFloat(align.percentage) > 0;
      });

    // Industry
    const industryMatch =
      !filters.industry.some((ind) => ind.checked) ||
      filters.industry.some(
        (ind) => ind.checked && event.industry?.includes(ind.label)
      );

    // Partner Event
    const partnerCheckVals = filters.partnerEvent
      .filter((pt) => pt.checked)
      .map((pt) => pt.value);
    const partnerMatch =
      partnerCheckVals.length === 0 || partnerCheckVals.includes(event.isPartneredEvent);

    // Draft Status
    const draftCheckVals = filters.draftStatus
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

    // Newly Created
    const newlyCreatedFilters = filters.newlyCreated.filter((nc) => nc.checked);
    const newlyCreatedMatch =
      newlyCreatedFilters.length === 0 ||
      newlyCreatedFilters.some((nc) => {
        const created = event.entryCreatedDate?.value
          ? dayjs(event.entryCreatedDate.value)
          : null;
        if (!created || !created.isValid()) return nc.value === false;
        const within14Days = dayjs().diff(created, "day") <= 14;
        return nc.value === within14Days;
      });

    // Organised By
    const organiserFilterActive = filters.organisedBy && filters.organisedBy.length > 0;
    const organisedByMatch =
      !organiserFilterActive ||
      filters.organisedBy.some((org) => event.organisedBy?.includes(org));

    // Final pass/fail
    return (
      regionMatch &&
      subRegionMatch &&
      countryMatch &&
      gepMatch &&
      programMatch &&
      activityMatch &&
      accountSectorMatch &&
      accountSegmentMatch &&
      buyerRollupMatch &&
      productFamilyMatch &&
      industryMatch &&
      partnerMatch &&
      draftMatch &&
      newlyCreatedMatch &&
      organisedByMatch
    );
  } catch (error) {
    console.error("Error applying filters to event:", event, error);
    return false;
  }
}

/**
 * DataExtractView
 * A specialized view that:
 *  - Uses the same layout as MonthView/ListView (Sidebar + Header).
 *  - Applies advanced filters from GlobalContext.
 *  - Lets you pick a date range (start/end).
 *  - Exports the final filtered data to CSV with Papa Parse.
 */
export default function DataExtractView() {
  // Grab filters & sidebar state from global context
  const { filters, sidebarOpen } = useContext(GlobalContext);

  // Local states for events, loading, date range
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /**
   * Fetch raw event data once on mount
   */
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const data = await getEventData("eventDataQuery");
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching events for DataExtract:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  /**
   * Re-apply advanced filters + date range whenever
   * `events`, `filters`, `startDate`, or `endDate` change
   */
  useEffect(() => {
    if (!Array.isArray(events) || !events.length) {
      setFilteredEvents([]);
      return;
    }

    const newFiltered = events.filter((event) => {
      // 1) Advanced filters from GlobalContext
      if (!passesAdvancedFilters(event, filters)) {
        return false;
      }

      // 2) Date range filter
      const evtStart = dayjs(event.startDate);
      const evtEnd = dayjs(event.endDate);

      // If user set a startDate, exclude events that end before that
      if (startDate && evtEnd.isBefore(dayjs(startDate).startOf("day"))) {
        return false;
      }

      // If user set an endDate, exclude events that start after that
      if (endDate && evtStart.isAfter(dayjs(endDate).endOf("day"))) {
        return false;
      }

      // Otherwise passes
      return true;
    });

    // Sort final by startDate ascending
    newFiltered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    setFilteredEvents(newFiltered);
  }, [events, filters, startDate, endDate]);

  /**
   * CSV Export of the final filtered events
   */
  const handleExportCSV = useCallback(() => {
    if (!filteredEvents.length) {
      alert("No events to export!");
      return;
    }

    const csvString = Papa.unparse(filteredEvents);
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

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Conditionally render the Sidebar if it's open (mimic your MonthView/ListView layout) */}
      {sidebarOpen && <Sidebar />}

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Calendar Header on top (like ListView) */}
        <CalendarHeader />

        {/* Main content area */}
        <Paper sx={{ margin: 2, padding: 2, flexGrow: 1, overflow: "auto" }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Data Extract
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
              {/* A) Date Range Filters */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  sx={{ width: 200 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  sx={{ width: 200 }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Clear Dates
                </Button>
              </Box>

              {/* B) CSV Export Button + Count Info */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Found <strong>{filteredEvents.length}</strong> events matching filters/date.
                </Typography>
                <Button variant="contained" onClick={handleExportCSV} sx={{ mt: 1 }}>
                  Export as CSV
                </Button>
              </Box>

              {/* C) Table Preview of Filtered Events */}
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
                      <th style={{ textAlign: "left", padding: "4px" }}>Title</th>
                      <th style={{ textAlign: "left", padding: "4px" }}>Start</th>
                      <th style={{ textAlign: "left", padding: "4px" }}>End</th>
                      <th style={{ textAlign: "left", padding: "4px" }}>Region</th>
                      <th style={{ textAlign: "left", padding: "4px" }}>Draft?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((evt) => (
                      <tr key={evt.eventId} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "4px" }}>{evt.title}</td>
                        <td style={{ padding: "4px" }}>
                          {dayjs(evt.startDate).format("YYYY-MM-DD HH:mm")}
                        </td>
                        <td style={{ padding: "4px" }}>
                          {dayjs(evt.endDate).format("YYYY-MM-DD HH:mm")}
                        </td>
                        <td style={{ padding: "4px" }}>
                          {(evt.region || []).join(", ")}
                        </td>
                        <td style={{ padding: "4px" }}>
                          {evt.isDraft ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
