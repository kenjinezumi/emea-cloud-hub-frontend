const axios = require('axios');

async function queryBigQuery(queryName) {
  // URL of your server-side API endpoint
  const apiUrl = 'http://localhost:3000/api/queryBigQuery';

  try {
    // Send a POST request to the server
    const response = await axios.post(apiUrl, {queryName});

    // Assuming the server responds with the query results directly
    console.log(`Results for '${queryName}':`);
    response.data.forEach((row) => console.log(row));
  } catch (error) {
    console.error(`Error querying '${queryName}' from the server:`, error.message);
  }
}
