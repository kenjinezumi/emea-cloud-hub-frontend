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

// ─────────────────────────────────────────────────────────────────────────────
// GA4 HELPER: Send event if gtag exists
// ─────────────────────────────────────────────────────────────────────────────
const sendGAEvent = (eventName, params = {}) => {
  if (window && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export default function Filters() {
  // SNACKBAR
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // REFRESH STATE
  const [refresh, setRefresh] = useState(false);

  // PERSISTED FILTERS FROM localStorage
  const persistedFilters =
    JSON.parse(localStorage.getItem("persistedFilters")) || {};

  // SAVED FILTERS
  const [savedFilters, setSavedFilters] = useState([]);

  // LOCAL STATES FOR FILTERS
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
        label: option.label,
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
  const [localNewlyCreatedOptions, setLocalNewlyCreatedOptions] = useState(
    persistedFilters.newlyCreated ||
      newlyCreatedOptions.map((option) => ({ ...option }))
  );
  const [localActivityTypeOptions, setLocalActivityTypeOptions] = useState(
    persistedFilters.activityType ||
      eventTypeOptions.map((option) => ({ label: option.label, checked: false }))
  );

  // ORGANIZED BY
  const [organisedByOptions, setOrganisedByOptions] = useState([]);
  const [selectedOrganisers, setSelectedOrganisers] = useState(
    persistedFilters.organisedBy || []
  );

  // ACCORDION STATE
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

  // CONTEXT
  const { updateFilters } = useContext(GlobalContext);

  // SNACKBAR HANDLERS
  const handleSnackbarClose = () => setSnackbarOpen(false);
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // FORCE REFRESH
  const forceRefresh = () => setRefresh((prev) => !prev);

  // ─────────────────────────────────────────────────────────────────────────────
  // GA4 => handleExpand/Collapse (optional)
  // ─────────────────────────────────────────────────────────────────────────────
  const toggleAccordion = (accordionName, expandedState, setExpandedState) => {
    sendGAEvent("accordion_toggle", {
      event_category: "Filters",
      event_label: accordionName,
      expanded: !expandedState,
    });
    setExpandedState(!expandedState);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ORGANIZED BY: FETCH from API
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrganisedBy = async () => {
      try {
        const data = await getOrganisedBy();
        if (Array.isArray(data)) {
          const flattened = data
            .flatMap((item) => item.organisedBy)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          setOrganisedByOptions(flattened);
        }
      } catch (error) {
        console.error("Failed to fetch OrganisedBy options:", error);
      }
    };
    fetchOrganisedBy();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // ORGANIZER CHANGE
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOrganiserChange = (event, newValue) => {
    sendGAEvent("organiser_change", {
      event_category: "Filters",
      selected: newValue.join(", ") || "(none)",
    });
    setSelectedOrganisers(newValue || []);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // localStorage: SAVE CHANGES
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
  // RESTORE persisted states on first load
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const localPersisted = JSON.parse(localStorage.getItem("persistedFilters"));
    if (localPersisted) {
      setLocalRegionOptions(localPersisted.regions || localRegionOptions);
      setLocalSubRegionFilters(localPersisted.subRegions || localSubRegionFilters);
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
      setSelectedOrganisers(localPersisted.organisedBy || []);
      setLocalPartyTypeOptions(localPersisted.partyType || localPartyTypeOptions);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // CLEAR ALL FILTERS
  // ─────────────────────────────────────────────────────────────────────────────
  const clearAllFilters = () => {
    sendGAEvent("clear_all_filters", {
      event_category: "Filters",
    });

    setLocalRegionOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalSubRegionFilters((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalCountryOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalGepOptions((prev) => prev.map((f) => ({ ...f, checked: false })));
    setLocalProgramNameOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalAccountSectorOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalActivityTypeOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalAccountSegmentOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalBuyerSegmentRollupOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalProductFamilyOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalIndustryOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalPartnerEventOptions((prev) =>
      prev.map((f) => ({ ...f, checked: false }))
    );
    setLocalDraftStatusOptions((prev) =>
      prev.map((option) => ({ ...option, checked: false }))
    );
    // Clear "Organised By"
    setSelectedOrganisers([]);
  };

  // (Optional) SELECT ALL FILTERS
  const selectAllFilters = () => {
    sendGAEvent("select_all_filters", {
      event_category: "Filters",
    });

    setLocalRegionOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalSubRegionFilters((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalCountryOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalGepOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalProgramNameOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalActivityTypeOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalAccountSectorOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalAccountSegmentOptions((prev) =>
      prev.map((f) => ({ ...f, checked: true }))
    );
    setLocalBuyerSegmentRollupOptions((prev) =>
      prev.map((f) => ({ ...f, checked: true }))
    );
    setLocalProductFamilyOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalIndustryOptions((prev) => prev.map((f) => ({ ...f, checked: true })));
    setLocalPartnerEventOptions((prev) =>
      prev.map((f) => ({ ...f, checked: true }))
    );
    setLocalDraftStatusOptions((prev) =>
      prev.map((f) => ({ ...f, checked: true }))
    );
    // setSelectedOrganisers([...organisedByOptions]) if desired
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TOGGLE A SINGLE FILTER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleFilterChange = (
    setFilterState,
    value,
    isAccountSector = false
  ) => {
    // Fire GA event
    sendGAEvent("toggle_filter", {
      event_category: "Filters",
      filter_label: value,
      isAccountSector,
    });

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
  // UPDATE CONTEXT whenever local filters change
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
  // DELETE A SAVED FILTER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDeleteFilter = async (filterName) => {
    sendGAEvent("delete_saved_filter", {
      event_category: "Filters",
      filterName,
    });

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
  // GET USER LDAP
  // ─────────────────────────────────────────────────────────────────────────────
  const getUserLdap = () => {
    const userData = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user")
    );
    if (userData && userData.emails && userData.emails[0].value) {
      const email = userData.emails[0].value;
      return email.split("@")[0];
    }
    throw new Error("No user data found in local/session storage");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCH SAVED FILTERS ON MOUNT
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
  // SAVE A NEW NAMED FILTER
  // ─────────────────────────────────────────────────────────────────────────────
  const [customFilterName, setCustomFilterName] = useState("");

  const handleSaveFilter = () => {
    sendGAEvent("save_filter", {
      event_category: "Filters",
      filterName: customFilterName.trim() || "(untitled)",
    });

    const ldap = getUserLdap();
    if (!customFilterName.trim()) return;

    const filterData = {
      ldap,
      filterName: customFilterName.trim(),
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
            label: value,
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
          organisedBy: selectedOrganisers,
        },
      ],
    };

    // API
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
  // APPLY A SAVED FILTER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleChipClick = (config) => {
    sendGAEvent("apply_saved_filter", {
      event_category: "Filters",
    });
    applyFilterConfig(config);
  };

  const applyFilterConfig = (config) => {
    if (!config || !Array.isArray(config)) {
      console.error("applyFilterConfig: Received invalid config.");
      return;
    }
    const saved = config[0] || {};

    const updatedSubRegionFilters = localSubRegionFilters.map((filter) => {
      const match = saved.subRegions?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedGepOptions = localGepOptions.map((filter) => {
      const match = saved.gep?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedProgramNameOptions = localProgramNameOptions.map((filter) => {
      const match = saved.programName?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedActivityTypeOptions = localActivityTypeOptions.map((filter) => {
      const match = saved.activityType?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedRegionOptions = localRegionOptions.map((filter) => {
      const match = saved.regions?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedCountryOptions = localCountryOptions.map((filter) => {
      const match = saved.countries?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedAccountSectorOptions = localAccountSectorOptions.map((filter) => {
      const match = saved.accountSectors?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.value.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedAccountSegmentOptions = localAccountSegmentOptions.map((filter) => {
      const match = saved.accountSegments?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedBuyerSegmentRollupOptions = localBuyerSegmentRollupOptions.map(
      (filter) => {
        const match = saved.buyerSegmentRollup?.find(
          (item) =>
            item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
        );
        return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
      }
    );

    const updatedProductFamilyOptions = localProductFamilyOptions.map((filter) => {
      const match = saved.productFamily?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedIndustryOptions = localIndustryOptions.map((filter) => {
      const match = saved.industry?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedPartnerEventOptions = localPartnerEventOptions.map((filter) => {
      const match = saved.partnerEvent?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    const updatedDraftStatusOptions = localDraftStatusOptions.map((filter) => {
      const match = saved.draftStatus?.find(
        (item) =>
          item.label.trim().toLowerCase() === filter.label.trim().toLowerCase()
      );
      return match ? { ...filter, checked: match.checked } : { ...filter, checked: false };
    });

    // ORGANIZED BY
    const updatedOrganisers = saved.organisedBy || [];

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
  // RENDER “ORGANIZED BY” MULTI-SELECT
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
      <div
        onClick={() => toggleAccordion(title, expanded, setExpanded)}
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
  // RENDER CHECKBOX FILTER SECTION
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
      <div
        onClick={() => toggleAccordion(title, expanded, setExpanded)}
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
                handleFilterChange(
                  setFilterState,
                  isAccountSector ? value : label,
                  isAccountSector
                )
              }
              className="form-checkbox h-5 w-5 rounded focus:ring-0 cursor-pointer"
            />
            <span className="ml-2 text-gray-700 capitalize text-xs">{label}</span>
          </label>
        ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4">
      {/* SAVE FILTERS ACCORDION */}
      <Accordion
        expanded={isCustomFiltersExpanded}
        onChange={() => {
          toggleAccordion("Save your Filter View", isCustomFiltersExpanded, setIsCustomFiltersExpanded);
        }}
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
          {/* NAME INPUT */}
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

          {/* RENDER SAVED FILTERS AS CHIPS */}
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

      {/* RESET / SELECT ALL FILTERS */}
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

        {/* (Optional) A button to "Select All Filters" */}
        {/* <IconButton
          aria-label="select all"
          onClick={selectAllFilters}
          size="small"
          style={{ color: "#4caf50", marginLeft: "8px" }}
        >
          <DoneAllIcon style={{ fontSize: "20px" }} />
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
          onClick={selectAllFilters}
        >
          Select all filters
        </button> 
        */}
      </div>

      <hr style={{ margin: "8px 0", border: 0 }} />

      {/* FILTER SECTIONS */}
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
        setIsAccountSectorExpanded,
        true // isAccountSector
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

      {/* SNACKBAR */}
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
