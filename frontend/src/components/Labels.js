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
  // Local storage object of “active” filter states (NOT an array)
  // ─────────────────────────────────────────────────────────────────────────────
  const persistedFilters =
    JSON.parse(localStorage.getItem("persistedFilters")) || {};

  // ─────────────────────────────────────────────────────────────────────────────
  // State: Named “saved filters” array
  // (These are filter sets the user can save & reuse.)
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

  const [localNewlyCreatedOptions, setLocalNewlyCreatedOptions] = useState(
    persistedFilters.newlyCreated ||
      newlyCreatedOptions.map((option) => ({ ...option }))
  );

  const [localActivityTypeOptions, setLocalActivityTypeOptions] = useState(
    persistedFilters.activityType ||
      eventTypeOptions.map((option) => ({ label: option.label, checked: false }))
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // State: Organised By
  // ─────────────────────────────────────────────────────────────────────────────
  const [organisedByOptions, setOrganisedByOptions] = useState();
  const [selectedOrganiser, setSelectedOrganiser] = useState(
    persistedFilters.organisedBy || null
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch “Organised By” from the API
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrganisedBy = async () => {
      try {
        const data = await getOrganisedBy();
        if (Array.isArray(data)) {
          const flattenedData = data
            .map((item) => item.organisedBy[0])
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          setOrganisedByOptions(flattenedData);
        }
      } catch (error) {
        console.error("Failed to fetch OrganisedBy options:", error);
      }
    };
    fetchOrganisedBy();
  }, []);

  const handleOrganiserChange = (event, newValue) => {
    // Set to null if no value is selected
    setSelectedOrganiser(newValue.length ? newValue : null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Accordions (expansion states)
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
  // Context: Updating filters for other components
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
      organisedBy: selectedOrganiser,
    };
    localStorage.setItem("persistedFilters", JSON.stringify(filtersToPersist));
    console.log("Saving filters to localStorage:", filtersToPersist);
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
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Restore persisted filter states on first load
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const localPersisted = JSON.parse(localStorage.getItem("persistedFilters"));
    if (localPersisted) {
      console.log("Loaded filters from localStorage:", localPersisted);
      setLocalRegionOptions(localPersisted.regions || localRegionOptions);
      setLocalSubRegionFilters(
        localPersisted.subRegions || localSubRegionFilters
      );
      setLocalCountryOptions(localPersisted.countries || localCountryOptions);
      setLocalGepOptions(localPersisted.gep || localGepOptions);
      setLocalProgramNameOptions(
        localPersisted.programName || localProgramNameOptions
      );
      setLocalActivityTypeOptions(
        localPersisted.activityType || localActivityTypeOptions
      );
      setLocalAccountSectorOptions(
        localPersisted.accountSectors || localAccountSectorOptions
      );
      setLocalAccountSegmentOptions(
        localPersisted.accountSegments || localAccountSegmentOptions
      );
      setLocalBuyerSegmentRollupOptions(
        localPersisted.buyerSegmentRollup || localBuyerSegmentRollupOptions
      );
      setLocalProductFamilyOptions(
        localPersisted.productFamily || localProductFamilyOptions
      );
      setLocalIndustryOptions(localPersisted.industry || localIndustryOptions);
      setLocalPartnerEventOptions(
        localPersisted.partnerEvent || localPartnerEventOptions
      );
      setLocalDraftStatusOptions(
        localPersisted.draftStatus || localDraftStatusOptions
      );
      setLocalNewlyCreatedOptions(
        localPersisted.newlyCreated || localNewlyCreatedOptions
      );
      setSelectedOrganiser(localPersisted.organisedBy || selectedOrganiser);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Clear and select all filters
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
    setLocalBuyerSegmentRollupOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalProductFamilyOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalIndustryOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalPartnerEventOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalDraftStatusOptions((prev) =>
      prev.map((option) => {
        if (option.label === "Finalized" || option.label === "Invite available") {
          return { ...option, checked: true };
        }
        return { ...option, checked: false };
      })
    );
    setSelectedOrganiser(null);
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
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Toggling filters
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Multi-select “Organised By”
  // ─────────────────────────────────────────────────────────────────────────────
  const [selectedOrganisers, setSelectedOrganisers] = useState([]);

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
            options={options || []}
            multiple
            value={selectedOptions || []}
            onChange={(event, newValue) => onOptionsChange(newValue)}
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
                    onOptionsChange(selectedOptions.filter((item) => item !== organiser))
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
  // Render Filter Section
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
  // Deleting a filter from saved filters
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
  // Filter helper for “newly created”
  // ─────────────────────────────────────────────────────────────────────────────
  const filterByNewlyCreated = (events) => {
    const selectedOptions = localNewlyCreatedOptions
      .filter((option) => option.checked)
      .map((option) => option.value);

    if (selectedOptions.length === 0) return events;

    return events.filter((event) => {
      const entryCreatedDate = event.entryCreatedDate?.value
        ? new Date(event.entryCreatedDate.value)
        : null;

      if (!entryCreatedDate) {
        console.warn("Missing or invalid entryCreatedDate for event:", event);
        // Treat missing dates as "not newly created"
        return selectedOptions.includes(false);
      }

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const isNewlyCreated = entryCreatedDate >= twoWeeksAgo;
      return selectedOptions.includes(isNewlyCreated);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Retrieve LDAP from local or session storage
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
  // Fetch list of saved filters from API on mount
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
  // Save a new named filter
  // ─────────────────────────────────────────────────────────────────────────────
  const [customFilterName, setCustomFilterName] = useState("");

  const handleSaveFilter = () => {
    const ldap = getUserLdap();

    if (!customFilterName.trim()) return;

    const filterData = {
      ldap,
      filterName: customFilterName.trim(),
      config:[ {
        regions: localRegionOptions.map(({ label, checked }) => ({ label, checked })),
        subRegions: localSubRegionFilters.map(({ label, checked }) => ({
          label,
          checked,
        })),
        countries: localCountryOptions.map(({ label, checked }) => ({ label, checked })),
        gep: localGepOptions.map(({ label, checked }) => ({ label, checked })),
        programName: localProgramNameOptions.map(({ label, checked }) => ({
          label,
          checked,
        })),
        accountSectors: localAccountSectorOptions.map(({ value, checked }) => ({
          value,
          checked,
        })),
        accountSegments: localAccountSegmentOptions.map(({ label, checked }) => ({
          label,
          checked,
        })),
        buyerSegmentRollup: localBuyerSegmentRollupOptions.map(
          ({ label, checked }) => ({ label, checked })
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
        organisedBy: selectedOrganiser || [],
      }],
    };

    // Send the formatted filter data to the backend
    sendFilterDataToAPI(filterData);

    // Add the filter to the “saved filters” array in state
    setSavedFilters((prev) => [
      ...prev,
      { filterName: customFilterName.trim(), config: filterData.config },
    ]);

    setCustomFilterName("");
    showSnackbar("Filter saved successfully!");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Apply a saved filter (re-check states from that config)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleChipClick = (config) => applyFilterConfig(config);

  const applyFilterConfig = (config) => {
    // Make sure config is well-formed
    if (!config || !Array.isArray(config)) {
      console.error("applyFilterConfig: Received undefined or invalid config.");
      return;
    }

    const organisedBy = config[0]?.organisedBy || null;

    // Sub-region
    const updatedSubRegionFilters = localSubRegionFilters.map((filter) => {
      const match = config[0]?.subRegions?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // GEP
    const updatedGepOptions = localGepOptions.map((filter) => {
      const match = config[0]?.gep?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Program
    const updatedProgramNameOptions = localProgramNameOptions.map((filter) => {
      const match = config[0]?.programName?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Activity type
    const updatedActivityTypeOptions = localActivityTypeOptions.map((filter) => {
      const match = config[0]?.activityType?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Account sector
    const updatedAccountSectorOptions = localAccountSectorOptions.map((filter) => {
      const match = config[0]?.accountSectors?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Region
    const updatedRegionOptions = localRegionOptions.map((filter) => {
      const match = config[0]?.regions?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Country
    const updatedCountryOptions = localCountryOptions.map((filter) => {
      const match = config[0]?.countries?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Account segment
    const updatedAccountSegmentOptions = localAccountSegmentOptions.map(
      (filter) => {
        const match = config[0]?.accountSegments?.find(
          (item) =>
            item &&
            item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
        );
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );

    // Buyer segment rollup
    const updatedBuyerSegmentRollupOptions = localBuyerSegmentRollupOptions.map(
      (filter) => {
        const match = config[0]?.buyerSegmentRollup?.find(
          (item) =>
            item &&
            item.label.trim().toLowerCase() ===
              filter.label.trim().toLowerCase()
        );
        return match ? { ...filter, checked: match.checked } : filter;
      }
    );

    // Product family
    const updatedProductFamilyOptions = localProductFamilyOptions.map((filter) => {
      const match = config[0]?.productFamily?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Industry
    const updatedIndustryOptions = localIndustryOptions.map((filter) => {
      const match = config[0]?.industry?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Partner event
    const updatedPartnerEventOptions = localPartnerEventOptions.map((filter) => {
      const match = config[0]?.partnerEvent?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Draft status
    const updatedDraftStatusOptions = localDraftStatusOptions.map((filter) => {
      const match = config[0]?.draftStatus?.find(
        (item) =>
          item &&
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : filter;
    });

    // Update all local states
    setLocalSubRegionFilters(updatedSubRegionFilters);
    setLocalGepOptions(updatedGepOptions);
    setLocalProgramNameOptions(updatedProgramNameOptions);
    setLocalActivityTypeOptions(updatedActivityTypeOptions);
    setLocalAccountSectorOptions(updatedAccountSectorOptions);
    setLocalRegionOptions(updatedRegionOptions);
    setLocalCountryOptions(updatedCountryOptions);
    setLocalAccountSegmentOptions(updatedAccountSegmentOptions);
    setLocalBuyerSegmentRollupOptions(updatedBuyerSegmentRollupOptions);
    setLocalProductFamilyOptions(updatedProductFamilyOptions);
    setLocalIndustryOptions(updatedIndustryOptions);
    setLocalPartnerEventOptions(updatedPartnerEventOptions);
    setLocalDraftStatusOptions(updatedDraftStatusOptions);
    setSelectedOrganiser(organisedBy);

    forceRefresh();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Final return: UI
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4">
      {/* Example of “Select All” usage (currently commented out)
      <div>
        <IconButton
          aria-label="select all"
          onClick={selectAllFilters}
          size="small"
          style={{ color: "#1976d2" }}
        >
          <DoneAllIcon style={{ fontSize: "20px", marginLeft: "0px" }} />
        </IconButton>
        <button
          style={{ fontSize: "14px", background: "none", border: "none", padding: 0, color: "inherit", cursor: "pointer" }}
          onClick={selectAllFilters}
        >
          Select all filters
        </button>
      </div> 
      */}

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

          {/* Render saved filters (chips) */}
          <Divider sx={{ marginY: "4px" }} />
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

      {/* Clear all button */}
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
          Clear all filters
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
        (value) => handleFilterChange(setLocalAccountSectorOptions, value, true),
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

      {renderOrganisedBySection(
        "Organised By",
        organisedByOptions,
        selectedOrganiser,
        (newValue) => setSelectedOrganiser(newValue),
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
