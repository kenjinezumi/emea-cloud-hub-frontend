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
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import "../styles/Forms.css";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function LocationFormPage() {
  const { formData, updateFormData, selectedEvent, setCurrentView } =
    useContext(GlobalContext);

  const [loading, setLoading] = useState(false);

  // NEW: Toggle for publish/draft
  const [isPublished, setIsPublished] = useState(
    formData?.isPublished || false
  );

  // 1) Region, SubRegion, Country
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

  // 2) City => an array of strings
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

  // Lists of subregions/countries to pick from
  const [availableSubregions, setAvailableSubregions] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);

  // UI states
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  // Confirmation dialog for publishing
  const [dialogOpen, setDialogOpen] = useState(false);

  const saveAndNavigate = useFormNavigation();

  /**
   * Keep formData updated as user changes region/subRegion/country/city
   */
  useEffect(() => {
    const currentFormData = {
      ...formData,
      region,
      subRegion,
      country,
      city,
      locationVenue,
      // Also remember user’s publishing choice
      isPublished,
    };
    updateFormData(currentFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, subRegion, country, city, locationVenue, isPublished]);

  /**
   * On mount (and if selectedEvent changes), fill subregions/countries
   */
  useEffect(() => {
    if (selectedEvent && Array.isArray(selectedEvent.region)) {
      // Build subregions from all selected regions
      const allSubregions = selectedEvent.region.flatMap((selectedReg) => {
        const regionObj = regionsData.find((rd) => rd.region === selectedReg);
        return regionObj ? regionObj.subregions : [];
      });
      setAvailableSubregions([...new Set(allSubregions)]);

      // Then do the same for subRegion => countries
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

  // -----------------------------
  // Region changes => reset others
  // -----------------------------
  const handleRegionChange = (e) => {
    const selectedRegions = e.target.value;
    setRegion(
      typeof selectedRegions === "string"
        ? selectedRegions.split(",")
        : selectedRegions
    );
    // Clear subRegion & country
    setSubRegion([]);
    setCountry([]);

    const allSubregions = selectedRegions.flatMap((selectedReg) => {
      const regionObj = regionsData.find((rd) => rd.region === selectedReg);
      return regionObj ? regionObj.subregions : [];
    });
    setAvailableSubregions([...new Set(allSubregions)]);
    setAvailableCountries([]);
  };

  // -----------------------------
  // Subregion changes => update countries
  // -----------------------------
  const handleSubRegionChange = (e) => {
    const selectedSubregions = e.target.value;
    setSubRegion(selectedSubregions);

    const countriesForSubregions = selectedSubregions.flatMap((sr) => {
      return (
        subregionsData.find((data) => data.subregion === sr)?.countries || []
      );
    });
    setAvailableCountries(countriesForSubregions);
    setCountry([]); // reset
  };

  // -----------------------------
  // City handling
  // -----------------------------
  const handleAddCity = () => {
    const trimmed = newCity.trim();
    if (trimmed && !city.includes(trimmed)) {
      setCity([...city, trimmed]);
      setNewCity("");
    } else {
      setSnackbarMessage("Empty or duplicate city name.");
      setIsError(true);
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
      setSnackbarMessage(
        "No valid or unique city names found in the pasted text."
      );
      setIsError(true);
      setSnackbarOpen(true);
    }
  };

  // -----------------------------
  // “Previous” => go back
  // -----------------------------
  const handlePrevious = () => {
    saveAndNavigate({ region, subRegion, country, city }, "/create-event");
  };

  // -----------------------------
  // Single "Next" button
  // If isPublished = false => save draft
  // If isPublished = true => confirm & publish
  // -----------------------------
  const handleNext = () => {
    if (isPublished) {
      setDialogOpen(true); // confirm
    } else {
      handleSaveDraft();
    }
  };

  // Actually do the draft saving
  const handleSaveDraft = async () => {
    setLoading(true);
    const draftData = {
      ...formData,
      region,
      subRegion,
      country,
      city,
      locationVenue,
      isDraft: true,
      isPublished: false,
    };
    updateFormData(draftData);

    try {
      const response = await sendDataToAPI(draftData);
      if (response.success) {
        setSnackbarMessage("Details saved as draft successfully!");
        setIsError(false);
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage("Failed to save draft.");
        setIsError(true);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the draft.");
      setIsError(true);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // On confirm => validate & publish
  const handleConfirmPublish = async () => {
    setLoading(true);

    // Minimal required fields check
    const isRegionValid = region.length > 0;
    const isSubRegionValid = subRegion.length > 0;
    const isCountryValid = country.length > 0;
    const isCityValid = city.length > 0;

    if (
      !isRegionValid ||
      !isSubRegionValid ||
      !isCountryValid ||
      !isCityValid
    ) {
      setSnackbarMessage(
        "All required fields (Regions, Sub-Regions, Countries, Cities) must be filled."
      );
      setIsError(true);
      setSnackbarOpen(true);
      setDialogOpen(false);
      setLoading(false);
      return;
    }

    // Now publish
    const publishedData = {
      ...formData,
      region,
      subRegion,
      country,
      city,
      locationVenue,
      isDraft: false,
      isPublished: true,
    };
    updateFormData(publishedData);

    try {
      const response = await sendDataToAPI(publishedData);
      if (response.success) {
        setSnackbarMessage("Location details saved and published successfully!");
        setIsError(false);
        setSnackbarOpen(true);
        setCurrentView("month");
        // Navigate back to main or next route
        saveAndNavigate({}, "/");
      } else {
        setSnackbarMessage("Failed to save and publish location data.");
        setIsError(true);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while publishing location data.");
      setIsError(true);
      setSnackbarOpen(true);
    } finally {
      setDialogOpen(false);
      setLoading(false);
    }
  };

  const handleCloseDialog = () => setDialogOpen(false);
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <div className="h-screen flex flex-col">
      <CalendarHeaderForm />

      <div className="form-container">
        <div className="event-form">
          <Typography
            variant="h4"
            className="form-title"
            style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
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
              <FormControl fullWidth>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Regions *
                </Typography>
                <Select
                  multiple
                  value={region}
                  onChange={handleRegionChange}
                  input={<OutlinedInput label="Regions" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((val) => (
                        <Chip key={val} label={val} />
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
              </FormControl>
            </Grid>

            {/* SUB-REGION MULTI-SELECT */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Sub-regions *
                </Typography>
                <Select
                  multiple
                  value={subRegion}
                  onChange={handleSubRegionChange}
                  input={<OutlinedInput label="Sub-Regions" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((sr) => (
                        <Chip
                          key={sr}
                          label={sr}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableSubregions.map((sr, idx) => (
                    <MenuItem key={idx} value={sr}>
                      {sr}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* COUNTRY MULTI-SELECT */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Countries *
                </Typography>
                <Select
                  multiple
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  input={<OutlinedInput label="Countries" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          onMouseDown={(e) => e.stopPropagation()}
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
              </FormControl>
            </Grid>

            {/* CITY as an array with text+chips */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Cities *
              </Typography>
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
            </Grid>

            {/* LOCATION VENUE */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Location Venue
              </Typography>
              <TextField
                value={locationVenue}
                onChange={(e) => setLocationVenue(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Publish Toggle */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography>Publish this event?</Typography>}
            />
          </Grid>

          {/* Buttons / spinner overlay */}
          <div style={{ marginTop: "20px", position: "relative" }}>
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

            {/* Previous Button */}
            <Button
              variant="outlined"
              onClick={handlePrevious}
              sx={{
                backgroundColor: "white",
                color: "#202124",
                border: "1px solid #dadce0",
                boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                m: 1,
              }}
            >
              Previous
            </Button>

            {/* Next Button */}
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                backgroundColor: blue[500],
                color: "white",
                m: 1,
                "&:hover": {
                  backgroundColor: blue[700],
                },
              }}
              disabled={loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Global SnackBar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          style: { backgroundColor: isError ? "red" : "green" },
        }}
      />

      {/* Confirmation Dialog for Publish */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-publish-title"
        aria-describedby="confirm-publish-description"
      >
        <DialogTitle id="confirm-publish-title">Confirm Save and Publish</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-publish-description">
            Please ensure the location fields are accurate. Once published,
            users can see or use this location info.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Exit
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPublish}
            sx={{
              backgroundColor: blue[500],
              color: "white",
              m: 1,
              "&:hover": { backgroundColor: blue[700] },
            }}
            disabled={loading}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
