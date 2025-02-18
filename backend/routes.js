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
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
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

module.exports = (firestoreStore) => {
  const session = require("express-session");

  router.use(
    session({
      store: firestoreStore,
      secret: process.env.COOKIE_KEY, // Use the same secure, random key for the cookie
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: false, // Use true in production with HTTPS
      },
    })
  );

  const corsOptions = {
    origin: "https://cloudhub.googleplex.com",
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
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/cloud-platform",
      ],
      accessType: "offline",
      prompt: "consent",
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

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    try {
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
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
      console.log("Authenticated user:", req.user);
      try {
        if (req.user) {
          console.log("User authenticated successfully:", req.user);
          req.session.save((err) => {
            if (err) console.error("Error saving session:", err);
            else console.log("Session saved successfully.");
          });
          res.redirect("https://cloudhub.googleplex.com/auth/success");
        } else {
          console.warn("User authentication failed. No user found in the session.");
          res.redirect("https://cloudhub.googleplex.com/login?error=AuthenticationFailed");
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
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const rawMessage = [
        `To: ${emailDetails.to}`,
        `Subject: ${emailDetails.subject}`,
        "",
        emailDetails.body,
      ].join("\n");

      const encodedMessage = Buffer.from(rawMessage).toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const draft = await gmail.users.drafts.create({
        userId: "me",
        requestBody: { message: { raw: encodedMessage } },
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

/**
 * Remove null/undefined fields from an object/array. 
 * `preserveFields` is an array of keys we allow to remain as null.
 */
function removeNullFields(obj, preserveFields = []) {
  if (obj === null) return undefined;

  if (Array.isArray(obj)) {
    return obj
      .map((item) => removeNullFields(item, preserveFields))
      .filter((item) => item !== undefined);
  }

  if (typeof obj === "object") {
    const cleanedObj = {};
    for (const key in obj) {
      if (obj[key] === null && preserveFields.includes(key)) {
        // Keep as null for this key
        cleanedObj[key] = null;
        continue;
      }
      const cleanedValue = removeNullFields(obj[key], preserveFields);
      if (cleanedValue !== undefined) {
        cleanedObj[key] = cleanedValue;
      }
    }
    return cleanedObj;
  }

  return obj;
}

/**
 * Recursively ensures any 'percentage' fields become strings.
 * If it's a number, convert to string, if null => empty string, etc.
 */
function coercePercentageFields(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => coercePercentageFields(item));
  }

  const newObj = {};
  for (const key of Object.keys(value)) {
    let fieldValue = value[key];

    if (key === "percentage") {
      // If numeric, convert to string
      if (typeof fieldValue === "number") {
        fieldValue = String(fieldValue);
      }
      // If null or undefined, make it an empty string
      if (fieldValue == null) {
        fieldValue = "";
      }
    } else {
      // Recurse
      fieldValue = coercePercentageFields(fieldValue);
    }
    newObj[key] = fieldValue;
  }
  return newObj;
}

/**
 * Recursively infers BigQuery parameter types from a JS object or array.
 * (Used in the "save-filter" logic)
 */
function inferBigQueryType(value) {
  if (value === null || value === undefined) {
    return "STRING";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: "ARRAY", arrayType: "STRING" };
    }
    const firstElem = value[0];
    const inferredElemType = inferBigQueryType(firstElem);
    if (typeof inferredElemType === "string") {
      return { type: "ARRAY", arrayType: inferredElemType };
    } else {
      return { type: "ARRAY", arrayType: inferredElemType };
    }
  }
  if (typeof value === "object") {
    const fields = {};
    for (const key of Object.keys(value)) {
      fields[key] = inferBigQueryType(value[key]);
    }
    return {
      type: "STRUCT",
      fields,
    };
  }
  if (typeof value === "string") return "STRING";
  if (typeof value === "boolean") return "BOOL";
  if (typeof value === "number") return "INT64"; // or FLOAT64 if needed
  return "STRING";
}

// Insert your base template population if needed
function populateTemplate(template, bodyContent) {
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

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const encodedSubject =
      `=?UTF-8?B?` + Buffer.from(subject, "utf-8").toString("base64") + `?=`;

    const email = [
      `To: ${to}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      `Subject: ${encodedSubject}`,
      "",
      body,
    ].join("\r\n");

    const encodedMessage = Buffer.from(email, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    logger.info("Encoded email message prepared.", { encodedMessage });

    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw: encodedMessage } },
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
      logger.error("Failed to create Gmail draft. No response data from Gmail API.");
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

// Log out user
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session = null;
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// Get current user info
router.get("/api/current_user", (req, res) => {
  if (req.user) {
    res.json({
      isAuthenticated: true,
      user: req.user,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
    });
  } else {
    res.status(401).json({
      isAuthenticated: false,
      message: "User not authenticated",
    });
  }
});

// BigQuery init
const bigquery = new BigQuery();

// Handler for GET
router.get("/", async (req, res) => {
  const { queryName } = req.query;
  if (!queryName) {
    logger.warn("GET /: Query name is required.");
    return res.status(400).json({ success: false, message: "Query name is required." });
  }
  logger.info("GET /: Query name received.", { queryName });
  res.json({ message: queryName });
});

// Endpoint to get user email from headers
router.get("/api/get-user-email", (req, res) => {
  const userEmail = req.header("X-AppEngine-User-Email");
  if (userEmail) {
    res.json({ email: userEmail });
  } else {
    logger.warn("GET /api/get-user-email: No email found in headers.");
    res.status(401).json({
      success: false,
      message: "User email not found in headers.",
    });
  }
});

// MAIN POST handler
router.post("/", async (req, res) => {
  logger.info("POST /: Request received.", { body: req.body });
  const { message, queryName, data } = req.body;

  logger.info("POST /: Message received.", { message });
  logger.info("POST /: Data received.", { data });
  logger.info("POST /: QueryName received.", { queryName });

  if (message === "save-data") {
    try {
      logger.info("POST /: Saving data.", { data });
      await saveEventData(data);
      logger.info("POST /: Data saved successfully.", { data });
      res.json({ success: true, message: "Data saved successfully." });
    } catch (error) {
      logger.error("POST /: Error saving data.", { error });
      if (error.name === "PartialFailureError") {
        logger.error("Partial failure occurred:", { errors: error.errors });
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
      logger.info("POST /: Executing query.", { queryName });
      const queries = await loadQueriesAsync();
      const query = queries[queryName];
      if (!query) {
        logger.warn("POST /: Query not found.", { queryName });
        return res.status(404).json({ success: false, message: "Query not found." });
      }
      const options = { query, location: "US" };
      const [rows] = await bigquery.query(options);
      logger.info("POST /: Query executed successfully.", { queryName, rowCount: rows.length });
      res.status(200).json({
        success: true,
        message: `${rows.length} rows retrieved successfully.`,
        data: rows,
      });
    } catch (error) {
      logger.error("POST /: Query execution error.", { error });
      res.status(500).json({
        success: false,
        message: "Failed to execute query. Please try again later.",
      });
    }
  } else if (queryName === "getOrganisers") {
    try {
      logger.info("POST /: Executing query.", { queryName });
      const queries = await loadQueriesAsync();
      const query = queries[queryName];
      if (!query) {
        logger.warn("POST /: Query not found.", { queryName });
        return res.status(404).json({ success: false, message: "Query not found." });
      }
      const options = { query, location: "US" };
      const [rows] = await bigquery.query(options);
      logger.info("POST /: Query executed successfully.", { queryName, rowCount: rows.length });
      res.status(200).json({
        success: true,
        message: `${rows.length} rows retrieved successfully.`,
        data: rows,
      });
    } catch (error) {
      logger.error("POST /: Query execution error.", { error });
      res.status(500).json({
        success: false,
        message: "Failed to execute query. Please try again later.",
      });
    }
  } else if (message === "duplicate-event") {
    try {
      const queries = await loadQueriesAsync();
      const duplicateQuery = queries["duplicateEvent"];
      if (!duplicateQuery) {
        logger.warn("POST /: Duplicate query not found.");
        return res.status(404).json({ success: false, message: "Duplicate query not found." });
      }

      const { eventId, eventData } = data;
      if (!eventId || !eventData) {
        logger.warn("POST /: Insufficient data for duplicating event.");
        return res.status(400).json({
          success: false,
          message: "Event ID and event data are required for duplication.",
        });
      }

      const newEventId = uuidv4();
      const dateUpdatedCloudHub = new Date().toISOString();

      const options = {
        query: duplicateQuery,
        location: "US",
        params: {
          newEventId,
          eventId,
          dateUpdatedCloudHub,
        },
      };

      await bigquery.query(options);

      logger.info("POST /: Event duplicated successfully.", { newEventId });
      res.status(200).json({
        success: true,
        message: "Event duplicated successfully.",
        newEventId,
      });
    } catch (error) {
      logger.error("POST /: Error duplicating event.", { error });
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
    const { eventId } = data;
    if (!eventId) {
      logger.warn("POST /: No eventId provided for deletion.");
      return res.status(400).json({
        success: false,
        message: "Event ID is required for deletion.",
      });
    }

    try {
      logger.info("POST /: Deleting event data.", { eventId });
      const deleteQuery = `
        UPDATE \`google.com:cloudhub.data.master-event-data\`
        SET isDeleted = TRUE
        WHERE eventId = @eventId;
      `;
      const options = {
        query: deleteQuery,
        location: "US",
        params: { eventId },
      };
      await bigquery.query(options);
      logger.info("POST /: Event data deleted successfully.", { eventId });
      res.status(200).json({ success: true, message: "Event deleted successfully." });
    } catch (error) {
      logger.error("POST /: Error deleting event.", { error });
      res.status(500).json({
        success: false,
        message: "Failed to delete event. Please try again later.",
      });
    }
  } else if (message === "save-filter") {
    // Save filter logic
    const { ldap, filterName, config } = data;
    if (!ldap || !filterName || !config) {
      logger.warn("POST /: LDAP, filter name, and config are required for saving filter.");
      return res.status(400).json({
        success: false,
        message: "LDAP, filter name, and config are required for saving filter.",
      });
    }

    try {
      const insertQuery = `
        INSERT INTO \`google.com:cloudhub.data.filters_config\` (id, ldap, filterName, config)
        VALUES (GENERATE_UUID(), @ldap, @filterName, @config);
      `;
      const configType = inferBigQueryType(config);
      const types = {
        ldap: "STRING",
        filterName: "STRING",
        config: {
          type: "STRUCT",
          fields: {
            regions: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            subRegions: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            countries: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            gep: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            programName: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            activityType: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            accountSectors: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            accountSegments: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            buyerSegmentRollup: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            productFamily: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            industry: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  checked: "BOOL",
                },
              },
            },
            partnerEvent: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  value: "BOOL",
                  checked: "BOOL",
                },
              },
            },
            draftStatus: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  value: "STRING",
                  checked: "BOOL",
                },
              },
            },
            newlyCreated: {
              type: "ARRAY",
              arrayType: {
                type: "STRUCT",
                fields: {
                  label: "STRING",
                  value: "BOOL",
                  checked: "BOOL",
                },
              },
            },
            organisedBy: {
              type: "ARRAY",
              arrayType: "STRING",
            },
          },
        },
      };

      const options = {
        query: insertQuery,
        location: "US",
        params: { ldap, filterName, config },
        types,
      };

      await bigquery.query(options);
      logger.info("POST /: Filter configuration saved successfully.", { ldap });
      res.status(200).json({
        success: true,
        message: "Filter configuration saved successfully.",
      });
    } catch (error) {
      logger.error("POST /: Error saving filter configuration.", { error });
      res.status(500).json({
        success: false,
        message: "Failed to save filter configuration. Please try again later.",
      });
    }
  } else if (message === "get-filters") {
    const { ldap } = data;
    if (!ldap) {
      logger.warn("POST /: LDAP is required for retrieving filters.");
      return res.status(400).json({
        success: false,
        message: "LDAP is required for retrieving filters.",
      });
    }

    try {
      logger.info("POST /: Retrieving filter configurations.", { ldap });
      const getFiltersQuery = `
        SELECT filterName, config
        FROM \`google.com:cloudhub.data.filters_config\`
        WHERE ldap = @ldap;
      `;

      const options = {
        query: getFiltersQuery,
        location: "US",
        params: { ldap },
      };

      const [rows] = await bigquery.query(options);
      if (rows.length === 0) {
        logger.info("POST /: No filters found for the provided LDAP.", { ldap });
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
        data: rows,
      });
    } catch (error) {
      logger.error("POST /: Error retrieving filter configurations.", { error });
      res.status(500).json({
        success: false,
        message: "Failed to retrieve filter configurations. Please try again later.",
      });
    }
  } else if (message === "delete-filter") {
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
      logger.info("POST /: Deleting filter configuration.", { ldap, filterName });
      const deleteQuery = `
        DELETE FROM \`google.com:cloudhub.data.filters_config\`
        WHERE ldap = @ldap AND filterName = @filterName;
      `;

      const options = {
        query: deleteQuery,
        location: "US",
        params: { ldap, filterName },
      };

      await bigquery.query(options);
      logger.info("POST /: Filter configuration deleted successfully.", { ldap, filterName });
      res.status(200).json({
        success: true,
        message: "Filter configuration deleted successfully.",
      });
    } catch (error) {
      logger.error("POST /: Error deleting filter configuration.", { error });
      res.status(500).json({
        success: false,
        message: "Failed to delete filter configuration. Please try again later.",
      });
    }
  } else {
    try {
      logger.info("POST /: Executing event data query.", { queryName });
      const query = `SELECT * FROM \`google.com:cloudhub.data.master-event-data\` WHERE eventId = '${queryName}'`;
      const options = { query, location: "US" };
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
      logger.error("POST /: Event data query execution error.", { error });
      res.status(500).json({
        success: false,
        message: "Failed to execute query. Please try again later.",
      });
    }
  }
});

