import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import {
  subRegionOptions,
  regionOptions,
  countryOptions,
  gepOptions,
  accountSectorOptions,
  accountSegmentOptions,
  buyerSegmentRollupOptions,
  productFamilyOptions,
  industryOptions,
  partnerEventOptions,
  draftStatusOptions,
  programNameOptions,
  eventTypeOptions,
  newlyCreatedOptions,
} from "./filters/FiltersData";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
  Typography,
  IconButton,
  Chip,
  TextField,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { blue } from "@mui/material/colors";
import { sendFilterDataToAPI } from "../api/pushFiltersConfig";
import { getFilterDataFromAPI } from "../api/getFilterData";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { deleteFilterDataFromAPI } from "../api/deleteFilterData";
import { getOrganisedBy } from "../api/getOrganisedBy";

export default function Filters() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [localProgramNameOptions, setLocalProgramNameOptions] = useState(
    programNameOptions.map((option) => ({ label: option, checked: false }))
  );

  const [localSubRegionFilters, setLocalSubRegionFilters] = useState(
    subRegionOptions.map((option) => ({ label: option, checked: false }))
  );
  const [localGepOptions, setLocalGepOptions] = useState(
    gepOptions.map((option) => ({ label: option, checked: false }))
  );
  const [localAccountSectorOptions, setLocalAccountSectorOptions] = useState(
    accountSectorOptions.map((option) => ({
      label: option.label, // Display this in the UI
      value: option.value, // Use this for logic
      checked: option.checked, // Initial checked state
    }))
  );
  
  
  const [localAccountSegmentOptions, setLocalAccountSegmentOptions] = useState(
    accountSegmentOptions
  );
  const [localBuyerSegmentRollupOptions, setLocalBuyerSegmentRollupOptions] =
    useState(buyerSegmentRollupOptions);
  const [localProductFamilyOptions, setLocalProductFamilyOptions] =
    useState(productFamilyOptions);
  const [localIndustryOptions, setLocalIndustryOptions] = useState(
    industryOptions.map((option) => ({ label: option, checked: false }))
  );
  const [localPartnerEventOptions, setLocalPartnerEventOptions] =
    useState(partnerEventOptions);
  const [localDraftStatusOptions, setLocalDraftStatusOptions] =
    useState(draftStatusOptions);
  const [localRegionOptions, setLocalRegionOptions] = useState(
    regionOptions.map((option) => ({ label: option, checked: false }))
  );

  const [localCountryOptions, setLocalCountryOptions] = useState(
    countryOptions
      .map((option) => ({ label: option, checked: false }))
      .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically by label
  );
  const [localNewlyCreatedOptions, setLocalNewlyCreatedOptions] = useState(
    newlyCreatedOptions.map((option) => ({ ...option }))
  );

  const [refresh, setRefresh] = useState(false);

  //Organised by

  const [organisedByOptions, setOrganisedByOptions] = useState(); // Default to an empty array
  const [selectedOrganiser, setSelectedOrganiser] = useState(); // Default to an empty array for multi-select
  const [isOrganisedByExpanded, setIsOrganisedByExpanded] = useState(false);

  useEffect(() => {
    const fetchOrganisedBy = async () => {
      try {
        const data = await getOrganisedBy();
  
        // Ensure `data` is an array
        if (Array.isArray(data)) {
          const flattenedData = data.map((item) => item.organisedBy[0]); // Flatten organisedBy arrays
          
          setOrganisedByOptions(flattenedData);
        } else {
        }
      } catch (error) {
        console.error("Failed to fetch OrganisedBy options:", error);
      }
    };
  
    fetchOrganisedBy();
  }, []);
  

  const handleOrganiserChange = (event, newValue) => {
    setSelectedOrganiser(newValue.length ? newValue : null); // Set to null if no value is selected
    
  };
  

  //Accordions
  const [isSubRegionExpanded, setIsSubRegionExpanded] = useState(false);
  const [isCustomFiltersExpanded, setIsCustomFiltersExpanded] = useState(false);
  const [isRegionExpanded, setIsRegionExpanded] = useState(false);
  const [isCountryExpanded, setIsCountryExpanded] = useState(false);

  const [isGepExpanded, setIsGepExpanded] = useState(false);
  const [isActivityTypeExpanded, setIsActivityTypeExpanded] = useState(false);

  const [isAccountSectorExpanded, setIsAccountSectorExpanded] = useState(false);
  const [isAccountSegmentExpanded, setIsAccountSegmentExpanded] =
    useState(false);
  const [isBuyerSegmentRollupExpanded, setIsBuyerSegmentRollupExpanded] =
    useState(false);
  const [isProductFamilyExpanded, setIsProductFamilyExpanded] = useState(false);
  const [isIndustryExpanded, setIsIndustryExpanded] = useState(false);
  const [isPartnerEventExpanded, setIsPartnerEventExpanded] = useState(false);
  const [isDraftStatusExpanded, setIsDraftStatusExpanded] = useState(false);
  const [isProgramNameExpanded, setIsProgramNameExpanded] = useState(false);
  const [isNewlyCreatedExpanded, setIsNewlyCreatedExpanded] = useState(false);

  const [localActivityTypeOptions, setLocalActivityTypeOptions] = useState(
    eventTypeOptions.map((option) => ({
      label: option.label,
      checked:false,
    }))
  );

  //Custom filters state
  const [customFilterName, setCustomFilterName] = useState("");
  const [savedFilters, setSavedFilters] = useState([]);

  const { updateFilters } = useContext(GlobalContext);

  const clearAllFilters = () => {
    setLocalRegionOptions(
      localRegionOptions.map((filter) => ({ ...filter, checked: false }))
    );
    setLocalSubRegionFilters(
      localSubRegionFilters.map((filter) => ({ ...filter, checked: false }))
    );
    setLocalCountryOptions(
      localCountryOptions.map((filter) => ({ ...filter, checked: false }))
    );
    setLocalGepOptions(
      localGepOptions.map((option) => ({ ...option, checked: false }))
    );
    setLocalProgramNameOptions(
      localProgramNameOptions.map((option) => ({ ...option, checked: false }))
    );
    setLocalAccountSectorOptions(
      localAccountSectorOptions.map((option) => ({ ...option, checked: false }))
    );
    setLocalActivityTypeOptions(
      localActivityTypeOptions.map((option) => ({ ...option, checked: false }))
    );
    setLocalAccountSegmentOptions(
      localAccountSegmentOptions.map((option) => ({
        ...option,
        checked: false,
      }))
    );
    setLocalBuyerSegmentRollupOptions(
      localBuyerSegmentRollupOptions.map((option) => ({
        ...option,
        checked: false,
      }))
    );
    setLocalProductFamilyOptions(
      localProductFamilyOptions.map((option) => ({ ...option, checked: false }))
    );

    setLocalIndustryOptions(
      localIndustryOptions.map((option) => ({ ...option, checked: false }))
    );
    setLocalPartnerEventOptions(
      localPartnerEventOptions.map((option) => ({ ...option, checked: false }))
    );
    setLocalDraftStatusOptions(
      localDraftStatusOptions.map((option) => ({ ...option, checked: false }))
    );
    setSelectedOrganiser(null);
  };

  const selectAllFilters = () => {
    setLocalRegionOptions(
      localRegionOptions.map((filter) => ({ ...filter, checked: true }))
    );
    setLocalSubRegionFilters(
      localSubRegionFilters.map((filter) => ({ ...filter, checked: true }))
    );
    setLocalCountryOptions(
      localCountryOptions.map((filter) => ({ ...filter, checked: true }))
    );
    setLocalGepOptions(
      localGepOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalProgramNameOptions(
      localProgramNameOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalActivityTypeOptions(
      localActivityTypeOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalAccountSectorOptions(
      localAccountSectorOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalAccountSegmentOptions(
      localAccountSegmentOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalBuyerSegmentRollupOptions(
      localBuyerSegmentRollupOptions.map((option) => ({
        ...option,
        checked: true,
      }))
    );
    setLocalProductFamilyOptions(
      localProductFamilyOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalIndustryOptions(
      localIndustryOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalPartnerEventOptions(
      localPartnerEventOptions.map((option) => ({ ...option, checked: true }))
    );
    setLocalDraftStatusOptions(
      localDraftStatusOptions.map((option) => ({ ...option, checked: true }))
    );
  };

  const handleFilterChange = (setFilterState, value, isAccountSector = false) => {
    setFilterState((prevFilters) =>
      prevFilters.map((filter) =>
        isAccountSector
          ? filter.value === value
            ? { ...filter, checked: !filter.checked }
            : filter
          : filter.label === value 
          ? { ...filter, checked: !filter.checked }
          : filter
      )
    );
    
    forceRefresh();
  };
  

  const forceRefresh = () => {
    setRefresh(!refresh);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    updateFilters({
      regions: localRegionOptions,
      subRegions: localSubRegionFilters,
      countries: localCountryOptions,
      gep: localGepOptions,
      programName: localProgramNameOptions,
      activityType: localActivityTypeOptions,

      accountSectors: localAccountSectorOptions,
      accountSegments: localAccountSegmentOptions,
      buyerSegmentRollup: localBuyerSegmentRollupOptions,
      productFamily: localProductFamilyOptions,
      industry: localIndustryOptions,
      partnerEvent: localPartnerEventOptions,
      draftStatus: localDraftStatusOptions,
      newlyCreated: localNewlyCreatedOptions,
      organisedBy: selectedOrganiser,
    });
  }, [
    localRegionOptions,
    localSubRegionFilters,
    localCountryOptions,
    localGepOptions,
    localProgramNameOptions,
    localActivityTypeOptions,
    localAccountSectorOptions,
    localAccountSegmentOptions,
    localBuyerSegmentRollupOptions,
    localProductFamilyOptions,
    localIndustryOptions,
    localPartnerEventOptions,
    localDraftStatusOptions,
    localNewlyCreatedOptions,
    selectedOrganiser,
    updateFilters,
  ]);

  const [selectedOrganisers, setSelectedOrganisers] = useState([]); // For multi-select

  const renderOrganisedBySection = (
    title,
    options = [],
    selectedOptions = [],
    onOptionsChange,
    expanded,
    setExpanded
  ) => (
    <div className="mb-4">
      <div
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer flex items-center"
      >
        <Typography variant="subtitle2" className="mr-2">
          {title}
        </Typography>
        {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </div>
      {expanded && (
        <div className="mt-3">
          <Autocomplete
            options={options || []} // Ensure options are always an array
            multiple
            value={selectedOptions || []} // Ensure selectedOptions are always an array
            onChange={(event, newValue) => onOptionsChange(newValue)}
            renderTags={() => null} // Chips will be rendered separately
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Type or select organisers"
              />
            )}
            sx={{ width: "100%" }}
          />
          {selectedOptions && selectedOptions.length > 0 && ( // Render chips only when there are selected options
            <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1, gap: 1 }}>
              {selectedOptions.map((organiser, index) => (
                <Chip
                  key={index}
                  label={organiser}
                  onDelete={() =>
                    onOptionsChange(
                      selectedOptions.filter((item) => item !== organiser)
                    )
                  }
                  sx={{
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    fontSize: "12px",
                    height: "24px",
                  }}
                />
              ))}
            </Box>
          )}
        </div>
      )}
    </div>
  );
  
  

  

  const renderFilterSection = (
    title,
    filters,
    setFilterState,
    expanded,
    setExpanded,
    isAccountSector = false
  ) => (
    <div className="mb-4">
      <div
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer flex items-center"
      >
        <Typography variant="subtitle2" className="mr-2">
          {title}
        </Typography>
        {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </div>
      {expanded &&
        filters.map(({ label, value, checked }, idx) => (
          <label key={idx} className="items-center mt-3 block">
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                handleFilterChange(setFilterState, isAccountSector ? value : label, isAccountSector)
              }
              className="form-checkbox h-5 w-5 rounded focus:ring-0 cursor-pointer"
            />
            <span className="ml-2 text-gray-700 capitalize text-xs">
              {label}
            </span>
          </label>
        ))}
    </div>
  );
  

  const handleDeleteFilter = async (filterName) => {
    try {
      // Get the ldap value (you can adjust this if ldap is stored elsewhere)
      const ldap = getUserLdap(); // Ensure `getUserLdap` is defined and returns the LDAP

      // Call delete API with both filterName and ldap
      await deleteFilterDataFromAPI(filterName, ldap);

      // Remove filter from the local savedFilters state
      const updatedFilters = savedFilters.filter(
        (filter) => filter.filterName !== filterName
      );
      setSavedFilters(updatedFilters);
      showSnackbar("Filter deleted successfully!");
    } catch (error) {
      console.error("Error deleting filter:", error);
    }
  };

  const filterByNewlyCreated = (events) => {
    const selectedOptions = localNewlyCreatedOptions
      .filter((option) => option.checked)
      .map((option) => option.value);

    if (selectedOptions.length === 0) return events; // No filter applied

    return events.filter((event) => {
      const entryCreatedDate = new Date(event.entryCreatedDate); // Adjust based on your date format
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const isNewlyCreated = entryCreatedDate >= twoWeeksAgo;
      return selectedOptions.includes(isNewlyCreated);
    });
  };

  const getUserLdap = () => {
    const userData = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user")
    );

    if (userData && userData.emails && userData.emails[0].value) {
      const email = userData.emails[0].value;
      return email.split("@")[0];
    }
    throw new Error("No user data found in local storage or session storage");
  };

  useEffect(() => {
    // Function to fetch and set saved filters
    const fetchSavedFilters = async () => {
      try {
        const ldap = getUserLdap();
        const filters = await getFilterDataFromAPI(ldap);
        if (filters) {
          setSavedFilters(filters);
        }
      } catch (error) {
        console.error("Error fetching saved filters:", error);
      }
    };

    fetchSavedFilters();
  }, []);

  const handleSaveFilter = () => {
    const ldap = getUserLdap();

    // Check if LDAP retrieval was successful
    if (ldap.startsWith("Error:")) {
      console.error(ldap);
      return;
    }

    if (customFilterName.trim()) {
      const filterData = {
        ldap: ldap, // Replace with actual LDAP or user identifier if available
        filterName: customFilterName.trim(), // Top-level filterName field
        config: [
          {
            regions: localRegionOptions.map(({ label, checked }) => ({
              label,
              checked,
            })),
            subRegions: localSubRegionFilters.map(({ label, checked }) => ({
              label,
              checked,
            })),
            countries: localCountryOptions.map(({ label, checked }) => ({
              label,
              checked,
            })),
            gep: localGepOptions.map(({ label, checked }) => ({
              label,
              checked,
            })),
            programName: localProgramNameOptions.map(({ label, checked }) => ({
              label,
              checked,
            })),
            accountSectors: localAccountSectorOptions.map(({ value, checked }) => ({
              value,
              checked,
            })),
            accountSegments: localAccountSegmentOptions.map(
              ({ label, checked }) => ({ label, checked })
            ),
            buyerSegmentRollup: localBuyerSegmentRollupOptions.map(
              ({ label, checked }) => ({ label, checked })
            ),
            productFamily: localProductFamilyOptions.map(
              ({ label, checked }) => ({ label, checked })
            ),
            industry: localIndustryOptions.map(({ label, checked }) => ({
              label,
              checked,
            })),
            partnerEvent: localPartnerEventOptions.map(
              ({ label, checked }) => ({ label, checked })
            ),
            draftStatus: localDraftStatusOptions.map(({ label, checked }) => ({
              label,
              checked,
            })),
            activityType: localActivityTypeOptions.map(
              ({ label, checked }) => ({
                label,
                checked,
              })
            ),
            organisedBy: selectedOrganiser,
          },
        ],
      };

      // Send the formatted filter data to the backend
      sendFilterDataToAPI(filterData);

      // Add the filter to the local savedFilters state
      setSavedFilters([
        ...savedFilters,
        { filterName: customFilterName.trim(), config: filterData.config },
      ]);
      setCustomFilterName("");
      showSnackbar("Filter saved successfully!");
    }
  };

  const handleChipClick = (config) => {

    applyFilterConfig(config);
  };

  const applyFilterConfig = (config) => {
    if (!config || !Array.isArray(config)) {
      console.error("applyFilterConfig: Received undefined or invalid config.");
      return;
    }

    const organisedBy = config[0]?.organisedBy || null;

    // Apply the filter configuration to update the checked states with detailed logging
    const updatedSubRegionFilters = localSubRegionFilters.map((filter) => {
      const match = config[0]?.subRegions?.find((item) => {
        if (!item) {
          return false;
        }
        return (
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
        );
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });

    const updatedGepOptions = localGepOptions.map((filter) => {
      const match = config[0]?.gep?.find((item) => {
        if (!item) {
          return false;
        }
        return (
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
        );
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });

    const updatedProgramNameOptions = localProgramNameOptions.map((filter) => {
      const match = config[0]?.programName?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    const updatedActivityTypeOptions = localActivityTypeOptions.map(
      (filter) => {
        const match = config[0]?.activityType?.find(
          (item) =>
            item.label.trim().toLowerCase() ===
            filter.label.trim().toLowerCase()
        );
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );
    setLocalActivityTypeOptions(updatedActivityTypeOptions);

    const updatedAccountSectorOptions = localAccountSectorOptions.map(
      (filter) => {
        const match = config[0]?.accountSectors?.find((item) => {
          if (!item) {
            return false;
          }
          return (
            item.label.trim().toLowerCase() ===
            filter.label.trim().toLowerCase()
          );
        });
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );

    const updatedRegionOptions = localRegionOptions.map((filter) => {
      const match = config[0]?.regions?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    const updatedCountryOptions = localCountryOptions.map((filter) => {
      const match = config[0]?.countries?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    const updatedAccountSegmentOptions = localAccountSegmentOptions.map(
      (filter) => {
        const match = config[0]?.accountSegments?.find((item) => {
          if (!item) {
            return false;
          }
          return (
            item.label.trim().toLowerCase() ===
            filter.label.trim().toLowerCase()
          );
        });
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );

    const updatedBuyerSegmentRollupOptions = localBuyerSegmentRollupOptions.map(
      (filter) => {
        const match = config[0]?.buyerSegmentRollup?.find((item) => {
          if (!item) {
            return false;
          }
          return (
            item.label.trim().toLowerCase() ===
            filter.label.trim().toLowerCase()
          );
        });
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );

    const updatedProductFamilyOptions = localProductFamilyOptions.map(
      (filter) => {
        const match = config[0]?.productFamily?.find((item) => {
          if (!item) {
            return false;
          }
          return (
            item.label.trim().toLowerCase() ===
            filter.label.trim().toLowerCase()
          );
        });
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );

    const updatedIndustryOptions = localIndustryOptions.map((filter) => {
      const match = config[0]?.industry?.find((item) => {
        if (!item) {
          return false;
        }
        return (
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
        );
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });

    const updatedPartnerEventOptions = localPartnerEventOptions.map(
      (filter) => {
        const match = config[0]?.partnerEvent?.find((item) => {
          if (!item) {
            return false;
          }
          return (
            item.label.trim().toLowerCase() ===
            filter.label.trim().toLowerCase()
          );
        });
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );

    const updatedDraftStatusOptions = localDraftStatusOptions.map((filter) => {
      const match = config[0]?.draftStatus?.find((item) => {
        if (!item) {
          return false;
        }
        return (
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
        );
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Update states to trigger re-render with checked options
    setLocalRegionOptions(updatedRegionOptions);
    setLocalCountryOptions(updatedCountryOptions);
    setLocalSubRegionFilters(updatedSubRegionFilters);
    setLocalGepOptions(updatedGepOptions);
    setLocalProgramNameOptions(updatedProgramNameOptions);
    setLocalAccountSectorOptions(updatedAccountSectorOptions);
    setLocalAccountSegmentOptions(updatedAccountSegmentOptions);
    setLocalBuyerSegmentRollupOptions(updatedBuyerSegmentRollupOptions);
    setLocalProductFamilyOptions(updatedProductFamilyOptions);
    setLocalIndustryOptions(updatedIndustryOptions);
    setLocalPartnerEventOptions(updatedPartnerEventOptions);
    setLocalDraftStatusOptions(updatedDraftStatusOptions);
    setSelectedOrganiser(organisedBy);

    // Trigger a UI refresh to reflect changes
    forceRefresh();
  };

  return (
    <div className="mt-4">
      {/* <div>
        <IconButton
          aria-label="select all"
          onClick={selectAllFilters}
          size="small"
          style={{ color: '#1976d2' }} // Google's blue color
        >
          <DoneAllIcon style={{ fontSize: '20px', marginLeft: '0px' }} />
        </IconButton>
        <button style={{ fontSize: '14px', background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }} onClick={selectAllFilters}>
          Select all filters
        </button>
      </div> */}
      <Accordion
        expanded={isCustomFiltersExpanded}
        onChange={() => setIsCustomFiltersExpanded(!isCustomFiltersExpanded)}
        sx={{
          borderRadius: "6px",
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e0e0e0",
          marginBottom: "4px",
          minHeight: "24px",
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon sx={{ color: blue[500], fontSize: "14px" }} />
          }
          aria-controls="custom-filters-content"
          id="custom-filters-header"
          sx={{
            backgroundColor: "#e8f0fe",
            padding: "2px 8px",
            borderRadius: "6px",
            minHeight: "24px", // Set a fixed minHeight
            height: "24px", // Force a fixed height
            maxHeight: "24px", // Ensure it doesn't expand
            "& .MuiAccordionSummary-content": {
              margin: 0,
              fontSize: "12px",
              display: "flex", // Center content vertically
              alignItems: "center",
            },
            "&.Mui-expanded": {
              // Prevent expansion in expanded state
              minHeight: "24px",
              height: "24px",
            },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              display: "flex",
              alignItems: "center",
              color: blue[500],
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            Save your Filter View
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: "4px 8px" }}>
          {/* Custom Filter Input */}
          <Box
            sx={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <TextField
              fullWidth
              label="Name of your Filter View"
              value={customFilterName}
              onChange={(e) => setCustomFilterName(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                fontSize: "10px",
                height: "30px",
                "& .MuiOutlinedInput-root": {
                  height: "30px",
                  "& input": {
                    height: "18px",
                    padding: "0 8px",
                    fontSize: "10px",
                    outline: "none", // Remove default outline
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1a73e8", // Customize border color when focused
                    borderWidth: "1px", // Optional: Make the border thinner
                  },
                },
              }}
              // InputProps={{ style: { fontSize: "10px", padding: "4px 8px" } }}
              InputLabelProps={{
                shrink: false, // Disable label shrink on input
                style: {
                  fontSize: "10px",
                  top: "-6px",
                  visibility: customFilterName ? "hidden" : "visible", // Hide label when input is not empty
                },
              }}
            />
            <IconButton
              aria-label="save filter"
              onClick={handleSaveFilter}
              sx={{ color: blue[500], fontSize: "14px" }}
            >
              <DoneAllIcon sx={{ fontSize: "14px" }} />
            </IconButton>
            <IconButton
              aria-label="clear filter name"
              onClick={() => setCustomFilterName("")}
              sx={{ color: "#d32f2f", fontSize: "14px" }}
            >
              <ClearIcon sx={{ fontSize: "14px" }} />
            </IconButton>
          </Box>

          {/* Saved Filters */}
          <Divider sx={{ marginY: "4px" }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {savedFilters.length > 0 ? (
              savedFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={filter.filterName || "Unnamed Filter"} // Display a fallback if filterName is missing
                  onClick={() => handleChipClick(filter.config)}
                  onDelete={() => handleDeleteFilter(filter.filterName)}
                  sx={{
                    backgroundColor: "#e0f7fa",
                    color: "#00796b",
                    fontSize: "10px",
                    height: "20px",
                  }}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ fontSize: "10px" }}
              >
                No saved filters
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <div>
        <IconButton
          aria-label="clear all"
          onClick={clearAllFilters}
          size="small"
          style={{ color: "#d32f2f" }} // Google's red color
        >
          <ClearIcon style={{ fontSize: "20px" }} />
        </IconButton>
        <button
          style={{
            fontSize: "14px",
            background: "none",
            border: "none",
            padding: 0,
            color: "inherit",
            cursor: "pointer",
          }}
          onClick={clearAllFilters}
        >
          Clear all filters
        </button>
      </div>
      <hr style={{ margin: "8px 0", border: 0 }} />

      {renderFilterSection(
        "Region",
        localRegionOptions,
        setLocalRegionOptions,
        isRegionExpanded,
        setIsRegionExpanded
      )}

      {renderFilterSection(
        "Sub-Region",
        localSubRegionFilters,
        setLocalSubRegionFilters,
        isSubRegionExpanded,
        setIsSubRegionExpanded
      )}

      {/* Render the "Country" filter section */}
      {renderFilterSection(
        "Country",
        localCountryOptions,
        setLocalCountryOptions,
        isCountryExpanded,
        setIsCountryExpanded
      )}

{renderFilterSection(
  "Account Sector",
  localAccountSectorOptions,
  (value) => handleFilterChange(setLocalAccountSectorOptions, value, true), // Pass the flag
  isAccountSectorExpanded,
  setIsAccountSectorExpanded
)}

      {renderFilterSection(
        "Account Segment",
        localAccountSegmentOptions,
        setLocalAccountSegmentOptions,
        isAccountSegmentExpanded,
        setIsAccountSegmentExpanded
      )}
      {renderFilterSection(
        "Industry",
        localIndustryOptions,
        setLocalIndustryOptions,
        isIndustryExpanded,
        setIsIndustryExpanded
      )}

      {renderFilterSection(
        "Buyer Segment Rollup",
        localBuyerSegmentRollupOptions,
        setLocalBuyerSegmentRollupOptions,
        isBuyerSegmentRollupExpanded,
        setIsBuyerSegmentRollupExpanded
      )}
      {renderFilterSection(
        "Product Family",
        localProductFamilyOptions,
        setLocalProductFamilyOptions,
        isProductFamilyExpanded,
        setIsProductFamilyExpanded
      )}

      {renderFilterSection(
        "Solution",
        localGepOptions,
        setLocalGepOptions,
        isGepExpanded,
        setIsGepExpanded
      )}

      {renderFilterSection(
        "Program",
        localProgramNameOptions,
        setLocalProgramNameOptions,
        isProgramNameExpanded,
        setIsProgramNameExpanded
      )}

      {renderFilterSection(
        "Activity Type",
        localActivityTypeOptions,
        setLocalActivityTypeOptions,
        isActivityTypeExpanded, // You'll define this state below
        setIsActivityTypeExpanded
      )}

      {renderOrganisedBySection(
        "Organised By",
        organisedByOptions,
        selectedOrganiser,
        (newValue) => {
          setSelectedOrganiser(newValue); // Update the selected organiser
          
        },
        isOrganisedByExpanded,
        setIsOrganisedByExpanded
      )}

      {renderFilterSection(
        "Is Partner Involved?",
        localPartnerEventOptions,
        setLocalPartnerEventOptions,
        isPartnerEventExpanded,
        setIsPartnerEventExpanded
      )}
      {renderFilterSection(
        "Is Draft?",
        localDraftStatusOptions,
        setLocalDraftStatusOptions,
        isDraftStatusExpanded,
        setIsDraftStatusExpanded
      )}
      {renderFilterSection(
        "Is Newly Created?",
        localNewlyCreatedOptions,
        setLocalNewlyCreatedOptions,
        isNewlyCreatedExpanded, // You can manage accordion expansion states
        setIsNewlyCreatedExpanded
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
