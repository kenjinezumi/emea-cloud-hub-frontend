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
} from "@mui/material";
import "../styles/Forms.css";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";

export default function LocationFormPage() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);

  const [region, setRegion] = useState(
    selectedEvent ? selectedEvent.region : formData.region || ""
  );

  const [subRegion, setSubRegion] = useState(
    selectedEvent ? selectedEvent.subRegion : formData.subRegion || []
  );

  const [open, setOpen] = useState(false);

  const [country, setCountry] = useState(
    selectedEvent ? selectedEvent.country : formData.country || []
  );
  const [availableSubregions, setAvailableSubregions] = useState(
    formData.availableSubregions || []
  );
  const [availableCountries, setAvailableCountries] = useState(
    formData.availableCountries || []
  );
  const [locationVenue, setLocationVenue] = useState(
    selectedEvent ? selectedEvent.locationVenue : formData.locationVenue || ""
  );

  const [city, setCity] = useState(
    selectedEvent ? selectedEvent.city : formData.city || ""
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

  const handleNext = () => {
    const isRegionValid = region.trim() !== "";
    const isSubRegionValid = subRegion.length > 0;
    const isCountryValid = country.length > 0;
    const isCityValid = city.trim() !== "";
    setIsRegionError(!isRegionValid);
    setIsSubRegionError(!isSubRegionValid);
    setIsCountryError(!isCountryValid);
    setIsCityError(!isCityValid);
    const formIsValid =
      isRegionValid && isSubRegionValid && isCountryValid && isCityValid;

    if (!formIsValid) {
      setIsFormValid(false);
      return;
    }

    const currentFormData = { region, subRegion, country, city, locationVenue };
    saveAndNavigate(currentFormData, "/extra");
  };
  useEffect(() => {
    const currentFormData = {
      region,
      subRegion,
      country,
      city,
      locationVenue,
      availableSubregions,
      availableCountries,
    };

    updateFormData(currentFormData);
  }, [
    region,
    subRegion,
    country,
    city,
    locationVenue,
    availableSubregions,
    availableCountries,
    updateFormData,
  ]);

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
                  Region
                </Typography>
                <Select value={region} onChange={handleRegionChange}>
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
                  Sub-region
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
                  Country
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
            <Button
              variant="contained"
              onClick={handleNext}
              className="next-button"
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "right",
                margin: "5px",
              }}
            >
              Next
            </Button>
            {/* <Button
              variant="contained"
              onClick={handleSaveAsDraft}
              style={{
                backgroundColor: blue[500],
                color: "white",
                float: "left",
                margin: "5px",
              }}
            >
              Save as Draft
            </Button> */}
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
