async function fetchAccessToken() {
  try {
    const response = await fetch('https://backend-dot-cloudhub.googleplex.com/'
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch access token, status ${response.status}`);
    }
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
  }
}


// export async function getDummyEventData(queryEventData) {
//   const apiUrl = `https://backend-dot-cloudhub.googleplex.com/?queryName=${encodeURIComponent(queryEventData)}`;

//   try {
//     const response = await fetch(apiUrl, {
//       credentials: 'include', // Include credentials like cookies in the request
//       method: 'GET', // Optional here since GET is the default method
//       // headers: {}, You can include headers if needed, but for a simple GET request with credentials, it might not be necessary
//     });
//     if (!response.ok) {
//       throw new Error(`Network response was not ok (${response.status})`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching data from the server:', error);
//     throw error;
//   }
// }

export async function getDummyEventData(queryEventData) {
  const apiUrl = `https://backend-dot-cloudhub.googleplex.com/`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST', // Use POST method to send data
      credentials: 'include', // Include credentials like cookies in the request
      headers: {
        'Content-Type': 'text/plain', // Changing to 'text/plain' to avoid preflight
      },
      body: JSON.stringify({ queryName: queryEventData }), // Still sending stringified JSON in the body
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }
    return await response.json(); // Parse and return the response as JSON
  } catch (error) {
    console.error('Error fetching data from the server:', error);
    throw error;
  }
}


