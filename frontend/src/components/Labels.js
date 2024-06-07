import React, { useState, useContext, useEffect } from 'react';
import GlobalContext from '../context/GlobalContext';
import { regionFilters, okrOptions, audienceSeniorityOptions, eventTypeOptions } from './filters/FiltersData';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Typography, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function Filters() {
  const [localRegionFilters, setLocalRegionFilters] = useState(regionFilters);
  const [localOkrOptions, setLocalOkrOptions] = useState(okrOptions);
  const [localAudienceSeniorityOptions, setLocalAudienceSeniorityOptions] = useState(audienceSeniorityOptions);
  const [localEventTypeOptions, setLocalEventTypeOptions] = useState(eventTypeOptions);

  const [localIsDraftOptions, setLocalIsDraftOptions] = useState([
    { label: 'Draft', checked: true},
    { label: 'Published', checked: true }
  ]);

  const [isRegionExpanded, setIsRegionExpanded] = useState(false);
  const [isOkrExpanded, setIsOkrExpanded] = useState(false);
  const [isAudienceSeniorityExpanded, setIsAudienceSeniorityExpanded] = useState(false);
  const [isEventTypeExpanded, setIsEventTypeExpanded] = useState(false);
  const [isIsDraftExpanded, setIsIsDraftExpanded] = useState(false);

  const { updateFilters } = useContext(GlobalContext);

  const clearAllFilters = () => {
    setLocalRegionFilters(localRegionFilters.map(filter => ({ ...filter, checked: false })));
    setLocalOkrOptions(localOkrOptions.map(option => ({ ...option, checked: false })));
    setLocalAudienceSeniorityOptions(localAudienceSeniorityOptions.map(option => ({ ...option, checked: false })));
    setLocalEventTypeOptions(localEventTypeOptions.map(option => ({ ...option, checked: false })));
    setLocalIsDraftOptions(localIsDraftOptions.map(option => ({ ...option, checked: false })));
  };

  const selectAllFilters = () => {
    setLocalRegionFilters(localRegionFilters.map(filter => ({ ...filter, checked: true })));
    setLocalOkrOptions(localOkrOptions.map(option => ({ ...option, checked: true })));
    setLocalAudienceSeniorityOptions(localAudienceSeniorityOptions.map(option => ({ ...option, checked: true })));
    setLocalEventTypeOptions(localEventTypeOptions.map(option => ({ ...option, checked: true })));
    setLocalIsDraftOptions(localIsDraftOptions.map(option => ({ ...option, checked: true })));
  };

  const handleRegionChange = (label) => {
    const newFilters = localRegionFilters.map((filter) => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalRegionFilters(newFilters);
  };

  const handleOkrChange = (label) => {
    const newFilters = localOkrOptions.map((filter) => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalOkrOptions(newFilters);
  };

  const handleAudienceSeniorityChange = (label) => {
    const newFilters = localAudienceSeniorityOptions.map((filter) => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalAudienceSeniorityOptions(newFilters);
  };

  const handleEventTypeChange = (label) => {
    const newFilters = localEventTypeOptions.map((filter) => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalEventTypeOptions(newFilters);
  };

  const handleIsDraftChange = (label) => {
    const newFilters = localIsDraftOptions.map((filter) => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalIsDraftOptions(newFilters);
  };

  useEffect(() => {
    updateFilters({
      regions: localRegionFilters,
      okr: localOkrOptions,
      audienceSeniority: localAudienceSeniorityOptions,
      eventType: localEventTypeOptions,
      isDraft: localIsDraftOptions,
    });
  }, [localRegionFilters, localOkrOptions, localAudienceSeniorityOptions, localEventTypeOptions, localIsDraftOptions, updateFilters]);

  const renderFilterSection = (title, filters, handleFilterChange, expanded, setExpanded) => (
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
            onChange={() => handleFilterChange(label)}
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

      {renderFilterSection('Region', localRegionFilters, handleRegionChange, isRegionExpanded, setIsRegionExpanded)}
      {renderFilterSection('OKR', localOkrOptions, handleOkrChange, isOkrExpanded, setIsOkrExpanded)}
      {renderFilterSection('Audience Seniority', localAudienceSeniorityOptions, handleAudienceSeniorityChange, isAudienceSeniorityExpanded, setIsAudienceSeniorityExpanded)}
      {renderFilterSection('Event type', localEventTypeOptions, handleEventTypeChange, isEventTypeExpanded, setIsEventTypeExpanded)}
      {renderFilterSection('Draft Status', localIsDraftOptions, handleIsDraftChange, isIsDraftExpanded, setIsIsDraftExpanded)}
    </div>
  );
}
