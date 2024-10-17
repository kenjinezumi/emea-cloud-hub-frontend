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
        backgroundColor: "#e3f2fd", // Light blue
        color: "#1a73e8", // Blue
        icon: (
          <LanguageIcon
            fontSize="small"
            style={{ marginRight: "5px", color: "#1a73e8" }} // Icon color consistent with the text color
          />
        ),
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Soft shadow for better visibility
        hoverStyle: {
          backgroundColor: "#bbdefb", // Slightly darker blue on hover
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Enhance shadow on hover
        },
      };
    case "Physical Event":
      return {
        backgroundColor: "#fce4ec", // Light pink
        color: "#d32f2f", // Red
        icon: (
          <LocationOnIcon
            fontSize="small"
            style={{ marginRight: "5px", color: "#d32f2f" }} // Icon color consistent with the text color
          />
        ),
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Soft shadow
        hoverStyle: {
          backgroundColor: "#f8bbd0", // Darker pink on hover
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
        },
      };
    case "Hybrid Event":
      return {
        backgroundColor: "#f3e5f5", // Light purple
        color: "#6a1b9a", // Deep purple
        icon: (
          <EventIcon
            fontSize="small"
            style={{ marginRight: "5px", color: "#6a1b9a" }} // Icon color consistent with the text color
          />
        ),
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Soft shadow
        hoverStyle: {
          backgroundColor: "#e1bee7", // Darker purple on hover
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
        },
      };
    case "Customer Story":
      return {
        backgroundColor: "#e8f5e9", // Light green
        color: "#2e7d32", // Green
        icon: (
          <EventIcon
            fontSize="small"
            style={{ marginRight: "5px", color: "#2e7d32" }} // Icon color consistent with the text color
          />
        ),
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Soft shadow
        hoverStyle: {
          backgroundColor: "#c8e6c9", // Darker green on hover
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
        },
      };
    case "Blog Post":
      return {
        backgroundColor: "#fffde7", // Light yellow
        color: "#f57f17", // Orange-yellow
        icon: (
          <ArticleIcon
            fontSize="small"
            style={{ marginRight: "5px", color: "#f57f17" }} // Icon color consistent with the text color
          />
        ),
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Soft shadow
        hoverStyle: {
          backgroundColor: "#fff9c4", // Darker yellow on hover
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
        },
      };
    default:
      return {
        backgroundColor: "#e3f2fd", // Light blue
        color: "#1a73e8", // Blue
        icon: (
          <EventIcon
            fontSize="small"
            style={{ marginRight: "5px", color: "#1a73e8" }} // Icon color consistent with the text color
          />
        ),
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Soft shadow
        hoverStyle: {
          backgroundColor: "#bbdefb", // Darker blue on hover
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
        },
      };
  }
};
