import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import { regionFilters, okrOptions, audienceSeniorityOptions, eventTypeOptions } from "./filters/FiltersData";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { Typography } from "@mui/material";

export default function Filters() {

  const [localRegionFilters, setLocalRegionFilters] = useState(regionFilters);
  const [localOkrOptions, setLocalOkrOptions] = useState(okrOptions);
  const [localAudienceSeniorityOptions, setLocalAudienceSeniorityOptions] = useState(audienceSeniorityOptions);
  const [localEventTypeOptions, setLocalEventTypeOptions] = useState(eventTypeOptions);

  const [isRegionExpanded, setIsRegionExpanded] = useState(false);
  const [isOkrExpanded, setIsOkrExpanded] = useState(false);
  const [isAudienceSeniorityExpanded, setIsAudienceSeniorityExpanded] = useState(false);
  const [isEventTypeExpanded, setIsEventTypeExpanded] = useState(false);
  const { updateFilters, filters } =  useContext(GlobalContext);

  const handleRegionChange = (label) => {
    const newFilters = localRegionFilters.map(filter => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalRegionFilters(newFilters);
  };

  const handleOkrChange = (label) => {
    const newFilters = localOkrOptions.map(filter => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalOkrOptions(newFilters);
  };

  const handleAudienceSeniorityChange = (label) => {
    const newFilters = localAudienceSeniorityOptions.map(filter => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalAudienceSeniorityOptions(newFilters);
  };

  const handleEventTypeChange = (label) => {
    const newFilters = localEventTypeOptions.map(filter => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalEventTypeOptions(newFilters);
  };

  useEffect(() => {
    updateFilters({
      regions: localRegionFilters,
      okr: localOkrOptions,
      audienceSeniority: localAudienceSeniorityOptions,
      eventType: localEventTypeOptions, 
    });
  }, [localRegionFilters, localOkrOptions, localAudienceSeniorityOptions, localEventTypeOptions, updateFilters]);

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
    <div className="mt-8">
      {renderFilterSection("Region", localRegionFilters, handleRegionChange, isRegionExpanded, setIsRegionExpanded)}
      {renderFilterSection("OKR", localOkrOptions, handleOkrChange, isOkrExpanded, setIsOkrExpanded)}
      {renderFilterSection("Audience Seniority", localAudienceSeniorityOptions, handleAudienceSeniorityChange, isAudienceSeniorityExpanded, setIsAudienceSeniorityExpanded)}
      {renderFilterSection("Event type", localEventTypeOptions, handleEventTypeChange, isEventTypeExpanded, setIsEventTypeExpanded)}
    </div>
  );
}
