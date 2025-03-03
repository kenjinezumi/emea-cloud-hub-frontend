import React, { useEffect, useContext, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  Autocomplete,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailIcon from "@mui/icons-material/Email";
import { blue } from "@mui/material/colors";

// Custom imports
import { languageOptions } from "../filters/FiltersData";
import { sendDataToAPI } from "../../api/pushData";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import "../styles/Forms.css";

// Options for the "platform" dropdown
const platformOptions = ["Gmail", "Salesloft"];

// Personalization tokens for Salesloft
const personalizationOptions = [
  "{{first_name}}",
  "{{last_name}}",
  "{{name}}",
  "{{company}}",
  "{{title}}",
  "{{industry}}",
  "{{My.name}}",
  "{{My.first_name}}",
  "{{My.last_name}}",
  "{{My.email_address}}",
];

export default function EventFormEmailInvitation() {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  // NEW: Toggle for publish/draft
  const [isPublished, setIsPublished] = useState(
    formData?.isPublished || false
  );

  // “languagesAndTemplates” is an array of objects: 
  // [{ platform, language, subjectLine, template }]
  const [languagesAndTemplates, setLanguagesAndTemplates] = useState(
    formData?.languagesAndTemplates?.length > 0
      ? formData.languagesAndTemplates
      : selectedEvent?.languagesAndTemplates?.length > 0
      ? selectedEvent.languagesAndTemplates
      : []
  );

  const saveAndNavigate = useFormNavigation();
  const quillRefs = useRef([]); // Refs for each ReactQuill instance

  /**
   * Keep formData updated as user changes fields
   */
  useEffect(() => {
    const oldTemplates = formData?.languagesAndTemplates ?? [];
    if (JSON.stringify(oldTemplates) !== JSON.stringify(languagesAndTemplates)) {
      updateFormData({
        ...formData,
        languagesAndTemplates,
        // Also store isPublished so we remember user's choice
        isPublished,
      });
    }
    // If you have more fields in formData, include them as well
  }, [languagesAndTemplates, isPublished, formData, updateFormData]);

  // Add a new item to languagesAndTemplates
  const handleAddLanguageAndTemplate = () => {
    setLanguagesAndTemplates((prev) => [
      ...prev,
      { platform: "", language: "", template: "", subjectLine: "" },
    ]);
  };

  // Remove an existing item
  const handleRemoveLanguageAndTemplate = (index) => {
    if (languagesAndTemplates.length > 1) {
      const updated = languagesAndTemplates.filter((_, idx) => idx !== index);
      setLanguagesAndTemplates(updated);
    } else {
      setSnackbarMessage("At least one email language is required.");
      setSnackbarOpen(true);
    }
  };

  // Platform change (Gmail / Salesloft)
  const handlePlatformChange = (value, index) => {
    setLanguagesAndTemplates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, platform: value } : item))
    );
  };

  // Language change
  const handleLanguageChange = (value, index) => {
    setLanguagesAndTemplates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, language: value } : item))
    );
  };

  // Editor change
  const handleEditorChange = (content, index) => {
    setLanguagesAndTemplates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, template: content } : item))
    );
  };

  // Subject line change
  const handleSubjectLineChange = (value, index) => {
    setLanguagesAndTemplates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, subjectLine: value } : item))
    );
  };

  // Insert a personalization token into the Quill editor
  const handlePersonalizationInsert = (token, index) => {
    const quillEditor = quillRefs.current[index]?.getEditor();
    if (!quillEditor) return;

    quillEditor.focus();
    const selection = quillEditor.getSelection();
    if (selection && selection.index != null) {
      const cursorPosition = selection.index;
      quillEditor.insertText(cursorPosition, token);
      quillEditor.setSelection(cursorPosition + token.length);
    } else {
      // Append token to the end if no cursor position
      const currentContent = quillEditor.getText();
      quillEditor.setText(`${currentContent.trim()} ${token}`);
    }
  };

  // Previous step
  const handlePrevious = () => {
    saveAndNavigate({ languagesAndTemplates, isPublished }, "/extra");
  };

  // Next step
  const handleNext = async () => {
    setLoading(true);

    // 1) If any language is missing, default it to "English"
    const corrected = languagesAndTemplates.map((item) => {
      if (!item.language || !item.language.trim()) {
        return { ...item, language: "English" };
      }
      return item;
    });

    // 2) Validate presence of language, subject line, and template
    const formIsValid = corrected.every(
      (item) =>
        item.language.trim() !== "" &&
        item.subjectLine.trim() !== "" &&
        item.template.trim() !== ""
    );
    setIsFormValid(formIsValid);

    if (!formIsValid) {
      setSnackbarMessage(
        "Please ensure each entry has a language, subject line, and template."
      );
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // 3) Prepare final data (decide if draft or published)
    const updatedFormData = {
      ...formData,
      languagesAndTemplates: corrected,
      isDraft: !isPublished,     // If not published, it's a draft
      isPublished: isPublished,  // True if published, false otherwise
    };

    updateFormData(updatedFormData);

    // 4) Send to API
    try {
      const response = await sendDataToAPI(updatedFormData, "draft");
      if (response.success) {
        setSnackbarMessage(
          isPublished
            ? "Event published successfully!"
            : "Draft saved successfully!"
        );
        setSnackbarOpen(true);

        setTimeout(() => {
          setLoading(false);
          saveAndNavigate(updatedFormData, "/audience");
        }, 1500);
      } else {
        setSnackbarMessage("Failed to save or publish.");
        setSnackbarOpen(true);
        setLoading(false);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving.");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ overscrollBehavior: "contain" }}
    >
      <CalendarHeaderForm />

      <div className="form-container" style={{ overscrollBehavior: "contain" }}>
        <div className="event-form">
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Grid item xs={12}>
              <Typography
                variant="h4"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.5rem",
                }}
              >
                <EmailIcon
                  style={{
                    marginRight: "10px",
                    color: blue[500],
                    height: "40px",
                  }}
                />
                <span className="mr-1 text-xl text-black cursor-pointer">
                  Email Invitation
                </span>
              </Typography>
            </Grid>
          </Grid>

          <form noValidate>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {languagesAndTemplates.map((item, index) => (
                <Accordion
                  key={index}
                  sx={{ width: "100%", marginBottom: "8px" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-content-${index}`}
                    id={`panel-header-${index}`}
                  >
                    <Typography>
                      {item.platform
                        ? `${item.platform}${item.language ? ` - ${item.language}` : ""}`
                        : "Add"}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {/* Platform */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Typography variant="subtitle1">Platform</Typography>
                          <Select
                            value={item.platform}
                            onChange={(e) =>
                              handlePlatformChange(e.target.value, index)
                            }
                            fullWidth
                          >
                            {platformOptions.map((platform) => (
                              <MenuItem key={platform} value={platform}>
                                {platform}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Language */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Typography variant="subtitle1">
                            Email Language
                          </Typography>
                          <Autocomplete
                            value={item.language || ""}
                            onChange={(event, newValue) => {
                              handleLanguageChange(newValue, index);
                            }}
                            freeSolo
                            options={languageOptions.filter(
                              (language) =>
                                // Disallow duplicates for the same platform
                                !languagesAndTemplates.some(
                                  (other, idx2) =>
                                    other.language === language &&
                                    other.platform === item.platform &&
                                    idx2 !== index
                                )
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Language"
                                variant="outlined"
                              />
                            )}
                          />
                        </FormControl>
                      </Grid>

                      {/* Subject Line */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">
                          Email Subject Line
                        </Typography>
                        <TextField
                          value={item.subjectLine || ""}
                          onChange={(e) =>
                            handleSubjectLineChange(e.target.value, index)
                          }
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>

                      {/* Email Body */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Email Body</Typography>
                        {item.platform === "Salesloft" ? (
                          <>
                            <ReactQuill
                              ref={(el) => (quillRefs.current[index] = el)}
                              value={item.template || ""}
                              onChange={(content) =>
                                handleEditorChange(content, index)
                              }
                              style={{
                                height: "300px",
                                maxHeight: "400px",
                                marginBottom: "20px",
                              }}
                              modules={{
                                toolbar: [
                                  [
                                    { header: "1" },
                                    { header: "2" },
                                    { font: [] },
                                  ],
                                  [
                                    { list: "ordered" },
                                    { list: "bullet" },
                                  ],
                                  ["bold", "italic", "underline"],
                                  ["link", "image"],
                                  ["clean"],
                                ],
                              }}
                            />

                            <div style={{ marginTop: "20px", pt: "40px" }}>
                              <Typography
                                variant="subtitle1"
                                style={{ marginTop: "50px" }}
                              >
                                Insert Personalization Tokens:
                              </Typography>
                              {personalizationOptions.map((token, idx) => (
                                <Button
                                  key={idx}
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    handlePersonalizationInsert(token, index)
                                  }
                                  sx={{ margin: "5px" }}
                                >
                                  {token}
                                </Button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <ReactQuill
                            value={item.template || ""}
                            onChange={(content) =>
                              handleEditorChange(content, index)
                            }
                            style={{
                              height: "300px",
                              maxHeight: "400px",
                              marginBottom: "20px",
                            }}
                            modules={{
                              toolbar: [
                                [
                                  { header: "1" },
                                  { header: "2" },
                                  { font: [] },
                                ],
                                [
                                  { list: "ordered" },
                                  { list: "bullet" },
                                ],
                                ["bold", "italic", "underline"],
                                ["link", "image"],
                                ["clean"],
                              ],
                            }}
                          />
                        )}
                      </Grid>

                      {/* Remove button if not the first item */}
                      {index > 0 && (
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => handleRemoveLanguageAndTemplate(index)}
                            sx={{
                              color: "#d32f2f",
                              borderColor: "#d32f2f",
                              marginTop: "1px",
                              textTransform: "none",
                            }}
                          >
                            Remove
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              <Grid item xs={12}>
                <Button variant="outlined" onClick={handleAddLanguageAndTemplate}>
                  Add
                </Button>
              </Grid>
            </Grid>

            {/* Publish toggle */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    name="isPublished"
                    color="primary"
                  />
                }
                label={<Typography>Publish this event?</Typography>}
              />
            </Grid>

            {/* Validation error */}
            {!isFormValid && (
              <Typography color="error" sx={{ mt: 2 }}>
                Please fill in all required fields.
              </Typography>
            )}

            {/* Snackbar */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
            />

            {/* Navigation buttons */}
            <div style={{ marginTop: "20px", textAlign: "right", position: "relative" }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                sx={{
                  color: "#202124",
                  border: "1px solid #dadce0",
                  boxShadow: "0 1px 2px 0 rgba(60,64,67,0.302)",
                  marginRight: 2,
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
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "8px",
                    zIndex: 1,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}

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
                disabled={loading}
              >
                Next
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
