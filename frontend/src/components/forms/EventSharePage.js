import React, { useEffect, useState } from "react";
import { Typography, Grid, Chip, Divider, Paper, Link, Accordion, AccordionSummary, AccordionDetails, Checkbox, Input } from "@mui/material";
import CalendarHeaderEventShare from "../commons/CalendarHeaderEventShare";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LinkIcon from "@mui/icons-material/Link";
import PeopleIcon from "@mui/icons-material/People";
import InfoIcon from "@mui/icons-material/Info";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TerrainIcon from "@mui/icons-material/Terrain";
import MapIcon from "@mui/icons-material/Map";
import PublicIcon from "@mui/icons-material/Public";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import HouseIcon from "@mui/icons-material/House";
import { blue } from "@mui/material/colors";
import { getEventData } from "../../api/getEventData";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // For customer use approval
import AssignmentIcon from "@mui/icons-material/Assignment"; // For OKR
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter"; // For Partner involvement
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; 

function ShareEventPage() {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cleanOrganiserName = (name) => {
    let cleanedName = name.replace(/[()]/g, "").trim();
    const uniqueParts = new Set(cleanedName.split(/\s+/));
    return Array.from(uniqueParts).join(" ");
  };

  useEffect(() => {
    getEventData(eventId)
      .then((data) => {
        setEventDetails(data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch event details:", error);
        setError("Failed to load event details.");
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="h-screen flex flex-col">
      <CalendarHeaderEventShare />

      <div className="form-container">
        <div className="event-form">
          <Paper
            style={{
              padding: 20,
              margin: "20px",
              overflow: "auto",
              border: "none",
              boxShadow: "0px 0px 0px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header Section */}
            <div style={{ marginBottom: "20px" }}>
              {/* First Line: Emoji and Title with Draft Status */}
              <Typography
                variant="h4"
                component="div"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px", // Adds space between elements
                  fontWeight: "bold",
                }}
              >
                {eventDetails.emoji} {/* Emoji */}
                <span>{eventDetails.title}</span> {/* Title */}
                {eventDetails.isDraft && (
                  <Typography
                    variant="body2"
                    sx={{ fontStyle: "italic", color: "#757575" }}
                  >
                    Draft
                  </Typography>
                )}
              </Typography>

              {/* Second Line: Start Date - End Date */}
              <Typography variant="body2" sx={{ mt: 1, color: "#757575" }}>
                {`${new Date(
                  eventDetails.startDate
                ).toLocaleDateString()} ${new Date(
                  eventDetails.startDate
                ).toLocaleTimeString()} - 
    ${new Date(eventDetails.endDate).toLocaleDateString()} ${new Date(
                  eventDetails.endDate
                ).toLocaleTimeString()}`}
              </Typography>

              {/* Third Line: Region, Subregion, Countries, City, Venue */}
              <Typography variant="body2" sx={{ mt: 1, color: "#757575" }}>
                {[
                  eventDetails.region,
                  eventDetails.subRegion?.join(", "),
                  eventDetails.country?.join(", "),
                  eventDetails.city,
                  eventDetails.locationVenue,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>

              {/* Fourth Line: Chips for Activity Type, Newly Published, and High Priority */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <Chip
                  label={eventDetails.eventType}
                  color="primary"
                  size="small"
                />

                {dayjs().diff(dayjs(eventDetails.publishedDate), "day", true) <=
                  7 && (
                  <Chip
                    label="Newly Published"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}

                {eventDetails.isHighPriority && (
                  <Chip
                    label={
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <WhatshotIcon style={{ marginRight: "4px" }} />
                        High Priority
                      </span>
                    }
                    color="error"
                    size="small"
                  />
                )}
              </div>
            </div>

            <Grid
              container
              spacing={3}
              className="form-grid"
              style={{ border: "none" }}
            >
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom component="div">
                  <CalendarMonthIcon
                    style={{
                      verticalAlign: "middle",
                      color: blue[500],
                      marginRight: 8,
                    }}
                    id="about-section"
                  />
                  About
                </Typography>
                <hr />
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PeopleIcon style={{ color: blue[500], marginRight: 8 }} />
                  Organised by:
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                    marginLeft: "32px",
                  }}
                >
                  {eventDetails.organisedBy?.map((organiser, index) => (
                    <Chip
                      key={index}
                      label={cleanOrganiserName(organiser)}
                      component="a"
                      href={`https://moma.corp.google.com/person/${encodeURIComponent(
                        cleanOrganiserName(organiser)
                      )}`}
                      clickable
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ))}
                </div>
              </Grid>

              {/* Event Series (Inline) */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <InfoIcon style={{ color: blue[500], marginRight: 8 }} />
                  Is the event part of a series?
                  <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                    {eventDetails.isEventSeries ? "Yes" : "No"}
                  </Typography>
                </Typography>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <InfoIcon style={{ color: blue[500], marginRight: 8 }} />
                  Description:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ marginLeft: "32px", marginTop: "8px" }}
                >
                  {eventDetails.description}
                </Typography>
              </Grid>

              {/* Speakers (Inline Chips on Two Lines) */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PeopleIcon style={{ color: blue[500], marginRight: 8 }} />
                  Speakers:
                </Typography>
                {/* Separate line for the chips */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                    marginLeft: "32px",
                  }}
                >
                  {eventDetails.speakers?.map((speaker, index) => (
                    <Chip
                      key={index}
                      label={speaker}
                      component="a"
                      href={`https://moma.corp.google.com/person/${encodeURIComponent(
                        cleanOrganiserName(speaker)
                      )}`}
                      clickable
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ))}
                </div>
              </Grid>
              {/* Marketing Program Instance ID */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <InfoIcon style={{ color: blue[500], marginRight: 8 }} />
                  Marketing Program Instance ID:
                  <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                    {eventDetails.marketingProgramInstanceId || "Not provided"}
                  </Typography>
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom component="div">
                  <LocationOnIcon
                    style={{
                      verticalAlign: "middle",
                      color: blue[500],
                      marginRight: 8,
                    }}
                    id="location-section"
                  />
                  Location
                </Typography>
                <hr />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" style={{ marginBottom: 4 }}>
                  {" "}
                  <MapIcon style={{ color: blue[500], marginRight: 8 }} />
                  Region:
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                    marginLeft: "32px",
                  }}
                >
                  {typeof eventDetails.region === "string" ? (
                    <Chip label={eventDetails.region} style={{ margin: 2 }} />
                  ) : eventDetails.region ? (
                    <Chip
                      label={String(eventDetails.region)}
                      style={{ margin: 2 }}
                    />
                  ) : (
                    <Typography variant="body1" gutterBottom>
                      N/A
                    </Typography>
                  )}
                </div>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {" "}
                  <TerrainIcon style={{ color: blue[500], marginRight: 8 }} />
                  Sub Regions:
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                    marginLeft: "32px",
                  }}
                >
                  {Array.isArray(eventDetails.subRegion) ? (
                    eventDetails.subRegion.map((subRegion, index) => (
                      <Chip
                        key={index}
                        label={subRegion}
                        style={{ margin: 2 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body1" gutterBottom>
                      N/A
                    </Typography>
                  )}{" "}
                </div>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {" "}
                  <PublicIcon style={{ color: blue[500], marginRight: 8 }} />
                  Countries:
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                    marginLeft: "32px",
                  }}
                >
                  {Array.isArray(eventDetails.country) ? (
                    eventDetails.country.map((country, index) => (
                      <Chip key={index} label={country} style={{ margin: 2 }} />
                    ))
                  ) : (
                    <Typography variant="body1" gutterBottom>
                      N/A
                    </Typography>
                  )}
                </div>
              </Grid>
              {/* City (Inline) */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <LocationCityIcon
                    style={{ color: blue[500], marginRight: 8 }}
                  />
                  City:
                  <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                    {eventDetails.city || "N/A"}
                  </Typography>
                </Typography>
              </Grid>

              {/* Venue (Inline) */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <HouseIcon style={{ color: blue[500], marginRight: 8 }} />
                  Venue:
                  <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                    {eventDetails.locationVenue || "N/A"}
                  </Typography>
                </Typography>
              </Grid>

              {/* Extra Details */}
<Grid item xs={12}>
  <Typography variant="h5" gutterBottom component="div">
    <InfoIcon style={{ color: blue[500], marginRight: 8 }} />
    Extra details
  </Typography>
  <hr />
</Grid>

{/* Approved for Customer Use */}
<Grid item xs={12}>
  <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
    <CheckCircleIcon style={{ color: blue[500], marginRight: 8 }} />
    Approved for customer use:
    <Typography variant="body1" sx={{ marginLeft: '8px' }}>
      {eventDetails.customerUseApproved ? "Yes" : "No"}
    </Typography>
  </Typography>
</Grid>

{/* OKR Selection (Expandable Accordion) */}
{/* OKR Selection */}
<Grid item xs={12}>
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="okr-panel-content" id="okr-panel-header">
      <Typography>
        <AssignmentIcon style={{ marginRight: 8, color: blue[500] }} />
        OKR Selection
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      {eventDetails.okr?.map((okr, index) => (
        <Grid container alignItems="center" key={index} sx={{ marginBottom: '8px' }}>
          <Grid item xs={1}>
            <Checkbox checked disabled />
          </Grid>
          <Grid item xs={7}>
            <Typography variant="body2">{okr.type}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Input
              type="number"
              value={okr.percentage}
              endAdornment="%"
              disabled
              sx={{ width: '80%' }}
            />
          </Grid>
        </Grid>
      )) || <Typography>No OKR selections available</Typography>}
    </AccordionDetails>
  </Accordion>
</Grid>

{/* GEP Selection */}
<Grid item xs={12}>
  <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
    <PublicIcon style={{ color: blue[500], marginRight: 8 }} />
    GEP:
  </Typography>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: '32px', marginTop: '8px' }}>
    {eventDetails.gep?.map((gep, index) => (
      <Chip
        key={index}
        label={gep}
        
      />
    )) || <Typography>No GEP selections available</Typography>}
  </div>
</Grid>


{/* Partner Involvement */}
<Grid item xs={12}>
  <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
    <BusinessCenterIcon style={{ color: blue[500], marginRight: 8 }} />
    Are partners involved?
    <Typography variant="body1" sx={{ marginLeft: '8px' }}>
      {eventDetails.partnerInvolvement ? `Yes (${eventDetails.partnerRole})` : "No"}
    </Typography>
  </Typography>
</Grid>
             
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom component="div">
                  <PeopleIcon
                    style={{
                      verticalAlign: "middle",
                      color: blue[500],
                      marginRight: 8,
                    }}
                    id="audience-section"
                  />
                  Audience
                </Typography>
                <hr />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Audience Persona:</Typography>
                {Array.isArray(eventDetails.audiencePersona) ? (
                  eventDetails.audiencePersona.map((persona, index) => (
                    <Chip key={index} label={persona} style={{ margin: 2 }} />
                  ))
                ) : (
                  <Typography variant="body1" gutterBottom>
                    N/A
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom component="div">
                  <LinkIcon
                    style={{
                      verticalAlign: "middle",
                      color: blue[500],
                      marginRight: 8,
                    }}
                    id="links-section"
                  />
                  Links
                </Typography>
                <hr />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>
                  Landing Page:{" "}
                  <Link href={eventDetails.landingPageLink} target="_blank">
                    {eventDetails.landingPageLink}
                  </Link>
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Sales Kit:{" "}
                  <Link
                    href={eventDetails.salesKitLink}
                    sx={{ marginBottom: 2 }}
                    target="_blank"
                  >
                    {eventDetails.salesKitLink}
                  </Link>
                  <br />
                </Typography>
                <Typography variant="body1" gutterBottom>
                  HAILO Link:{" "}
                  <Link
                    href={eventDetails.hailoLink}
                    sx={{ marginBottom: 2 }}
                    target="_blank"
                  >
                    {eventDetails.hailoLink}
                  </Link>
                  <br />
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Other Documents:{" "}
                  <Link
                    href={eventDetails.otherDocumentsLink}
                    sx={{ marginBottom: 2 }}
                    target="_blank"
                  >
                    {eventDetails.otherDocumentsLink}
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default ShareEventPage;
