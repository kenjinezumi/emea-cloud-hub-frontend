const express = require('express');
const router = express.Router();
const { BigQuery } = require('@google-cloud/bigquery');
const loadQueriesAsync = require('./utils/queriesLoaders');

// Middleware for parsing JSON bodies
router.use(express.json());

// Initialize BigQuery client
const bigquery = new BigQuery();

// Handler for GET requests
router.get('/', async (req, res) => {
  const { queryName } = req.query;

  if (!queryName) {
    return res.status(400).json({
      success: false,
      message: 'Query name is required.'
    });
  }

  res.json({ message: queryName });
});

// Handler for POST requests
router.post('/', async (req, res) => {
  const { message, queryName, data } = req.body;

  if (message === 'save-data') {
    try {
      await saveEventData(data);
      res.json({ success: true, message: 'Data saved successfully.' });
    } catch (error) {
      if (error.name === 'PartialFailureError') {
        console.error('Partial failure occurred:', error.errors);
      } else {
        console.error('ERROR:', error);
      }
      throw error; 
    }
    
  } else if (queryName) {
    // This branch handles fetching data based on a provided queryName
    try {
      console.log('Fetching the data');
      const queries = await loadQueriesAsync();
      const query = queries[queryName];
      if (!query) {
        return res.status(404).json({ success: false, message: 'Query not found.' });
      }
      const options = { query: query, location: 'US' };
      const [rows] = await bigquery.query(options);
      console.log([rows]);
      res.status(200).json({
        success: true,
        message: `${rows.length} rows retrieved successfully.`,
        data: rows
      });
    } catch (error) {
      console.error(`Query execution error: ${error}`);
      res.status(500).json({ success: false, message: 'Failed to execute query. Please try again later.' });
    }
  } else {
    // If neither save-data message nor queryName is provided
    res.status(400).json({ success: false, message: 'Invalid request.' });
  }
});

// Function to save event data
async function saveEventData(eventData) {
  const datasetId = 'data';
  const tableId = 'master_event_data';

  // Serialize accountSegments to a JSON string
  eventData.isHighPriority = eventData.isHighPriority.toString(); 
  eventData.accountSegments = JSON.stringify(eventData.accountSegments);  
  eventData.region = [eventData.region]; 

  delete eventData.dropdownValue2;
  delete eventData.languagesAndTemplates;
 
  try {
    await bigquery.dataset(datasetId).table(tableId).insert([eventData]);
    console.log(`Inserted 1 row into table ${tableId}`);
  } catch (error) {
    console.error('ERROR:', error);
    throw error; // Consider handling this error more gracefully
  }
}

module.exports = router;
