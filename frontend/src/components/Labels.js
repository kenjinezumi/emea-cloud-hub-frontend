import React, { useState, useContext, useEffect } from 'react';
import GlobalContext from '../context/GlobalContext';
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
} from './filters/FiltersData';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Typography, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function Filters() {
  const [localSubRegionFilters, setLocalSubRegionFilters] = useState(subRegionOptions.map(option => ({ label: option, checked:false })));
  const [localGepOptions, setLocalGepOptions] = useState(gepOptions.map(option => ({ label: option, checked: false })));
  const [localAccountSectorOptions, setLocalAccountSectorOptions] = useState(accountSectorOptions);
  const [localAccountSegmentOptions, setLocalAccountSegmentOptions] = useState(accountSegmentOptions);
  const [localBuyerSegmentRollupOptions, setLocalBuyerSegmentRollupOptions] = useState(buyerSegmentRollupOptions);
  const [localProductFamilyOptions, setLocalProductFamilyOptions] = useState(productFamilyOptions);
  const [localIndustryOptions, setLocalIndustryOptions] = useState(industryOptions.map(option => ({ label: option, checked: false})));
  const [localPartnerEventOptions, setLocalPartnerEventOptions] = useState(partnerEventOptions);
  const [localDraftStatusOptions, setLocalDraftStatusOptions] = useState(draftStatusOptions);

  const [isSubRegionExpanded, setIsSubRegionExpanded] = useState(false);
  const [isGepExpanded, setIsGepExpanded] = useState(false);
  const [isAccountSectorExpanded, setIsAccountSectorExpanded] = useState(false);
  const [isAccountSegmentExpanded, setIsAccountSegmentExpanded] = useState(false);
  const [isBuyerSegmentRollupExpanded, setIsBuyerSegmentRollupExpanded] = useState(false);
  const [isProductFamilyExpanded, setIsProductFamilyExpanded] = useState(false);
  const [isIndustryExpanded, setIsIndustryExpanded] = useState(false);
  const [isPartnerEventExpanded, setIsPartnerEventExpanded] = useState(false);
  const [isDraftStatusExpanded, setIsDraftStatusExpanded] = useState(false);

  const { updateFilters } = useContext(GlobalContext);

  const clearAllFilters = () => {
    setLocalSubRegionFilters(localSubRegionFilters.map(filter => ({ ...filter, checked: false })));
    setLocalGepOptions(localGepOptions.map(option => ({ ...option, checked: false })));
    setLocalAccountSectorOptions(localAccountSectorOptions.map(option => ({ ...option, checked: false })));
    setLocalAccountSegmentOptions(localAccountSegmentOptions.map(option => ({ ...option, checked: false })));
    setLocalBuyerSegmentRollupOptions(localBuyerSegmentRollupOptions.map(option => ({ ...option, checked: false })));
    setLocalProductFamilyOptions(localProductFamilyOptions.map(option => ({ ...option, checked: false })));
    setLocalIndustryOptions(localIndustryOptions.map(option => ({ ...option, checked: false })));
    setLocalPartnerEventOptions(localPartnerEventOptions.map(option => ({ ...option, checked: false })));
    setLocalDraftStatusOptions(localDraftStatusOptions.map(option => ({ ...option, checked: false })));
  };

  const selectAllFilters = () => {
    setLocalSubRegionFilters(localSubRegionFilters.map(filter => ({ ...filter, checked: true })));
    setLocalGepOptions(localGepOptions.map(option => ({ ...option, checked: true })));
    setLocalAccountSectorOptions(localAccountSectorOptions.map(option => ({ ...option, checked: true })));
    setLocalAccountSegmentOptions(localAccountSegmentOptions.map(option => ({ ...option, checked: true })));
    setLocalBuyerSegmentRollupOptions(localBuyerSegmentRollupOptions.map(option => ({ ...option, checked: true })));
    setLocalProductFamilyOptions(localProductFamilyOptions.map(option => ({ ...option, checked: true })));
    setLocalIndustryOptions(localIndustryOptions.map(option => ({ ...option, checked: true })));
    setLocalPartnerEventOptions(localPartnerEventOptions.map(option => ({ ...option, checked: true })));
    setLocalDraftStatusOptions(localDraftStatusOptions.map(option => ({ ...option, checked: true })));
  };

  const handleFilterChange = (setFilterState, label) => {
    setFilterState(prevFilters =>
      prevFilters.map(filter => filter.label === label ? { ...filter, checked: !filter.checked } : filter)
    );
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

  const renderFilterSection = (title, filters, setFilterState, expanded, setExpanded) => (
    <div className="mb-4">
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer flex items-center">
        <Typography variant="subtitle2" className="mr-2">{title}</Typography>
        {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </div>
      {expanded && filters.map(({ label, checked }, idx) => (
        <label key={idx} className="items-center mt-3 block">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => handleFilterChange(setFilterState, label)}
            className="form-checkbox h-5 w-5 rounded focus:ring-0 cursor-pointer"
          />
          <span className="ml-2 text-gray-700 capitalize text-xs">{label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="mt-4">
      <div>
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
      </div>
      <div>
        <IconButton
          aria-label="clear all"
          onClick={clearAllFilters}
          size="small"
          style={{ color: '#d32f2f' }} // Google's red color
        >
          <ClearIcon style={{ fontSize: '20px' }} />
        </IconButton>
        <button style={{ fontSize: '14px', background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }} onClick={clearAllFilters}>
          Clear all filters
        </button>
      </div>
      <hr style={{ margin: '8px 0', border: 0 }} />

      {renderFilterSection('Sub-Region', localSubRegionFilters, setLocalSubRegionFilters, isSubRegionExpanded, setIsSubRegionExpanded)}
      {renderFilterSection('Solution', localGepOptions, setLocalGepOptions, isGepExpanded, setIsGepExpanded)}
      {renderFilterSection('Account Sector', localAccountSectorOptions, setLocalAccountSectorOptions, isAccountSectorExpanded, setIsAccountSectorExpanded)}
      {renderFilterSection('Account Segment', localAccountSegmentOptions, setLocalAccountSegmentOptions, isAccountSegmentExpanded, setIsAccountSegmentExpanded)}
      {renderFilterSection('Buyer Segment Rollup', localBuyerSegmentRollupOptions, setLocalBuyerSegmentRollupOptions, isBuyerSegmentRollupExpanded, setIsBuyerSegmentRollupExpanded)}
      {renderFilterSection('Product Family', localProductFamilyOptions, setLocalProductFamilyOptions, isProductFamilyExpanded, setIsProductFamilyExpanded)}
      {renderFilterSection('Industry', localIndustryOptions, setLocalIndustryOptions, isIndustryExpanded, setIsIndustryExpanded)}
      {renderFilterSection('Is Partner Event', localPartnerEventOptions, setLocalPartnerEventOptions, isPartnerEventExpanded, setIsPartnerEventExpanded)}
      {renderFilterSection('Draft Status', localDraftStatusOptions, setLocalDraftStatusOptions, isDraftStatusExpanded, setIsDraftStatusExpanded)}
      </div>
  );
}
