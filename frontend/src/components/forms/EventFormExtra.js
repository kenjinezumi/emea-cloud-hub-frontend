import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../../context/GlobalContext";
import { okrOptions, gepOptions } from "../filters/FiltersData";
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
  
  
  
  const [okrSelections, setOkrSelections] = useState(() => {
    const dataSource = formData || selectedEvent;
    return okrOptions.reduce((acc, option) => {
      const okrItem = dataSource?.okr?.find((item) => item.type === option.label);
      acc[option.label] = {
        selected: !!okrItem && okrItem.percentage !== "",
        percentage: okrItem ? okrItem.percentage : "",
      };
      return acc;
    }, {});
  });
  
  const [gep, setGep] = useState(formData?.gep || selectedEvent?.gep || []);
  
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

  const handleNext =  async () => {
    const isCustomerUseValid = customerUse !== "";
    const isGepValid = gep.length > 0;

    setIsCustomerUseError(!isCustomerUseValid);
    setIsGepError(!isGepValid);

    if (!isCustomerUseValid || !isGepValid) {
      setIsFormValid(false);
      setSnackbarMessage("Please fill in all required fields.");
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
        setSnackbarOpen(true);
        return;
      }

      if (okrTotalPercentage !== 100) {
        setSnackbarMessage("Total OKR percentage must equal 100%");
        setSnackbarOpen(true);
        return;
      }
    }

    // const formIsValid =
    //   customerUse && selectedOkrs.length > 0 && gep.length > 0

    // setIsFormValid(formIsValid);

    // if (!formIsValid) {
    //   return;
    // }

    const updatedFormData = {
      ...formData,
      okr: selectedOkrs,
      gep,
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
          saveAndNavigate(updatedFormData, "/email-invitation");
        }, 1500);

      } else {
        setSnackbarMessage("Failed to save draft.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the draft.");
      setSnackbarOpen(true);
    }

  };

  const handleSaveAsDraft = async () => {
    const isDraft = formData.isDraft !== undefined ? formData.isDraft : true;

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
        setSnackbarOpen(true);
        return;
      }

      if (okrTotalPercentage !== 100) {
        setSnackbarMessage("Total OKR percentage must equal 100%");
        setSnackbarOpen(true);
        return;
      }
    }

    const draftData = {
      isApprovedForCustomerUse: customerUse === "yes",
      okr: selectedOkrs,
      gep,
      isPartneredEvent: isPartneredEvent === true,
      isDraft: true,
      isPublished: false,
    };

    const updatedFormData = { ...formData, ...draftData };
    updateFormData(updatedFormData);

    try {
      const response = await sendDataToAPI(updatedFormData, "draft");
      if (response.success) {
        setSnackbarMessage("Draft saved successfully!");
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to save draft.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the draft.");
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
            {/* <Grid item xs={12}>
              <FormControl component="fieldset" error={isCustomerUseError}>
                <Typography variant="subtitle1">
                  Approved for customer use?
                </Typography>
                <RadioGroup
                  value={customerUse}
                  onChange={(e) => setCustomerUse(e.target.value)}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
                {isCustomerUseError && (
                  <Typography variant="body2" color="error">
                    Please select an option for customer use approval.
                  </Typography>
                )}
              </FormControl>
            </Grid> */}

            {/* OKR Selection as Expandable Accordion */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel-content"
                  id="panel-header"
                >
                  <Typography>OKR Selection</Typography>
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
                <Typography variant="subtitle1">Solution</Typography>
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
            <Button
              variant="contained"
              onClick={handleNext}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "left",
                margin: "10px",
              }}
            >
              Next
            </Button>
            {/* <Button
              variant="contained"
              onClick={handleSaveAsDraft}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "right",
                margin: "10px",
              }}
            >
              Save as Draft
            </Button> */}
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
