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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EmailIcon from "@mui/icons-material/Email";
import { blue } from "@mui/material/colors";
import { languageOptions } from "../filters/FiltersData";
import { sendDataToAPI } from "../../api/pushData";
import GlobalContext from "../../context/GlobalContext";
import CalendarHeaderForm from "../commons/CalendarHeaderForm";
import { useFormNavigation } from "../../hooks/useFormNavigation";
import "../styles/Forms.css";

const platformOptions = ["Gmail", "Salesloft"];

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
const EventFormEmailInvitation = () => {
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [languagesAndTemplates, setLanguagesAndTemplates] = useState(
    formData?.languagesAndTemplates?.length > 0
      ? formData.languagesAndTemplates
      : selectedEvent?.languagesAndTemplates?.length > 0
      ? selectedEvent.languagesAndTemplates
      : []
  );

  const [isFormValid, setIsFormValid] = useState(true);
  const saveAndNavigate = useFormNavigation();
  const [editorContent, setEditorContent] = useState("");
  const quillRefs = useRef([]);

  useEffect(() => {
    // Compare old array vs. new array to prevent an unnecessary update
    const oldTemplates = formData?.languagesAndTemplates ?? [];
    if (JSON.stringify(oldTemplates) !== JSON.stringify(languagesAndTemplates)) {
      // Only update if there's a real difference
      updateFormData({
        ...formData,
        languagesAndTemplates,
      });
    }
    // NOTE: if formData has other fields that can change, see #2 below
  }, [languagesAndTemplates, formData, updateFormData]);
  

  const handleAddLanguageAndTemplate = () => {
    setLanguagesAndTemplates([
      ...languagesAndTemplates,
      { platform: "", language: "", template: "", subjectLine: "" },
    ]);
  };

  const handleRemoveLanguageAndTemplate = (index) => {
    if (languagesAndTemplates.length > 1) {
      const updatedItems = languagesAndTemplates.filter(
        (_, idx) => idx !== index
      );
      setLanguagesAndTemplates(updatedItems);
    } else {
      setSnackbarMessage("At least one email language is required.");
      setSnackbarOpen(true);
    }
  };

  const handlePlatformChange = (value, index) => {
    const updatedItems = [...languagesAndTemplates];
    updatedItems[index].platform = value;
    setLanguagesAndTemplates(updatedItems);
  };

  const handleLanguageChange = (value, index) => {
    const updatedItems = [...languagesAndTemplates];
    updatedItems[index].language = value;
    setLanguagesAndTemplates(updatedItems);
  };

  const handleTemplateChange = (value, index) => {
    const updatedItems = [...languagesAndTemplates];
    updatedItems[index].template = value;
    setLanguagesAndTemplates(updatedItems);
  };

  const handlePersonalizationInsert = (token, index) => {
    // Access the correct editor from refs
    const quillEditor = quillRefs.current[index]?.getEditor();

    if (quillEditor) {
      // Focus the editor to ensure it's active
      quillEditor.focus();

      // Get the current cursor position
      const selection = quillEditor.getSelection();

      if (selection && selection.index != null) {
        // Insert token at the cursor position
        const cursorPosition = selection.index;
        quillEditor.insertText(cursorPosition, token);

        // Move the cursor to the end of the inserted token
        quillEditor.setSelection(cursorPosition + token.length);
      } else {
        // If no selection, append token to the end of the current content
        const currentContent = quillEditor.getText();
        quillEditor.setText(`${currentContent.trim()} ${token}`);
      }
    } else {
      console.warn("Quill editor not available for index:", index);
    }
  };

  const handleSubjectLineChange = (value, index) => {
    setLanguagesAndTemplates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, subjectLine: value } : item
      )
    );
  };

  const handleEditorChange = (content, index) => {
    setLanguagesAndTemplates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, template: content } : item
      )
    );
  };

  const handleNext = async () => {
    setLoading(true);

    const formIsValid = languagesAndTemplates.every(
      (item) =>
        item.language.trim() !== "" &&
        item.template.trim() !== "" &&
        item.subjectLine.trim() !== ""
    );
    const updatedFormData = {
      ...formData,
      languagesAndTemplates,
      isDraft: true,
      isPublished: false,
    };
    updateFormData(updatedFormData);

    try {
      const response = await sendDataToAPI(updatedFormData, "draft");
      if (response.success) {
        setSnackbarMessage("Draft saved successfully!");
        setSnackbarOpen(true);
        setTimeout(() => {
          setLoading(false);
          saveAndNavigate(updatedFormData, "/audience");
        }, 1500);
      } else {
        setSnackbarMessage("Failed to save draft.");
        setLoading(false);
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("An error occurred while saving the draft.");
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handlePrevious = () => {
    saveAndNavigate({ languagesAndTemplates }, "/extra");
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
                  Email invitation
                </span>
              </Typography>
            </Grid>
          </Grid>

          <form noValidate>
            <Grid container spacing={2} sx={{ mb: 3 }}>
            {languagesAndTemplates.length > 0 ? (

              languagesAndTemplates.map((item, index) => (
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
                    ? // If a platform is selected:
                      `${item.platform}${item.language ? ` - ${item.language}` : ""}`
                    : // If no platform is selected, display 'Add'
                      "Add"
    }
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={2}>
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
                                !languagesAndTemplates.some(
                                  (templateItem, idx) =>
                                    templateItem.language === language &&
                                    templateItem.platform === item.platform &&
                                    idx !== index // Ensure the current item is not filtered out
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

                      <Grid item xs={12}>
                        <Typography variant="subtitle1">
                          Email Subject Line
                        </Typography>
                        <TextField
                          label=""
                          value={item.subjectLine || ""}
                          onChange={(e) =>
                            handleSubjectLineChange(e.target.value, index)
                          }
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Email Body</Typography>

                        {/* Check if the platform is Salesloft, then show ReactQuill */}
                        {item.platform === "Salesloft" ? (
                          <>
                            <ReactQuill
                              ref={(el) => (quillRefs.current[index] = el)} // Assign unique ref for each editor
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
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  ["bold", "italic", "underline"],
                                  ["link", "image"],
                                  ["clean"],
                                ],
                              }}
                            />

                            <div style={{ marginTop: "20px", pt: "40px" }}>
                              <Typography
                                variant="subtitle1"
                                style={{ marginTop: "50px", pt: "40px" }}
                              >
                                Insert Personalisation Tokens:
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
                          // Render a regular text field for Gmail
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
                                [{ list: "ordered" }, { list: "bullet" }],
                                ["bold", "italic", "underline"],
                                ["link", "image"],
                                ["clean"],
                              ],
                            }}
                          />
                        )}
                      </Grid>
                      {index > 0 && (
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() =>
                              handleRemoveLanguageAndTemplate(index)
                            }
                            style={{
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
              ))
            ): (
              // Render a message or simply nothing if you don't want to display anything
              <Typography></Typography>
            )}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={handleAddLanguageAndTemplate}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {!isFormValid && (
              <Typography color="error" sx={{ mb: 2 }}>
                Please fill in all required fields.
              </Typography>
            )}

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message={snackbarMessage}
            />

            {/* Button container aligned to the right */}
            <div style={{ marginTop: "20px", textAlign: "right" }}>
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventFormEmailInvitation;
