import React from "react";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import ArticleIcon from "@mui/icons-material/Article";

// Utility function to get the styles and icons for different event types
export const getEventStyleAndIcon = (eventType) => {
  switch (eventType) {
    case "Online Event":
      return {
        backgroundColor: "#e3f2fd", 
        color: "#1a73e8", 
        icon: <LanguageIcon fontSize="small" style={{ marginRight: "5px" }} />
      };
    case "Physical Event":
      return {
        backgroundColor: "#fce4ec", 
        color: "#d32f2f", 
        icon: <LocationOnIcon fontSize="small" style={{ marginRight: "5px" }} />
      };
    case "Hybrid Event":
      return {
        backgroundColor: "#f3e5f5", 
        color: "#6a1b9a", 
        icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />
      };
    case "Customer Story":
      return {
        backgroundColor: "#e8f5e9", 
        color: "#2e7d32", 
        icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />
      };
    case "Blog Post":
      return {
        backgroundColor: "#fffde7", 
        color: "#f57f17", 
        icon: <ArticleIcon fontSize="small" style={{ marginRight: "5px" }} />
      };
    default:
      return {
        backgroundColor: "#e3f2fd", 
        color: "#1a73e8", 
        icon: <EventIcon fontSize="small" style={{ marginRight: "5px" }} />
      };
  }
};
