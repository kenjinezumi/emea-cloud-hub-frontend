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
  Box
} from "@mui/material";
import "../styles/Forms.css";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";

export default function LocationFormPage() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false); 
  const [region, setRegion] = useState(
    formData?.region || selectedEvent?.region || ""
  );
  
  const [subRegion, setSubRegion] = useState(
    formData?.subRegion || selectedEvent?.subRegion || []
  );
  
  const [country, setCountry] = useState(
    formData?.country || selectedEvent?.country || []
  );
  
  const [locationVenue, setLocationVenue] = useState(
    formData?.locationVenue || selectedEvent?.locationVenue || ""
  );
  
  const [city, setCity] = useState(
    formData?.city || selectedEvent?.city || ""
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

  const [isRegionError, setIsRegionError] = useState(false);
  const [isSubRegionError, setIsSubRegionError] = useState(false);
  const [isCountryError, setIsCountryError] = useState(false);
  const [isCityError, setIsCityError] = useState(false);

  const saveAndNavigate = useFormNavigation();

  const handlePrevious = () => {
    saveAndNavigate({ region, subRegion, country }, "/create-event");
  };

  const handleDelete = (subRegionToDelete) => (event) => {
    event.stopPropagation();
    setSubRegion((currentSubRegions) =>
      currentSubRegions.filter((subRegion) => subRegion !== subRegionToDelete)
    );
  };

  const handleCountryDelete = (countryToDelete) => (event) => {
    event.stopPropagation();
    setCountry((currentCountries) =>
      currentCountries.filter((country) => country !== countryToDelete)
    );
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSubRegion(typeof value === "string" ? value.split(",") : value);
  };

  const handleNext = async () => {
    setLoading(true);

    const isRegionValid = region?.trim() !== "";    
    const isSubRegionValid = subRegion.length > 0;
    const isCountryValid = country.length > 0;
    // const isCityValid = city?.trim() !== "";
    setIsRegionError(!isRegionValid);
    setIsSubRegionError(!isSubRegionValid);
    setIsCountryError(!isCountryValid);
    // setIsCityError(!isCityValid);
    const formIsValid =
      isRegionValid && isSubRegionValid && isCountryValid;

    if (!formIsValid) {
      setIsFormValid(false);
      setLoading(false);
      return;
    }

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
        setSnackbarMessage("Details saved and published successfully!");
        setSnackbarOpen(true);
        setTimeout(() => {
          setLoading(false);
          saveAndNavigate(currentFormData, "/extra");
        }, 1500);

      } else {
        setSnackbarMessage("Failed to save and publish.");
        setLoading(false);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving and publishing.");
      setLoading(false);
      setSnackbarOpen(true);
    } 
  };


  useEffect(() => {
    const currentFormData = {
      region,
      subRegion,
      country,
      city,
      locationVenue,
    };
  
    updateFormData(currentFormData);
  }, [region, subRegion, country, city, locationVenue, updateFormData]);

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setRegion(selectedRegion);

    const subregionsForRegion =
      regionsData.find((data) => data.region === selectedRegion)?.subregions ||
      [];
    setAvailableSubregions(subregionsForRegion);

    setSubRegion([]);
    setCountry([]);
  };
  useEffect(() => {
    if (selectedEvent) {
      const subregionsForRegion =
        regionsData.find((data) => data.region === selectedEvent.region)?.subregions || [];
      setAvailableSubregions(subregionsForRegion);
  
      const countriesForSubregions = selectedEvent.subRegion.flatMap(
        (selectedSubregion) =>
          subregionsData.find((data) => data.subregion === selectedSubregion)?.countries || []
      );
      setAvailableCountries(countriesForSubregions);
    }
  }, [selectedEvent]);
  
  const handleSubRegionChange = (e) => {
    const selectedSubregions = e.target.value;
    setSubRegion(selectedSubregions);

    const countriesForSubregions = selectedSubregions.flatMap(
      (selectedSubregion) =>
        subregionsData.find((data) => data.subregion === selectedSubregion)
          ?.countries || [] 
    );
    setAvailableCountries(countriesForSubregions);
    setCountry([...new Set(countriesForSubregions)]);
  };

  
  const handleSaveAsDraft = async () => {
    const isDraft = formData.isDraft !== undefined ? formData.isDraft : true;

    const draftData = {
      region,
      subRegion,
      country,
      isDraft,
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
            {/* Region Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isRegionError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Region *
                </Typography>
                <Select value={region || ''}  onChange={handleRegionChange}>
                  {regionOptions.map((region, idx) => (
                    <MenuItem key={idx} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </Select>
                {isRegionError && (
                  <Typography variant="body2" color="error">
                    Region is required
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Sub-Region Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isSubRegionError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Sub-region *
                </Typography>
                <Select
                  multiple
                  value={subRegion}
                  onChange={handleSubRegionChange}
                  renderValue={(selected) => (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                    >
                      {selected.map((subRegion) => (
                        <Chip
                          key={subRegion}
                          label={subRegion}
                          onDelete={handleDelete(subRegion)}
                          style={{ margin: "2px" }}
                          onMouseDown={(event) => {
                            event.stopPropagation();
                          }}
                        />
                      ))}
                    </div>
                  )}
                >
                  {availableSubregions &&
                    availableSubregions.map((subRegion, idx) => (
                      <MenuItem key={idx} value={subRegion}>
                        {subRegion}
                      </MenuItem>
                    ))}
                </Select>
                {isSubRegionError && (
                  <Typography variant="body2" color="error">
                    Sub-region is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {/* Country Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth error={isCountryError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Country *
                </Typography>
                <Select
                  multiple
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  renderValue={(selected) => (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
                    >
                      {selected.map((country) => (
                        <Chip
                          key={country}
                          label={country}
                          onDelete={handleCountryDelete(country)}
                          style={{ margin: "2px" }}
                          onMouseDown={(event) => {
                            event.stopPropagation();
                          }}
                        />
                      ))}
                    </div>
                  )}
                >
                  {availableCountries.map((country, idx) => (
                    <MenuItem key={idx} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
                {isCountryError && (
                  <Typography variant="body2" color="error">
                    Country is required
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={isCityError}>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  City
                </Typography>
                <TextField
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  fullWidth
                  error={isCityError}
                  helperText={isCityError ? "City is required" : ""} //
                />
              </FormControl>
            </Grid>
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
          <div className="form-navigation-buttons">
            <Button
              variant="outlined"
              onClick={handlePrevious}
              style={{
                backgroundColor: "white",
                color: "#202124",
                border: "1px solid #dadce0",
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                float: "left",
                margin: "5px",
              }}
            >
              Previous
            </Button>
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
                  backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent background
                  borderRadius: "8px", // Optional: match the button's border-radius
                  zIndex: 1, // Ensure it appears on top
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Button */}
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
