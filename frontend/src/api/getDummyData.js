// import axios from 'axios';

// export async function getDummyEventData(queryName) {
//   const apiUrl = 'https://backend-dot-cloudhub.googleplex.com/queryBigQuery';

//   // try {
//   //   // Construct the data object directly without qs.stringify
//   //   const data = {
//   //     queryName: queryName
//   //   };

//     // Specify the content type as 'application/json' and send JSON data
//     // const response = await axios.post(apiUrl, data, {
//     //     headers: { 'Content-Type': 'application/json' },
//     //     withCredentials: true,
//     // });
//     const response = await axios.get('https://backend-dot-cloudhub.googleplex.com/', {
//       withCredentials: true
//     });
//     console.log(response);
//   //   if (Array.isArray(response.data)) {
//   //     response.data.forEach((row) => console.log(row));
//   //   } else {
//   //     console.log('Unexpected response format:', response.data);
//   //   }
//   // } catch (error) {
//   //   console.error(`Error querying '${queryName}' from the server:`, error);
//   //   return [];
//   // }
// }


// export async function getDummyEventData() {
//   // The API URL pointing to the root since that's where your GET endpoint is defined.
//   const apiUrl = 'https://backend-dot-cloudhub.googleplex.com/';

//   try {
//     // Making a GET request to the server
//     const response = await axios.get(apiUrl, {
//       withCredentials: true // Include this if you're sending credentials (like cookies) in cross-origin requests
//     });

//     // Logging the response data to the console
//     console.log('Response data:', response.data);

//     // Process the response data as needed
//     // Example: if you expect an array and want to log each item
//     // This part is commented out since your current GET endpoint seems to return a simple message
//     // if (Array.isArray(response.data)) {
//     //   response.data.forEach((row) => console.log(row));
//     // } else {
//     //   console.log('Unexpected response format:', response.data);
//     // }
//   } catch (error) {
//     // Logging any errors that occur during the GET request
//     console.error('Error fetching data from the server:', error);
//     // Optionally, handle the error in your application, such as displaying an error message to the user
//   }
// }

export async function getDummyEventData(queryEventData) {
  const apiUrl = 'https://backend-dot-cloudhub.googleplex.com/queryBigQuery';
  const data = {
    queryName: queryEventData // Using the function parameter
  };

  try {
    // Note: This is a simplified example. Adjustments might be needed based on your actual API requirements.
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors', // Using no-cors mode
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // With 'no-cors', you cannot read the response body directly.
    // The following line will not work as expected: console.log(await response.json());
    console.log('Request made with no-cors mode, but response is not readable');

    return; // No data can be returned as the response is opaque
  } catch (error) {
    console.error('Error fetching data from the server:', error);
    throw error;
  }
}
