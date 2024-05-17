import React, { useContext, useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { blue } from "@mui/material/colors";
import { sendDataToAPI } from "../../api/pushData"; 

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
  const [isFormValid, setIsFormValid] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const navigate = useNavigate();

  const handlePrevious = () => {
    navigate("/create-event");
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
    setSubRegion(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const handleNext = () => {
    let formIsValid = Array.isArray(region)
      ? region.map(String).join("").trim()
      : String(region).trim();

    // Check if form is valid
    if (!formIsValid) {
      setIsFormValid(false);
      return;
    }

    if (!subRegion.length || !country.length) {
      setIsFormValid(false);
      return;
    }

    const currentFormData = { region, subRegion, country };
    updateFormData({ ...formData, ...currentFormData });
    navigate("/extra");
  };

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setRegion(selectedRegion);

    // Filter available subregions based on the selected region
    const subregionsForRegion =
      regionsData.find((data) => data.region === selectedRegion)?.subregions ||
      [];
    setAvailableSubregions(subregionsForRegion);

    // Clear the selected subregions and countries
    setSubRegion([]);
    setCountry([]);
  };

  const handleSubRegionChange = (e) => {
    const selectedSubregions = e.target.value;
    setSubRegion(selectedSubregions);

    // Filter available countries based on the selected subregions
    const countriesForSubregions = selectedSubregions.flatMap(
      (selectedSubregion) =>
        subregionsData.find((data) => data.subregion === selectedSubregion)
          ?.countries || []
    );
    setAvailableCountries(countriesForSubregions); // Make sure this is set to update available countries
    setCountry([...new Set(countriesForSubregions)]);
  };

  const handleSaveAsDraft = async () => {
    const isDraft = formData.isDraft !== undefined ? formData.isDraft : true;

    const draftData = {
      region,
      subRegion,
      country,
      isDraft,
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
              <FormControl fullWidth>
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
              </FormControl>
            </Grid>

            {/* Sub-Region Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Sub-region
                </Typography>
                <Select
                  multiple
                  value={subRegion}
                  onChange={handleSubRegionChange}
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {selected.map((subRegion) => (
                        <Chip
                          key={subRegion}
                          label={subRegion}
                          onDelete={handleDelete(subRegion)} // Pass the subRegion directly to handleDelete
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
              </FormControl>
            </Grid>
            {/* Country Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle1" style={{ marginBottom: "4px" }}>
                  Country
                </Typography>
                <Select
                  multiple
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
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
            <Button
              variant="contained"
              onClick={handleSaveAsDraft}
              style={{
                backgroundColor: blue[500], // using MUI's blue color
                color: "white",
                float: "left", // Align it to the left of the Next button
                margin: "5px",
              }}
            >
              Save as Draft
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
