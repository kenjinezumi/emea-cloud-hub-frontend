/* eslint-env node */

const express = require('express');
const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors'); 

const { insertIntoBigQuery } = require('./helpers/saveData');

const corsOptions = {
  origin: '*', // Or more specific origins for better security
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Add any other headers your client might send
  credentials: true, // If your client needs to send cookies
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


const bigquery = new BigQuery();

// Function to load queries from JSON file
function loadQueries() {
  const queriesFilePath = './queries.json';
  try {
    const queriesRaw = fs.readFileSync(queriesFilePath);
    return JSON.parse(queriesRaw);
  } catch (error) {
    console.error(`Failed to load queries from ${queriesFilePath}:`, error);
    throw error; // Rethrow to handle it in the endpoint
  }
}


app.post('/queryBigQuery', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  try {
    // const { queryName } = req.body; // Destructure queryName from the request body
    // const queries = loadQueries(); // Load queries from the JSON file
    
    // if (!queries[queryName]) {
    //   return res.status(404).json({ error: `Query '${queryName}' not found.` });
    // }
    
    // const query = queries[queryName]; 
    // const options = { query: query, location: 'US' };
    // const [rows] = await bigquery.query(options);

    // res.json(rows);
    res.json('hi');
  } catch (error) {
    console.error(`ERROR: ${error}`);
    res.status(500).send(error.message);
  }
});


app.get('/event/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const query = `
    SELECT * FROM \`google.com:cloudhub.data.master_event_data\`
    WHERE eventId = @eventId
  `;
  const options = {
    query: query,
    params: { eventId: eventId },
    location: 'US',
  };

  try {
    const [rows] = await bigquery.query(options);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Event not found');
    }
  } catch (error) {
    console.error(`ERROR: ${error}`);
    res.status(500).send(error.message);
  }
});




app.post('/saveEventData', async (req, res) => {
  const formData = req.body;
  const datasetId = 'data';
  const tableId = 'master_event_data';

  try {
    await insertIntoBigQuery(formData, datasetId, tableId);
    res.json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
