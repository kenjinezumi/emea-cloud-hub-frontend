import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Chip,
  Divider,
  Paper,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Input,
  TextField,
} from "@mui/material";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import DomainIcon from "@mui/icons-material/Domain";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CategoryIcon from "@mui/icons-material/Category";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import MemoryIcon from "@mui/icons-material/Memory";
import EmailIcon from "@mui/icons-material/Email";

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
    if (eventId) {
      getEventData(eventId)
        .then((data) => {
          if (data.length > 0) {
            setEventDetails(data[0]); // Assuming `data[0]` contains the event details
          } else {
            setError("Event not found.");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch event details:", error);
          setError("Failed to load event details.");
          setLoading(false);
        });
    }
  }, [eventId]); // Make sure this useEffect depends on `eventId`

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

              {/* Sub Regions */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <TerrainIcon style={{ color: blue[500], marginRight: 8 }} />
                  Sub Regions:
                </Typography>
                {Array.isArray(eventDetails.subRegion) &&
                eventDetails.subRegion.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "8px",
                      marginLeft: "32px",
                    }}
                  >
                    {eventDetails.subRegion.map((subRegion, index) => (
                      <Chip
                        key={index}
                        label={subRegion}
                        style={{ margin: 2 }}
                      />
                    ))}
                  </div>
                ) : (
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ marginLeft: "32px" }}
                  >
                    N/A
                  </Typography>
                )}
              </Grid>

              {/* Countries */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  <PublicIcon style={{ color: blue[500], marginRight: 8 }} />
                  Countries:
                </Typography>
                {Array.isArray(eventDetails.country) &&
                eventDetails.country.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "8px",
                      marginLeft: "32px",
                    }}
                  >
                    {eventDetails.country.map((country, index) => (
                      <Chip key={index} label={country} style={{ margin: 2 }} />
                    ))}
                  </div>
                ) : (
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ marginLeft: "32px" }}
                  >
                    N/A
                  </Typography>
                )}
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
                  <InfoIcon
                    style={{ color: blue[500], marginRight: 8 }}
                    id="extra-details-section"
                  />
                  Extra details
                </Typography>
                <hr />
              </Grid>

              {/* Approved for Customer Use */}
              {/* <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <CheckCircleIcon
                    style={{ color: blue[500], marginRight: 8 }}
                  />
                  Approved for customer use:
                  <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                    {eventDetails.customerUseApproved ? "Yes" : "No"}
                  </Typography>
                </Typography>
              </Grid> */}

              {/* OKR Selection (Expandable Accordion) */}
              {/* OKR Selection */}
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="okr-panel-content"
                    id="okr-panel-header"
                  >
                    <Typography>
                      <AssignmentIcon
                        style={{ marginRight: 8, color: blue[500] }}
                      />
                      OKR Selection
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Array.isArray(eventDetails.okr) &&
                    eventDetails.okr.filter(Boolean).length > 0 ? (
                      eventDetails.okr.filter(Boolean).map((okr, index) => (
                        <Grid
                          container
                          alignItems="center"
                          key={index}
                          sx={{ marginBottom: "8px" }}
                        >
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
                              sx={{ width: "80%" }}
                            />
                          </Grid>
                        </Grid>
                      ))
                    ) : (
                      <Typography>No OKR selections available</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* GEP Selection */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PublicIcon style={{ color: blue[500], marginRight: 8 }} />
                  Solution
                </Typography>
                {Array.isArray(eventDetails.gep) &&
                eventDetails.gep.filter(Boolean).length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginLeft: "32px",
                      marginTop: "8px",
                    }}
                  >
                    {eventDetails.gep.filter(Boolean).map((gep, index) => (
                      <Chip key={index} label={gep} />
                    ))}
                  </div>
                ) : (
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ marginLeft: "32px" }}
                  >
                    N/A
                  </Typography>
                )}
              </Grid>
              {/* Program */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PublicIcon style={{ color: blue[500], marginRight: 8 }} />
                  Program
                </Typography>
                {eventDetails.programName &&
                eventDetails.programName.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginLeft: "32px",
                      marginTop: "8px",
                    }}
                  >
                    {eventDetails.programName.map((program, index) => (
                      <Chip key={index} label={program} />
                    ))}
                  </div>
                ) : (
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ marginLeft: "32px" }}
                  >
                    N/A
                  </Typography>
                )}
              </Grid>

              {/* Partner Involvement */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <BusinessCenterIcon
                    style={{ color: blue[500], marginRight: 8 }}
                  />
                  Are partners involved?
                  <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                    {eventDetails.partnerInvolvement
                      ? `Yes (${eventDetails.partnerRole})`
                      : "No"}
                  </Typography>
                </Typography>
              </Grid>
              {/* Email Invitation Section */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom component="div">
                  <EmailIcon
                    style={{
                      verticalAlign: "middle",
                      color: blue[500],
                      marginRight: 8,
                    }}
                    id="email-invitation-section"
                  />
                  Email Invitation
                </Typography>
                <hr />
              </Grid>

              {/* Email Invitation Accordion */}
              {/* <Grid item xs={12}>
                {eventDetails.languagesAndTemplates?.map(
                  (templateData, index) => (
                    <Accordion key={index}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel-${index}-content`}
                        id={`panel-${index}-header`}
                      >
                        <Typography variant="subtitle1">
                          Language: {templateData.language}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* Platform */}
              {/* <Grid item xs={12} sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#757575", mb: 1 }}
                          >
                            Platform:
                          </Typography>
                          <TextField
                            fullWidth
                            value={templateData.platform}
                            variant="outlined"
                            disabled
                            InputProps={{
                              style: { backgroundColor: "#e0e0e0" },
                            }}
                          />
                        </Grid> */}

              {/* Subject Line */}
              {/* <Grid item xs={12} sx={{ mb: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#757575", mb: 1 }}
                          >
                            Subject Line:
                          </Typography>
                          <TextField
                            fullWidth
                            value={templateData.subjectLine}
                            variant="outlined"
                            disabled
                            InputProps={{
                              style: { backgroundColor: "#e0e0e0" },
                            }}
                          />
                        </Grid> */}

              {/* Template Body */}
              {/* <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#757575", mb: 1 }}
                          >
                            Template Body:
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={templateData.template}
                            variant="outlined"
                            disabled
                            InputProps={{
                              style: { backgroundColor: "#e0e0e0" },
                            }}
                          />
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ) */}
              {/* )}  */}
              {/* </Grid> */}
              {/* Audience Section */}
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

              {/* Buyer Segment Rollup */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <AssignmentIcon
                    style={{ color: blue[500], marginRight: 8 }}
                  />
                  Buyer Segment Rollup:
                </Typography>
                {Array.isArray(eventDetails.audienceSeniority) &&
                eventDetails.audienceSeniority.filter(Boolean).length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginLeft: "32px",
                      marginTop: "8px",
                    }}
                  >
                    {eventDetails.audienceSeniority
                      .filter(Boolean)
                      .map((seniority, index) => (
                        <Chip key={index} label={seniority} />
                      ))}
                  </div>
                ) : (
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ marginLeft: "32px" }}
                  >
                    N/A
                  </Typography>
                )}
              </Grid>

              {/* Audience Persona */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <PersonIcon style={{ color: blue[500], marginRight: 8 }} />
                  Buyer Segment:
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginLeft: "32px",
                    marginTop: "8px",
                  }}
                >
                  {eventDetails.audiencePersona?.map((persona, index) => (
                    <Chip key={index} label={persona} />
                  ))}
                </div>
              </Grid>

              {/* Industry */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <BusinessIcon style={{ color: blue[500], marginRight: 8 }} />
                  Industry:
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginLeft: "32px",
                    marginTop: "8px",
                  }}
                >
                  {eventDetails.industry?.map((industry, index) => (
                    <Chip key={index} label={industry} />
                  ))}
                </div>
              </Grid>

              {/* Account Sectors */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <DomainIcon style={{ color: blue[500], marginRight: 8 }} />
                  Account Sectors:
                </Typography>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginLeft: "32px",
                    marginTop: "8px",
                  }}
                >
                  {eventDetails.accountSectors?.commercial && (
                    <Chip label="Commercial" />
                  )}
                  {eventDetails.accountSectors?.public && (
                    <Chip label="Public" />
                  )}
                </div>
              </Grid>
              {/* Account Segments */}
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="account-segments-content"
                    id="account-segments-header"
                  >
                    <Typography>
                      <AccountBalanceIcon
                        style={{ marginRight: 8, color: blue[500] }}
                      />
                      Account Segments
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(eventDetails.accountSegments || {}).map(
                      ([segment, details], index) => (
                        <Grid
                          container
                          alignItems="center"
                          key={index}
                          sx={{ marginBottom: "8px" }}
                        >
                          <Grid item xs={7}>
                            <Typography variant="body2">{segment}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Input
                              type="number"
                              value={details.percentage}
                              endAdornment="%"
                              disabled
                              sx={{ width: "80%" }}
                            />
                          </Grid>
                        </Grid>
                      )
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Account Category */}
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="account-category-content"
                    id="account-category-header"
                  >
                    <Typography>
                      <CategoryIcon
                        style={{ marginRight: 8, color: blue[500] }}
                      />
                      Account Category
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(eventDetails.accountCategory || {}).map(
                      ([category, details], index) => (
                        <Grid
                          container
                          alignItems="center"
                          key={index}
                          sx={{ marginBottom: "8px" }}
                        >
                          <Grid item xs={7}>
                            <Typography variant="body2">{category}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Input
                              type="number"
                              value={details.percentage}
                              endAdornment="%"
                              disabled
                              sx={{ width: "80%" }}
                            />
                          </Grid>
                        </Grid>
                      )
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Account Type */}
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="account-type-content"
                    id="account-type-header"
                  >
                    <Typography>
                      <BusinessCenterIcon
                        style={{ marginRight: 8, color: blue[500] }}
                      />
                      Greenfield Status
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(eventDetails.accountType || {}).map(
                      ([type, details], index) => (
                        <Grid
                          container
                          alignItems="center"
                          key={index}
                          sx={{ marginBottom: "8px" }}
                        >
                          <Grid item xs={7}>
                            <Typography variant="body2">{type}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Input
                              type="number"
                              value={details.percentage}
                              endAdornment="%"
                              disabled
                              sx={{ width: "80%" }}
                            />
                          </Grid>
                        </Grid>
                      )
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Product Alignment */}
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="product-alignment-content"
                    id="product-alignment-header"
                  >
                    <Typography>
                      <SettingsIcon
                        style={{ marginRight: 8, color: blue[500] }}
                      />
                      Product Family
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(eventDetails.productAlignment || {}).map(
                      ([product, details], index) => (
                        <Grid
                          container
                          alignItems="center"
                          key={index}
                          sx={{ marginBottom: "8px" }}
                        >
                          <Grid item xs={7}>
                            <Typography variant="body2">{product}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Input
                              type="number"
                              value={details.percentage}
                              endAdornment="%"
                              disabled
                              sx={{ width: "80%" }}
                            />
                          </Grid>
                        </Grid>
                      )
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
              {/* AI vs Core and Max Event Capacity */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <MemoryIcon style={{ color: blue[500], marginRight: 8 }} />
                  AI vs Core:{" "}
                  <span style={{ marginLeft: "8px" }}>
                    {eventDetails.aiVsCore}
                  </span>
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <PeopleOutlineIcon
                    style={{ color: blue[500], marginRight: 8 }}
                  />
                  Max Event Capacity:{" "}
                  <span style={{ marginLeft: "8px" }}>
                    {eventDetails.maxEventCapacity}
                  </span>
                </Typography>
              </Grid>

              {/* Links Section */}
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

              {/* Landing Page Links */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <LinkIcon style={{ color: blue[500], marginRight: 8 }} />
                  Landing Page Links:
                </Typography>
                {eventDetails.landingPageLinks?.map((link, index) => (
                  <Typography key={index} variant="body1" sx={{ ml: 4 }}>
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </Link>
                  </Typography>
                ))}
              </Grid>

              {/* Sales Kit Links */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <LinkIcon style={{ color: blue[500], marginRight: 8 }} />
                  Sales Kit Links:
                </Typography>
                {eventDetails.salesKitLinks?.map((link, index) => (
                  <Typography key={index} variant="body1" sx={{ ml: 4 }}>
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </Link>
                  </Typography>
                ))}
              </Grid>

              {/* Hailo Links */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <LinkIcon style={{ color: blue[500], marginRight: 8 }} />
                  Hailo Links:
                </Typography>
                {eventDetails.hailoLinks?.map((link, index) => (
                  <Typography key={index} variant="body1" sx={{ ml: 4 }}>
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </Link>
                  </Typography>
                ))}
              </Grid>

              {/* Other Documents Links */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <LinkIcon style={{ color: blue[500], marginRight: 8 }} />
                  Other Documents Links:
                </Typography>
                {eventDetails.otherDocumentsLinks?.map((link, index) => (
                  <Typography key={index} variant="body1" sx={{ ml: 4 }}>
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </Link>
                  </Typography>
                ))}
              </Grid>
            </Grid>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default ShareEventPage;
