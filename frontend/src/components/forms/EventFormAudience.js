import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../../context/GlobalContext";
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
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import { blue } from "@mui/material/colors";
import {
  audienceSeniorityOptions,
  industryOptions,
} from "../filters/FiltersData";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import "../styles/Forms.css";

/** 
 * Helper for any object that needs { selected: boolean, percentage: string }
 */
function ensureSelectedPercentage(obj) {
  return {
    selected: !!(obj && obj.selected),
    percentage: obj && typeof obj.percentage === "string" ? obj.percentage : "",
  };
}

/**
 * Create a "safe" accountSegments object
 */
function getSafeAccountSegments(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      Corporate: { selected: false, percentage: "" },
      SMB: { selected: false, percentage: "" },
      Select: { selected: false, percentage: "" },
      Enterprise: { selected: false, percentage: "" },
      Startup: { selected: false, percentage: "" },
    };
  }
  return {
    Corporate: ensureSelectedPercentage(raw.Corporate),
    SMB: ensureSelectedPercentage(raw.SMB),
    Select: ensureSelectedPercentage(raw.Select),
    Enterprise: ensureSelectedPercentage(raw.Enterprise),
    Startup: ensureSelectedPercentage(raw.Startup),
  };
}

/**
 * Create a "safe" accountCategory object
 */
function getSafeAccountCategory(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      "Digital Native": { selected: false, percentage: "" },
      Traditional: { selected: false, percentage: "" },
    };
  }
  return {
    "Digital Native": ensureSelectedPercentage(raw["Digital Native"]),
    Traditional: ensureSelectedPercentage(raw.Traditional),
  };
}

/**
 * Create a "safe" accountType object
 */
function getSafeAccountType(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      Greenfield: { selected: false, percentage: "" },
      "Existing Customer": { selected: false, percentage: "" },
    };
  }
  return {
    Greenfield: ensureSelectedPercentage(raw.Greenfield),
    "Existing Customer": ensureSelectedPercentage(raw["Existing Customer"]),
  };
}

/**
 * Create a "safe" productAlignment object
 */
function getSafeProductAlignment(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      GCP: { selected: false, percentage: "" },
      GWS: { selected: false, percentage: "" },
    };
  }
  return {
    GCP: ensureSelectedPercentage(raw.GCP),
    GWS: ensureSelectedPercentage(raw.GWS),
  };
}

