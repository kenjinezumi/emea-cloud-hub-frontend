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
  partyTypeOptions
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
import DoneAllIcon from "@mui/icons-material/DoneAll";

import { sendFilterDataToAPI } from "../api/pushFiltersConfig";
import { getFilterDataFromAPI } from "../api/getFilterData";
import { deleteFilterDataFromAPI } from "../api/deleteFilterData";
import { getOrganisedBy } from "../api/getOrganisedBy";

export default function Filters() {
  // ─────────────────────────────────────────────────────────────────────────────
  // State: Snackbar
  // ─────────────────────────────────────────────────────────────────────────────
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // ─────────────────────────────────────────────────────────────────────────────
  // State: Refresh toggler
  // ─────────────────────────────────────────────────────────────────────────────
  const [refresh, setRefresh] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Retrieve from local storage (if exists)
  // ─────────────────────────────────────────────────────────────────────────────
  const persistedFilters =
    JSON.parse(localStorage.getItem("persistedFilters")) || {};

  // ─────────────────────────────────────────────────────────────────────────────
  // State: Named “saved filters”
  // ─────────────────────────────────────────────────────────────────────────────
  const [savedFilters, setSavedFilters] = useState([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // State: Each filter’s “checked” data
  // ─────────────────────────────────────────────────────────────────────────────
  const [localRegionOptions, setLocalRegionOptions] = useState(
    persistedFilters.regions ||
      regionOptions.map((option) => ({ label: option, checked: false }))
  );

  const [localSubRegionFilters, setLocalSubRegionFilters] = useState(
    persistedFilters.subRegions ||
      subRegionOptions.map((option) => ({ label: option, checked: false }))
  );

  const [localCountryOptions, setLocalCountryOptions] = useState(
    persistedFilters.countries ||
      countryOptions
        .map((option) => ({ label: option, checked: false }))
        .sort((a, b) => a.label.localeCompare(b.label))
  );

  const [localGepOptions, setLocalGepOptions] = useState(
    persistedFilters.gep ||
      gepOptions.map((option) => ({ label: option, checked: false }))
  );

  const [localProgramNameOptions, setLocalProgramNameOptions] = useState(
    persistedFilters.programName ||
      programNameOptions.map((option) => ({ label: option, checked: false }))
  );

  const [localAccountSectorOptions, setLocalAccountSectorOptions] = useState(
    persistedFilters.accountSectors ||
      accountSectorOptions.map((option) => ({
        label: option.label,
        value: option.value,
        checked: option.checked || false,
      }))
  );


const [localPartyTypeOptions, setLocalPartyTypeOptions] = useState(
  persistedFilters.partyType ||
    partyTypeOptions.map((option) => ({
      label: option.label, // or just `option`
      checked: false,
    }))
);

const [isPartyTypeExpanded, setIsPartyTypeExpanded] = useState(false);


  const [localAccountSegmentOptions, setLocalAccountSegmentOptions] = useState(
    persistedFilters.accountSegments || accountSegmentOptions
  );

  const [
    localBuyerSegmentRollupOptions,
    setLocalBuyerSegmentRollupOptions,
  ] = useState(
    persistedFilters.buyerSegmentRollup || buyerSegmentRollupOptions
  );

  const [localProductFamilyOptions, setLocalProductFamilyOptions] = useState(
    persistedFilters.productFamily || productFamilyOptions
  );

  const [localIndustryOptions, setLocalIndustryOptions] = useState(
    persistedFilters.industry ||
      industryOptions.map((option) => ({ label: option, checked: false }))
  );

  const [localPartnerEventOptions, setLocalPartnerEventOptions] = useState(
    persistedFilters.partnerEvent || partnerEventOptions
  );

  const [localDraftStatusOptions, setLocalDraftStatusOptions] = useState(
    persistedFilters.draftStatus || draftStatusOptions
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // “Newly Created” filters (2-weeks old or not)
  // ─────────────────────────────────────────────────────────────────────────────
  const [localNewlyCreatedOptions, setLocalNewlyCreatedOptions] = useState(
    persistedFilters.newlyCreated ||
      newlyCreatedOptions.map((option) => ({ ...option }))
  );

  const [localActivityTypeOptions, setLocalActivityTypeOptions] = useState(
    persistedFilters.activityType ||
      eventTypeOptions.map((option) => ({ label: option.label, checked: false }))
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Organised By: Store as an array for multi-select
  // ─────────────────────────────────────────────────────────────────────────────
  const [organisedByOptions, setOrganisedByOptions] = useState([]);
  // ADDED/RENAMED: Instead of a single “selectedOrganiser”, store an array
  const [selectedOrganisers, setSelectedOrganisers] = useState(
    persistedFilters.organisedBy || []
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch “Organised By” from API
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrganisedBy = async () => {
      try {
        const data = await getOrganisedBy();
        if (Array.isArray(data)) {
          // Flatten all sub-arrays into one array
          const flattened = data
            .flatMap((item) => item.organisedBy) // merges each 'organisedBy' array
            .filter(Boolean) // remove any empty or falsy values
            .sort((a, b) => a.localeCompare(b)); // sort alphabetically
  
          setOrganisedByOptions(flattened);
        }
      } catch (error) {
        console.error("Failed to fetch OrganisedBy options:", error);
      }
    };
    fetchOrganisedBy();
  }, []);
  

  // ─────────────────────────────────────────────────────────────────────────────
  // Controlled Autocomplete for “Organised By”
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOrganiserChange = (event, newValue) => {
    setSelectedOrganisers(newValue || []);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Accordion expansion states
  // ─────────────────────────────────────────────────────────────────────────────
  const [isSubRegionExpanded, setIsSubRegionExpanded] = useState(false);
  const [isCustomFiltersExpanded, setIsCustomFiltersExpanded] = useState(false);
  const [isRegionExpanded, setIsRegionExpanded] = useState(false);
  const [isCountryExpanded, setIsCountryExpanded] = useState(false);
  const [isGepExpanded, setIsGepExpanded] = useState(false);
  const [isActivityTypeExpanded, setIsActivityTypeExpanded] = useState(false);
  const [isAccountSectorExpanded, setIsAccountSectorExpanded] = useState(false);
  const [isAccountSegmentExpanded, setIsAccountSegmentExpanded] = useState(false);
  const [isBuyerSegmentRollupExpanded, setIsBuyerSegmentRollupExpanded] =
    useState(false);
  const [isProductFamilyExpanded, setIsProductFamilyExpanded] = useState(false);
  const [isIndustryExpanded, setIsIndustryExpanded] = useState(false);
  const [isPartnerEventExpanded, setIsPartnerEventExpanded] = useState(false);
  const [isDraftStatusExpanded, setIsDraftStatusExpanded] = useState(false);
  const [isProgramNameExpanded, setIsProgramNameExpanded] = useState(false);
  const [isNewlyCreatedExpanded, setIsNewlyCreatedExpanded] = useState(false);
  const [isOrganisedByExpanded, setIsOrganisedByExpanded] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Context: inform other components
  // ─────────────────────────────────────────────────────────────────────────────
  const { updateFilters } = useContext(GlobalContext);

  // ─────────────────────────────────────────────────────────────────────────────
  // Save filter states to localStorage whenever they change
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const filtersToPersist = {
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
      organisedBy: selectedOrganisers, 
      partyType: localPartyTypeOptions,

    };
    localStorage.setItem("persistedFilters", JSON.stringify(filtersToPersist));
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
    localPartyTypeOptions,
    selectedOrganisers,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Restore persisted filter states on first load
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const localPersisted = JSON.parse(localStorage.getItem("persistedFilters"));
    if (localPersisted) {
      // region
      setLocalRegionOptions(localPersisted.regions || localRegionOptions);
      // subregion
      setLocalSubRegionFilters(localPersisted.subRegions || localSubRegionFilters);
      // country
      setLocalCountryOptions(localPersisted.countries || localCountryOptions);
      // GEP
      setLocalGepOptions(localPersisted.gep || localGepOptions);
      // Program name
      setLocalProgramNameOptions(
        localPersisted.programName || localProgramNameOptions
      );
      // Activity type
      setLocalActivityTypeOptions(
        localPersisted.activityType || localActivityTypeOptions
      );
      // Account Sector
      setLocalAccountSectorOptions(
        localPersisted.accountSectors || localAccountSectorOptions
      );
      // Account Segment
      setLocalAccountSegmentOptions(
        localPersisted.accountSegments || localAccountSegmentOptions
      );
      // Buyer Segment
      setLocalBuyerSegmentRollupOptions(
        localPersisted.buyerSegmentRollup || localBuyerSegmentRollupOptions
      );
      // Product Family
      setLocalProductFamilyOptions(
        localPersisted.productFamily || localProductFamilyOptions
      );
      // Industry
      setLocalIndustryOptions(localPersisted.industry || localIndustryOptions);
      // Partner
      setLocalPartnerEventOptions(
        localPersisted.partnerEvent || localPartnerEventOptions
      );
      // Draft status
      setLocalDraftStatusOptions(
        localPersisted.draftStatus || localDraftStatusOptions
      );
      // Newly created
      setLocalNewlyCreatedOptions(
        localPersisted.newlyCreated || localNewlyCreatedOptions
      );
      // Organised By
      setSelectedOrganisers(localPersisted.organisedBy || []);
      // Party type 
      setLocalPartyTypeOptions(localPersisted.partyType || localPartyTypeOptions);

    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Clear and select all
  // ─────────────────────────────────────────────────────────────────────────────
  const clearAllFilters = () => {
    setLocalRegionOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalSubRegionFilters((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalCountryOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalGepOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalProgramNameOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalAccountSectorOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalActivityTypeOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalAccountSegmentOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalBuyerSegmentRollupOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalProductFamilyOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalIndustryOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalPartnerEventOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalDraftStatusOptions((prev) =>
      prev.map((option) => {
        // Optionally set default "Finalized"/"Invite available" = true, if desired
        if (option.label === "Finalized" || option.label === "Invite available") {
          return { ...option, checked: true };
        }
        return { ...option, checked: false };
      })
    );
    // Clear “Organised By”
    setSelectedOrganisers([]);
  };

  const selectAllFilters = () => {
    setLocalRegionOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalSubRegionFilters((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalCountryOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalGepOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalProgramNameOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalActivityTypeOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalAccountSectorOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalAccountSegmentOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalBuyerSegmentRollupOptions((prev) =>
      prev.map((f) => ({ ...f, checked: true }))
    );
    setLocalProductFamilyOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalIndustryOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalPartnerEventOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalDraftStatusOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    // If you want to also "select all" organisers, either do that here or just leave it
    // setSelectedOrganisers([...organisedByOptions]);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Helper for toggling filter checkboxes
  // ─────────────────────────────────────────────────────────────────────────────
  const forceRefresh = () => setRefresh((prev) => !prev);

  const handleFilterChange = (setFilterState, value, isAccountSector = false) => {
    setFilterState((prevFilters) =>
      prevFilters.map((filter) => {
        if (isAccountSector) {
          return filter.value === value
            ? { ...filter, checked: !filter.checked }
            : filter;
        }
        return filter.label === value
          ? { ...filter, checked: !filter.checked }
          : filter;
      })
    );
    forceRefresh();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Snackbar
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Update context whenever local filters change
  // ─────────────────────────────────────────────────────────────────────────────
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
      organisedBy: selectedOrganisers,
      partyType: localPartyTypeOptions,

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
    selectedOrganisers,
    localPartyTypeOptions,

    updateFilters,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render the multi-select “Organised By” section
  // ─────────────────────────────────────────────────────────────────────────────
  const renderOrganisedBySection = (
    title,
    options = [],
    selectedOptions = [],
    onOptionsChange,
    expanded,
    setExpanded
  ) => (
    <div className="mb-4">
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer flex items-center">
        <Typography variant="subtitle2" className="mr-2">
          {title}
        </Typography>
        {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </div>

      {expanded && (
        <div className="mt-3">
          <Autocomplete
            multiple
            options={options}
            value={selectedOptions}
            onChange={onOptionsChange}
            renderTags={() => null}
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

          {selectedOptions && selectedOptions.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1, gap: 1 }}>
              {selectedOptions.map((organiser, index) => (
                <Chip
                  key={index}
                  label={organiser}
                  onDelete={() =>
                    onOptionsChange(
                      null,
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Reusable render function for standard checkbox filters
  // ─────────────────────────────────────────────────────────────────────────────
  const renderFilterSection = (
    title,
    filters,
    setFilterState,
    expanded,
    setExpanded,
    isAccountSector = false
  ) => (
    <div className="mb-4">
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer flex items-center">
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
            <span className="ml-2 text-gray-700 capitalize text-xs">{label}</span>
          </label>
        ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete a saved filter
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDeleteFilter = async (filterName) => {
    try {
      const ldap = getUserLdap();
      await deleteFilterDataFromAPI(filterName, ldap);

      setSavedFilters((prev) => prev.filter((f) => f.filterName !== filterName));
      showSnackbar("Filter deleted successfully!");
    } catch (error) {
      console.error("Error deleting filter:", error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Get user LDAP from local/session storage
  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch saved filters on mount
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Saving a new named filter
  // ─────────────────────────────────────────────────────────────────────────────
  const [customFilterName, setCustomFilterName] = useState("");

  const handleSaveFilter = () => {
    const ldap = getUserLdap();
    if (!customFilterName.trim()) return;

    const filterData = {
      ldap,
      filterName: customFilterName.trim(),
      // The config is typically an array of objects in your schema
      config: [
        {
          regions: localRegionOptions.map(({ label, checked }) => ({ label, checked })),
          subRegions: localSubRegionFilters.map(({ label, checked }) => ({
            label,
            checked,
          })),
          countries: localCountryOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          gep: localGepOptions.map(({ label, checked }) => ({ label, checked })),
          programName: localProgramNameOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          accountSectors: localAccountSectorOptions.map(({ value, checked }) => ({
            label: value, // Or keep your original structure
            checked,
          })),
          accountSegments: localAccountSegmentOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          buyerSegmentRollup: localBuyerSegmentRollupOptions.map(
            ({ label, checked }) => ({
              label,
              checked,
            })
          ),
          productFamily: localProductFamilyOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          industry: localIndustryOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          partnerEvent: localPartnerEventOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          draftStatus: localDraftStatusOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          activityType: localActivityTypeOptions.map(({ label, checked }) => ({
            label,
            checked,
          })),
          organisedBy: selectedOrganisers, // array
        },
      ],
    };

    // API call to store
    sendFilterDataToAPI(filterData);

    // Update local state
    setSavedFilters((prev) => [
      ...prev,
      { filterName: customFilterName.trim(), config: filterData.config },
    ]);

    setCustomFilterName("");
    showSnackbar("Filter saved successfully!");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Apply a saved filter
  // ─────────────────────────────────────────────────────────────────────────────
  const handleChipClick = (config) => applyFilterConfig(config);

  const applyFilterConfig = (config) => {
    if (!config || !Array.isArray(config)) {
      console.error("applyFilterConfig: Received invalid config.");
      return;
    }
    const saved = config[0] || {};

    // Sub-region
    const updatedSubRegionFilters = localSubRegionFilters.map((filter) => {
      const match = saved.subRegions?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // GEP
    const updatedGepOptions = localGepOptions.map((filter) => {
      const match = saved.gep?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Program
    const updatedProgramNameOptions = localProgramNameOptions.map((filter) => {
      const match = saved.programName?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Activity
    const updatedActivityTypeOptions = localActivityTypeOptions.map((filter) => {
      const match = saved.activityType?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Region
    const updatedRegionOptions = localRegionOptions.map((filter) => {
      const match = saved.regions?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Country
    const updatedCountryOptions = localCountryOptions.map((filter) => {
      const match = saved.countries?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Account Sectors
    const updatedAccountSectorOptions = localAccountSectorOptions.map((filter) => {
      const match = saved.accountSectors?.find(
        (item) =>
          // NOTE: your original structure might differ; adjust accordingly
          item.label.trim().toLowerCase() === filter.value.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Account Segments
    const updatedAccountSegmentOptions = localAccountSegmentOptions.map((filter) => {
      const match = saved.accountSegments?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Buyer Segment Rollup
    const updatedBuyerSegmentRollupOptions = localBuyerSegmentRollupOptions.map(
      (filter) => {
        const match = saved.buyerSegmentRollup?.find(
          (item) =>
            item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
        );
        return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
      }
    );

    // Product Family
    const updatedProductFamilyOptions = localProductFamilyOptions.map((filter) => {
      const match = saved.productFamily?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Industry
    const updatedIndustryOptions = localIndustryOptions.map((filter) => {
      const match = saved.industry?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Partner Event
    const updatedPartnerEventOptions = localPartnerEventOptions.map((filter) => {
      const match = saved.partnerEvent?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Draft Status
    const updatedDraftStatusOptions = localDraftStatusOptions.map((filter) => {
      const match = saved.draftStatus?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // Organised By (array of strings)
    const updatedOrganisers = saved.organisedBy || [];

    // Update states
    setLocalSubRegionFilters(updatedSubRegionFilters);
    setLocalGepOptions(updatedGepOptions);
    setLocalProgramNameOptions(updatedProgramNameOptions);
    setLocalActivityTypeOptions(updatedActivityTypeOptions);
    setLocalRegionOptions(updatedRegionOptions);
    setLocalCountryOptions(updatedCountryOptions);
    setLocalAccountSectorOptions(updatedAccountSectorOptions);
    setLocalAccountSegmentOptions(updatedAccountSegmentOptions);
    setLocalBuyerSegmentRollupOptions(updatedBuyerSegmentRollupOptions);
    setLocalProductFamilyOptions(updatedProductFamilyOptions);
    setLocalIndustryOptions(updatedIndustryOptions);
    setLocalPartnerEventOptions(updatedPartnerEventOptions);
    setLocalDraftStatusOptions(updatedDraftStatusOptions);
    setSelectedOrganisers(updatedOrganisers);

    forceRefresh();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4">
      {/* Save filters */}
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
          expandIcon={<ExpandMoreIcon sx={{ color: blue[500], fontSize: "14px" }} />}
          aria-controls="custom-filters-content"
          id="custom-filters-header"
          sx={{
            backgroundColor: "#e8f0fe",
            padding: "2px 8px",
            borderRadius: "6px",
            minHeight: "24px",
            height: "24px",
            maxHeight: "24px",
            "& .MuiAccordionSummary-content": {
              margin: 0,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
            },
            "&.Mui-expanded": {
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
          {/* Name Input */}
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
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1a73e8",
                    borderWidth: "1px",
                  },
                },
              }}
              InputLabelProps={{
                shrink: false,
                style: {
                  fontSize: "10px",
                  top: "-6px",
                  visibility: customFilterName ? "hidden" : "visible",
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

          <Divider sx={{ marginY: "4px" }} />

          {/* Render saved filters as chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {savedFilters && savedFilters.length > 0 ? (
              savedFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={filter.filterName || "Unnamed Filter"}
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

      {/* Reset all filters */}
      <div>
        <IconButton
          aria-label="clear all"
          onClick={clearAllFilters}
          size="small"
          style={{ color: "#d32f2f" }}
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
          Reset all filters
        </button>
      </div>

      <hr style={{ margin: "8px 0", border: 0 }} />

      {/* Filter sections */}
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
        isActivityTypeExpanded,
        setIsActivityTypeExpanded
      )}
      {renderFilterSection(
        "1st vs 3rd Party",
        localPartyTypeOptions,
        setLocalPartyTypeOptions,
        isPartyTypeExpanded,
        setIsPartyTypeExpanded
      )}

      {/* Organised By (multi-select) */}
      {renderOrganisedBySection(
        "Organised By",
        organisedByOptions,
        selectedOrganisers,
        handleOrganiserChange,
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
        isNewlyCreatedExpanded,
        setIsNewlyCreatedExpanded
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
