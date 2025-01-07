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
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Input,
  Switch,
  CircularProgress,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "../styles/Forms.css";
import InfoIcon from "@mui/icons-material/Info";
import { blue, grey } from "@mui/material/colors";
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
  const [program, setProgram] = useState(
    Array.isArray(formData?.programName)
      ? formData.programName
      : selectedEvent?.programName || []
  );

  const [isProgramError, setIsProgramError] = useState(false);

  const [okrSelections, setOkrSelections] = useState(() => {
    const dataSource = formData || selectedEvent;
    return okrOptions.reduce((acc, option) => {
      const okrItem = dataSource?.okr?.find(
        (item) => item.type === option.label
      );
      acc[option.label] = {
        selected: !!okrItem && okrItem.percentage !== "",
        percentage: okrItem ? okrItem.percentage : "",
      };
      return acc;
    }, {});
  });

  const [gep, setGep] = useState(
    (Array.isArray(formData?.gep)
      ? formData.gep
      : selectedEvent?.gep || []
    ).filter(Boolean)
  );

  const [isPartneredEvent, setIsPartneredEvent] = useState(
    formData?.isPartneredEvent || selectedEvent?.isPartneredEvent || false
  );

  const [partnerRole, setPartnerRole] = useState(
    formData?.partnerRole || selectedEvent?.partnerRole || ""
  );

  const [isCustomerUseError, setIsCustomerUseError] = useState(false);
  const [isGepError, setIsGepError] = useState(false);

  const handleToggleOkr = (label) => {
    setOkrSelections((prev) => ({
      ...prev,
      [label]: {
        ...prev[label],
        selected: !prev[label].selected,
      },
    }));
  };
  const handleProgramChange = (event) => {
    setProgram(event.target.value);
    setIsProgramError(false);
  };

  const handlePercentageChange = (label, value) => {
    setOkrSelections((prev) => ({
      ...prev,
      [label]: {
        ...prev[label],
        percentage: value,
      },
    }));
  };
  useEffect(() => {
    const updatedFormData = {
      ...formData,
      // isApprovedForCustomerUse: customerUse === "yes" ? true : false,
      programName: program,
      isApprovedForCustomerUse: null,
      okr: Object.keys(okrSelections).map((label) => ({
        type: label,
        percentage: okrSelections[label].percentage,
      })),
      gep,
      isPartneredEvent,
      partnerRole,
    };

    // Only update the form if the data has changed
    if (JSON.stringify(updatedFormData) !== JSON.stringify(formData)) {
      updateFormData(updatedFormData);
    }
  }, [
    program,
    customerUse,
    okrSelections,
    gep,
    isPartneredEvent,
    partnerRole,
    updateFormData,
    formData,
  ]);

  const saveAndNavigate = useFormNavigation();

  const handlePrevious = () => {
    const selectedOkrs = Object.keys(okrSelections)
      .filter((key) => okrSelections[key].selected)
      .map((key) => ({
        type: key,
        percentage: okrSelections[key].percentage,
      }));

    saveAndNavigate(
      {
        okr: selectedOkrs,
        gep,
        program,
        isPartneredEvent: isPartneredEvent === true,
        isApprovedForCustomerUse: customerUse === "yes",
        partnerRole,
      },
      "/email-invitation"
    );
  };

  const handleGepDelete = (gepToDelete) => (event) => {
    event.stopPropagation();
    setGep((currentGep) => currentGep.filter((gep) => gep !== gepToDelete));
  };

  const handleProgramDelete = (programToDelete) => (event) => {
    event.stopPropagation();
    setProgram((currentProgram) =>
      currentProgram.filter((item) => item !== programToDelete)
    );
  };

  const handleNext = async () => {
    setLoading(true);
    const isGepValid = gep.length > 0;
    const isProgramValid = program.length > 0;

    // setIsCustomerUseError(!isCustomerUseValid);
    setIsGepError(!isGepValid);
    setIsProgramError(!isProgramValid);

    if (!isGepValid || !isProgramValid) {
      setIsFormValid(false);
      setSnackbarMessage("Please fill in all required fields.");
      setLoading(false);
      setSnackbarOpen(true);
      return;
    }

    const selectedOkrs = Object.keys(okrSelections)
      .filter((key) => okrSelections[key].selected)
      .map((key) => ({
        type: key,
        percentage: okrSelections[key].percentage,
      }));

    if (selectedOkrs.length > 0) {
      const okrTotalPercentage = selectedOkrs.reduce(
        (sum, okr) => sum + (parseFloat(okr.percentage) || 0),
        0
      );

      if (okrTotalPercentage > 100) {
        setSnackbarMessage("Total OKR percentage cannot exceed 100%");
        setLoading(false);
        setSnackbarOpen(true);
        return;
      }

      if (okrTotalPercentage !== 100) {
        setSnackbarMessage("Total OKR percentage must equal 100%");
        setLoading(false);
        setSnackbarOpen(true);
        return;
      }
    }

    const updatedFormData = {
      ...formData,
      okr: selectedOkrs,
      gep,
      programName: program,
      isPartneredEvent: isPartneredEvent === true,
      isApprovedForCustomerUse: customerUse === "yes",
      partnerRole,
      isDraft: true,
      isPublished: false,
    };
    try {
      const response = await sendDataToAPI(updatedFormData, "draft");
      if (response.success) {
        setSnackbarMessage("Draft saved successfully!");
        setSnackbarOpen(true);
        setTimeout(() => {
          setLoading(false);
          saveAndNavigate(updatedFormData, "/email-invitation");
        }, 1500);
      } else {
        setSnackbarMessage("Failed to save draft.");
        setLoading(false);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the draft.");
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
            
            {/* OKR Selection as Expandable Accordion */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel-content"
                  id="panel-header"
                >
                  <Typography>OKR Selection *</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {Object.keys(okrSelections).map((label) => (
                    <Grid container alignItems="center" key={label}>
                      <Grid item xs={1}>
                        <Checkbox
                          checked={okrSelections[label].selected}
                          onChange={() => handleToggleOkr(label)}
                        />
                      </Grid>
                      <Grid item xs={7}>
                        <Typography variant="body2">{label}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Input
                          type="number"
                          value={okrSelections[label].percentage}
                          onChange={(e) =>
                            handlePercentageChange(label, e.target.value)
                          }
                          onWheel={(e) => e.target.blur()}
                          placeholder="Percentage"
                          sx={{ width: "80%" }}
                          inputProps={{
                            min: 0,
                            max: 100,
                            step: 1,
                          }}
                          disabled={!okrSelections[label].selected}
                        />
                      </Grid>
                    </Grid>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={isGepError}>
                <Typography variant="subtitle1">Solution *</Typography>
                <Select
                  multiple
                  value={gep}
                  onChange={(e) => setGep(e.target.value)}
                  renderValue={(selected) => (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                    >
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

            {/* New Program Field */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isProgramError}>
                <Typography variant="subtitle1">Program *</Typography>
                <Select
                  multiple
                  value={program}
                  onChange={handleProgramChange}
                  renderValue={(selected) => (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                    >
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

            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ display: "flex", alignItems: "center" }}
              >
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
              />
            </Grid>

            {/* Partner Role Dropdown */}
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
          </Grid>
          {/* {!isFormValid && (
            <Typography color="error" style={{ marginBottom: "10px" }}>
              Please fill in all required fields.
            </Typography>
          )} */}
          <div style={{ marginTop: "20px", float: "right" }}>
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
                  backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent background
                  borderRadius: "8px", // Optional: match the button's border-radius
                  zIndex: 1, // Ensure it appears on top
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Button */}
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
              disabled={loading} // Disable button while loading
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
