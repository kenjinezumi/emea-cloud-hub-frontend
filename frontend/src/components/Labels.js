import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import {
  subRegionOptions,
  gepOptions,
  accountSectorOptions,
  accountSegmentOptions,
  buyerSegmentRollupOptions,
  productFamilyOptions,
  industryOptions,
  partnerEventOptions,
  draftStatusOptions,
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
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { blue } from "@mui/material/colors";
import { sendFilterDataToAPI } from "../api/pushFiltersConfig";
import { getFilterDataFromAPI } from "../api/getFilterData";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { deleteFilterDataFromAPI} from "../api/deleteFilterData";
export default function Filters() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [localSubRegionFilters, setLocalSubRegionFilters] = useState(
    subRegionOptions.map((option) => ({ label: option, checked: false }))
  );
  const [localGepOptions, setLocalGepOptions] = useState(
    gepOptions.map((option) => ({ label: option, checked: false }))
  );
  const [localAccountSectorOptions, setLocalAccountSectorOptions] =
    useState(accountSectorOptions);
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

    const [refresh, setRefresh] = useState(false);


  //Accordions
  const [isSubRegionExpanded, setIsSubRegionExpanded] = useState(false);
  const [isCustomFiltersExpanded, setIsCustomFiltersExpanded] = useState(false);

  const [isGepExpanded, setIsGepExpanded] = useState(false);
  const [isAccountSectorExpanded, setIsAccountSectorExpanded] = useState(false);
  const [isAccountSegmentExpanded, setIsAccountSegmentExpanded] =
    useState(false);
  const [isBuyerSegmentRollupExpanded, setIsBuyerSegmentRollupExpanded] =
    useState(false);
  const [isProductFamilyExpanded, setIsProductFamilyExpanded] = useState(false);
  const [isIndustryExpanded, setIsIndustryExpanded] = useState(false);
  const [isPartnerEventExpanded, setIsPartnerEventExpanded] = useState(false);
  const [isDraftStatusExpanded, setIsDraftStatusExpanded] = useState(false);

  //Custom filters state
  const [customFilterName, setCustomFilterName] = useState("");
  const [savedFilters, setSavedFilters] = useState([]);

  const { updateFilters } = useContext(GlobalContext);

  const clearAllFilters = () => {
    setLocalSubRegionFilters(
      localSubRegionFilters.map((filter) => ({ ...filter, checked: false }))
    );
    setLocalGepOptions(
      localGepOptions.map((option) => ({ ...option, checked: false }))
    );
    setLocalAccountSectorOptions(
      localAccountSectorOptions.map((option) => ({ ...option, checked: false }))
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
  };

  const selectAllFilters = () => {
    setLocalSubRegionFilters(
      localSubRegionFilters.map((filter) => ({ ...filter, checked: true }))
    );
    setLocalGepOptions(
      localGepOptions.map((option) => ({ ...option, checked: true }))
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

  const handleFilterChange = (setFilterState, label) => {
    setFilterState((prevFilters) =>
      prevFilters.map((filter) =>
        filter.label === label
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
      subRegions: localSubRegionFilters,
      gep: localGepOptions,
      accountSectors: localAccountSectorOptions,
      accountSegments: localAccountSegmentOptions,
      buyerSegmentRollup: localBuyerSegmentRollupOptions,
      productFamily: localProductFamilyOptions,
      industry: localIndustryOptions,
      partnerEvent: localPartnerEventOptions,
      draftStatus: localDraftStatusOptions,
    });
  }, [
    localSubRegionFilters,
    localGepOptions,
    localAccountSectorOptions,
    localAccountSegmentOptions,
    localBuyerSegmentRollupOptions,
    localProductFamilyOptions,
    localIndustryOptions,
    localPartnerEventOptions,
    localDraftStatusOptions,
    updateFilters,
  ]);

  const renderFilterSection = (
    title,
    filters,
    setFilterState,
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
      {expanded &&
        filters.map(({ label, checked }, idx) => (
          <label key={idx} className="items-center mt-3 block">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => handleFilterChange(setFilterState, label)}
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
      const updatedFilters = savedFilters.filter(filter => filter.filterName !== filterName);
      setSavedFilters(updatedFilters);
      showSnackbar("Filter deleted successfully!");

    } catch (error) {
      console.error("Error deleting filter:", error);
    }
  };
  
  

  const getUserLdap = () => {
    const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    
    if (userData && userData.emails && userData.emails[0].value) {
      const email = userData.emails[0].value;
      return email.split('@')[0];
    }
      throw new Error('No user data found in local storage or session storage');
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
    if (ldap.startsWith('Error:')) {
      console.error(ldap);
      return;
    }
  
    if (customFilterName.trim()) {
      const filterData = {
        ldap: ldap, // Replace with actual LDAP or user identifier if available
        filterName: customFilterName.trim(), // Top-level filterName field
        config: [
          {
            subRegions: localSubRegionFilters.map(({ label, checked }) => ({ label, checked })),
            gep: localGepOptions.map(({ label, checked }) => ({ label, checked })),
            accountSectors: localAccountSectorOptions.map(({ label, checked }) => ({ label, checked })),
            accountSegments: localAccountSegmentOptions.map(({ label, checked }) => ({ label, checked })),
            buyerSegmentRollup: localBuyerSegmentRollupOptions.map(({ label, checked }) => ({ label, checked })),
            productFamily: localProductFamilyOptions.map(({ label, checked }) => ({ label, checked })),
            industry: localIndustryOptions.map(({ label, checked }) => ({ label, checked })),
            partnerEvent: localPartnerEventOptions.map(({ label, checked }) => ({ label, checked })),
            draftStatus: localDraftStatusOptions.map(({ label, checked }) => ({ label, checked })),
          },
        ],
      };
  
      // Send the formatted filter data to the backend
      sendFilterDataToAPI(filterData);
  
      // Add the filter to the local savedFilters state
      setSavedFilters([...savedFilters, { filterName: customFilterName.trim(), config: filterData.config }]);
      setCustomFilterName(''); 
      showSnackbar("Filter saved successfully!");

    }
  };
  
  const handleChipClick = (config) => {
    console.log("Applying filter config:", config);
    applyFilterConfig(config);
  };

  const applyFilterConfig = (config) => {
    if (!config || !Array.isArray(config)) {
      console.error("applyFilterConfig: Received undefined or invalid config.");
      return;
    }
  
    // Apply the filter configuration to update the checked states with detailed logging
    const updatedSubRegionFilters = localSubRegionFilters.map((filter) => {
      const match = config[0]?.subRegions?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedGepOptions = localGepOptions.map((filter) => {
      const match = config[0]?.gep?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedAccountSectorOptions = localAccountSectorOptions.map((filter) => {
      const match = config[0]?.accountSectors?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedAccountSegmentOptions = localAccountSegmentOptions.map((filter) => {
      const match = config[0]?.accountSegments?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedBuyerSegmentRollupOptions = localBuyerSegmentRollupOptions.map((filter) => {
      const match = config[0]?.buyerSegmentRollup?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedProductFamilyOptions = localProductFamilyOptions.map((filter) => {
      const match = config[0]?.productFamily?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedIndustryOptions = localIndustryOptions.map((filter) => {
      const match = config[0]?.industry?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedPartnerEventOptions = localPartnerEventOptions.map((filter) => {
      const match = config[0]?.partnerEvent?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    const updatedDraftStatusOptions = localDraftStatusOptions.map((filter) => {
      const match = config[0]?.draftStatus?.find((item) => {
        if (!item) {
          return false;
        }
        return item.label.trim().toLowerCase() === filter.label.trim().toLowerCase();
      });
      return match ? { ...filter, checked: match.checked } : filter;
    });
  
    // Update states to trigger re-render with checked options
    setLocalSubRegionFilters(updatedSubRegionFilters);
    setLocalGepOptions(updatedGepOptions);
    setLocalAccountSectorOptions(updatedAccountSectorOptions);
    setLocalAccountSegmentOptions(updatedAccountSegmentOptions);
    setLocalBuyerSegmentRollupOptions(updatedBuyerSegmentRollupOptions);
    setLocalProductFamilyOptions(updatedProductFamilyOptions);
    setLocalIndustryOptions(updatedIndustryOptions);
    setLocalPartnerEventOptions(updatedPartnerEventOptions);
    setLocalDraftStatusOptions(updatedDraftStatusOptions);
  
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
                '& .MuiOutlinedInput-root': {
                  height: '30px',
                  '& input': {
                    height: '18px',
                    padding: '0 8px',
                    fontSize: '10px',
                    outline: 'none', // Remove default outline
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1a73e8', // Customize border color when focused
                    borderWidth: '1px', // Optional: Make the border thinner
                  },
                },
              }}
              // InputProps={{ style: { fontSize: "10px", padding: "4px 8px" } }}
              InputLabelProps={{
                shrink: false, // Disable label shrink on input
                style: {
                  fontSize: '10px',
                  top: '-6px',
                  visibility: customFilterName ? 'hidden' : 'visible', // Hide label when input is not empty
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
        "Sub-Region",
        localSubRegionFilters,
        setLocalSubRegionFilters,
        isSubRegionExpanded,
        setIsSubRegionExpanded
      )}
      {renderFilterSection(
        "Account Sector",
        localAccountSectorOptions,
        setLocalAccountSectorOptions,
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
      <Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={handleSnackbarClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>
    </div>
    
  );
}
