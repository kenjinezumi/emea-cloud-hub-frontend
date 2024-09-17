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

  logger.info('Preparing to save or update event data.', { eventData });

  try {
    // Construct the dynamic MERGE query
    const mergeQuery = `
      MERGE \`${datasetId}.${tableId}\` T
      USING (SELECT @eventId AS eventId) S
      ON T.eventId = S.eventId
      WHEN MATCHED THEN
        UPDATE SET 
          title = @title,
          description = @description,
          emoji = @emoji,
          organisedBy = @organisedBy,
          startDate = @startDate,
          endDate = @endDate,
          marketingProgramInstanceId = @marketingProgramInstanceId,
          eventType = @eventType,
          region = @region,
          subRegion = @subRegion,
          country = @country,
          activityOwner = @activityOwner,
          speakers = @speakers,
          isEventSeries = @isEventSeries,
          languagesAndTemplates = @languagesAndTemplates,
          isApprovedForCustomerUse = @isApprovedForCustomerUse,
          okr = @okr,
          gep = @gep,
          audiencePersona = @audiencePersona,
          audienceSeniority = @audienceSeniority,
          accountSectors = @accountSectors,
          accountSegments = @accountSegments,
          maxEventCapacity = @maxEventCapacity,
          peopleMeetingCriteria = @peopleMeetingCriteria,
          landingPageLinks = @landingPageLinks,
          salesKitLinks = @salesKitLinks,
          hailoLinks = @hailoLinks,
          otherDocumentsLinks = @otherDocumentsLinks,
          isHighPriority = @isHighPriority,
          isPartneredEvent = @isPartneredEvent,
          partnerRole = @partnerRole,
          accountCategory = @accountCategory,
          accountType = @accountType,
          productAlignment = @productAlignment,
          aiVsCore = @aiVsCore,
          industry = @industry,
          city = @city,
          locationVenue = @locationVenue,
          marketingActivityType = @marketingActivityType,
          isDraft = @isDraft,
          isPublished = @isPublished,
          userTimezone = @userTimezone
      WHEN NOT MATCHED THEN
        INSERT (
          eventId,
          title,
          description,
          emoji,
          organisedBy,
          startDate,
          endDate,
          marketingProgramInstanceId,
          eventType,
          region,
          subRegion,
          country,
          activityOwner,
          speakers,
          isEventSeries,
          languagesAndTemplates,
          isApprovedForCustomerUse,
          okr,
          gep,
          audiencePersona,
          audienceSeniority,
          accountSectors,
          accountSegments,
          maxEventCapacity,
          peopleMeetingCriteria,
          landingPageLinks,
          salesKitLinks,
          hailoLinks,
          otherDocumentsLinks,
          isHighPriority,
          isPartneredEvent,
          partnerRole,
          accountCategory,
          accountType,
          productAlignment,
          aiVsCore,
          industry,
          city,
          locationVenue,
          marketingActivityType,
          isDraft,
          isPublished,
          userTimezone
        ) VALUES (
          @eventId,
          @title,
          @description,
          @emoji,
          @organisedBy,
          @startDate,
          @endDate,
          @marketingProgramInstanceId,
          @eventType,
          @region,
          @subRegion,
          @country,
          @activityOwner,
          @speakers,
          @isEventSeries,
          @languagesAndTemplates,
          @isApprovedForCustomerUse,
          @okr,
          @gep,
          @audiencePersona,
          @audienceSeniority,
          @accountSectors,
          @accountSegments,
          @maxEventCapacity,
          @peopleMeetingCriteria,
          @landingPageLinks,
          @salesKitLinks,
          @hailoLinks,
          @otherDocumentsLinks,
          @isHighPriority,
          @isPartneredEvent,
          @partnerRole,
          @accountCategory,
          @accountType,
          @productAlignment,
          @aiVsCore,
          @industry,
          @city,
          @locationVenue,
          @marketingActivityType,
          @isDraft,
          @isPublished,
          @userTimezone
        )
    `;

    const params = {
      eventId: eventData.eventId,
      title: eventData.title || null,
      description: eventData.description || null,
      emoji: eventData.emoji || null,
      organisedBy: eventData.organisedBy || [],
      startDate: eventData.startDate || null,
      endDate: eventData.endDate || null,
      marketingProgramInstanceId: eventData.marketingProgramInstanceId || null,
      eventType: eventData.eventType || null,
      region: eventData.region || [],
      subRegion: eventData.subRegion || [],
      country: eventData.country || [],
      activityOwner: eventData.activityOwner || [],
      speakers: eventData.speakers || [],
      isEventSeries: eventData.isEventSeries || false,
      languagesAndTemplates: eventData.languagesAndTemplates || [],
      isApprovedForCustomerUse: eventData.isApprovedForCustomerUse || false,
      okr: eventData.okr || [],
      gep: eventData.gep || [],
      audiencePersona: eventData.audiencePersona || [],
      audienceSeniority: eventData.audienceSeniority || [],
      accountSectors: eventData.accountSectors || {},
      accountSegments: eventData.accountSegments || {},
      maxEventCapacity: eventData.maxEventCapacity || null,
      peopleMeetingCriteria: eventData.peopleMeetingCriteria || null,
      landingPageLinks: eventData.landingPageLinks || [],
      salesKitLinks: eventData.salesKitLinks || [],
      hailoLinks: eventData.hailoLinks || [],
      otherDocumentsLinks: eventData.otherDocumentsLinks || [],
      isHighPriority: eventData.isHighPriority || false,
      isPartneredEvent: eventData.isPartneredEvent || false,
      partnerRole: eventData.partnerRole || null,
      accountCategory: eventData.accountCategory || {},
      accountType: eventData.accountType || {},
      productAlignment: eventData.productAlignment || {},
      aiVsCore: eventData.aiVsCore || null,
      industry: eventData.industry || null,
      city: eventData.city || null,
      locationVenue: eventData.locationVenue || null,
      marketingActivityType: eventData.marketingActivityType || null,
      isDraft: eventData.isDraft || true,
      isPublished: eventData.isPublished || false,
      userTimezone: eventData.userTimezone || null
    };

    const types = {
      eventId: 'string',
      tacticId: 'string',
      title: 'string',
      description: 'string',
      emoji: 'string',
      organisedBy: { type: 'array', arrayType: 'string' },
      startDate: 'string',
      endDate: 'string',
      marketingProgramInstanceId: 'string',
      eventType: 'string',
      region: 'string',
      subRegion: { type: 'array', arrayType: 'string' },
      country: { type: 'array', arrayType: 'string' },
      activityOwner: { type: 'array', arrayType: 'string' },
      speakers: { type: 'array', arrayType: 'string' },
      isEventSeries: 'bool',
      languagesAndTemplates: { 
        type: 'array', 
        arrayType: { 
          type: 'struct', 
          fields: { 
            platform: 'string', 
            language: 'string', 
            template: 'string' 
          } 
        } 
      },
      okr: { 
        type: 'array', 
        arrayType: { 
          type: 'struct', 
          fields: { 
            type: 'string', 
            percentage: 'string' 
          } 
        } 
      },
      gep: { type: 'array', arrayType: 'string' },
      audiencePersona: { type: 'array', arrayType: 'string' },
      audienceSeniority: { type: 'array', arrayType: 'string' },
      accountSectors: { 
        type: 'struct', 
        fields: { 
          commercial: 'bool', 
          public: 'bool' 
        } 
      },
      accountSegments: { 
        type: 'struct', 
        fields: {
          Corporate: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
          SMB: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
          Select: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
          Enterprise: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
          Startup: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
        }
      },
      maxEventCapacity: 'string',
      peopleMeetingCriteria: 'string',
      landingPageLinks: { type: 'array', arrayType: 'string' },
      salesKitLinks: { type: 'array', arrayType: 'string' },
      hailoLinks: { type: 'array', arrayType: 'string' },
      otherDocumentsLinks: { type: 'array', arrayType: 'string' },
      isApprovedForCustomerUse: 'bool',
      isDraft: 'bool',
      isPublished: 'bool',
      isHighPriority: 'bool',
      isPartneredEvent: 'bool',
      partnerRole: 'string',
      accountCategory: { 
        type: 'struct', 
        fields: {
          DigitalNative: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
          Traditional: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
        } 
      },
      accountType: { 
        type: 'struct', 
        fields: {
          Greenfield: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
          ExistingCustomer: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
        } 
      },
      productAlignment: { 
        type: 'struct', 
        fields: {
          GCP: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
          GWS: { 
            type: 'struct', 
            fields: { 
              selected: 'bool', 
              percentage: 'string' 
            } 
          },
        } 
      },
      aiVsCore: 'string',
      industry: 'string',
      city: 'string',
      locationVenue: 'string',
      marketingActivityType: 'string',
      userTimezone: 'string',
    };
    
    
    logger.info('Executing query with parameters:', { params, types });


    try {
      await bigquery.query({
        query: mergeQuery,
        params,
        location: 'US',
        types,
      });
    } catch (error) {
      logger.error('Error executing query:', { error: JSON.stringify(error, null, 2) });
      throw error; // Re-throw the error after logging
    }
    

    logger.info('Event data saved or updated successfully.', { eventId });

  } catch (error) {
    logger.error('Error saving or updating event data.', { error });
    throw error;
  }
}






module.exports = router;
