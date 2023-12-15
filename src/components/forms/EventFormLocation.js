import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../../context/GlobalContext";
import { countryOptions, regionOptions, subRegionOptions } from "../filters/FiltersData";
import { Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Forms.css";
import {ReactComponent as LocationLogo} from '../../assets/svg/location.svg';

export default function LocationFormPage() {
    const { formData, updateFormData } = useContext(GlobalContext);
    const [region, setRegion] = useState("");
    const [subRegion, setSubRegion] = useState("");
    const [country, setCountry] = useState("");
    const [previousFormData, setPreviousFormData] = useState({});
    const [isFormValid, setIsFormValid] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const savedData = localStorage.getItem("formData");
        if (savedData) {
            setPreviousFormData(JSON.parse(savedData));
        }
    }, []);

    const handlePrevious = () => {
        navigate("/create-event");
    };

    const handleNext = () => {
        const formIsValid = region.trim() && subRegion.trim() && country.trim();
        setIsFormValid(formIsValid);

        if (!formIsValid) {
            return;
        }

        const currentFormData = { region, subRegion, country };
        updateFormData({ ...formData, ...currentFormData });
        navigate("/extra");
    };

    return (
        <div className="form-container">
            <div className="event-form">
                <Typography variant="h4" className="form-title" style={{ display: 'flex', alignItems: 'center', marginBottom:'40px' }}>
                    <LocationLogo style={{ marginRight: '8px', width:'40px', height:'40px' }} />
                    Location
                </Typography>
                <Grid container spacing={3} className="form-grid">
                    {/* Region Dropdown */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Region</InputLabel>
                            <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                                {regionOptions.map((region, idx) => (
                                    <MenuItem key={idx} value={region}>{region}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Sub-Region Dropdown */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Sub-Region</InputLabel>
                            <Select value={subRegion} onChange={(e) => setSubRegion(e.target.value)}>
                                {subRegionOptions.map((subRegion, idx) => (
                                    <MenuItem key={idx} value={subRegion}>{subRegion}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {/* Country Dropdown */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Country</InputLabel>
                            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
                                {countryOptions.map((country, idx) => (
                                    <MenuItem key={idx} value={country}>{country}</MenuItem>
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
                    <Button variant="outlined" onClick={handlePrevious} style={{ backgroundColor: "white", color: "#202124", border: "1px solid #dadce0", boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)", float: "left", margin: "10px" }}>
                        Previous
                    </Button>
                    <Button variant="outlined" onClick={handleNext} className="next-button" style={{ backgroundColor: "#4285F4", color: "white", float: "right", margin: "10px" }}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
