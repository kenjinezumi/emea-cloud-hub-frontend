import axios from 'axios';

export async function getDummyEventData(queryName) {
  // URL of your server-side API endpoint
  const apiUrl = 'https://backend-dot-cloudhub.googleplex.com/queryBigQuery';

  try {
    // Send a POST request to the server
    const response = await axios.post(apiUrl, {queryName});

    // Assuming the server responds with the query results directly
    response.data.forEach((row) => console.log(row));
  } catch (error) {
    console.error(`Error querying '${queryName}' from the server:`, error.message);
    return [];
  }
}
