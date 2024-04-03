import axios from 'axios';

export async function getDummyEventData(queryName) {
  const apiUrl = 'https://backend-dot-cloudhub.googleplex.com/queryBigQuery';

  try {
    // Construct the data object directly without qs.stringify
    const data = {
      queryName: queryName
    };

    // Specify the content type as 'application/json' and send JSON data
    const response = await axios.post(apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (Array.isArray(response.data)) {
      response.data.forEach((row) => console.log(row));
    } else {
      console.log('Unexpected response format:', response.data);
    }
  } catch (error) {
    console.error(`Error querying '${queryName}' from the server:`, error);
    return [];
  }
}
