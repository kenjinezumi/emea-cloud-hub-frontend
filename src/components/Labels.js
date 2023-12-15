import React, { useState, useContext} from "react";
import GlobalContext from "../context/GlobalContext";
import { regionFilters } from "./filters/FiltersData";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

export default function Filters() {
  const { updateFilters } = useContext(GlobalContext);
  const [localFilters, setLocalFilters] = useState(regionFilters);
  const [isExpanded, setIsExpanded] = useState(false); 

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };


  // Function to handle filter change
  const handleFilterChange = (label) => {
    const newFilters = localFilters.map(filter => {
      if (filter.label === label) {
        return { ...filter, checked: !filter.checked };
      }
      return filter;
    });
    setLocalFilters(newFilters);

    // Optionally, if you want to update global filters state as well
    updateFilters(newFilters);
  };

  return (
    <React.Fragment>
      <p
        className="text-gray-500 font-bold mt-10 cursor-pointer"
        onClick={toggleExpand}
      >        {isExpanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}

        Region
      </p>
      {isExpanded && // Only render the list if isExpanded is true
        localFilters.map(({ label, checked }, idx) => (
          <label key={idx} className="items-center mt-3 block">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => handleFilterChange(label)}
              className="form-checkbox h-5 w-5 rounded focus:ring-0 cursor-pointer"
            />
            <span className="ml-2 text-gray-700 capitalize">{label}</span>
          </label>
        ))}
    </React.Fragment>
  );
}
