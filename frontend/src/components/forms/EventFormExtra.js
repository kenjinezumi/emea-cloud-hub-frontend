import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../../context/GlobalContext";
import {
  okrOptions,
  gepOptions,
  programNameOptions,
} from "../filters/FiltersData";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import Snackbar from "@mui/material/Snackbar";
import {
  Button,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Input,
  Switch,
  CircularProgress,
  Box,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "../styles/Forms.css";
import InfoIcon from "@mui/icons-material/Info";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";

const partnerRoleOptions = [
  "Partner Generated Thought Leadership (Whitepaper, Panelist)",
  "Joint Messaging & Content Creation",
  "Lead Nurture & Follow Up (Lead-to-Opp // Opp-to-Close)",
  "Speak at Google / 3rd Party Roundtable, Forum",
  "Host Event (Webinar, Townhall, Workshop, Demo)",
  "Joint Customer Offer",
  "Sales Leadership Customer Engagement",
  "Other",
];

export default function ExtraDetailsForm() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  // NEW: Toggle for publish/draft
  const [isPublished, setIsPublished] = useState(
    formData?.isPublished || false
  );

  // Customer Use
  const [customerUse, setCustomerUse] = useState(
    formData?.isApprovedForCustomerUse !== undefined
      ? formData.isApprovedForCustomerUse
        ? "yes"
        : "no"
      : selectedEvent?.isApprovedForCustomerUse !== undefined
      ? selectedEvent.isApprovedForCustomerUse
        ? "yes"
        : "no"
      : ""
  );

  // Program
  const [program, setProgram] = useState(
    Array.isArray(formData?.programName)
      ? formData.programName
      : selectedEvent?.programName || []
  );
  const [isProgramError, setIsProgramError] = useState(false);

  // GEP
  const [gep, setGep] = useState(
    (Array.isArray(formData?.gep)
      ? formData.gep
      : selectedEvent?.gep || []
    ).filter(Boolean)
  );
  const [isGepError, setIsGepError] = useState(false);

  // Partners
  const [isPartneredEvent, setIsPartneredEvent] = useState(
    formData?.isPartneredEvent || selectedEvent?.isPartneredEvent || false
  );
  const [partnerRole, setPartnerRole] = useState(
    formData?.partnerRole || selectedEvent?.partnerRole || ""
  );

  const saveAndNavigate = useFormNavigation();

  /**
   * Keep formData updated as user changes fields
   */
  useEffect(() => {
    const updatedFormData = {
      ...formData,
      // Convert "yes"/"no" to boolean
      isApprovedForCustomerUse: customerUse === "yes",
      programName: program,
      gep,
      isPartneredEvent,
      partnerRole,
      isPublished, // Remember the user's choice
    };

    // Update only if something changed
    if (JSON.stringify(updatedFormData) !== JSON.stringify(formData)) {
      updateFormData(updatedFormData);
    }
  }, [
    formData,
    program,
    customerUse,
    gep,
    isPartneredEvent,
    partnerRole,
    isPublished,
    updateFormData,
  ]);

  /**
   * Handle Program selection
   */
  const handleProgramChange = (event) => {
    setProgram(event.target.value);
    setIsProgramError(false);
  };

  /**
   * Delete a GEP item
   */
  const handleGepDelete = (gepToDelete) => (event) => {
    event.stopPropagation();
    setGep((currentGep) => currentGep.filter((g) => g !== gepToDelete));
  };

  /**
   * Delete a Program item
   */
  const handleProgramDelete = (programToDelete) => (event) => {
    event.stopPropagation();
    setProgram((currentProgram) =>
      currentProgram.filter((item) => item !== programToDelete)
    );
  };

  /**
   * Previous step
   */
  const handlePrevious = () => {
    saveAndNavigate(
      {
        gep,
        programName: program,
        isPartneredEvent,
        isApprovedForCustomerUse: customerUse === "yes",
        partnerRole,
        isPublished,
      },
      "/email-invitation"
    );
  };

  /**
   * Next step
   */
  const handleNext = async () => {
    setLoading(true);

    // Validate fields
    const isGepValid = gep.length > 0;
    const isProgramValid = program.length > 0;

    setIsGepError(!isGepValid);
    setIsProgramError(!isProgramValid);

    if (!isGepValid || !isProgramValid) {
      setIsFormValid(false);
      setSnackbarMessage("Please fill in all required fields.");
      setLoading(false);
      setSnackbarOpen(true);
      return;
    }

    // Merge final data
    const updatedFormData = {
      ...formData,
      gep,
      programName: program,
      isPartneredEvent,
      isApprovedForCustomerUse: customerUse === "yes",
      partnerRole,
      // Decide if published or draft
      isDraft: !isPublished,
      isPublished: isPublished,
    };

    try {
      const response = await sendDataToAPI(updatedFormData, "draft");
      if (response.success) {
        setSnackbarMessage(
          isPublished
            ? "Event published successfully!"
            : "Draft saved successfully!"
        );
        setSnackbarOpen(true);

        setTimeout(() => {
          setLoading(false);
          saveAndNavigate(updatedFormData, "/email-invitation");
        }, 1500);
      } else {
        setSnackbarMessage("Failed to save or publish.");
        setLoading(false);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving.");
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <CalendarHeaderForm />

      <div className="form-container">
        <div className="event-form scrollable-form">
          <Typography
            variant="h4"
            className="form-title"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <InfoIcon
              style={{ marginRight: "10px", color: blue[500], height: "40px" }}
            />
            <span className="mr-1 text-xl text-black cursor-pointer">
              Extra details
            </span>
          </Typography>

          <Grid container spacing={2}>
            {/* Solutions (GEP) */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isGepError}>
                <Typography variant="subtitle1">Solution *</Typography>
                <Select
                  multiple
                  value={gep}
                  onChange={(e) => setGep(e.target.value)}
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {selected.map((gepItem) => (
                        <Chip
                          key={gepItem}
                          label={gepItem}
                          onDelete={handleGepDelete(gepItem)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </div>
                  )}
                >
                  {gepOptions.map((option, idx) => (
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {isGepError && (
                  <Typography variant="body2" color="error">
                    Please select at least one Solution.
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Program */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isProgramError}>
                <Typography variant="subtitle1">Program *</Typography>
                <Select
                  multiple
                  value={program}
                  onChange={handleProgramChange}
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {selected.map((programItem) => (
                        <Chip
                          key={programItem}
                          label={programItem}
                          onDelete={handleProgramDelete(programItem)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </div>
                  )}
                >
                  {programNameOptions.map((option, idx) => (
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {isProgramError && (
                  <Typography variant="body2" color="error">
                    Please select at least one Program.
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Partner */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
                Are Partner(s) involved?
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPartneredEvent}
                    onChange={(e) => setIsPartneredEvent(e.target.checked)}
                    name="partneredEvent"
                    color="primary"
                  />
                }
                label=""
              />
            </Grid>

            {/* Partner Role */}
            {isPartneredEvent && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography variant="subtitle1">Partner's Role</Typography>
                  <Select
                    value={partnerRole}
                    onChange={(e) => setPartnerRole(e.target.value)}
                  >
                    {partnerRoleOptions.map((option, idx) => (
                      <MenuItem key={idx} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Publish Toggle */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    name="isPublished"
                    color="primary"
                  />
                }
                label={<Typography>Publish this event?</Typography>}
              />
            </Grid>
          </Grid>

          {/* Validation error */}
          {!isFormValid && (
            <Typography color="error" style={{ marginBottom: "10px" }}>
              Please fill in all required fields.
            </Typography>
          )}

          {/* Bottom Buttons */}
          <div style={{ marginTop: "20px", float: "right", position: "relative" }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              style={{
                backgroundColor: "white",
                color: "#202124",
                border: "1px solid #dadce0",
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                float: "left",
                margin: "10px",
              }}
            >
              Previous
            </Button>

            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  zIndex: 1,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                backgroundColor: blue[500],
                color: "white",
                margin: "10px",
                "&:hover": {
                  backgroundColor: blue[700],
                },
              }}
              disabled={loading}
            >
              Next
            </Button>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
