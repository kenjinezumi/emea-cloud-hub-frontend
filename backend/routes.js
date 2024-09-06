const express = require('express');
const router = express.Router();
const { BigQuery } = require('@google-cloud/bigquery');
const loadQueriesAsync = require('./utils/queriesLoaders');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const winston = require('winston');

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

// Middleware for parsing JSON bodies
router.use(express.json());

// NEW: Cookie session middleware setup
router.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  keys: [COOKIE_KEY] // Use the secure random string as the key
}));


// NEW: Initialize Passport
router.use(passport.initialize());
router.use(passport.session());

// NEW: Configure Passport.js for Google OAuth
passport.use(new GoogleStrategy({
  clientID: CLIENT_ID, // Access Client ID from environment variables
  clientSecret: CLIENT_SECRET, // Access Client Secret from environment variables
  callbackURL: CALLBACK_URL // Access Callback URL from environment variables
}, (accessToken, refreshToken, profile, done) => {
  // Use the profile information for user registration or login
  return done(null, profile);
}));

// NEW: Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// NEW: Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route for Google OAuth login
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Route for handling the callback from Google
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (!req.user) {
      // Authentication failed, return an error message and authentication status
      return res.status(401).json({
        isAuthenticated: false,
        message: "Authentication failed. Please try again.",
      });
    }

    // Successful authentication, return user data and auth status
    const user = req.user;
    res.json({
      isAuthenticated: true,
      user: user,
      message: "Authentication successful", // You can add a success message as well
    });
  }
);

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
  res.send(req.user); // Send back the user object from the session
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

// Function to save event data (existing code)
async function saveEventData(eventData) {
  const datasetId = 'data';
  const tableId = 'master-event-data';

  logger.info('Preparing to save event data.', { eventData });

  try {
    // Remove unnecessary fields
    logger.info('Removing unnecessary fields: dropdownValue2,otherDocumentsLink,\
    marketingActivityType, landingPageLink, languagesAndTemplates.');
    delete eventData.dropdownValue2;
    delete eventData.otherDocumentsLink;
    delete eventData.landingPageLink;
    delete eventData.salesKitLink;   
    delete eventData.hailoLink;   
    delete eventData.marketingActivityType;
    delete eventData.activityOwner;
    delete eventData.activityType;
    delete eventData.emailLanguage;
    delete eventData.emailText;

    // Insert event data into BigQuery
    logger.info('Inserting event data into BigQuery.', { datasetId, tableId });
    await bigquery.dataset(datasetId).table(tableId).insert([eventData]);
    logger.info('Event data saved successfully.', { eventData });
  } catch (error) {
    if (error.name === 'PartialFailureError') {
      logger.error('Partial failure occurred while saving event data.', { errors: error.errors });
    } else {
      logger.error('Error saving event data.', { error });
    }
    throw error; // Consider handling this error more gracefully
  }
}

module.exports = router;
