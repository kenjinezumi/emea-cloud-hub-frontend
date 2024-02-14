const express = require('express');
const {BigQuery} = require('@google-cloud/bigquery');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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
  try {
    const { queryName } = req.body; // Destructure queryName from the request body
    const queries = loadQueries(); // Load queries from the JSON file
    
    // Check if the queryName exists in the loaded queries
    if (!queries[queryName]) {
      return res.status(404).json({error: `Query '${queryName}' not found.`});
    }
    
    const query = queries[queryName]; // Get the query string by queryName
    const options = {query: query, location: 'US'};
    const [rows] = await bigquery.query(options);
    res.json(rows);
  } catch (error) {
    console.error(`ERROR: ${error}`);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
