const express = require("express");
const router = express.Router();
const { BigQuery } = require("@google-cloud/bigquery");
const loadQueriesAsync = require("./utils/queriesLoaders");
const { LoggingWinston } = require("@google-cloud/logging-winston");
const winston = require("winston");
const cors = require("cors");
const { google } = require("googleapis");
const gmail = google.gmail("v1");
const { v4: uuidv4 } = require("uuid");
const OAuth2 = google.auth.OAuth2;

// New imports for login
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cookieSession = require("cookie-session");
// Setup Winston logger
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console(), loggingWinston],
});

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const COOKIE_KEY = process.env.COOKIE_KEY;

console.log(`client id is: ${CLIENT_ID}`);
console.log(`CLIENT_SECRET is: ${CLIENT_SECRET}`);
console.log(`CALLBACK_URLis: ${CALLBACK_URL}`);

console.log(`client id is: ${CLIENT_ID}`);

// Middleware for parsing JSON bodies
module.exports = (firestoreStore) => {
  const session = require("express-session");

  router.use(
    session({
      store: firestoreStore,
      secret: process.env.COOKIE_KEY, // Use the same secure, random key for the cookie
      resave: false, // Avoid resaving the session if nothing has changed
      saveUninitialized: false, // Avoid creating sessions for unauthenticated users
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true, // Prevent client-side access to the cookie
        secure: false, // Only set to true in production with HTTPS
      },
    })
  );

  const corsOptions = {
    origin: "https://cloudhub.googleplex.com", // Your frontend domain
    credentials: true,
  };
  router.use(cors(corsOptions));

  // Google OAuth login route
  router.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/gmail.send", // Add Gmail send scope
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/cloud-platform",
      ],
      accessType: "offline", // To receive a refresh token for long-term access
      prompt: "consent", // Force prompt to ensure refresh token is provided
    })
  );

  router.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.error("Refresh token is required.");
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Initialize the OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    // Set the refresh token in the credentials
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    try {
      // Refresh the access token
      const { credentials } = await oauth2Client.refreshAccessToken();
      logger.info("Access token refreshed successfully.");

      res.status(200).json({
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date,
      });
    } catch (error) {
      logger.error("Error during token refresh:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  });

  // Google OAuth callback route
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
    }),
    async (req, res) => {
      console.log("Authenticated user:", req.user); // Check if tokens are present

      try {
        if (req.user) {
          console.log("User authenticated successfully:", req.user);

          // Trigger session save and log
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session:", err);
            } else {
              console.log("Session saved successfully.");
            }
          });

          res.redirect("https://cloudhub.googleplex.com/auth/success"); // Redirect to the frontend
        } else {
          console.warn(
            "User authentication failed. No user found in the session."
          );
          res.redirect(
            "https://cloudhub.googleplex.com/login?error=AuthenticationFailed"
          );
        }
      } catch (err) {
        console.error("Error during Google OAuth callback:", err.message);
        res.redirect(
          `https://cloudhub.googleplex.com/login?error=OAuthCallbackError&message=${encodeURIComponent(
            err.message
          )}`
        );
      }
    }
  );

  // Send Gmail invite
  const sendGmail = async (accessToken, emailDetails) => {
    try {
      const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
      oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const gmail = google.gmail({
        version: "v1",
        auth: oauth2Client,
      });

      // Create the draft message
      const rawMessage = [
        `To: ${emailDetails.to}`,
        `Subject: ${emailDetails.subject}`,
        "",
        emailDetails.body,
      ].join("\n");

      const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Create a draft
      const draft = await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: {
            raw: encodedMessage,
          },
        },
      });

      console.log("Draft created:", draft);
      return draft;
    } catch (error) {
      console.error("Error creating draft:", error);
      throw error;
    }
  };

  const baseTemplate = `
  <html>
    <body>
      {{bodyContent}}
    </body>
  </html>
`;

  // Function to populate the base template with content
  function populateTemplate(template, bodyContent) {
    // Replace newlines in the body content with <br> for proper HTML rendering
    // const formattedContent = bodyContent.replace(/\n/g, '<br>');

    // Replace the placeholder in the base template with the formatted content
    return template.replace("{{bodyContent}}", bodyContent);
  }

  router.post("/send-gmail-invite", async (req, res) => {
    const { to, subject, body, accessToken } = req.body;

    if (!accessToken) {
      logger.error("Access token not found.");
      return res.status(401).send("Access token not found");
    }

    try {
      logger.info("Proceeding to create Gmail draft.");

      // Use the provided access token
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const gmail = google.gmail({
        version: "v1",
        auth: oauth2Client,
      });

      const emailBody = populateTemplate(baseTemplate, body);

      // Prepare the raw email format
      const email = [
        `To: ${to}`,
        "Content-Type: text/html; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${subject}`,
        "",
        emailBody,
      ].join("\n");

      const encodedMessage = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      logger.info("Encoded email message prepared.", {
        encodedMessage,
      });

      // Create Gmail draft
      const response = await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: {
            raw: encodedMessage,
          },
        },
      });

      if (response && response.data) {
        logger.info("Gmail draft created successfully.", {
          draftId: response.data.id,
        });
        res.status(200).json({
          success: true,
          draftId: response.data.id,
          draftUrl: `https://mail.google.com/mail/u/me/#drafts`,
        });
      } else {
        logger.error(
          "Failed to create Gmail draft. No response data from Gmail API."
        );
        res.status(500).send("Failed to create Gmail draft");
      }
    } catch (error) {
      logger.error("Error while creating Gmail draft", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).send("Failed to create Gmail draft due to server error");
    }
  });

  // Route to log out the user
  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err); // Handle any errors that occur during logout
      }

      // Clear the session and cookies, if needed
      req.session = null; // If you're using express-session, this will destroy the session
      res.clearCookie("connect.sid"); // Clear the session cookie

      // Redirect the user to the homepage or a login page after logout
      res.redirect("/");
    });
  });

  // Route to get current user info
  router.get("/api/current_user", (req, res) => {
    if (req.user) {
      res.json({
        isAuthenticated: true, // Indicating the user is authenticated
        user: req.user,
        accessToken: req.user.accessToken,
        refreshToken: req.user.refreshToken, // Sending the user object from the session
      });
    } else {
      res.status(401).json({
        isAuthenticated: false, // Indicating the user is not authenticated
        message: "User not authenticated",
      });
    }
  });

  // Initialize BigQuery client
  const bigquery = new BigQuery();

  // Handler for GET requests (existing code)
  router.get("/", async (req, res) => {
    const { queryName } = req.query;

    if (!queryName) {
      logger.warn("GET /: Query name is required.");
      return res.status(400).json({
        success: false,
        message: "Query name is required.",
      });
    }

    logger.info("GET /: Query name received.", {
      queryName,
    });
    res.json({
      message: queryName,
    });
  });

  // Endpoint to get user email from headers (existing code)
  router.get("/api/get-user-email", (req, res) => {
    const userEmail = req.header("X-AppEngine-User-Email");

    if (userEmail) {
      res.json({
        email: userEmail,
      });
    } else {
      // Log a warning if no email is found
      logger.warn("GET /api/get-user-email: No email found in headers.");

      // Return an error if the header is not present
      res.status(401).json({
        success: false,
        message: "User email not found in headers.",
      });
    }
  });

  // Handler for POST requests (existing code)
  router.post("/", async (req, res) => {
    logger.info("POST /: Request received.", {
      body: req.body,
    });
    const { message, queryName, data } = req.body;

    logger.info("POST /: Message received.", {
      message,
    });
    logger.info("POST /: Data received.", {
      data,
    });
    logger.info("POST /: QueryName received.", {
      queryName,
    });

    if (message === "save-data") {
      try {
        logger.info("POST /: Saving data.", {
          data,
        });
        await saveEventData(data);
        logger.info("POST /: Data saved successfully.", {
          data,
        });
        res.json({
          success: true,
          message: "Data saved successfully.",
        });
      } catch (error) {
        logger.error("POST /: Error saving data.", {
          error,
        });
        if (error.name === "PartialFailureError") {
          logger.error("Partial failure occurred:", {
            errors: error.errors,
          });
        }
        res.status(500).json({
          success: false,
          message: "Failed to save data. Please try again later.",
        });
      }
    } else if (
      queryName === "eventDataQuery" ||
      queryName === "organisedByOptionsQuery" ||
      queryName === "marketingProgramQuery"
    ) {
      try {
        logger.info("POST /: Executing query.", {
          queryName,
        });
        const queries = await loadQueriesAsync();
        const query = queries[queryName];
        if (!query) {
          logger.warn("POST /: Query not found.", {
            queryName,
          });
          return res.status(404).json({
            success: false,
            message: "Query not found.",
          });
        }
        const options = {
          query: query,
          location: "US",
        };
        const [rows] = await bigquery.query(options);
        logger.info("POST /: Query executed successfully.", {
          queryName,
          rowCount: rows.length,
        });
        res.status(200).json({
          success: true,
          message: `${rows.length} rows retrieved successfully.`,
          data: rows,
        });
      } catch (error) {
        logger.error("POST /: Query execution error.", {
          error,
        });
        res.status(500).json({
          success: false,
          message: "Failed to execute query. Please try again later.",
        });
      }
    } else if (queryName === "getOrganisers") {
      try {
        logger.info("POST /: Executing query.", {
          queryName,
        });
        const queries = await loadQueriesAsync();
        const query = queries[queryName];
        if (!query) {
          logger.warn("POST /: Query not found.", {
            queryName,
          });
          return res.status(404).json({
            success: false,
            message: "Query not found.",
          });
        }
        const options = {
          query: query,
          location: "US",
        };
        const [rows] = await bigquery.query(options);
        logger.info("POST /: Query executed successfully.", {
          queryName,
          rowCount: rows.length,
        });
        res.status(200).json({
          success: true,
          message: `${rows.length} rows retrieved successfully.`,
          data: rows,
        });
      } catch (error) {
        logger.error("POST /: Query execution error.", {
          error,
        });
        res.status(500).json({
          success: false,
          message: "Failed to execute query. Please try again later.",
        });
      }
    } else if (message === "duplicate-event") {
      try {
        const queries = await loadQueriesAsync(); // Load all queries from JSON
        const duplicateQuery = queries["duplicateEvent"];

        if (!duplicateQuery) {
          logger.warn("POST /: Duplicate query not found.");
          return res.status(404).json({
            success: false,
            message: "Duplicate query not found.",
          });
        }

        const { eventId, eventData } = data;
        if (!eventId || !eventData) {
          logger.warn("POST /: Insufficient data for duplicating event.");
          return res.status(400).json({
            success: false,
            message: "Event ID and event data are required for duplication.",
          });
        }

        // Generate a new UUID for the duplicated event
        const newEventId = uuidv4();
        const dateUpdatedCloudHub = new Date().toISOString();

        // Set up the query options, including new and old event IDs
        const options = {
          query: duplicateQuery,
          location: "US",
          params: {
            newEventId: newEventId,
            eventId: eventId,
            dateUpdatedCloudHub: dateUpdatedCloudHub,
          },
        };

        // Execute the duplication query
        await bigquery.query(options);

        logger.info("POST /: Event duplicated successfully.", {
          newEventId,
        });
        res.status(200).json({
          success: true,
          message: "Event duplicated successfully.",
          newEventId: newEventId,
        });
      } catch (error) {
        logger.error("POST /: Error duplicating event.", {
          error,
        });
        res.status(500).json({
          success: false,
          message: "Failed to duplicate event. Please try again later.",
        });
      }
    } else if (message === "salesloft-cadence") {
        const { title, subject, body } = data;

        if (!title || !subject || !body) {
            console.warn("Missing data for SalesLoft cadence creation.");
            return res.status(400).json({
                success: false,
                message: "Title, subject, and body are required.",
            });
        }

        try {
            console.info("Creating SalesLoft cadence...");
            const response = await createSalesLoftCadence({ title, subject, body });

            if (response.success) {
                console.info("SalesLoft cadence created successfully.", response.data);
                return res.status(200).json({
                    success: true,
                    message: "SalesLoft cadence created successfully.",
                    data: response.data,
                });
            } else {
                console.error("Failed to create SalesLoft cadence.", response.error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to create SalesLoft cadence.",
                    error: response.error,
                });
            }
        } catch (error) {
            console.error("Error during SalesLoft cadence creation:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error while creating SalesLoft cadence.",
            });
        }
    } else if (message === "delete-data") {
      // Handle delete event logic
      const { eventId } = data;

      if (!eventId) {
        logger.warn("POST /: No eventId provided for deletion.");
        return res.status(400).json({
          success: false,
          message: "Event ID is required for deletion.",
        });
      }

      try {
        logger.info("POST /: Deleting event data.", {
          eventId,
        });

        const deleteQuery = `
        UPDATE  \`google.com:cloudhub.data.master-event-data\`
        SET isDeleted = TRUE
WHERE eventId = @eventId;
      `;

        const options = {
          query: deleteQuery,
          location: "US",
          params: {
            eventId: eventId,
          },
        };

        await bigquery.query(options);

        logger.info("POST /: Event data deleted successfully.", {
          eventId,
        });
        res.status(200).json({
          success: true,
          message: "Event deleted successfully.",
        });
      } catch (error) {
        logger.error("POST /: Error deleting event.", {
          error,
        });
        res.status(500).json({
          success: false,
          message: "Failed to delete event. Please try again later.",
        });
      }
    } else if (message === "save-filter") {
      // Save filter logic
      const { ldap, filterName, config } = data;

      if (!ldap || !filterName || !config || config.length === 0) {
        logger.warn("POST /: Incomplete data for saving filter.");
        return res.status(400).json({
          success: false,
          message:
            "LDAP and filter configuration are required for saving filter.",
        });
      }

      try {
        logger.info("POST /: Saving filter configuration.", {
          ldap,
        });

        const insertQuery = `
        INSERT INTO \`google.com:cloudhub.data.filters_config\` (id, ldap, filterName, config)
        VALUES (GENERATE_UUID(), @ldap, @filterName, @config);
    `;

        const options = {
          query: insertQuery,
          location: "US",
          params: {
            ldap: ldap,
            filterName: filterName,
            config: config,
          },
        };

        await bigquery.query(options);

        logger.info("POST /: Filter configuration saved successfully.", {
          ldap,
        });
        res.status(200).json({
          success: true,
          message: "Filter configuration saved successfully.",
        });
      } catch (error) {
        logger.error("POST /: Error saving filter configuration.", {
          error,
        });
        res.status(500).json({
          success: false,
          message:
            "Failed to save filter configuration. Please try again later.",
        });
      }
    } else if (message === "get-filters") {
      // Get filters logic
      const { ldap } = data;

      if (!ldap) {
        logger.warn("POST /: LDAP is required for retrieving filters.");
        return res.status(400).json({
          success: false,
          message: "LDAP is required for retrieving filters.",
        });
      }

      try {
        logger.info("POST /: Retrieving filter configurations.", {
          ldap,
        });

        const getFiltersQuery = `
            SELECT filterName, config
            FROM \`google.com:cloudhub.data.filters_config\`
            WHERE ldap = @ldap;
        `;

        const options = {
          query: getFiltersQuery,
          location: "US",
          params: {
            ldap,
          },
        };

        const [rows] = await bigquery.query(options);

        if (rows.length === 0) {
          logger.info("POST /: No filters found for the provided LDAP.", {
            ldap,
          });
          return res.status(404).json({
            success: false,
            message: "No filters found for the provided LDAP.",
          });
        }

        logger.info("POST /: Filter configurations retrieved successfully.", {
          ldap,
          rowCount: rows.length,
        });
        res.status(200).json({
          success: true,
          message: "Filter configurations retrieved successfully.",
          data: rows, // Return only the filters_config array
        });
      } catch (error) {
        logger.error("POST /: Error retrieving filter configurations.", {
          error,
        });
        res.status(500).json({
          success: false,
          message:
            "Failed to retrieve filter configurations. Please try again later.",
        });
      }
    } else if (message === "delete-filter") {
      // Delete filter logic
      const { filterName, ldap } = data;
      console.log("Deleting the filtername: ", filterName, " LDAP: ", ldap);

      if (!ldap || !filterName) {
        logger.warn("POST /: LDAP and filter name are required for deletion.");
        return res.status(400).json({
          success: false,
          message: "LDAP and filter name are required for deleting filter.",
        });
      }

      try {
        logger.info("POST /: Deleting filter configuration.", {
          ldap,
          filterName,
        });

        const deleteQuery = `
        DELETE FROM \`google.com:cloudhub.data.filters_config\`
        WHERE ldap = @ldap AND filterName = @filterName;
    `;

        const options = {
          query: deleteQuery,
          location: "US",
          params: {
            ldap: ldap,
            filterName: filterName,
          },
        };

        await bigquery.query(options);

        logger.info("POST /: Filter configuration deleted successfully.", {
          ldap,
          filterName,
        });
        res.status(200).json({
          success: true,
          message: "Filter configuration deleted successfully.",
        });
      } catch (error) {
        logger.error("POST /: Error deleting filter configuration.", {
          error,
        });
        res.status(500).json({
          success: false,
          message:
            "Failed to delete filter configuration. Please try again later.",
        });
      }
    } else {
      try {
        logger.info("POST /: Executing event data query.", {
          queryName,
        });
        const query = `SELECT * FROM \`google.com:cloudhub.data.master-event-data\` WHERE eventId = '${queryName}'`;
        const options = {
          query: query,
          location: "US",
        };
        const [rows] = await bigquery.query(options);
        logger.info("POST /: Event data query executed successfully.", {
          queryName,
          rowCount: rows.length,
        });
        res.status(200).json({
          success: true,
          message: `${rows.length} rows retrieved successfully.`,
          data: rows,
        });
      } catch (error) {
        logger.error("POST /: Event data query execution error.", {
          error,
        });
        res.status(500).json({
          success: false,
          message: "Failed to execute query. Please try again later.",
        });
      }
    }
  });

  router.post("/share-to-calendar", async (req, res) => {
    const { data, accessToken } = req.body;
    logger.error("Request body received:", {
      body: req.body,
    });

    logger.error("Event details are:", data); // Corrected to log the event details
    logger.error("Access token is:", accessToken);

    if (!accessToken) {
      logger.error("Access token not found.");
      return res.status(401).send("Access token is required");
    }

    try {
      logger.info("Proceeding to add event to Google Calendar.");

      // Initialize OAuth2 client with the provided access token
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
      });

      const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client,
      });

      // Set up the event details
      const event = {
        summary: data.title || "No Title Provided",
        location: data.location || "Online Event",
        description: data.description || "No Description Provided",
        start: {
          dateTime: data.startDate,
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: data.endDate,
          timeZone: "America/Los_Angeles",
        },
      };

      // Insert event into Google Calendar
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      if (response.status === 200) {
        logger.info("Google Calendar event created successfully.", {
          eventId: response.data.id,
        });
        res.status(200).json({
          success: true,
          eventId: response.data.id,
          eventUrl: `https://calendar.google.com/calendar/event?eid=${response.data.id}`,
        });
      } else {
        logger.error("Failed to add event to Google Calendar.", {
          status: response.status,
        });
        res
          .status(response.status)
          .send("Failed to add event to Google Calendar");
      }
    } catch (error) {
      logger.error("Error in Google Calendar event creation", {
        error: error.message,
      });
      res
        .status(500)
        .send("Failed to add event to Google Calendar due to server error");
    }
  });

  async function saveEventData(eventData) {
    const datasetId = "data";
    const tableId = "master-event-data";
    const eventId = eventData.eventId;

    logger.info("Preparing to upsert event data.", {
      eventData,
    });

    try {
      // Clean eventData by removing null, undefined, or empty fields
      const cleanedData = cleanEventData(eventData);

      // Step 1: Check if the event already exists
      const checkEventQuery = `
      SELECT eventId 
      FROM \`${datasetId}.${tableId}\`
      WHERE eventId = @eventId
    `;

      const checkParams = {
        eventId,
      };

      const [rows] = await bigquery.query({
        query: checkEventQuery,
        params: checkParams,
        location: "US",
      });

      if (rows.length > 0) {
        // Step 2: Event exists, perform an UPDATE
        logger.info("Event already exists. Performing update.", {
          eventId,
        });

        const updateQuery = `
                UPDATE \`${datasetId}.${tableId}\`
                SET ${Object.keys(cleanedData)
                  .map((key) => `${key} = @${key}`)
                  .join(", ")},
                    dateUpdatedCloudHub = @dateUpdatedCloudHub
                WHERE eventId = @eventId
            `;

        const updateParams = {
          ...cleanedData,
          eventId,
          dateUpdatedCloudHub: new Date().toISOString(),
        };

        await bigquery.query({
          query: updateQuery,
          params: updateParams,
          location: "US",
        });

        logger.info("Event data updated successfully.", {
          eventId,
        });
      } else {
        // Step 3: Event does not exist, perform an INSERT
        logger.info("Event does not exist. Performing insert.", {
          eventId,
        });

        const insertQuery = `
        INSERT INTO \`${datasetId}.${tableId}\` (${Object.keys(
          cleanedData
        ).join(", ")})
        VALUES (${Object.keys(cleanedData)
          .map((key) => `@${key}`)
          .join(", ")})
      `;

        const insertParams = cleanedData;

        await bigquery.query({
          query: insertQuery,
          params: insertParams,
          location: "US",
        });

        logger.info("Event data inserted successfully.", {
          eventId,
        });
      }
    } catch (error) {
      logger.error("Error performing upsert operation on event data.", {
        error,
      });
      throw error;
    }
  }

  const createSalesLoftCadence = async (data) => {
    const SALESLOFT_API_TOKEN = process.env.SALESLOFT_API_TOKEN;

    if (!SALESLOFT_API_TOKEN) {
        throw new Error("SalesLoft API token is missing. Ensure it's set in the environment variables.");
    }

    try {
        const generatedCadenceId = data.cadence_id || uuidv4();
        const title = data.subjectLine || "Default Title";
        const description = data.subjectLine || "Default Description";

        // Populate the required fields
        const payload = {
            cadence_id: generatedCadenceId,
            name: title, // Title of the cadence
            description, // Description of the cadence
            settings: data.settings || {}, // Optional settings
            steps: [
                {
                    type: "EMAIL",
                    subject: data.subjectLine || "No Subject",
                    body: data.template || "No Body",
                },
            ],
            target_daily_people: data.target_daily_people || 50, // Example default: 50
            remove_replied: data.remove_replied ?? true, // Default to true
            remove_bounced: data.remove_bounced ?? true, // Default to true
            external_identifier: data.external_identifier || generatedCadenceId, // Use generated ID if not provided
            cadence_function: data.cadence_function || "Default Function", // Example default value
        };

        console.log("Payload being sent to SalesLoft API:", JSON.stringify(payload, null, 2));

        const response = await fetch("https://api.salesloft.com/v2/cadence_imports.json", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SALESLOFT_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SalesLoft API error: Status ${response.status}, Message: ${errorText}`);
        }

        const responseData = await response.json();
        return {
            success: true,
            data: responseData,
        };
    } catch (error) {
        console.error("Error creating SalesLoft cadence:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};






  function cleanEventData(eventData) {
    const cleanedData = {};

    for (const key in eventData) {
      if (eventData.hasOwnProperty(key)) {
        const value = eventData[key];

        if (key === "entryCreatedDate") {
          continue;
      }

        // Check if value is non-null, non-undefined, non-empty string, non-empty array, and non-empty struct
        if (value !== null && value !== undefined) {
          if (typeof value === "string" && value.trim() !== "") {
            cleanedData[key] = value;
          } else if (Array.isArray(value) && value.length > 0) {
            cleanedData[key] = value;
          } else if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            Object.keys(value).length > 0
          ) {
            // Check if it's a non-empty struct (non-empty object)
            cleanedData[key] = value;
          } else if (typeof value !== "string" && typeof value !== "object") {
            // For primitive values like boolean, number, etc., we directly include them
            cleanedData[key] = value;
          }
        }
      }
    }

    return cleanedData;
  }
  return router;
};