export default function AudiencePersonaForm() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  // Buyer segment rollup: audienceSeniority
  const [audienceSeniority, setAudienceSeniority] = useState(() => {
    const fromFormData = Array.isArray(formData?.audienceSeniority)
      ? formData.audienceSeniority
      : [];
    const fromSelectedEvent = Array.isArray(selectedEvent?.audienceSeniority)
      ? selectedEvent.audienceSeniority
      : [];
    return fromFormData.length > 0 ? fromFormData : fromSelectedEvent;
  });

  // Industry
  const [industry, setIndustry] = useState(() => {
    const fromFormData = Array.isArray(formData?.industry)
      ? formData.industry
      : [];
    const fromSelectedEvent = Array.isArray(selectedEvent?.industry)
      ? selectedEvent.industry
      : [];
    return fromFormData.length > 0 ? fromFormData : fromSelectedEvent;
  });

  // Account Sectors (just booleans, no percentage)
  const [accountSectors, setAccountSectors] = useState(() => {
    const fromFormData = formData?.accountSectors;
    const fromSelectedEvent = selectedEvent?.accountSectors;
    return (
      fromFormData ??
      fromSelectedEvent ?? {
        commercial: false,
        public: false,
      }
    );
  });

  // Account Segments (with { selected, percentage })
  const [accountSegments, setAccountSegments] = useState(() => {
    // If formData has it, use that; otherwise use selectedEvent
    if (formData?.accountSegments) {
      return getSafeAccountSegments(formData.accountSegments);
    } else if (selectedEvent?.accountSegments) {
      return getSafeAccountSegments(selectedEvent.accountSegments);
    }
    return getSafeAccountSegments(null);
  });

  // Account Category (with { selected, percentage })
  const [accountCategory, setAccountCategory] = useState(() => {
    if (formData?.accountCategory) {
      return getSafeAccountCategory(formData.accountCategory);
    } else if (selectedEvent?.accountCategory) {
      return getSafeAccountCategory(selectedEvent.accountCategory);
    }
    return getSafeAccountCategory(null);
  });

  // Account Type (with { selected, percentage })
  const [accountType, setAccountType] = useState(() => {
    if (formData?.accountType) {
      return getSafeAccountType(formData.accountType);
    } else if (selectedEvent?.accountType) {
      return getSafeAccountType(selectedEvent.accountType);
    }
    return getSafeAccountType(null);
  });

  // Product Alignment (with { selected, percentage })
  const [productAlignment, setProductAlignment] = useState(() => {
    if (formData?.productAlignment) {
      return getSafeProductAlignment(formData.productAlignment);
    } else if (selectedEvent?.productAlignment) {
      return getSafeProductAlignment(selectedEvent.productAlignment);
    }
    return getSafeProductAlignment(null);
  });

  // AI vs Core
  const [aiVsCore, setAiVsCore] = useState(
    formData?.aiVsCore ?? selectedEvent?.aiVsCore ?? ""
  );

  // Max Event Capacity
  const [maxEventCapacity, setMaxEventCapacity] = useState(
    formData?.maxEventCapacity ?? selectedEvent?.maxEventCapacity ?? ""
  );

  // People Meeting Criteria
  const [peopleMeetingCriteria, setPeopleMeetingCriteria] = useState(() => {
    if (selectedEvent) {
      return selectedEvent.peopleMeetingCriteria ?? formData.peopleMeetingCriteria ?? "";
    }
    return formData.peopleMeetingCriteria ?? "";
  });

  const [isFormValid, setIsFormValid] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Expandable sections
  const [expanded, setExpanded] = useState({
    accountSegments: false,
    accountCategory: false,
    accountType: false,
    productAlignment: false,
    accountSectors: false,
    aiVsCore: false,
  });

  // Validation flags
  const [isAudienceSeniorityError, setIsAudienceSeniorityError] = useState(false);
  const [isAccountSegmentsError, setIsAccountSegmentsError] = useState(false);
  const [isAccountCategoryError, setIsAccountCategoryError] = useState(false);
  const [isAccountTypeError, setIsAccountTypeError] = useState(false);
  const [isProductAlignmentError, setIsProductAlignmentError] = useState(false);
  const [isAiVsCoreError, setIsAiVsCoreError] = useState(false);
  const [isIndustryError, setIsIndustryError] = useState(false);
  const [isAccountSectorsError, setIsAccountSectorsError] = useState(false);

  const saveAndNavigate = useFormNavigation();

  /**
   * Keep formData updated as user changes fields
   */
  useEffect(() => {
    const currentFormData = {
      audienceSeniority,
      accountSectors,
      maxEventCapacity,
      peopleMeetingCriteria,
      accountSegments,
      accountCategory,
      accountType,
      productAlignment,
      aiVsCore,
      industry,
    };
    // Only update if changed
    if (JSON.stringify(formData) !== JSON.stringify(currentFormData)) {
      updateFormData(currentFormData);
    }
  }, [
    audienceSeniority,
    accountSectors,
    maxEventCapacity,
    peopleMeetingCriteria,
    accountSegments,
    accountCategory,
    accountType,
    productAlignment,
    aiVsCore,
    industry,
    formData,
    updateFormData,
  ]);

  // Handle toggling of the expand/accordion
  const handleToggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle removing one audience seniority item
  const handleAudienceSeniorityDelete = (seniorityToDelete) => {
    setAudienceSeniority((current) =>
      current.filter((item) => item !== seniorityToDelete)
    );
  };

  // Generic toggler for accountSegments / accountCategory / accountType / productAlignment
  const handleToggleSegment = (segment, setStateFunc) => {
    setStateFunc((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        selected: !prev[segment].selected,
      },
    }));
  };

  // Generic percentage changer
  const handlePercentageChange = (segment, value, setStateFunc) => {
    setStateFunc((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        percentage: value,
      },
    }));
  };

  // AccountSectors are just booleans
  const handleCheckboxChangeAccountSectors = (event) => {
    const { name, checked } = event.target;
    setAccountSectors((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // “Calculate Audience” button (currently just a placeholder)
  const handleCalculateAudience = () => {
    setSnackbarMessage("No data in the backend yet! (Placeholder)");
    setSnackbarOpen(true);
  };

  // “Previous” button
  const handlePrevious = () => {
    // Build partial formData to save
    const currentFormData = {
      audienceSeniority,
      accountSectors,
      maxEventCapacity,
      peopleMeetingCriteria,
      accountSegments,
      accountCategory,
      accountType,
      productAlignment,
      aiVsCore,
      industry,
      isDraft: true,
      isPublished: false,
    };
    saveAndNavigate(currentFormData, "/email-invitation");
  };

  // “Next” button
  const handleNext = async () => {
    setLoading(true);

    // 1) Validate if percentages are up to 100 for each grouping

    // Gather selectedSegments for accountSegments
    const selectedSegments = Object.keys(accountSegments)
      .filter((key) => accountSegments[key].selected)
      .map((key) => ({
        type: key,
        percentage: accountSegments[key].percentage,
      }));
    // Sum their percentages
    if (selectedSegments.length > 0) {
      const sum = selectedSegments.reduce(
        (acc, item) => acc + parseFloat(item.percentage || "0"),
        0
      );
      if (sum > 100) {
        setSnackbarMessage("Total percentage for Account Segments cannot exceed 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      if (sum !== 100) {
        setSnackbarMessage("Total percentage for Account Segments must equal 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
    }

    // 2) Validate accountCategory
    const selectedCategories = Object.keys(accountCategory)
      .filter((key) => accountCategory[key].selected)
      .map((key) => ({
        type: key,
        percentage: accountCategory[key].percentage,
      }));
    if (selectedCategories.length > 0) {
      const sum = selectedCategories.reduce(
        (acc, item) => acc + parseFloat(item.percentage || "0"),
        0
      );
      if (sum > 100) {
        setSnackbarMessage("Total percentage for Account Category cannot exceed 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      if (sum !== 100) {
        setSnackbarMessage("Total percentage for Account Category must equal 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
    }

    // 3) Validate accountType
    const selectedTypes = Object.keys(accountType)
      .filter((key) => accountType[key].selected)
      .map((key) => ({
        type: key,
        percentage: accountType[key].percentage,
      }));
    if (selectedTypes.length > 0) {
      const sum = selectedTypes.reduce(
        (acc, item) => acc + parseFloat(item.percentage || "0"),
        0
      );
      if (sum > 100) {
        setSnackbarMessage("Total percentage for Account Type cannot exceed 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      if (sum !== 100) {
        setSnackbarMessage("Total percentage for Account Type must equal 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
    }

    // 4) Validate productAlignment
    const selectedAlignments = Object.keys(productAlignment)
      .filter((key) => productAlignment[key].selected)
      .map((key) => ({
        type: key,
        percentage: productAlignment[key].percentage,
      }));
    if (selectedAlignments.length > 0) {
      const sum = selectedAlignments.reduce(
        (acc, item) => acc + parseFloat(item.percentage || "0"),
        0
      );
      if (sum > 100) {
        setSnackbarMessage("Total percentage for Product Alignment cannot exceed 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      if (sum !== 100) {
        setSnackbarMessage("Total percentage for Product Alignment must equal 100%");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
    }

    // 5) Basic required checks
    const isAudienceSeniorityValid = audienceSeniority.length > 0;
    const isIndustryValid = industry.length > 0;
    const isAccountSectorsValid = accountSectors.commercial || accountSectors.public;
    const isAccountSegmentsValid = selectedSegments.length > 0; 
    const isAccountCategoryValid = selectedCategories.length > 0;
    const isAccountTypeValid = selectedTypes.length > 0;
    const isProductAlignmentValid = selectedAlignments.length > 0;
    const isAiVsCoreValid = aiVsCore !== "";

    setIsAudienceSeniorityError(!isAudienceSeniorityValid);
    setIsIndustryError(!isIndustryValid);
    setIsAccountSectorsError(!isAccountSectorsValid);
    setIsAccountSegmentsError(!isAccountSegmentsValid);
    setIsAccountCategoryError(!isAccountCategoryValid);
    setIsAccountTypeError(!isAccountTypeValid);
    setIsProductAlignmentError(!isProductAlignmentValid);
    setIsAiVsCoreError(!isAiVsCoreValid);

    const formIsValid =
      isAudienceSeniorityValid &&
      isIndustryValid &&
      isAccountSectorsValid &&
      isAccountSegmentsValid &&
      isAccountCategoryValid &&
      isAccountTypeValid &&
      isProductAlignmentValid &&
      isAiVsCoreValid;

    setIsFormValid(formIsValid);

    if (!formIsValid) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // 6) Prepare final data
    const draftData = {
      audienceSeniority,
      accountSectors,
      maxEventCapacity,
      peopleMeetingCriteria,
      accountSegments,
      accountCategory,
      accountType,
      productAlignment,
      aiVsCore,
      industry,
      isDraft: true,
      isPublished: false,
    };

    // 7) Save (API call)
    try {
      updateFormData(draftData); // update context
      const updatedFormData = { ...formData, ...draftData };
      const response = await sendDataToAPI(updatedFormData);

      if (response.success) {
        setSnackbarMessage("Draft saved successfully!");
        setSnackbarOpen(true);
        setTimeout(() => {
          setLoading(false);
          saveAndNavigate(updatedFormData, "/links");
        }, 1500);
      } else {
        setSnackbarMessage("Failed to save draft.");
        setSnackbarOpen(true);
        setLoading(false);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the draft.");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ overscrollBehavior: "contain" }}
    >
      <CalendarHeaderForm />
      <div className="form-container" style={{ overscrollBehavior: "contain" }}>
        <div className="event-form">
          <Typography
            variant="h4"
            className="form-title"
            style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
          >
            <PeopleIcon
              style={{ marginRight: "10px", color: blue[500], height: "40px" }}
            />
            <span className="mr-1 text-xl text-black cursor-pointer">
              Audience
            </span>
          </Typography>

          {/* Buyer Segment Rollup */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">Buyer Segment Rollup *</Typography>
            <FormControl fullWidth error={isAudienceSeniorityError}>
              <Select
                multiple
                value={audienceSeniority}
                onChange={(e) => setAudienceSeniority(e.target.value)}
                renderValue={(selected) => (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {selected.map((seniority) => (
                      <Chip
                        key={seniority}
                        label={seniority}
                        onDelete={() => handleAudienceSeniorityDelete(seniority)}
                      />
                    ))}
                  </div>
                )}
              >
                {audienceSeniorityOptions.map((option, idx) => (
                  <MenuItem key={idx} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {isAudienceSeniorityError && (
                <Typography variant="body2" color="error">
                  Please select at least one buyer segment rollup.
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Industry */}
          <Grid item xs={12} style={{ marginTop: 16 }}>
            <Typography variant="subtitle1">Industry *</Typography>
            <FormControl fullWidth error={isIndustryError}>
              <Select
                multiple
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                renderValue={(selected) => (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </div>
                )}
              >
                {industryOptions.map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    <Checkbox checked={industry.indexOf(option) > -1} />
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {isIndustryError && (
                <Typography variant="body2" color="error">
                  Please select at least one industry.
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Account Sectors */}
          <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
            <Accordion
              expanded={expanded.accountSectors}
              onChange={() => handleToggleSection("accountSectors")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="account-sectors-content"
                id="account-sectors-header"
              >
                <Typography>Account Sectors *</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container alignItems="center">
                  <Grid item xs={1}>
                    <Checkbox
                      checked={accountSectors.commercial}
                      onChange={handleCheckboxChangeAccountSectors}
                      name="commercial"
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">Commercial Sector</Typography>
                  </Grid>
                </Grid>
                <Grid container alignItems="center">
                  <Grid item xs={1}>
                    <Checkbox
                      checked={accountSectors.public}
                      onChange={handleCheckboxChangeAccountSectors}
                      name="public"
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <Typography variant="body2">Public Sector</Typography>
                  </Grid>
                </Grid>
                {isAccountSectorsError && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    Please select at least one account sector.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Account Segments */}
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Accordion
              expanded={expanded.accountSegments}
              onChange={() => handleToggleSection("accountSegments")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="account-segments-content"
                id="account-segments-header"
              >
                <Typography>Account Segments *</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.keys(accountSegments).map((segment) => (
                  <Grid container alignItems="center" key={segment} spacing={2}>
                    <Grid item xs={1}>
                      <Checkbox
                        checked={accountSegments[segment].selected}
                        onChange={() =>
                          handleToggleSegment(segment, setAccountSegments)
                        }
                      />
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">{segment}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Input
                        type="number"
                        value={accountSegments[segment].percentage}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) =>
                          handlePercentageChange(
                            segment,
                            e.target.value,
                            setAccountSegments
                          )
                        }
                        placeholder="Percentage"
                        sx={{ width: "80%" }}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                        disabled={!accountSegments[segment].selected}
                      />
                    </Grid>
                  </Grid>
                ))}
              </AccordionDetails>
              {isAccountSegmentsError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Please select at least one account segment and ensure total
                  percentage equals 100%.
                </Typography>
              )}
            </Accordion>
          </Grid>

          {/* Account Category */}
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Accordion
              expanded={expanded.accountCategory}
              onChange={() => handleToggleSection("accountCategory")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="account-category-content"
                id="account-category-header"
              >
                <Typography>Account Category *</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.keys(accountCategory).map((category) => (
                  <Grid container alignItems="center" key={category} spacing={2}>
                    <Grid item xs={1}>
                      <Checkbox
                        checked={accountCategory[category].selected}
                        onChange={() =>
                          handleToggleSegment(category, setAccountCategory)
                        }
                      />
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">{category}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Input
                        type="number"
                        value={accountCategory[category].percentage}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) =>
                          handlePercentageChange(
                            category,
                            e.target.value,
                            setAccountCategory
                          )
                        }
                        placeholder="Percentage"
                        sx={{ width: "80%" }}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                        disabled={!accountCategory[category].selected}
                      />
                    </Grid>
                  </Grid>
                ))}
              </AccordionDetails>
              {isAccountCategoryError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Please select at least one account category and ensure total
                  percentage equals 100%.
                </Typography>
              )}
            </Accordion>
          </Grid>

          {/* Account Type */}
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Accordion
              expanded={expanded.accountType}
              onChange={() => handleToggleSection("accountType")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="account-type-content"
                id="account-type-header"
              >
                <Typography>Greenfield Status *</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.keys(accountType).map((type) => (
                  <Grid container alignItems="center" key={type} spacing={2}>
                    <Grid item xs={1}>
                      <Checkbox
                        checked={accountType[type].selected}
                        onChange={() => handleToggleSegment(type, setAccountType)}
                      />
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">{type}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Input
                        type="number"
                        value={accountType[type].percentage}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) =>
                          handlePercentageChange(type, e.target.value, setAccountType)
                        }
                        placeholder="Percentage"
                        sx={{ width: "80%" }}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                        disabled={!accountType[type].selected}
                      />
                    </Grid>
                  </Grid>
                ))}
              </AccordionDetails>
              {isAccountTypeError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Please select at least one account type and ensure total
                  percentage equals 100%.
                </Typography>
              )}
            </Accordion>
          </Grid>

          {/* Product Alignment */}
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Accordion
              expanded={expanded.productAlignment}
              onChange={() => handleToggleSection("productAlignment")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="product-alignment-content"
                id="product-alignment-header"
              >
                <Typography>Product Family *</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {Object.keys(productAlignment).map((alignment) => (
                  <Grid
                    container
                    alignItems="center"
                    key={alignment}
                    spacing={2}
                  >
                    <Grid item xs={1}>
                      <Checkbox
                        checked={productAlignment[alignment].selected}
                        onChange={() =>
                          handleToggleSegment(alignment, setProductAlignment)
                        }
                      />
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">{alignment}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Input
                        type="number"
                        value={productAlignment[alignment].percentage}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) =>
                          handlePercentageChange(
                            alignment,
                            e.target.value,
                            setProductAlignment
                          )
                        }
                        placeholder="Percentage"
                        sx={{ width: "80%" }}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                        disabled={!productAlignment[alignment].selected}
                      />
                    </Grid>
                  </Grid>
                ))}
              </AccordionDetails>
              {isProductAlignmentError && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Please select at least one product alignment and ensure total
                  percentage equals 100%.
                </Typography>
              )}
            </Accordion>
          </Grid>

          {/* AI vs Core */}
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Accordion
              expanded={expanded.aiVsCore}
              onChange={() => handleToggleSection("aiVsCore")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="ai-vs-core-content"
                id="ai-vs-core-header"
              >
                <Typography>AI vs Core *</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth error={isAiVsCoreError}>
                  <Select
                    value={aiVsCore}
                    onChange={(e) => setAiVsCore(e.target.value)}
                  >
                    <MenuItem value="AI">AI</MenuItem>
                    <MenuItem value="Core">Core</MenuItem>
                  </Select>
                  {isAiVsCoreError && (
                    <Typography variant="body2" color="error">
                      Please select AI or Core.
                    </Typography>
                  )}
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Max Event Capacity */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">Maximum Event Capacity</Typography>
            <TextField
              type="number"
              value={maxEventCapacity}
              onChange={(e) => setMaxEventCapacity(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* People Meeting Criteria */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              People Meeting the Audience Criteria
            </Typography>
            <TextField
              type="number"
              value={peopleMeetingCriteria}
              onChange={(e) => setPeopleMeetingCriteria(e.target.value)}
              fullWidth
              disabled
              InputProps={{
                style: {
                  backgroundColor: "#e0e0e0", // Light grey to signify disabled
                },
              }}
            />
            <Button
              variant="outlined"
              onClick={handleCalculateAudience}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "left",
                margin: "10px 0",
              }}
            >
              Calculate the audience
            </Button>
          </Grid>

          {/* Form Error Prompt */}
          {!isFormValid && (
            <Typography color="error" style={{ marginBottom: "10px" }}>
              Please fill in all required fields.
            </Typography>
          )}

          {/* Previous / Next Buttons */}
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
