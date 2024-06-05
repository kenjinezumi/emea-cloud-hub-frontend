const express = require('express');
const router = express.Router();
const { BigQuery } = require('@google-cloud/bigquery');
const loadQueriesAsync = require('./utils/queriesLoaders');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const winston = require('winston');

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

// Middleware for parsing JSON bodies
router.use(express.json());

// Initialize BigQuery client
const bigquery = new BigQuery();

// Handler for GET requests
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

// Handler for POST requests
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

// Function to save event data
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
