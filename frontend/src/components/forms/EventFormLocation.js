import React, { useEffect, useContext, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import {
  regionOptions,
  regionsData,
  subregionsData,
} from "../filters/FiltersData";
import Snackbar from "@mui/material/Snackbar";
import {
  Button,
  FormControl,
  Typography,
  Grid,
  Select,
  MenuItem,
  Chip,
  TextField,
  CircularProgress,
  Box,
  InputAdornment,
  OutlinedInput,
  IconButton,
} from "@mui/material";
import "../styles/Forms.css";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function LocationFormPage() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);

  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) region: now an ARRAY (multi-select)
  // ─────────────────────────────────────────────────────────────────────────────
  const [region, setRegion] = useState(
    Array.isArray(formData?.region)
      ? formData.region
      : Array.isArray(selectedEvent?.region)
      ? selectedEvent.region
      : []
  );

  const [subRegion, setSubRegion] = useState(
    Array.isArray(formData?.subRegion)
      ? formData.subRegion
      : Array.isArray(selectedEvent?.subRegion)
      ? selectedEvent.subRegion
      : []
  );

  const [country, setCountry] = useState(
    Array.isArray(formData?.country)
      ? formData.country
      : Array.isArray(selectedEvent?.country)
      ? selectedEvent.country
      : []
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) city: now an ARRAY of strings, managed via text+chips
  // ─────────────────────────────────────────────────────────────────────────────
  const [city, setCity] = useState(
    Array.isArray(formData?.city)
      ? formData.city
      : Array.isArray(selectedEvent?.city)
      ? selectedEvent.city
      : []
  );
  const [newCity, setNewCity] = useState("");

  const [locationVenue, setLocationVenue] = useState(
    formData?.locationVenue || selectedEvent?.locationVenue || ""
  );

  const [open, setOpen] = useState(false);

  const [availableSubregions, setAvailableSubregions] = useState(
    formData.availableSubregions || []
  );
  const [availableCountries, setAvailableCountries] = useState(
    formData.availableCountries || []
  );

  const [isFormValid, setIsFormValid] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Validation flags
  const [isRegionError, setIsRegionError] = useState(false);
  const [isSubRegionError, setIsSubRegionError] = useState(false);
  const [isCountryError, setIsCountryError] = useState(false);
  const [isCityError, setIsCityError] = useState(false);

  const saveAndNavigate = useFormNavigation();

  // ─────────────────────────────────────────────────────────────────────────────
  // If “Previous” button, go back to /create-event
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePrevious = () => {
    saveAndNavigate({ region, subRegion, country, city }, "/create-event");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Deleting subRegion/country chips
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDeleteSubRegion = (subRegionToDelete) => (event) => {
    event.stopPropagation();
    setSubRegion((prev) => prev.filter((sr) => sr !== subRegionToDelete));
  };
  const handleDeleteCountry = (countryToDelete) => (event) => {
    event.stopPropagation();
    setCountry((prev) => prev.filter((c) => c !== countryToDelete));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Region multi-select changes
  // ─────────────────────────────────────────────────────────────────────────────
  const handleRegionChange = (e) => {
    const selectedRegions = e.target.value;
    setRegion(typeof selectedRegions === "string" ? selectedRegions.split(",") : selectedRegions);

    // Clear subRegion + country if region changes
    setSubRegion([]);
    setCountry([]);
    setAvailableSubregions([]);
    setAvailableCountries([]);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Sub-region changes => update countries
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubRegionChange = (e) => {
    const selectedSubregions = e.target.value;
    setSubRegion(selectedSubregions);

    // Build availableCountries from subregions
    const countriesForSubregions = selectedSubregions.flatMap((sr) => {
      return (
        subregionsData.find((data) => data.subregion === sr)?.countries || []
      );
    });
    setAvailableCountries(countriesForSubregions);
    // Optionally, we can also clear country array if needed
    setCountry([]);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // “Next” button => validate & save
  // ─────────────────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    setLoading(true);

    // Validate
    const isRegionValid = region.length > 0; // must have at least 1 region
    const isSubRegionValid = subRegion.length > 0;
    const isCountryValid = country.length > 0;
    const isCityValid = city.length > 0; // must have at least 1 city if you want mandatory

    setIsRegionError(!isRegionValid);
    setIsSubRegionError(!isSubRegionValid);
    setIsCountryError(!isCountryValid);
    setIsCityError(!isCityValid);

    const formIsValid =
      isRegionValid && isSubRegionValid && isCountryValid && isCityValid;

    if (!formIsValid) {
      setIsFormValid(false);
      setSnackbarMessage("All fields are required.");
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // Build final data
    const currentFormData = {
      ...formData,
      region,
      subRegion,
      country,
      city,
      locationVenue,
      isDraft: true,
      isPublished: false,
    };
    updateFormData(currentFormData);

    try {
      const response = await sendDataToAPI(currentFormData);
      if (response.success) {
        setSnackbarMessage("Details saved successfully!");
        setSnackbarOpen(true);
        setTimeout(() => {
          setLoading(false);
          saveAndNavigate(currentFormData, "/extra");
        }, 1500);
      } else {
        setSnackbarMessage("Failed to save location data.");
        setLoading(false);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving location data.");
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Save as Draft
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSaveAsDraft = async () => {
    const draftData = {
      region,
      subRegion,
      country,
      city,
      locationVenue,
      isDraft: true,
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

  // ─────────────────────────────────────────────────────────────────────────────
  // If “selectedEvent” is loaded, load subregion/country
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedEvent) {
      // region[] => figure out subregions for them
      // But your data structure in 'regionsData' might differ
      // This is just an example if you have region->subregions
      // For multiple regions, we'd collect subregions from them all
      // For now we just set them from selectedEvent's region, ignoring if multiple
      if (Array.isArray(selectedEvent.region)) {
        // For each region we find subregions
        // This code is optional or depends on how your data is shaped
      }
      // next:
      const subregionsForRegion = []; // Possibly build from each region
      setAvailableSubregions(subregionsForRegion);

      // For subRegion => load countries
      if (Array.isArray(selectedEvent.subRegion)) {
        const countriesForSubregions = selectedEvent.subRegion.flatMap(
          (selectedSubregion) =>
            subregionsData.find((data) => data.subregion === selectedSubregion)
              ?.countries || []
        );
        setAvailableCountries(countriesForSubregions);
      }
    }
  }, [selectedEvent]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Keep context in sync if user modifies region, subRegion, ...
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // any time region/subRegion/country/city change, update form data
    const currentFormData = {
      ...formData,
      region,
      subRegion,
      country,
      city,
      locationVenue,
    };
    updateFormData(currentFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, subRegion, country, city, locationVenue]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Handling city as array with a text field
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddCity = () => {
    const trimmed = newCity.trim();
    if (trimmed && !city.includes(trimmed)) {
      setCity([...city, trimmed]);
      setNewCity("");
    } else {
      setSnackbarMessage("Empty or duplicate city name.");
      setSnackbarOpen(true);
    }
  };
  const handleCityDelete = (cityToDelete) => {
    setCity((prev) => prev.filter((c) => c !== cityToDelete));
  };
  const handlePasteCities = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("Text");
    const splitted = pastedText.split(/[ ,;\n]+/).filter(Boolean);

    const uniqueCities = splitted.filter((c) => c && !city.includes(c));
    if (uniqueCities.length > 0) {
      setCity((prev) => [...prev, ...uniqueCities]);
    } else {
      setSnackbarMessage("No valid or unique city names found in the pasted text.");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <CalendarHeaderForm />

      <div className="form-container">
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
            <LocationOnIcon
              style={{ marginRight: "10px", color: blue[500], height: "40px" }}
            />
            <span className="mr-1 text-xl text-black cursor-pointer">
              Location
            </span>
          </Typography>

          <Grid container spacing={3} className="form-grid">
            {/* REGION MULTI-SELECT */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isRegionError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Regions *
                </Typography>
                <Select
                  multiple
                  value={region}
                  onChange={handleRegionChange}
                  // for multi-select with chips
                  input={<OutlinedInput label="Regions" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {regionOptions.map((reg, idx) => (
                    <MenuItem key={idx} value={reg}>
                      {reg}
                    </MenuItem>
                  ))}
                </Select>
                {isRegionError && (
                  <Typography variant="body2" color="error">
                    Please select at least one region
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* SUB-REGION MULTI-SELECT */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isSubRegionError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Sub-regions *
                </Typography>
                <Select
                  multiple
                  value={subRegion}
                  onChange={handleSubRegionChange}
                  input={<OutlinedInput label="Sub-region(s)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((subR) => (
                        <Chip
                          key={subR}
                          label={subR}
                          onDelete={handleDeleteSubRegion(subR)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableSubregions?.map((sr, idx) => (
                    <MenuItem key={idx} value={sr}>
                      {sr}
                    </MenuItem>
                  ))}
                </Select>
                {isSubRegionError && (
                  <Typography variant="body2" color="error">
                    Please select at least one sub-region
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* COUNTRY MULTI-SELECT */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isCountryError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Countries *
                </Typography>
                <Select
                  multiple
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  input={<OutlinedInput label="Country(s)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          onDelete={handleDeleteCountry(c)}
                          onMouseDown={(event) => event.stopPropagation()}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableCountries.map((c, idx) => (
                    <MenuItem key={idx} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
                {isCountryError && (
                  <Typography variant="body2" color="error">
                    Please select at least one country
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* CITY as an array with text+chips */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isCityError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Cities *
                </Typography>
                <Box>
                  <TextField
                    variant="outlined"
                    placeholder="Enter a city and press Enter, or paste multiple"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCity();
                      }
                    }}
                    onPaste={handlePasteCities}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleAddCity} edge="end">
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", mt: 1, gap: 1 }}>
                  {city.map((cty, idx) => (
                    <Chip
                      key={idx}
                      label={cty}
                      onDelete={() => handleCityDelete(cty)}
                      color="primary"
                    />
                  ))}
                </Box>
                {isCityError && (
                  <Typography variant="body2" color="error">
                    Please add at least one city
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* LOCATION VENUE */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Location Venue
                </Typography>
                <TextField
                  value={locationVenue}
                  onChange={(e) => setLocationVenue(e.target.value)}
                  fullWidth
                />
              </FormControl>
            </Grid>
          </Grid>

          {!isFormValid && (
            <Typography color="error" style={{ marginBottom: "10px" }}>
              All fields are required.
            </Typography>
          )}

          <div className="form-navigation-buttons" style={{ position: "relative" }}>
            {/* PREVIOUS BUTTON */}
            <Button
              variant="outlined"
              onClick={handlePrevious}
              style={{
                backgroundColor: "white",
                color: "#202124",
                border: "1px solid #dadce0",
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                margin: "5px",
              }}
            >
              Previous
            </Button>

            {/* LOADING SPINNER OVERLAY */}
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  zIndex: 1,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            {/* NEXT BUTTON */}
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                backgroundColor: blue[500],
                color: "white",
                margin: "10px",
                "&:hover": {
                  backgroundColor: blue[700],
                },
              }}
              disabled={loading} // Disable button while loading
            >
              Next
            </Button>

            {/* Optionally, you can add a "Save as Draft" button here if desired */}
            {/*
            <Button
              variant="text"
              onClick={handleSaveAsDraft}
              style={{ margin: "10px" }}
            >
              Save as Draft
            </Button>
            */}

            {/* SNACKBAR */}
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