// Share to Google Calendar
router.post("/share-to-calendar", async (req, res) => {
  const { data, accessToken } = req.body;
  logger.error("Request body received:", { body: req.body });
  logger.error("Event details are:", data);
  logger.error("Access token is:", accessToken);

  if (!accessToken) {
    logger.error("Access token not found.");
    return res.status(401).send("Access token is required");
  }

  try {
    logger.info("Proceeding to add event to Google Calendar.");
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: data.title || "No Title Provided",
      location: data.location || "Online Event",
      description: data.description || "No Description Provided",
      start: { dateTime: data.startDate, timeZone: "America/Los_Angeles" },
      end: { dateTime: data.endDate, timeZone: "America/Los_Angeles" },
    };

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
      logger.error("Failed to add event to Google Calendar.", { status: response.status });
      res.status(response.status).send("Failed to add event to Google Calendar");
    }
  } catch (error) {
    logger.error("Error in Google Calendar event creation", { error: error.message });
    res.status(500).send("Failed to add event to Google Calendar due to server error");
  }
});

/**
 * Upsert (INSERT or UPDATE) event data in BigQuery
 */
async function saveEventData(eventData) {
  const datasetId = "data";
  const tableId = "master-event-data";
  const eventId = eventData.eventId;

  logger.info("Preparing to upsert event data.", { eventData });

  try {
    // Step A: Clean out null fields
    // Step B: Coerce "percentage" fields to always be strings
    const cleanedData = cleanEventData(eventData);

    // 1) Check if event already exists
    const checkEventQuery = `
      SELECT eventId 
      FROM \`${datasetId}.${tableId}\`
      WHERE eventId = @eventId
    `;
    const checkParams = { eventId };
    const [rows] = await bigquery.query({
      query: checkEventQuery,
      params: checkParams,
      location: "US",
    });

    if (rows.length > 0) {
      // 2) Update
      logger.info("Event already exists. Performing update.", { eventId });

      const updateQuery = `
        UPDATE \`${datasetId}.${tableId}\`
        SET ${Object.keys(cleanedData).map((key) => `${key} = @${key}`).join(", ")},
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
      logger.info("Event data updated successfully.", { eventId });
    } else {
      // 3) Insert
      logger.info("Event does not exist. Performing insert.", { eventId });
      const insertQuery = `
        INSERT INTO \`${datasetId}.${tableId}\` (${Object.keys(cleanedData).join(", ")})
        VALUES (${Object.keys(cleanedData).map((key) => `@${key}`).join(", ")})
      `;

      const insertParams = cleanedData;

      await bigquery.query({
        query: insertQuery,
        params: insertParams,
        location: "US",
      });
      logger.info("Event data inserted successfully.", { eventId });
    }
  } catch (error) {
    logger.error("Error performing upsert operation on event data.", { error });
    throw error;
  }
}

