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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import { blue } from "@mui/material/colors";
import { audienceRoles, audienceSeniorityOptions } from "../filters/FiltersData";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import "../styles/Forms.css";

export default function AudiencePersonaForm() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);

  const [audienceSeniority, setAudienceSeniority] = useState(
    Array.isArray(selectedEvent?.audienceSeniority) ? selectedEvent.audienceSeniority : formData.audienceSeniority || []
  );
  
  const [audiencePersona, setAudiencePersona] = useState(
    Array.isArray(selectedEvent?.audiencePersona) ? selectedEvent.audiencePersona : formData.audiencePersona || []
  );
  
  const [industry, setIndustry] = useState(
    Array.isArray(selectedEvent?.industry) ? selectedEvent.industry : formData.industry || []
  );
  
  const [accountSectors, setAccountSectors] = useState(
    selectedEvent?.accountSectors || formData.accountSectors || {
      commercial: false,
      public: false,
    }
  );
  
  const [accountSegments, setAccountSegments] = useState(
    selectedEvent?.accountSegments || formData.accountSegments || {
      Corporate: { selected: false, percentage: "" },
      SMB: { selected: false, percentage: "" },
      Select: { selected: false, percentage: "" },
      Enterprise: { selected: false, percentage: "" },
      Startup: { selected: false, percentage: "" },
    }
  );
  
  const [accountCategory, setAccountCategory] = useState(
    selectedEvent?.accountCategory || formData.accountCategory || {
      "Digital Native": { selected: false, percentage: "" },
      Traditional: { selected: false, percentage: "" },
    }
  );
  
  const [accountType, setAccountType] = useState(
    selectedEvent?.accountType || formData.accountType || {
      Greenfield: { selected: false, percentage: "" },
      "Existing Customer": { selected: false, percentage: "" },
    }
  );
  
  const [productAlignment, setProductAlignment] = useState(
    selectedEvent?.productAlignment || formData.productAlignment || {
      GCP: { selected: false, percentage: "" },
      GWS: { selected: false, percentage: "" },
    }
  );
  
  const [aiVsCore, setAiVsCore] = useState(
    selectedEvent?.aiVsCore || formData.aiVsCore || null
  );
  
  const [maxEventCapacity, setMaxEventCapacity] = useState(
    selectedEvent?.maxEventCapacity || formData.maxEventCapacity || ""
  );
  

  const [isAudiencePersonaError, setIsAudiencePersonaError] = useState(false);
  const [isAudienceSeniorityError, setIsAudienceSeniorityError] = useState(false);
  const [isAccountSegmentsError, setIsAccountSegmentsError] = useState(false);
  const [isAccountCategoryError, setIsAccountCategoryError] = useState(false);
  const [isAccountTypeError, setIsAccountTypeError] = useState(false);
  const [isProductAlignmentError, setIsProductAlignmentError] = useState(false);
  const [isAiVsCoreError, setIsAiVsCoreError] = useState(false);
  const [isIndustryError, setIsIndustryError] = useState(false);
  const [isAccountSectorsError, setIsAccountSectorsError] = useState(false);


  const industryOptions = [
    'Manufacturing',
    'Healthcare',
    'Education',
    'Financial Services',
    'Government',
    'Retail',
  ];
  
  
  useEffect(() => {
    const currentFormData = {
      audiencePersona,
      audienceSeniority,
      accountSectors,
      maxEventCapacity,
      accountSegments,
      accountCategory,
      accountType,
      productAlignment,
      aiVsCore,
      industry,
    };

    // Update formData in the context only if there are changes
    if (JSON.stringify(formData) !== JSON.stringify(currentFormData)) {
      updateFormData(currentFormData);
    }
  }, [
    audiencePersona,
    audienceSeniority,
    accountSectors,
    maxEventCapacity,
    accountSegments,
    accountCategory,
    accountType,
    productAlignment,
    aiVsCore,
    industry,
    formData,
    updateFormData,
  ]);

  useEffect(() => {
    if (selectedEvent || formData) {
      setAudienceSeniority(selectedEvent?.audienceSeniority || formData.audienceSeniority || []);
      setAudiencePersona(selectedEvent?.audiencePersona || formData.audiencePersona || []);
      setIndustry(selectedEvent?.industry || formData.industry || []);
      setAccountSectors(selectedEvent?.accountSectors || formData.accountSectors || { commercial: false, public: false });
      setAccountSegments(selectedEvent?.accountSegments || formData.accountSegments || {
        Corporate: { selected: false, percentage: "" },
        SMB: { selected: false, percentage: "" },
        Select: { selected: false, percentage: "" },
        Enterprise: { selected: false, percentage: "" },
        Startup: { selected: false, percentage: "" },
      });
      setAccountCategory(selectedEvent?.accountCategory || formData.accountCategory || {
        "Digital Native": { selected: false, percentage: "" },
        Traditional: { selected: false, percentage: "" },
      });
      setAccountType(selectedEvent?.accountType || formData.accountType || {
        Greenfield: { selected: false, percentage: "" },
        "Existing Customer": { selected: false, percentage: "" },
      });
      setProductAlignment(selectedEvent?.productAlignment || formData.productAlignment || {
        GCP: { selected: false, percentage: "" },
        GWS: { selected: false, percentage: "" },
      });
      setAiVsCore(selectedEvent?.aiVsCore || formData.aiVsCore || null);
      setMaxEventCapacity(selectedEvent?.maxEventCapacity || formData.maxEventCapacity || "");
    }
  }, [selectedEvent, formData]);
  
  const [peopleMeetingCriteria, setPeopleMeetingCriteria] = useState(
    selectedEvent ? selectedEvent.peopleMeetingCriteria : formData.peopleMeetingCriteria || ""
  );
  const [isFormValid, setIsFormValid] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [expanded, setExpanded] = useState({
    accountSegments: false,
    accountCategory: false,
    accountType: false,
    productAlignment: false,
    accountSectors: false, 
  });

  const saveAndNavigate = useFormNavigation();

  useEffect(() => {
    if (selectedEvent) {
      const eventSegments = selectedEvent.accountSegments || {};
      setAccountSegments({
        Corporate: { selected: !!eventSegments.Corporate, percentage: eventSegments.Corporate?.percentage || "" },
        SMB: { selected: !!eventSegments.SMB, percentage: eventSegments.SMB?.percentage || "" },
        Select: { selected: !!eventSegments.Select, percentage: eventSegments.Select?.percentage || "" },
        Enterprise: { selected: !!eventSegments.Enterprise, percentage: eventSegments.Enterprise?.percentage || "" },
        Startup: { selected: !!eventSegments.Startup, percentage: eventSegments.Startup?.percentage || "" },
      });
    }
  }, [selectedEvent]);

  const handleToggleSection = (section) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [section]: !prevExpanded[section],
    }));
  };

  const handleAudiencePersonaDelete = (personaToDelete) => {
    setAudiencePersona((currentPersonas) =>
      currentPersonas.filter((persona) => persona !== personaToDelete)
    );
  };

  const handleAudienceSeniorityDelete = (seniorityToDelete) => {
    setAudienceSeniority((currentSeniorities) =>
      currentSeniorities.filter((seniority) => seniority !== seniorityToDelete)
    );
  };

  const handleToggleSegment = (segment, setStateFunc) => {
    setStateFunc((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        selected: !prev[segment].selected,
      },
    }));
  };

  const handlePercentageChange = (segment, value, setStateFunc) => {
    setStateFunc((prev) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        percentage: value,
      },
    }));
  };

  const handleCheckboxChangeAccountSectors = (event) => {
    const { name, checked } = event.target;
    setAccountSectors((prevSectors) => ({
      ...prevSectors,
      [name]: checked,
    }));
  };

  const handleNext = async () => {
    
    const selectedSegments = Object.keys(accountSegments)
    .filter((key) => accountSegments[key].selected) // Only selected segments
    .map((key) => ({
      type: key,
      percentage: accountSegments[key].percentage,
    }));

  if (selectedSegments.length > 0) {
    const segmentTotalPercentage = selectedSegments.reduce(
      (sum, segment) => sum + (parseFloat(segment.percentage) || 0),
      0
    );

    if (segmentTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Account Segments cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (segmentTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Account Segments must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }

  // Calculate and validate Account Category only if a checkbox is selected
  const selectedCategories = Object.keys(accountCategory)
    .filter((key) => accountCategory[key].selected) // Only selected categories
    .map((key) => ({
      type: key,
      percentage: accountCategory[key].percentage,
    }));

  if (selectedCategories.length > 0) {
    const categoryTotalPercentage = selectedCategories.reduce(
      (sum, category) => sum + (parseFloat(category.percentage) || 0),
      0
    );

    if (categoryTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Account Category cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (categoryTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Account Category must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }

  // Calculate and validate Account Type only if a checkbox is selected
  const selectedTypes = Object.keys(accountType)
    .filter((key) => accountType[key].selected) // Only selected types
    .map((key) => ({
      type: key,
      percentage: accountType[key].percentage,
    }));

  if (selectedTypes.length > 0) {
    const typeTotalPercentage = selectedTypes.reduce(
      (sum, type) => sum + (parseFloat(type.percentage) || 0),
      0
    );

    if (typeTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Account Type cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (typeTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Account Type must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }

  // Calculate and validate Product Alignment only if a checkbox is selected
  const selectedAlignments = Object.keys(productAlignment)
    .filter((key) => productAlignment[key].selected) // Only selected alignments
    .map((key) => ({
      type: key,
      percentage: productAlignment[key].percentage,
    }));

  if (selectedAlignments.length > 0) {
    const alignmentTotalPercentage = selectedAlignments.reduce(
      (sum, alignment) => sum + (parseFloat(alignment.percentage) || 0),
      0
    );

    if (alignmentTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Product Alignment cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (alignmentTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Product Alignment must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }

  const isAudiencePersonaValid = audiencePersona.length > 0;
    const isAudienceSeniorityValid = audienceSeniority.length > 0;
    const isAccountSegmentsValid = selectedSegments.length > 0;
    const isAccountCategoryValid = selectedCategories.length > 0;
    const isAccountTypeValid = selectedTypes.length > 0;
    const isProductAlignmentValid = selectedAlignments.length > 0;
    const isAiVsCoreValid = aiVsCore !== null && aiVsCore !== undefined && aiVsCore !== "";
    const isIndustryValid = industry.length > 0;
    const isAccountSectorsValid = accountSectors.commercial || accountSectors.public;

    setIsAudiencePersonaError(!isAudiencePersonaValid);
    setIsAudienceSeniorityError(!isAudienceSeniorityValid);
    setIsAccountSegmentsError(!isAccountSegmentsValid);
    setIsAccountCategoryError(!isAccountCategoryValid);
    setIsAccountTypeError(!isAccountTypeValid);
    setIsProductAlignmentError(!isProductAlignmentValid);
    setIsAiVsCoreError(!isAiVsCoreValid);
    setIsIndustryError(!isIndustryValid);
    setIsAccountSectorsError(!isAccountSectorsValid);

    const formIsValid =
    isAudiencePersonaValid &&
    isAudienceSeniorityValid &&
    isAccountSegmentsValid &&
    isAccountCategoryValid &&
    isAccountTypeValid &&
    isProductAlignmentValid &&
    isAiVsCoreValid &&
    isIndustryValid &&
    isAccountSectorsValid;

  setIsFormValid(formIsValid);

  if (!formIsValid) {
    setSnackbarMessage("Please fill in all required fields.");
    setSnackbarOpen(true);
    return;
  }


  
    // If all checks pass, save the form data and move to the next step
    const draftData = {
      audiencePersona,
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
      isPublished: false
    };
  
    setIsFormValid(true);
    updateFormData(draftData);
    const updatedFormData = { ...formData, ...draftData };


    try {
          const response = await sendDataToAPI(updatedFormData);
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
    saveAndNavigate(updatedFormData, "/links");
  };
  

  const handlePrevious = () => {
    const currentFormData = {
      audiencePersona,
      audienceSeniority,
      accountSectors,
      maxEventCapacity,
      peopleMeetingCriteria,
      accountSegments,
      accountCategory,
      accountType,
      productAlignment,
      aiVsCore,
      isDraft: true,  
      isPublished: false,
    };

    saveAndNavigate(currentFormData, "/email-invitation");
  };

  const handleSaveAsDraft = async () => {
    // Validate Account Segments
    const selectedSegments = Object.keys(accountSegments)
    .filter((key) => accountSegments[key].selected) // Only selected segments
    .map((key) => ({
      type: key,
      percentage: accountSegments[key].percentage,
    }));

  if (selectedSegments.length > 0) {
    const segmentTotalPercentage = selectedSegments.reduce(
      (sum, segment) => sum + (parseFloat(segment.percentage) || 0),
      0
    );

    if (segmentTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Account Segments cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (segmentTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Account Segments must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }

  // Calculate and validate Account Category only if a checkbox is selected
  const selectedCategories = Object.keys(accountCategory)
    .filter((key) => accountCategory[key].selected) // Only selected categories
    .map((key) => ({
      type: key,
      percentage: accountCategory[key].percentage,
    }));

  if (selectedCategories.length > 0) {
    const categoryTotalPercentage = selectedCategories.reduce(
      (sum, category) => sum + (parseFloat(category.percentage) || 0),
      0
    );

    if (categoryTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Account Category cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (categoryTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Account Category must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }

  // Calculate and validate Account Type only if a checkbox is selected
  const selectedTypes = Object.keys(accountType)
    .filter((key) => accountType[key].selected) // Only selected types
    .map((key) => ({
      type: key,
      percentage: accountType[key].percentage,
    }));

  if (selectedTypes.length > 0) {
    const typeTotalPercentage = selectedTypes.reduce(
      (sum, type) => sum + (parseFloat(type.percentage) || 0),
      0
    );

    if (typeTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Account Type cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (typeTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Account Type must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }

  // Calculate and validate Product Alignment only if a checkbox is selected
  const selectedAlignments = Object.keys(productAlignment)
    .filter((key) => productAlignment[key].selected) // Only selected alignments
    .map((key) => ({
      type: key,
      percentage: productAlignment[key].percentage,
    }));

  if (selectedAlignments.length > 0) {
    const alignmentTotalPercentage = selectedAlignments.reduce(
      (sum, alignment) => sum + (parseFloat(alignment.percentage) || 0),
      0
    );

    if (alignmentTotalPercentage > 100) {
      setSnackbarMessage("Total percentage for Product Alignment cannot exceed 100%");
      setSnackbarOpen(true);
      return;
    }

    if (alignmentTotalPercentage !== 100) {
      setSnackbarMessage("Total percentage for Product Alignment must equal 100%");
      setSnackbarOpen(true);
      return;
    }
  }


  
    // If all checks pass, prepare the form data for saving as draft
    const draftData = {
      audiencePersona,
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
      isDraft: true,  // Mark it as a draft
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
  
  const handleCalculateAudience = () => {
    setSnackbarMessage("No data in the backend yet!!!!");
    setSnackbarOpen(true);
  };

  return (
    <div className="h-screen flex flex-col" style={{ overscrollBehavior: "contain" }}>
      <CalendarHeaderForm />
      <div className="form-container" style={{ overscrollBehavior: "contain" }}>
        <div className="event-form">
          <Typography
            variant="h4"
            className="form-title"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <PeopleIcon
              style={{ marginRight: "10px", color: blue[500], height: "40px" }}
            />
            <span className="mr-1 text-xl text-black cursor-pointer">
              Audience 
            </span>
            
          </Typography>

 {/* Audience Seniority */}
 <Grid item xs={12}>
            <Typography variant="subtitle1">Buyer Segment Rollup</Typography>
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
          {/* Audience Persona */}
          <Grid item xs={12}>
            <Typography variant="subtitle1"> Buyer Segment</Typography>
            <FormControl fullWidth error={isAudiencePersonaError}>
            <Select
                multiple
                value={audiencePersona}
                onChange={(e) => setAudiencePersona(e.target.value)}
                renderValue={(selected) => (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {selected.map((persona) => (
                      <Chip
                        key={persona}
                        label={persona}
                        onDelete={() => handleAudiencePersonaDelete(persona)}
                      />
                    ))}
                  </div>
                )}
              >
                {audienceRoles.map((role, idx) => (
  <MenuItem key={idx} value={role}>
    {role}
  </MenuItem>
))}

{audienceSeniorityOptions.map((option, idx) => (
  <MenuItem key={idx} value={option.label}>
    {option.label}
  </MenuItem>
))}

              </Select>
              {isAudiencePersonaError && (
      <Typography variant="body2" color="error">
        Please select at least one buyer segment.
      </Typography>
    )}
            </FormControl>
          </Grid>

         
          
{/* Industry Multi-Select */}
<Grid item xs={12}>
  <Typography variant="subtitle1">Industry</Typography>
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
      {industryOptions.map((industryOption, idx) => (
        <MenuItem key={idx} value={industryOption}>
          <Checkbox checked={industry.indexOf(industryOption) > -1} />
          {industryOption}
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



{/* Account Sectors Accordion */}
<Grid item xs={12} sx={{ mb: 2 }}>
  <Accordion expanded={expanded.accountSectors} onChange={() => handleToggleSection('accountSectors')}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="account-sectors-content" id="account-sectors-header">
      <Typography>Account Sectors</Typography>
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


{/* Account Segments Accordion */}
<Grid item xs={12} sx={{ mb: 2 }}>
  <Accordion expanded={expanded.accountSegments} onChange={() => handleToggleSection("accountSegments")}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="account-segments-content" id="account-segments-header">
      <Typography>Account Segments</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {Object.keys(accountSegments).map((segment) => (
        <Grid container alignItems="center" key={segment} spacing={2}>
          <Grid item xs={1}>
            <Checkbox
              checked={accountSegments[segment].selected}
              onChange={() => handleToggleSegment(segment, setAccountSegments)}
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
              onChange={(e) => handlePercentageChange(segment, e.target.value, setAccountSegments)}
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
        Please select at least one account segment and ensure total percentage equals 100%.
      </Typography>
    )}
  </Accordion>
</Grid>


{/* Account Category Accordion */}
<Grid item xs={12} sx={{ mb: 2 }}>
  <Accordion expanded={expanded.accountCategory} onChange={() => handleToggleSection("accountCategory")}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="account-category-content" id="account-category-header">
      <Typography>Account Category</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {Object.keys(accountCategory).map((category) => (
        <Grid container alignItems="center" key={category} spacing={2}>
          <Grid item xs={1}>
            <Checkbox
              checked={accountCategory[category].selected}
              onChange={() => handleToggleSegment(category, setAccountCategory)}
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
              onChange={(e) => handlePercentageChange(category, e.target.value, setAccountCategory)}
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
        Please select at least one account category and ensure total percentage equals 100%.
      </Typography>
    )}
  </Accordion>
</Grid>


{/* Account Type Accordion */}
<Grid item xs={12} sx={{ mb: 2 }}>
  <Accordion expanded={expanded.accountType} onChange={() => handleToggleSection("accountType")}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="account-type-content" id="account-type-header">
      <Typography>Greenfield Status</Typography>
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
              onChange={(e) => handlePercentageChange(type, e.target.value, setAccountType)}
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
        Please select at least one account type and ensure total percentage equals 100%.
      </Typography>
    )}
  </Accordion>
</Grid>


{/* Product Alignment Accordion */}
<Grid item xs={12} sx={{ mb: 2 }}>
  <Accordion expanded={expanded.productAlignment} onChange={() => handleToggleSection("productAlignment")}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="product-alignment-content" id="product-alignment-header">
      <Typography>Product Family</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {Object.keys(productAlignment).map((alignment) => (
        <Grid container alignItems="center" key={alignment} spacing={2}>
          <Grid item xs={1}>
            <Checkbox
              checked={productAlignment[alignment].selected}
              onChange={() => handleToggleSegment(alignment, setProductAlignment)}
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
              onChange={(e) => handlePercentageChange(alignment, e.target.value, setProductAlignment)}
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
        Please select at least one product alignment and ensure total percentage equals 100%.
      </Typography>
    )}
  </Accordion>
</Grid>

{/* AI vs Core Accordion */}
<Grid item xs={12} sx={{ mb: 2 }}>
  <Accordion expanded={expanded.aiVsCore} onChange={() => handleToggleSection("aiVsCore")}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="ai-vs-core-content" id="ai-vs-core-header">
      <Typography>AI vs Core</Typography>
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
            <Typography variant="subtitle1">People Meeting the Audience Criteria</Typography>
            
            <TextField
              type="number"
              value={peopleMeetingCriteria}
              onChange={(e) => setPeopleMeetingCriteria(e.target.value)}
              fullWidth
              disabled
              InputProps={{
                style: {
                  backgroundColor: '#e0e0e0', // Light grey background color to indicate disabled state
                },
              }}
            />
            <Button
              variant="outlined"
              onClick={handleCalculateAudience}
              style={{
                backgroundColor: blue[500],  // Google blue color
                color: "white",              // White text
                float: "left",
                margin: "10px 0",
              }}
            >
              Calculate the audience
            </Button>
          </Grid>

          {/* Validation & Save Buttons */}
          {!isFormValid && (
            <Typography color="error" style={{ marginBottom: "10px" }}>
              Please fill in all required fields.
            </Typography>
          )}

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
                float: "left",
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
