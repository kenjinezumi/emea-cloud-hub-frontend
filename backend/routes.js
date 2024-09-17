const express = require('express');
const router = express.Router();
const { BigQuery } = require('@google-cloud/bigquery');
const loadQueriesAsync = require('./utils/queriesLoaders');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const winston = require('winston');
const cors = require('cors');

// New imports for login
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');

// Setup Winston logger
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    loggingWinston
  ]
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
router.use(express.json());
const session = require('express-session');

router.use(session({
  secret: process.env.COOKIE_KEY,  // Use the same secure, random key for the cookie
  resave: false,  // Avoid resaving the session if nothing has changed
  saveUninitialized: false,  // Avoid creating sessions for unauthenticated users
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,  // 1 day
    httpOnly: true,  // Prevent client-side access to the cookie
    secure: false,  // Only set to true in production with HTTPS
  },
}));


const corsOptions = {
  origin: 'https://cloudhub.googleplex.com', // Your frontend domain
  credentials: true,
};
router.use(cors(corsOptions));

// Google OAuth login route
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      console.log('Inside the Google OAuth callback, after Passport authentication');

      if (req.user) {
        console.log('User authenticated successfully:', req.user);
        res.redirect('https://cloudhub.googleplex.com/auth/success'); // Redirect to the frontend
      } else {
        console.warn('User authentication failed. No user found in the session.');
        res.redirect('https://cloudhub.googleplex.com/login?error=AuthenticationFailed');
      }
    } catch (err) {
      console.error('Error during Google OAuth callback:', err.message);
      res.redirect(`https://cloudhub.googleplex.com/login?error=OAuthCallbackError&message=${encodeURIComponent(err.message)}`);
    }
  })


// Route to log out the user
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Route to get current user info
router.get('/api/current_user', (req, res) => {
  if (req.user) {
    res.json({
      isAuthenticated: true,  // Indicating the user is authenticated
      user: req.user          // Sending the user object from the session
    });
  } else {
    res.status(401).json({
      isAuthenticated: false,  // Indicating the user is not authenticated
      message: 'User not authenticated'
    });
  }
});

// Initialize BigQuery client
const bigquery = new BigQuery();

// Handler for GET requests (existing code)
router.get('/', async (req, res) => {
  const { queryName } = req.query;

  if (!queryName) {
    logger.warn('GET /: Query name is required.');
    return res.status(400).json({
      success: false,
      message: 'Query name is required.'
    });
  }

  logger.info('GET /: Query name received.', { queryName });
  res.json({ message: queryName });
});

// Endpoint to get user email from headers (existing code)
router.get('/api/get-user-email', (req, res) => {
  const userEmail = req.header('X-AppEngine-User-Email');

  if (userEmail) {
    res.json({ email: userEmail });
  } else {
    // Log a warning if no email is found
    logger.warn('GET /api/get-user-email: No email found in headers.');

    // Return an error if the header is not present
    res.status(401).json({ success: false, message: 'User email not found in headers.' });
  }
});