/**
 * Clean event data by removing null fields & coercing "percentage" to string
 */
function cleanEventData(eventData) {
  // 1) Remove nulls
  const withoutNulls = removeNullFields(eventData, ["type"]);

  // 2) Coerce "percentage" fields
  const coerced = coercePercentageFields(withoutNulls);

  // 3) Optionally remove truly empty objects/arrays/strings
  //    Or do extra checks as needed
  const cleanedData = {};

  for (const key in coerced) {
    if (!coerced.hasOwnProperty(key)) continue;
    const value = coerced[key];

    // Example skip: if (key === "entryCreatedDate") continue; // your logic
    if (key === "entryCreatedDate") {
      continue;
    }

    // Keep if non-empty string, or array with length, or object with keys, etc.
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
        cleanedData[key] = value;
      } else if (typeof value !== "string" && typeof value !== "object") {
        // For booleans, numbers, etc.
        cleanedData[key] = value;
      }
    }
  }

  return cleanedData;
}

/**
 * Create a SalesLoft cadence
 */
const createSalesLoftCadence = async (data) => {
  const SALESLOFT_API_TOKEN = process.env.SALESLOFT_API_TOKEN;
  if (!SALESLOFT_API_TOKEN) {
    throw new Error("SalesLoft API token is missing.");
  }

  const payload = {
    settings: {
      name: data.title || "Missing cadence name",
      target_daily_people: 1000,
      remove_replied: true,
      remove_bounced: true,
      cadence_function: "event",
      external_identifier: null,
    },
    sharing_settings: {
      team_cadence: true,
      shared: true,
    },
    cadence_content: {
      step_groups: [
        {
          automated_settings: {
            time_of_day: "09:00",
            timezone_mode: "person",
            send_type: "at_time",
            allow_send_on_weekends: true,
          },
          automated: true,
          day: 1,
          due_immediately: false,
          reference_id: "123",
          steps: [
            {
              enabled: true,
              name: "Event invitation",
              type: "Email",
              type_settings: {
                previous_email_step_group_reference_id: null,
                email_template: {
                  attachments: [],
                  body: data.body || "<div>Email Body</div>",
                  click_tracking: true,
                  open_tracking: true,
                  subject: data.subject || "Hi there!",
                  title: data.title || "Title",
                },
              },
            },
          ],
        },
      ],
    },
  };

  try {
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
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error creating SalesLoft cadence:", error);
    return { success: false, error: error.message };
  }
};

return router;
};
