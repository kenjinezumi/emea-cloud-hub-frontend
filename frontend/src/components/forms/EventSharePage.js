import React, { useEffect, useState } from "react";
import { Typography, Grid, Chip, Divider, Paper, Link } from "@mui/material";
import CalendarHeaderEventShare from "../commons/CalendarHeaderEventShare";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LinkIcon from "@mui/icons-material/Link";
import PeopleIcon from "@mui/icons-material/People";
import InfoIcon from "@mui/icons-material/Info";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { blue } from "@mui/material/colors";
import { getEventData } from "../../api/getEventData";
import { useParams } from "react-router-dom";

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

  useEffect(() => {
    if (eventDetails) {
    }
  }, [eventDetails]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Display event details with improved structure
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
                <Typography variant="subtitle1">Title:</Typography>
                <Typography variant="body1" gutterBottom>
                  {eventDetails.title} {eventDetails.emoji}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Description:</Typography>
                <Typography variant="body1" gutterBottom>
                  {eventDetails.description}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Organised By:</Typography>
                {eventDetails.organisedBy &&
                  eventDetails.organisedBy.map((organiser, index) => (
                    <Chip
                      key={index}
                      label={cleanOrganiserName(organiser)}
                      component="a"
                      href={`https://moma.corp.google.com/person/${encodeURIComponent(
                        cleanOrganiserName(organiser)
                      )}`}
                      clickable
                      style={{ margin: 2 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ))}
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
                <Typography variant="subtitle1">Regions:</Typography>
                {eventDetails.region.map((region, index) => (
                  <Chip key={index} label={region} style={{ margin: 2 }} />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Sub Regions:</Typography>
                {eventDetails.subRegion.map((subRegion, index) => (
                  <Chip key={index} label={subRegion} style={{ margin: 2 }} />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Countries:</Typography>
                {eventDetails.country.map((country, index) => (
                  <Chip key={index} label={country} style={{ margin: 2 }} />
                ))}
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
                {eventDetails.audiencePersona.map((persona, index) => (
                  <Chip key={index} label={persona} style={{ margin: 2 }} />
                ))}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom component="div">
                  <InfoIcon
                    style={{
                      verticalAlign: "middle",
                      color: blue[500],
                      marginRight: 8,
                    }}
                    id="extra-details-section"
                  />
                  Extra details
                </Typography>
                <hr />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Email Language:</Typography>
                <Typography variant="body1" gutterBottom>
                  {eventDetails.emailLanguage}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Email Text:</Typography>
                <Typography variant="body1" gutterBottom>
                  {eventDetails.emailText}
                </Typography>
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