// Handler for POST requests (existing code)
router.post('/', async (req, res) => {
  logger.info('POST /: Request received.', { body: req.body });
  const { message, queryName, data } = req.body;

  logger.info('POST /: Message received.', { message });
  logger.info('POST /: Data received.', { data });
  logger.info('POST /: QueryName received.', { queryName });

  if (message === 'save-data') {
    try {
      logger.info('POST /: Saving data.', { data });
      await saveEventData(data);
      logger.info('POST /: Data saved successfully.', { data });
      res.json({ success: true, message: 'Data saved successfully.' });
    } catch (error) {
      logger.error('POST /: Error saving data.', { error });
      if (error.name === 'PartialFailureError') {
        logger.error('Partial failure occurred:', { errors: error.errors });
      }
      res.status(500).json({ success: false, message: 'Failed to save data. Please try again later.' });
    }
  } else if (queryName === 'eventDataQuery' || queryName === 'organisedByOptionsQuery' || queryName === 'marketingProgramQuery') {
    try {
      logger.info('POST /: Executing query.', { queryName });
      const queries = await loadQueriesAsync();
      const query = queries[queryName];
      if (!query) {
        logger.warn('POST /: Query not found.', { queryName });
        return res.status(404).json({ success: false, message: 'Query not found.' });
      }
      const options = { query: query, location: 'US' };
      const [rows] = await bigquery.query(options);
      logger.info('POST /: Query executed successfully.', { queryName, rowCount: rows.length });
      res.status(200).json({
        success: true,
        message: `${rows.length} rows retrieved successfully.`,
        data: rows
      });
    } catch (error) {
      logger.error('POST /: Query execution error.', { error });
      res.status(500).json({ success: false, message: 'Failed to execute query. Please try again later.' });
    }
  } else if (message === 'delete-data') {
    // Handle delete event logic
    const { eventId } = data;
    
    if (!eventId) {
      logger.warn('POST /: No eventId provided for deletion.');
      return res.status(400).json({ success: false, message: 'Event ID is required for deletion.' });
    }
  
    try {
      logger.info('POST /: Deleting event data.', { eventId });
      
      const deleteQuery = `
        DELETE FROM \`google.com:cloudhub.data.master-event-data\`
        WHERE eventId = @eventId
      `;
      
      const options = {
        query: deleteQuery,
        location: 'US',
        params: { eventId: eventId },
      };
      
      await bigquery.query(options);
      
      logger.info('POST /: Event data deleted successfully.', { eventId });
      res.status(200).json({ success: true, message: 'Event deleted successfully.' });
    } catch (error) {
      logger.error('POST /: Error deleting event.', { error });
      res.status(500).json({ success: false, message: 'Failed to delete event. Please try again later.' });
    }
  } else {
    try {
      logger.info('POST /: Executing event data query.', { queryName });
      const query = `SELECT * FROM \`google.com:cloudhub.data.master-event-data\` WHERE eventId = '${queryName}'`;
      const options = { query: query, location: 'US' };
      const [rows] = await bigquery.query(options);
      logger.info('POST /: Event data query executed successfully.', { queryName, rowCount: rows.length });
      res.status(200).json({
        success: true,
        message: `${rows.length} rows retrieved successfully.`,
        data: rows
      });
    } catch (error) {
      logger.error('POST /: Event data query execution error.', { error });
      res.status(500).json({ success: false, message: 'Failed to execute query. Please try again later.' });
    }
  }
});

async function saveEventData(eventData) {
  const datasetId = 'data';
  const tableId = 'master-event-data';
  const eventId = eventData.eventId;

  logger.info('Preparing to save event data.', { eventData });

  try {
    // Step 1: Check if the event already exists in BigQuery
    const checkEventQuery = `
      SELECT eventId
      FROM \`${datasetId}.${tableId}\`
      WHERE eventId = @eventId
    `;
    const options = {
      query: checkEventQuery,
      params: { eventId },
      location: 'US',
    };

    const [rows] = await bigquery.query(options);

    if (rows.length > 0) {
      // Step 2: Event exists, construct dynamic update query
      logger.info('Event already exists. Updating event data.', { eventId });

      // Create dynamic SET clause based on the provided fields in eventData
      const setClauses = [];
      const params = { eventId };
      const types = {};

      for (const [key, value] of Object.entries(eventData)) {
        if (Array.isArray(value)) {
          // Handle array types
          if (key === 'languagesAndTemplates') {
            // If the field is `languagesAndTemplates`, treat as ARRAY<STRUCT>
            params[key] = value.length === 0 ? [] : value;
            setClauses.push(`${key} = @${key}`);
            types[key] = 'ARRAY<STRUCT<platform STRING, language STRING, template STRING>>';
          } else if (key === 'okr') {
            // If the field is `okr`, treat as ARRAY<STRUCT>
            params[key] = value.length === 0 ? [] : value;
            setClauses.push(`${key} = @${key}`);
            types[key] = 'ARRAY<STRUCT<type STRING, percentage STRING>>';
          } else {
            // For other arrays, check if empty and treat as ARRAY<STRING>
            params[key] = value.length === 0 ? [] : value;
            setClauses.push(`${key} = @${key}`);
            types[key] = 'ARRAY<STRING>';
          }
        } else if (value !== undefined && value !== null) {
          // Handle other non-array fields
          setClauses.push(`${key} = @${key}`);
          params[key] = value;
        }
      }

      // Construct the final dynamic update query
      const updateEventQuery = `
        UPDATE \`${datasetId}.${tableId}\`
        SET ${setClauses.join(', ')}
        WHERE eventId = @eventId
      `;

      const updateOptions = {
        query: updateEventQuery,
        params,
        types, // Add types for empty arrays
        location: 'US',
      };

      await bigquery.query(updateOptions);
      logger.info('Event data updated successfully.', { eventId });

    } else {
      // Step 3: If event doesn't exist, insert a new record
      logger.info('Event does not exist. Inserting new event data.', { eventData });
      await bigquery.dataset(datasetId).table(tableId).insert([eventData]);
      logger.info('Event data saved successfully.', { eventData });
    }
  } catch (error) {
    if (error.name === 'PartialFailureError') {
      logger.error('Partial failure occurred while saving event data.', { errors: error.errors });
    } else {
      logger.error('Error saving event data.', { error });
    }
    throw error;
  }
}





module.exports = router;
