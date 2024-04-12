const express = require('express');
const router = express.Router();
const { GoogleAuth } = require('google-auth-library');
const loadQueries = require('./utils/queriesLoaders');
const { BigQuery } = require('@google-cloud/bigquery');
// Middleware for cookie parsing
router.use(express.json());

// Init BQ
const bigquery = new BigQuery();
router.get('/', async (req, res) => {
  const { queryName } = req.query; 

  if (!queryName) {
    return res.status(400).json({
      success: false,
      message: 'Query name is required.'
    });
  }

  res.json(
    {message:queryName}
  );
});

// Get query from BigQuery
router.post('/', async (req, res) => {
  // try {
  //   const auth = new GoogleAuth({
  //     // Specify the required scopes
  //     scopes: 'https://www.googleapis.com/auth/cloud-platform',
  //   });

  //   // Acquire a client, and use it to fetch the token
  //   const client = await auth.getClient();
  //   const accessToken = await client.getAccessToken();

  //   // Send the token back to the client
  //   res.json({ accessToken: accessToken.token });
  // } catch (error) {
  //   console.error('Error fetching access token:', error);
  //   res.status(500).send('Failed to fetch access token');
  // }
  const { queryName } = req.body;

  // Example: Returning the "queryName" from the request body in the response
  res.json({
    message: `Received query name: ${queryName}`
  });
  // console.log(`Request Method: ${req.method}`);
  // console.log(`Request URL: ${req.originalUrl}`);
  // console.log(`Request IP: ${req.ip}`);
  // console.log(`Request Body: ${JSON.stringify(req.body)}`);
  // console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
  
  // const { queryName } = req.body;

  // if (!queryName) {
  //   return res.status(400).json({
  //     success: false,
  //     message: 'Query name is required.'
  //   });
  // }

  // console.log(`Running query for: ${queryName}`);
  
  // try {
  //   const queries = loadQueries(); 
    
  //   if (!queries.hasOwnProperty(queryName)) {
  //     console.log(`Query '${queryName}' does not exist.`);
  //     return res.status(404).json({
  //       success: false,
  //       message: `Query '${queryName}' not found.`
  //     });
  //   }
    
  //   const query = queries[queryName];
  //   const options = { query: query, location: 'US' };
  //   const [rows] = await bigquery.query(options);

  //   res.json({
  //     success: true,
  //     message: `${rows.length} rows retrieved successfully.`,
  //     data: rows
  //   });
  // } catch (error) {
  //   console.error(`Query execution error: ${error}`);
  //   res.status(500).json({
  //     success: false,
  //     message: 'Failed to execute query. Please try again later.'
  //   });
  // }
});

module.exports = router;
